/**
 * Định nghĩa quyền cho từng role
 * Format: action | resource
 */

const PERMISSIONS = {
  // === USER COMMON ===
  // Xem danh mục, nhà cung cấp, sản phẩm
  "view:categories": ["user", "admin"],
  "view:suppliers": ["user", "admin"],
  "view:products": ["user", "admin"],
  "view:promotions": ["user", "admin"],
  "view:banners": ["user", "admin"],

  // Quản lý hồ sơ cá nhân
  "view:profile": ["user", "admin"],
  "edit:profile": ["user", "admin"],
  "change:password": ["user", "admin"],

  // Quản lý địa chỉ
  "view:addresses": ["user", "admin"],
  "create:addresses": ["user", "admin"],
  "edit:addresses": ["user", "admin"],
  "delete:addresses": ["user", "admin"],

  // Quản lý giỏ hàng
  "view:cart": ["user", "admin"],
  "add:cart": ["user", "admin"],
  "update:cart": ["user", "admin"],
  "remove:cart": ["user", "admin"],

  // Quản lý đơn hàng của mình
  "create:orders": ["user", "admin"],
  "view:my_orders": ["user", "admin"],
  "view:order_detail": ["user", "admin"],
  "cancel:my_orders": ["user", "admin"],

  // Quản lý mã giảm giá
  "view:coupons": ["user", "admin"],
  "apply:coupons": ["user", "admin"],

  // Danh sách yêu thích
  "view:wishlist": ["user", "admin"],
  "add:wishlist": ["user", "admin"],
  "remove:wishlist": ["user", "admin"],

  // Để lại đánh giá
  "create:reviews": ["user", "admin"],
  "view:reviews": ["user", "admin"],
  "edit:own_reviews": ["user", "admin"],
  "delete:own_reviews": ["user", "admin"],

  // Bài đăng (blog/community nếu có)
  "view:posts": ["user", "admin"],
  "create:posts": ["user", "admin"],
  "edit:own_posts": ["user", "admin"],
  "delete:own_posts": ["user", "admin"],

  // === ADMIN ONLY ===
  // Quản lý danh mục
  "create:categories": ["admin"],
  "edit:categories": ["admin"],
  "delete:categories": ["admin"],

  // Quản lý nhà cung cấp
  "create:suppliers": ["admin"],
  "edit:suppliers": ["admin"],
  "delete:suppliers": ["admin"],

  // Quản lý sản phẩm
  "create:products": ["admin"],
  "edit:products": ["admin"],
  "delete:products": ["admin"],
  "edit:product_variants": ["admin"],

  // Quản lý chương trình khuyến mãi
  "create:promotions": ["admin"],
  "edit:promotions": ["admin"],
  "delete:promotions": ["admin"],

  // Quản lý banner
  "create:banners": ["admin"],
  "edit:banners": ["admin"],
  "delete:banners": ["admin"],

  // Quản lý mã giảm giá
  "create:coupons": ["admin"],
  "edit:coupons": ["admin"],
  "delete:coupons": ["admin"],

  // Quản lý thuộc tính sản phẩm
  "manage:attributes": ["admin"],

  // Quản lý tất cả đơn hàng
  "view:all_orders": ["admin"],
  "update:order_status": ["admin"],
  "cancel:all_orders": ["admin"],

  // Quản lý thanh toán
  "manage:payment_methods": ["admin"],

  // Quản lý người dùng
  "view:users": ["admin"],
  "create:users": ["admin"],
  "edit:users": ["admin"],
  "delete:users": ["admin"],
  "manage:user_roles": ["admin"],

  // Quản lý bài đăng
  "edit:all_posts": ["admin"],
  "delete:all_posts": ["admin"],
  "moderate:posts": ["admin"],

  // Quản lý đánh giá
  "edit:all_reviews": ["admin"],
  "delete:all_reviews": ["admin"],
  "moderate:reviews": ["admin"],

  // === ADMIN STORE MANAGEMENT (Quản lý cửa hàng) ===
  // Dashboard & Thống kê
  "view:dashboard": ["admin"],
  "view:analytics": ["admin"],
  "view:reports": ["admin"],
  "export:reports": ["admin"],

  // Quản lý kho (Inventory)
  "view:inventory": ["admin"],
  "manage:inventory": ["admin"],
  "manage:stock": ["admin"],
  "view:stock_alerts": ["admin"],
  "manage:warehouse": ["admin"],

  // Quản lý giao hàng (Shipping & Delivery)
  "manage:shipping_methods": ["admin"],
  "manage:shipping_rates": ["admin"],
  "view:shipments": ["admin"],
  "manage:shipments": ["admin"],
  "track:shipments": ["admin"],
  "manage:carriers": ["admin"],

  // Quản lý khách hàng
  "view:customers": ["admin"],
  "manage:customers": ["admin"],
  "view:customer_analytics": ["admin"],
  "manage:customer_segments": ["admin"],

  // Cấu hình & Thiết lập cửa hàng
  "manage:store_settings": ["admin"],
  "manage:store_info": ["admin"],
  "manage:store_config": ["admin"],
  "manage:business_hours": ["admin"],
  "manage:store_policies": ["admin"],

  // Quản lý tài chính
  "view:financial_reports": ["admin"],
  "view:revenue": ["admin"],
  "view:expenses": ["admin"],
  "manage:refunds": ["admin"],
  "view:payment_settlements": ["admin"],

  // Quản lý khuyến mãi & Chiến dịch
  "create:campaigns": ["admin"],
  "edit:campaigns": ["admin"],
  "delete:campaigns": ["admin"],
  "view:campaign_analytics": ["admin"],

  // Quản lý email & Thông báo
  "manage:email_templates": ["admin"],
  "send:notifications": ["admin"],
  "manage:notification_settings": ["admin"],

  // Quản lý tích hợp & API
  "manage:integrations": ["admin"],
  "manage:api_keys": ["admin"],
  "view:webhooks": ["admin"],
  "manage:webhooks": ["admin"],

  // Quản lý nhadvvân viên (Nếu có)
  "view:staff": ["admin"],
  "manage:staff": ["admin"],
  "manage:staff_roles": ["admin"],
  "manage:staff_permissions": ["admin"],

  // Quản lý bảo mật & Audit
  "view:audit_logs": ["admin"],
  "manage:security_settings": ["admin"],
  "view:login_attempts": ["admin"],
};

/**
 * Kiểm tra xem một role có quyền thực hiện action hay không
 * @param {string} permission - action:resource (ví dụ: "view:products")
 * @param {string} role - "user" hoặc "admin"
 * @returns {boolean}
 */
export function hasPermission(permission, role) {
  const allowedRoles = PERMISSIONS[permission];
  if (!allowedRoles) return false;
  return allowedRoles.includes(role);
}

/**
 * Kiểm tra xem user có quyền thực hiện action hay không
 * @param {object} user - req.user object
 * @param {string} permission - action:resource
 * @returns {boolean}
 */
export function userHasPermission(user, permission) {
  if (!user) return false;
  return hasPermission(permission, user.role);
}

/**
 * Định nghĩa các resource chỉ user được xem (không được admin xem)
 */
export const USER_ONLY_RESOURCES = [
  "my_orders", // Thay vì view user_orders, admin access all_orders
];

/**
 * Danh sách các route công khai (không cần xác thực)
 */
export const PUBLIC_ROUTES = {
  "GET:/api/catalog/categories": true,
  "GET:/api/catalog/suppliers": true,
  "GET:/api/catalog/products": true,
  "GET:/api/banners": true,
  "GET:/api/promotions": true,
};

export default PERMISSIONS;
