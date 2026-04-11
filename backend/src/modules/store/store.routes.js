/**
 * Store Management Routes
 * Tất cả các endpoint cho quản lý cửa hàng (Admin only)
 */

import { Router } from "express";
import { requireAuth } from "../../middlewares/authz.middleware.js";
import { requirePermission } from "../../middlewares/permission.middleware.js";
import * as controller from "./store.controller.js";

const router = Router();

// ============================================
// DASHBOARD & ANALYTICS
// ============================================

/**
 * GET /api/store/dashboard
 * Lấy thống kê tổng quan
 */
router.get(
  "/dashboard",
  requireAuth(),
  requirePermission("view:dashboard"),
  controller.getDashboardStats,
);

/**
 * GET /api/store/analytics/revenue
 * Lấy phân tích doanh số theo thời gian
 */
router.get(
  "/analytics/revenue",
  requireAuth(),
  requirePermission("view:analytics"),
  controller.getRevenueAnalytics,
);

// ============================================
// INVENTORY MANAGEMENT (Quản lý kho)
// ============================================

/**
 * GET /api/store/inventory
 * Danh sách kho + tồn kho
 */
router.get(
  "/inventory",
  requireAuth(),
  requirePermission("view:inventory"),
  controller.getInventory,
);

/**
 * PUT /api/store/inventory/:bentheid
 * Cập nhật tồn kho cho từng biến thể sản phẩm
 */
router.put(
  "/inventory/:bentheid",
  requireAuth(),
  requirePermission("manage:inventory"),
  controller.updateStockLevel,
);

/**
 * GET /api/store/inventory/alerts/low-stock
 * Danh sách sản phẩm hết hàng/cảnh báo tồn kho thấp
 */
router.get(
  "/inventory/alerts/low-stock",
  requireAuth(),
  requirePermission("view:stock_alerts"),
  controller.getLowStockAlerts,
);

// ============================================
// SHIPPING MANAGEMENT (Quản lý giao hàng)
// ============================================

/**
 * GET /api/store/shipping/pending
 * Danh sách đơn chờ vận chuyển
 */
router.get(
  "/shipping/pending",
  requireAuth(),
  requirePermission("view:shipments"),
  controller.getPendingShipments,
);

/**
 * PATCH /api/store/shipping/:donhangid
 * Cập nhật trạng thái giao hàng
 */
router.patch(
  "/shipping/:donhangid",
  requireAuth(),
  requirePermission("manage:shipments"),
  controller.updateShipmentStatus,
);

// ============================================
// CUSTOMER MANAGEMENT (Quản lý khách hàng)
// ============================================

/**
 * GET /api/store/customers
 * Danh sách khách hàng với thống kê mua hàng
 */
router.get(
  "/customers",
  requireAuth(),
  requirePermission("view:customers"),
  controller.getCustomers,
);

/**
 * GET /api/store/customers/:userid
 * Chi tiết khách hàng + lịch sử mua hàng
 */
router.get(
  "/customers/:userid",
  requireAuth(),
  requirePermission("view:customers"),
  controller.getCustomerDetail,
);

// ============================================
// STORE SETTINGS (Cấu hình cửa hàng)
// ============================================

/**
 * GET /api/store/settings
 * Lấy cấu hình cửa hàng
 */
router.get(
  "/settings",
  requireAuth(),
  requirePermission("manage:store_settings"),
  controller.getStoreSettings,
);

/**
 * PATCH /api/store/settings
 * Cập nhật cấu hình cửa hàng
 */
router.patch(
  "/settings",
  requireAuth(),
  requirePermission("manage:store_settings"),
  controller.updateStoreSettings,
);

// ============================================
// FINANCIAL REPORTS (Báo cáo tài chính)
// ============================================

/**
 * GET /api/store/reports/revenue
 * Báo cáo doanh thu
 */
router.get(
  "/reports/revenue",
  requireAuth(),
  requirePermission("view:financial_reports"),
  controller.getRevenueReport,
);

/**
 * GET /api/store/reports/profit
 * Báo cáo lợi nhuận
 */
router.get(
  "/reports/profit",
  requireAuth(),
  requirePermission("view:financial_reports"),
  controller.getProfitReport,
);

// ============================================
// AUDIT & LOGS (Nhật ký hoạt động)
// ============================================

/**
 * GET /api/store/audit-logs
 * Xem nhật ký hoạt động và nhật ký truy cập
 */
router.get(
  "/audit-logs",
  requireAuth(),
  requirePermission("view:audit_logs"),
  controller.getAuditLogs,
);

export default router;
