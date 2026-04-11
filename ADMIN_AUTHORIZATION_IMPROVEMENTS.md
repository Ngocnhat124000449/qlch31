# Cải Tiến Hệ Thống Phân Quyền Admin (Admin Authorization System)

## 📋 Tổng Quan

Hệ thống phân quyền admin được cải tiến để:

1. **Backend**: Thêm endpoint xác minh admin (`/api/users/verify-admin`)
2. **Frontend**: Cải tiến Admin Layout guard để luôn verif từ backend
3. **Bảo mật**: Các admin routes đều được protect bằng middleware `requirePermission()` hoặc `requireAdmin()`

## 🔐 Qui Trình Xác Quyền Admin

### Backend Flow

```
User Login Request
          ↓
Verify Credentials (email + password)
          ↓
Check user.role từ DB ("admin" or "user")
          ↓
Set isAdmin = (role === "admin")
          ↓
Create JWT Token + Session
          ↓
Return Token + User { userid, email, role, isAdmin }
```

### Frontend Flow

```
Access /admin/* → AdminLayout Component
          ↓
Call useMe() hook → GET /api/users/me (1 lần khi login)
          ↓
Backend trả: { user: { ..., isAdmin: true/false } }
          ↓
AdminLayout kiểm tra me.isAdmin
          ↓
    ✅ isAdmin = true → Render AdminShell
    ❌ isAdmin = false / guest → Redirect /
```

## ✅ Thay Đổi Chi Tiết

Hệ thống đã được tối ưu để **chỉ xác thực vai trò 1 lần khi đăng nhập**.

### Backend

Middleware `requireAuth()` đã xác minh `isAdmin` từ DB:

- Khi login: kiểm tra `user.role` và set `isAdmin` flag
- Return `{ user: { ..., isAdmin: true/false } }` từ `/api/users/me`

### Frontend - Backend Endpoint

**File**: `backend/src/modules/user/user.controller.js`

Endpoint `/api/users/verify-admin` được thêm nhưng **không cần thiết** vì:

- `useMe()` hook đã gọi `/api/users/me` một lần khi login
- User data mang `isAdmin` từ khi xác thực

**File**: `frontend/src/app/admin/layout.js`

Đơn giản hóa logic:

- Đọc `me.isAdmin` từ auth context
- Không gọi thêm API
- Redirect ngay nếu không phải admin

```javascript
const { me, status } = useMe(); // 1 lần khi login
const isAdmin = me?.isAdmin === true; // Đã được xác thực từ backend

useEffect(() => {
  if (status === "guest" || (status === "auth" && !isAdmin)) {
    router.replace("/");
  }
}, [router, status, isAdmin]);
```

---

## 📝 Tất Cả Admin Routes Được Protect

### Protected Routes

| Module         | Endpoint                        | Permission               | Middleware                            |
| -------------- | ------------------------------- | ------------------------ | ------------------------------------- |
| **Users**      | `GET /api/users/admin/users`    | `view:users`             | `requireAuth() + requirePermission()` |
| **Catalog**    | `POST /api/catalog/categories`  | `create:categories`      | `requireAuth() + requirePermission()` |
| **Catalog**    | `POST /api/catalog/products`    | `create:products`        | `requireAuth() + requirePermission()` |
| **Promotions** | `POST /api/promotions`          | `create:promotions`      | `requireAuth() + requireAdmin()`      |
| **Coupons**    | `POST /api/coupons`             | `create:coupons`         | `requireAuth() + requirePermission()` |
| **Orders**     | `GET /api/orders/admin/all`     | `view:all_orders`        | `requireAuth() + requirePermission()` |
| **Orders**     | `PATCH /api/orders/:id/status`  | `update:order_status`    | `requireAuth() + requirePermission()` |
| **Store**      | `GET /api/store/dashboard`      | `view:dashboard`         | `requireAuth() + requirePermission()` |
| **Store**      | `PUT /api/store/inventory/:id`  | `manage:inventory`       | `requireAuth() + requirePermission()` |
| **Store**      | `PATCH /api/store/shipping/:id` | `manage:shipments`       | `requireAuth() + requirePermission()` |
| **Banners**    | `POST /api/banners`             | `create:banners`         | `requireAuth() + requirePermission()` |
| **Payments**   | `POST /api/payment-methods`     | `manage:payment_methods` | `requireAuth() + requireAdmin()`      |

---

## 🛡️ Cơ Chế Bảo Mật

### 1. Authentication (Xác thực)

- `requireAuth()` middleware kiểm tra:
  - Token hợp lệ (JWT signature)
  - Token không hết hạn
  - Session tồn tại + không bị revoke
  - User không bị disable

### 2. Authorization (Phân quyền)

#### Option A: `requirePermission(permission)`

- Kiểm tra user có quyền cụ thể không
- Áp dụng cho hầu hết admin routes (tốt hơn, granular)
- Ví dụ: `requirePermission("view:dashboard")`

#### Option B: `requireAdmin()`

- Shorthand: chỉ kiểm tra `req.user.isAdmin === true`
- Áp dụng cho điều kiện admin chít chẽ (promotion, payment)

---

### Tóm Tắt

| Bước | Khi Nào           | Điều Gì Xảy Ra                                        |
| ---- | ----------------- | ----------------------------------------------------- |
| 1    | **Login**         | Backend xác minh role, set `isAdmin`, return trong me |
| 2    | **Access /admin** | Frontend đọc `me.isAdmin` từ auth context             |
| 3    | **Redirect**      | Nếu không admin → redirect / (không cần gọi API thêm) |

**Kết quả**: Chỉ xác thực 1 lần, không gọi thêm API ✅

### Test Case 1: User Không Phải Admin

```bash
# Login bằng user account
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"user@example.com","matkhau":"password"}'

# ❌ Không được access admin dashboard
curl -X GET http://localhost:3000/admin \
  -H "Authorization: Bearer <user_token>"

# Kết quả: Redirect /
```

### Test Case 2: Admin Được Truy Cập

```bash
# Login bằng admin account
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"admin@example.com","matkhau":"password"}'

# ✅ Được access
curl -X GET http://localhost:5001/api/store/dashboard \
  -H "Authorization: Bearer <admin_token>"

# Kết quả: { "data": {...} }
```

### Test Case 3: Verify Admin Endpoint

```bash
# Frontend call verify-admin
curl -X GET http://localhost:5001/api/users/verify-admin \
  -H "Authorization: Bearer <token>"

# Response (Admin):
# { "isAdmin": true, "role": "admin", "userid": 1 }

# Response (User):
# { "isAdmin": false, "role": "user", "userid": 5 }
```

---

## 📚 Middleware Stack

### Authorization Middleware Files

- **`src/middlewares/authz.middleware.js`**: Authentication
  - `requireAuth()`: xác minh token + session
  - `requireAdmin()`: check isAdmin flag
  - `attachUserFromToken()`: helper

- **`src/middlewares/permission.middleware.js`**: Permissions
  - `requirePermission(perm)`: check user có quyền
  - `requireAdminOnly()`: admin only (alternative)
  - `requireOwner()`: owner checking
  - `requireResourceOwner()`: resource ownership

---

## 🚀 Next Steps

1. **Testing**: Test tất cả admin routes với admin/user account
2. **Audit Log**: Thêm logging cho admin actions (recommended)
3. **Rate Limiting**: Thêm rate limit cho login/verify-admin endpoints
4. **Refresh Token**: Implement refresh token rotation cho admin sessions

---

## 📖 Reference

- Backend Auth Documentation: `backend/AUTHORIZATION.md`
- Store Management API: `backend/STORE_MANAGEMENT_API.md`
- Permission System: `backend/src/utils/permissions.js`
