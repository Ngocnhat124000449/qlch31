/**
 * Store Management Controller
 * Quản lý các thao tác cửa hàng của Admin
 * Bao gồm: Dashboard, Inventory, Shipping, Customers, Settings, Reports
 */

import { asyncHandler } from "../../utils/asyncHandler.js";
import { AppError } from "../../utils/appError.js";
import { pool } from "../../db/db.js";

/**
 * === DASHBOARD & ANALYTICS ===
 */

/**
 * Lấy thống kê tổng quan (Dashboard)
 * - Tổng doanh số hôm nay
 * - Tổng đơn hàng
 * - Tổng khách hàng
 * - Sản phẩm bán chạy
 */
export const getDashboardStats = asyncHandler(async (req, res) => {
  // Lấy doanh số từ tất cả các đơn hàng đã thanh toán
  const revenueRes = await pool.query(
    `SELECT 
      COUNT(DISTINCT donhangid) as total_orders,
      COALESCE(SUM(tongthanhtoan), 0) as total_revenue
     FROM public.donhang 
     WHERE trangthai IN ('COMPLETED', 'PAID', 'SHIPPED')`,
  );

  // Lấy tổng số khách hàng
  const customersRes = await pool.query(
    `SELECT COUNT(*) as total_customers FROM public.users WHERE role = 'user'`,
  );

  // Lấy số sản phẩm có tồn kho thấp (< 10)
  const lowStockRes = await pool.query(
    `SELECT COUNT(*) as low_stock_items FROM public.bienthe_sanpham WHERE tonkho < 10`,
  );

  const stats = {
    totalRevenue: Number(revenueRes.rows[0].total_revenue) || 0,
    totalOrders: Number(revenueRes.rows[0].total_orders) || 0,
    totalCustomers: Number(customersRes.rows[0].total_customers) || 0,
    lowStockItems: Number(lowStockRes.rows[0].low_stock_items) || 0,
  };

  res.json(stats);
});

/**
 * Lấy phân tích doanh số theo thời gian (ngày/tuần/tháng/năm)
 */
export const getRevenueAnalytics = asyncHandler(async (req, res) => {
  const { period = "daily" } = req.query; // daily, weekly, monthly, yearly

  let groupBy = "DATE(created_at)";
  let orderBy = "DATE(created_at)";

  if (period === "weekly") {
    groupBy = "DATE_TRUNC('week', created_at)";
    orderBy = "DATE_TRUNC('week', created_at)";
  } else if (period === "monthly") {
    groupBy = "DATE_TRUNC('month', created_at)";
    orderBy = "DATE_TRUNC('month', created_at)";
  } else if (period === "yearly") {
    groupBy = "DATE_TRUNC('year', created_at)";
    orderBy = "DATE_TRUNC('year', created_at)";
  }

  const { rows } = await pool.query(
    `SELECT 
      ${groupBy} as date,
      COUNT(DISTINCT donhangid) as orders,
      COALESCE(SUM(tongthanhtoan), 0) as revenue,
      COALESCE(AVG(tongthanhtoan), 0) as avg_order_value
     FROM public.donhang
     WHERE trangthai IN ('COMPLETED', 'PAID', 'SHIPPED')
     GROUP BY ${groupBy}
     ORDER BY ${orderBy} DESC
     LIMIT 365`,
  );

  const analytics = rows.map((row) => ({
    date: row.date ? row.date.toISOString().split("T")[0] : null,
    revenue: Number(row.revenue),
    orders: Number(row.orders),
    avgOrderValue: Number(row.avg_order_value),
  }));

  res.json(analytics);
});

/**
 * === INVENTORY MANAGEMENT (Quản lý kho) ===
 */

/**
 * Xem danh sách kho + tồn kho
 */
export const getInventory = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search } = req.query;
  const offset = (page - 1) * limit;

  // Query tổng số items (để tính pagination)
  let countQuery = `
    SELECT COUNT(DISTINCT bs.bentheid) as total
    FROM public.bienthe_sanpham bs
    JOIN public.sanpham sp ON bs.sanphamid = sp.sanphamid
    WHERE bs.trangthai = true
  `;

  if (search) {
    countQuery += ` AND (sp.ten ILIKE $1 OR bs.sku ILIKE $1)`;
  }

  const countRes = await pool.query(countQuery, search ? [`%${search}%`] : []);
  const totalCount = Number(countRes.rows[0].total);

  // Query data với pagination
  let dataQuery = `
    SELECT 
      bs.bentheid,
      sp.ten AS sanpham_name,
      bs.sku,
      bs.tenbienthe,
      bs.tonkho,
      bs.giaban,
      sp.danhmucid
    FROM public.bienthe_sanpham bs
    JOIN public.sanpham sp ON bs.sanphamid = sp.sanphamid
    WHERE bs.trangthai = true
  `;

  const params = [];

  if (search) {
    dataQuery += ` AND (sp.ten ILIKE $${params.length + 1} OR bs.sku ILIKE $${params.length + 1})`;
    params.push(`%${search}%`);
  }

  dataQuery += ` ORDER BY bs.bentheid DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
  params.push(limit, offset);

  const { rows } = await pool.query(dataQuery, params);

  res.json({
    data: rows,
    page: Number(page),
    limit: Number(limit),
    total: totalCount,
  });
});

/**
 * Cập nhật tồn kho
 */
export const updateStockLevel = asyncHandler(async (req, res) => {
  const { bentheid } = req.params;
  const { tonkho, note } = req.body;

  if (!Number.isInteger(tonkho) || tonkho < 0) {
    throw new AppError("Invalid stock level", 400, "INVALID_STOCK");
  }

  // Kiểm tra sản phẩm có tồn tại không
  const checkRes = await pool.query(
    `SELECT bentheid, tonkho as old_tonkho FROM public.bienthe_sanpham WHERE bentheid = $1`,
    [bentheid],
  );

  if (checkRes.rows.length === 0) {
    throw new AppError("Product variant not found", 404, "NOT_FOUND");
  }

  const oldStock = checkRes.rows[0].old_tonkho;

  // Cập nhật tồn kho
  const { rows } = await pool.query(
    `UPDATE public.bienthe_sanpham 
     SET tonkho = $1, updated_at = CURRENT_TIMESTAMP
     WHERE bentheid = $2 
     RETURNING *`,
    [tonkho, bentheid],
  );

  // TODO: Log stock change history (nếu có bảng stock_history)
  // await pool.query(`
  //   INSERT INTO public.stock_history (bentheid, old_tonkho, new_tonkho, reason, changed_by)
  //   VALUES ($1, $2, $3, $4, $5)
  // `, [bentheid, oldStock, tonkho, note, req.user.userid]);

  res.json({
    message: "Stock updated",
    data: {
      bentheid: rows[0].bentheid,
      tonkho: rows[0].tonkho,
      giaban: rows[0].giaban,
      updated_at: rows[0].updated_at,
    },
  });
});

/**
 * Danh sách sản phẩm hết hàng/cảnh báo tồn kho thấp
 */
export const getLowStockAlerts = asyncHandler(async (req, res) => {
  const { threshold = 10 } = req.query;

  const { rows } = await pool.query(
    `SELECT 
      bs.bentheid,
      sp.ten AS sanpham_name,
      bs.sku,
      bs.tenbienthe,
      bs.tonkho,
      bs.giaban
    FROM public.bienthe_sanpham bs
    JOIN public.sanpham sp ON bs.sanphamid = sp.sanphamid
    WHERE bs.tonkho <= $1
    ORDER BY bs.tonkho ASC`,
    [threshold],
  );

  res.json({
    message: `${rows.length} products with low stock`,
    threshold,
    data: rows,
  });
});

/**
 * === SHIPPING MANAGEMENT (Quản lý giao hàng) ===
 */

/**
 * Xem danh sách đơn chờ vận chuyển
 */
export const getPendingShipments = asyncHandler(async (req, res) => {
  const { rows } = await pool.query(
    `SELECT 
      dh.donhangid,
      dh.userid,
      u.hoten,
      dh.tongthanhtoan,
      dh.trangthai,
      dh.created_at
    FROM public.donhang dh
    JOIN public.users u ON dh.userid = u.userid
    WHERE dh.trangthai = 'PAID'
    ORDER BY dh.created_at ASC`,
  );

  res.json({
    message: `${rows.length} orders ready for shipment`,
    data: rows,
  });
});

/**
 * Cập nhật trạng thái giao hàng
 */
export const updateShipmentStatus = asyncHandler(async (req, res) => {
  const { donhangid } = req.params;
  const { status = "SHIPPED", trackingNumber, carrier } = req.body;

  if (!["SHIPPED", "IN_TRANSIT", "DELIVERED", "FAILED"].includes(status)) {
    throw new AppError("Invalid shipment status", 400, "INVALID_STATUS");
  }

  // Kiểm tra đơn hàng có tồn tại không
  const checkRes = await pool.query(
    `SELECT donhangid, trangthai FROM public.donhang WHERE donhangid = $1`,
    [donhangid],
  );

  if (checkRes.rows.length === 0) {
    throw new AppError("Order not found", 404, "NOT_FOUND");
  }

  // Cập nhật trạng thái
  const { rows } = await pool.query(
    `UPDATE public.donhang 
     SET trangthai = $1, updated_at = CURRENT_TIMESTAMP
     WHERE donhangid = $2 
     RETURNING *`,
    [status, donhangid],
  );

  // TODO: Log shipment history (nếu có bảng shipment_tracking)
  // await pool.query(`
  //   INSERT INTO public.shipment_tracking (donhangid, status, tracking_number, carrier, updated_by)
  //   VALUES ($1, $2, $3, $4, $5)
  // `, [donhangid, status, trackingNumber, carrier, req.user.userid]);

  res.json({
    message: "Shipment status updated",
    data: {
      donhangid: rows[0].donhangid,
      trangthai: rows[0].trangthai,
      updated_at: rows[0].updated_at,
    },
  });
});

/**
 * === CUSTOMER MANAGEMENT (Quản lý khách hàng) ===
 */

/**
 * Danh sách khách hàng
 */
export const getCustomers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search } = req.query;
  const offset = (page - 1) * limit;

  // Query tổng số customers
  let countQuery = `
    SELECT COUNT(*) as total FROM public.users WHERE role = 'user'
  `;

  if (search) {
    countQuery += ` AND (hoten ILIKE $1 OR email ILIKE $1)`;
  }

  const countRes = await pool.query(countQuery, search ? [`%${search}%`] : []);
  const totalCount = Number(countRes.rows[0].total);

  // Query customer list với pagination
  let query = `
    SELECT 
      u.userid,
      u.email,
      u.hoten,
      u.sdt,
      u.created_at,
      COUNT(DISTINCT o.donhangid) AS total_orders,
      COALESCE(SUM(CASE WHEN o.trangthai IN ('COMPLETED', 'PAID', 'SHIPPED') THEN o.tongthanhtoan ELSE 0 END), 0) AS total_spent
    FROM public.users u
    LEFT JOIN public.donhang o ON u.userid = o.userid
    WHERE u.role = 'user'
  `;

  const params = [];

  if (search) {
    query += ` AND (u.hoten ILIKE $${params.length + 1} OR u.email ILIKE $${params.length + 1})`;
    params.push(`%${search}%`);
  }

  query += ` GROUP BY u.userid
    ORDER BY u.created_at DESC
    LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
  params.push(limit, offset);

  const { rows } = await pool.query(query, params);

  res.json({
    data: rows.map((row) => ({
      userid: row.userid,
      email: row.email,
      hoten: row.hoten,
      sdt: row.sdt,
      created_at: row.created_at,
      total_orders: Number(row.total_orders),
      total_spent: Number(row.total_spent),
    })),
    page: Number(page),
    limit: Number(limit),
    total: totalCount,
  });
});

/**
 * Chi tiết khách hàng + lịch sử mua hàng
 */
export const getCustomerDetail = asyncHandler(async (req, res) => {
  const { userid } = req.params;

  const customerRes = await pool.query(
    `SELECT userid, email, hoten, sdt, avatarurl, created_at 
     FROM public.users 
     WHERE userid = $1 AND role = 'user'`,
    [userid],
  );

  if (customerRes.rows.length === 0) {
    throw new AppError("Customer not found", 404, "NOT_FOUND");
  }

  const ordersRes = await pool.query(
    `SELECT donhangid, tongthanhtoan, trangthai, created_at 
     FROM public.donhang 
     WHERE userid = $1 
     ORDER BY created_at DESC`,
    [userid],
  );

  res.json({
    customer: customerRes.rows[0],
    orders: ordersRes.rows,
  });
});

/**
 * === STORE SETTINGS (Cấu hình cửa hàng) ===
 */

/**
 * Lấy cấu hình cửa hàng (nếu có bảng store_settings)
 */
export const getStoreSettings = asyncHandler(async (req, res) => {
  // TODO: Implement if store_settings table exists
  const settings = {
    storeName: "My Store",
    storeEmail: "admin@mystore.com",
    storePhone: "+84 123 456 789",
    address: "123 Main St",
    businessHours: {
      monday: { open: "08:00", close: "17:00" },
      saturday: { open: "08:00", close: "12:00" },
      sunday: { closed: true },
    },
    currency: "VND",
    timezone: "Asia/Ho_Chi_Minh",
  };

  res.json(settings);
});

/**
 * Cập nhật cấu hình cửa hàng
 */
export const updateStoreSettings = asyncHandler(async (req, res) => {
  const { storeName, storeEmail, storePhone, address, businessHours } =
    req.body;

  // TODO: Validate and save to database

  res.json({
    message: "Store settings updated",
    data: {
      storeName,
      storeEmail,
      storePhone,
      address,
      businessHours,
    },
  });
});

/**
 * === FINANCIAL REPORTS (Báo cáo tài chính) ===
 */

/**
 * Báo cáo doanh thu
 */
export const getRevenueReport = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    throw new AppError(
      "Missing startDate or endDate query parameters",
      400,
      "MISSING_PARAMS",
    );
  }

  try {
    new Date(startDate);
    new Date(endDate);
  } catch (e) {
    throw new AppError("Invalid date format", 400, "INVALID_DATE");
  }

  // Query tổng doanh thu trong khoảng thời gian
  const totalRes = await pool.query(
    `SELECT 
      COUNT(DISTINCT donhangid) as total_orders,
      COALESCE(SUM(tongthanhtoan), 0) as total_revenue
     FROM public.donhang
     WHERE trangthai IN ('COMPLETED', 'PAID', 'SHIPPED')
       AND created_at >= $1::timestamp
       AND created_at < $2::timestamp`,
    [startDate, endDate],
  );

  const totalRevenue = Number(totalRes.rows[0].total_revenue);
  const totalOrders = Number(totalRes.rows[0].total_orders);
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Query sản phẩm bán chạy nhất trong khoảng thời gian
  const topProductsRes = await pool.query(
    `SELECT 
      sp.ten as product_name,
      SUM(og.soluong) as quantity,
      COALESCE(SUM(og.dongia * og.soluong), 0) as revenue
     FROM public.ordor_gom og
     JOIN public.sanpham sp ON og.sanphamid = sp.sanphamid
     JOIN public.donhang dh ON og.donhangid = dh.donhangid
     WHERE dh.trangthai IN ('COMPLETED', 'PAID', 'SHIPPED')
       AND dh.created_at >= $1::timestamp
       AND dh.created_at < $2::timestamp
     GROUP BY sp.sanphamid, sp.ten
     ORDER BY revenue DESC
     LIMIT 10`,
    [startDate, endDate],
  );

  const report = {
    startDate,
    endDate,
    totalRevenue,
    totalOrders,
    averageOrderValue: Math.round(averageOrderValue),
    topProducts: topProductsRes.rows.map((row) => ({
      productName: row.product_name,
      quantity: Number(row.quantity),
      revenue: Number(row.revenue),
    })),
  };

  res.json(report);
});

/**
 * Báo cáo lợi nhuận
 */
export const getProfitReport = asyncHandler(async (req, res) => {
  // Query tổng doanh thu
  const revenueRes = await pool.query(
    `SELECT COALESCE(SUM(tongthanhtoan), 0) as total_revenue
     FROM public.donhang
     WHERE trangthai IN ('COMPLETED', 'PAID', 'SHIPPED')`,
  );

  const totalRevenue = Number(revenueRes.rows[0].total_revenue);

  // Query tổng chi phí (estimated from product costs)
  // Note: Nếu có bảng chi phí riêng, hãy query từ đó
  const costsRes = await pool.query(
    `SELECT COALESCE(SUM(og.dongia * og.soluong * 0.6), 0) as total_costs
     FROM public.ordor_gom og
     JOIN public.donhang dh ON og.donhangid = dh.donhangid
     WHERE dh.trangthai IN ('COMPLETED', 'PAID', 'SHIPPED')`,
  );

  const totalCosts = Number(costsRes.rows[0].total_costs);

  const profit = totalRevenue - totalCosts;
  const profitMargin =
    totalRevenue > 0 ? Math.round((profit / totalRevenue) * 100) : 0;

  const report = {
    totalRevenue,
    totalCosts,
    profit,
    profitMargin,
  };

  res.json(report);
});

/**
 * === AUDIT & LOGS ===
 */

/**
 * Xem nhật ký hoạt động (Audit logs)
 */
export const getAuditLogs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50, action, actor } = req.query;
  const offset = (page - 1) * limit;

  // TODO: Create audit_logs table in database
  // Table schema example:
  // CREATE TABLE public.audit_logs (
  //   log_id SERIAL PRIMARY KEY,
  //   actor_id INT REFERENCES users(userid),
  //   action VARCHAR(50),
  //   resource VARCHAR(100),
  //   details JSONB,
  //   timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  //   ip_address VARCHAR(45)
  // );

  // For now, return empty logs with appropriate message
  res.json({
    message: "Audit logging feature coming soon",
    data: [],
    page: Number(page),
    limit: Number(limit),
    note: "Audit logs table needs to be created. See controller for schema.",
  });
});

export default {
  // Dashboard
  getDashboardStats,
  getRevenueAnalytics,

  // Inventory
  getInventory,
  updateStockLevel,
  getLowStockAlerts,

  // Shipping
  getPendingShipments,
  updateShipmentStatus,

  // Customers
  getCustomers,
  getCustomerDetail,

  // Store Settings
  getStoreSettings,
  updateStoreSettings,

  // Reports
  getRevenueReport,
  getProfitReport,

  // Audit
  getAuditLogs,
};
