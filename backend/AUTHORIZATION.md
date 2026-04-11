# Hệ Thống Phân Quyền (Authorization) - Admin & User

## Tổng Quan

Hệ thống phân quyền được xây dựng dựa trên **Role-Based Access Control (RBAC)** với hai role chính:

- **User**: Người dùng thông thường
- **Admin**: Quản trị viên hệ thống

## Cấu Trúc Quyền

### 1. File Định Nghĩa Quyền

**File: `src/utils/permissions.js`**

Định nghĩa tất cả quyền theo format: `action:resource`

Ví dụ:

- `view:products` - Xem danh sách sản phẩm (User & Admin)
- `create:products` - Tạo sản phẩm (Admin only)
- `edit:products` - Chỉnh sửa sản phẩm (Admin only)
- `delete:products` - Xóa sản phẩm (Admin only)

### 2. Middleware Phân Quyền

**File: `src/middlewares/permission.middleware.js`**

#### `requirePermission(permission)`

Kiểm tra xem user có quyền thực hiện action

```javascript
// Kiểm tra một quyền
router.post(
  "/",
  requireAuth(),
  requirePermission("create:banners"),
  controller,
);

// Kiểm tra một trong nhiều quyền
router.get(
  "/",
  requirePermission(["view:orders", "view:my_orders"]),
  controller,
);
```

#### `requireAdminOnly()`

Shorthand để kiểm tra user là admin

```javascript
router.get("/stats", requireAuth(), requireAdminOnly(), controller);
```

#### `requireOwner(paramName)`

Kiểm tra user chỉ được xem/sửa data của chính họ

```javascript
router.put(
  "/:userid/profile",
  requireAuth(),
  requireOwner("userid"),
  controller,
);
```

#### `requireResourceOwner(getOwnerId)`

Kiểm tra user chỉ được quản lý resource của chính họ

```javascript
router.patch(
  "/my-post/:postid",
  requireAuth(),
  requireResourceOwner(async (req) => {
    const post = await getPostById(req.params.postid);
    return post?.userid;
  }),
  controller,
);
```

## Quyền Cho Từng Role

### USER (Người Dùng Thông Thường)

#### Xem Danh Sách

- `view:categories`, `view:suppliers`, `view:products`
- `view:promotions`, `view:banners`
- `view:reviews`, `view:posts`

#### Quản Lý Cá Nhân

- `view:profile`, `edit:profile`, `change:password`
- `view:addresses`, `create:addresses`, `edit:addresses`, `delete:addresses`
- `view:cart`, `add:cart`, `update:cart`, `remove:cart`
- `view:coupons`, `apply:coupons`
- `view:wishlist`, `add:wishlist`, `remove:wishlist`

#### Quản Lý Đơn Hàng

- `create:orders` - Tạo đơn hàng
- `view:my_orders` - Xem đơn hàng của mình
- `view:order_detail` - Xem chi tiết đơn
- `cancel:my_orders` - Hủy đơn của mình

#### Tương Tác

- `create:reviews` - Để lại đánh giá
- `create:posts` - Tạo bài đăng
- `edit:own_reviews` - Chỉnh sửa đánh giá của mình
- `edit:own_posts` - Chỉnh sửa bài của mình
- `delete:own_reviews`, `delete:own_posts` - Xóa của mình

### ADMIN (Quản Trị Viên)

#### Quản Lý Dữ Liệu Cốt Lõi

- `create:categories`, `edit:categories`, `delete:categories`
- `create:suppliers`, `edit:suppliers`, `delete:suppliers`
- `create:products`, `edit:products`, `delete:products`
- `edit:product_variants` - Quản lý biến thể sản phẩm

#### Quản Lý Khuyến Mãi

- `create:promotions`, `edit:promotions`, `delete:promotions`
- `create:banners`, `edit:banners`, `delete:banners`
- `create:coupons`, `edit:coupons`, `delete:coupons`

#### Quản Lý Người Dùng & Đơn Hàng

- `view:users`, `create:users`, `edit:users`, `delete:users`
- `manage:user_roles` - Thay đổi role user
- `view:all_orders` - Xem tất cả đơn hàng
- `update:order_status` - Cập nhật trạng thái đơn
- `cancel:all_orders` - Hủy đơn bất kỳ

#### Quản Lý Nội Dung

- `moderate:posts` - Duyệt/xóa bài đăng
- `moderate:reviews` - Duyệt/xóa đánh giá
- `manage:attributes` - Quản lý thuộc tính sản phẩm
- `manage:payment_methods` - Quản lý phương thức thanh toán

#### 📊 Quản Lý Cửa Hàng (Store Management)

**Dashboard & Phân Tích**

- `view:dashboard` - Xem thống kê tổng quan
- `view:analytics` - Xem phân tích doanh số
- `view:reports` - Xem báo cáo
- `export:reports` - Xuất báo cáo

**Quản Lý Kho (Inventory)**

- `view:inventory` - Xem danh sách kho
- `manage:inventory` - Cập nhật tồn kho
- `manage:stock` - Quản lý hàng tồn
- `view:stock_alerts` - Xem cảnh báo hàng thấp
- `manage:warehouse` - Quản lý kho

**Quản Lý Giao Hàng (Shipping)**

- `manage:shipping_methods` - Quản lý phương thức giao hàng
- `manage:shipping_rates` - Quản lý giá giao hàng
- `view:shipments` - Xem danh sách giao hàng
- `manage:shipments` - Quản lý trạng thái giao hàng
- `track:shipments` - Theo dõi giao hàng
- `manage:carriers` - Quản lý đơn vị vận chuyển

**Quản Lý Khách Hàng (Customer)**

- `view:customers` - Xem danh sách khách hàng
- `manage:customers` - Quản lý thông tin khách hàng
- `view:customer_analytics` - Xem thống kê khách hàng
- `manage:customer_segments` - Quản lý phân khúc khách hàng

**Cấu Hình Cửa Hàng (Store Settings)**

- `manage:store_settings` - Quản lý cấu hình cửa hàng
- `manage:store_info` - Quản lý thông tin cửa hàng
- `manage:store_config` - Quản lý config cửa hàng
- `manage:business_hours` - Quản lý giờ kinh doanh
- `manage:store_policies` - Quản lý chính sách cửa hàng

**Tài Chính (Finance)**

- `view:financial_reports` - Xem báo cáo tài chính
- `view:revenue` - Xem doanh thu
- `view:expenses` - Xem chi phí
- `manage:refunds` - Quản lý hoàn tiền
- `view:payment_settlements` - Xem thanh toán

**Khuyến Mãi & Chiến Dịch**

- `create:campaigns` - Tạo chiến dịch
- `edit:campaigns` - Chỉnh sửa chiến dịch
- `delete:campaigns` - Xóa chiến dịch
- `view:campaign_analytics` - Xem phân tích chiến dịch

**Email & Thông Báo**

- `manage:email_templates` - Quản lý template email
- `send:notifications` - Gửi thông báo
- `manage:notification_settings` - Quản lý cấu hình thông báo

**Tích Hợp & API**

- `manage:integrations` - Quản lý tích hợp
- `manage:api_keys` - Quản lý API key
- `view:webhooks` - Xem webhooks
- `manage:webhooks` - Quản lý webhooks

**Nhân Viên (Staff)**

- `view:staff` - Xem danh sách nhân viên
- `manage:staff` - Quản lý nhân viên
- `manage:staff_roles` - Quản lý vai trò nhân viên
- `manage:staff_permissions` - Quản lý quyền nhân viên

**Bảo Mật & Kiểm Toán**

- `view:audit_logs` - Xem nhật ký hoạt động
- `manage:security_settings` - Quản lý cấu hình bảo mật
- `view:login_attempts` - Xem lịch sử đăng nhập

## Cách Sử Dụng

### 1. Kiểm Tra Quyền Trong Routes

**Tạo Tài Nguyên (Admin Only)**

```javascript
import { requirePermission } from "../../middlewares/permission.middleware.js";

router.post(
  "/products",
  requireAuth(),
  requirePermission("create:products"),
  uploadSingleImage("image"),
  controller.createProduct,
);
```

**Xem Danh Sách (User & Admin)**

```javascript
router.get("/products", optionalAuth(), controller.listProducts);
```

**Quản Lý Tài Nguyên Của Chính Mình (User) hoặc Bất Kỳ (Admin)**

```javascript
router.patch(
  "/orders/:orderId/cancel",
  requireAuth(),
  requireResourceOwner(async (req) => {
    const order = await getOrderById(req.params.orderId);
    return order?.userid;
  }),
  controller.cancelOrder,
);
```

### 2. Kiểm Tra Quyền Trong Controller

```javascript
import { userHasPermission } from "@/utils/permissions.js";

export async function someAction(req, res) {
  // Kiểm tra quyền động
  if (!userHasPermission(req.user, "edit:products")) {
    return res.status(403).json({ message: "Forbidden" });
  }

  // Thực hiện action
  // ...
}
```

### 3. Kiểm Tra Quyền Trong Frontend (React)

```javascript
// Hook để kiểm tra quyền user
export function usePermission(permission) {
  const { user } = useAuth();
  return userHasPermission(user, permission);
}

// Sử dụng
function AdminPanel() {
  const canManageUsers = usePermission("view:users");

  if (!canManageUsers) {
    return <div>Không có quyền truy cập</div>;
  }

  return <UserList />;
}
```

## Database Schema

Thông tin role được lưu trữ trong bảng `users`:

```sql
CREATE TABLE users (
  userid BIGSERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'user' NOT NULL,  -- 'user' hoặc 'admin'
  trangthai BOOLEAN DEFAULT true,             -- Trạng thái active/inactive
  ...
);
```

### Cập Nhật Role User

```sql
-- Nâng cấp user thành admin
UPDATE users SET role = 'admin' WHERE userid = 123;

-- Hạ tư admin xuống user
UPDATE users SET role = 'user' WHERE userid = 456;
```

## Các Route Ví Dụ

### Public Routes (Không cần đăng nhập)

```
GET  /api/catalog/categories
GET  /api/catalog/products
GET  /api/banners
GET  /api/promotions
```

### User Routes (Cần đăng nhập)

```
GET    /api/users/me                    # Xem hồ sơ của mình
PUT    /api/users/me                    # Chỉnh sửa hồ sơ
POST   /api/orders                      # Tạo đơn hàng
GET    /api/orders                      # Xem đơn hàng của mình
PATCH  /api/orders/:id/cancel           # Hủy đơn
```

### Admin Routes (Cần role = admin)

```
POST   /api/catalog/products            # Tạo sản phẩm
PUT    /api/catalog/products/:id        # Chỉnh sửa sản phẩm
DELETE /api/catalog/products/:id        # Xóa sản phẩm
GET    /api/users/admin/users           # Xem tất cả users
GET    /api/orders/admin/all            # Xem tất cả đơn hàng
PATCH  /api/orders/:id/status           # Cập nhật trạng thái đơn
```

### Store Management Routes (Admin Only - Quản Lý Cửa Hàng)

```
# Dashboard & Analytics
GET    /api/store/dashboard             # Thống kê tổng quan
GET    /api/store/analytics/revenue     # Phân tích doanh số

# Inventory (Quản Lý Kho)
GET    /api/store/inventory             # Danh sách kho
PUT    /api/store/inventory/:bentheid   # Cập nhật tồn kho
GET    /api/store/inventory/alerts/low-stock  # Cảnh báo hàng thấp

# Shipping (Quản Lý Giao Hàng)
GET    /api/store/shipping/pending      # Đơn chờ vận chuyển
PATCH  /api/store/shipping/:donhangid   # Cập nhật trạng thái giao hàng

# Customers (Quản Lý Khách Hàng)
GET    /api/store/customers             # Danh sách khách hàng
GET    /api/store/customers/:userid     # Chi tiết khách hàng

# Store Settings (Cấu Hình Cửa Hàng)
GET    /api/store/settings              # Lấy cấu hình
PATCH  /api/store/settings              # Cập nhật cấu hình

# Reports (Báo Cáo)
GET    /api/store/reports/revenue       # Báo cáo doanh thu
GET    /api/store/reports/profit        # Báo cáo lợi nhuận

# Audit Logs (Nhật Ký Hoạt Động)
GET    /api/store/audit-logs            # Xem nhật ký
```

## Error Responses

### Unauthenticated (Chưa đăng nhập)

```json
{
  "status": 401,
  "message": "Unauthenticated"
}
```

### Forbidden (Không có quyền)

```json
{
  "status": 403,
  "message": "Forbidden: insufficient permissions",
  "required": ["create:products"],
  "userRole": "user"
}
```

### Disabled User (Tài khoản bị khóa)

```json
{
  "status": 403,
  "message": "User is disabled"
}
```

## Hướng Dẫn Thêm Quyền Mới

1. **Thêm quyền vào `permissions.js`**

   ```javascript
   "new_action:resource": ["admin"],  // Hoặc ["user", "admin"]
   ```

2. **Sử dụng trong route**

   ```javascript
   router.post(
     "/...",
     requireAuth(),
     requirePermission("new_action:resource"),
     controller,
   );
   ```

3. **Kiểm tra quyền trong logic nếu cần**

## Best Practices

1. ✅ **Luôn sử dụng `requireAuth()` trước `requirePermission()`**
2. ✅ **Kiểm tra quyền ở middleware, không ở controller**
3. ✅ **Sử dụng các middleware helper được cung cấp**
4. ✅ **Tránh hardcode role check (`if (user.role === "admin")`)**
5. ✅ **Log các hành động nhạy cảm (bảo mật)**
6. ✅ **Kiểm tra quyền resource owner cho data của user**

## Maintenance

Để thêm/sửa/xóa quyền:

1. Cập nhật `permissions.js`
2. Cập nhật documentation
3. Cập nhật các routes liên quan
4. Test bằng Postman/API client
