# Store Management API Testing Guide

## Chuẩn Bị Test

### 1. Tạo Admin Account

Trước tiên, tạo một user với role admin:

```bash
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@mystore.com",
    "password": "AdminPassword123!",
    "hoten": "Store Admin"
  }'
```

Sau đó, cập nhật user role thành admin bằng database:

```sql
UPDATE public.users SET role = 'admin' WHERE email = 'admin@mystore.com';
```

### 2. Đăng nhập và Lấy Access Token

```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@mystore.com",
    "password": "AdminPassword123!"
  }'
```

Lưu `accessToken` từ response.

### 3. Setting Environment Variable (Optional)

Để dễ thao tác, lưu token vào environment:

```bash
# Linux/Mac
export TOKEN="your_access_token_here"

# Windows (PowerShell)
$env:TOKEN="your_access_token_here"
```

---

## Testing Endpoints

### 📊 Dashboard & Analytics

#### Test Get Dashboard Stats

```bash
curl -X GET http://localhost:5001/api/store/dashboard \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Expected Response:**

```json
{
  "totalRevenue": 150000000,
  "totalOrders": 45,
  "totalCustomers": 120,
  "lowStockItems": 8
}
```

#### Test Get Revenue Analytics

```bash
# Daily
curl -X GET "http://localhost:5001/api/store/analytics/revenue?period=daily" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Monthly
curl -X GET "http://localhost:5001/api/store/analytics/revenue?period=monthly" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Expected Response:**

```json
[
  {
    "date": "2026-04-10",
    "revenue": 5000000,
    "orders": 5,
    "avgOrderValue": 1000000
  }
]
```

---

### 📦 Inventory Management

#### Test Get Inventory

```bash
# Basic list
curl -X GET "http://localhost:5001/api/store/inventory?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# With search
curl -X GET "http://localhost:5001/api/store/inventory?page=1&limit=10&search=laptop" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Expected Response:**

```json
{
  "data": [
    {
      "bentheid": 1,
      "sanpham_name": "Laptop Dell",
      "sku": "DL001",
      "tenbienthe": "256GB SSD",
      "tonkho": 50,
      "giaban": 29000000
    }
  ],
  "page": 1,
  "limit": 10,
  "total": 150
}
```

#### Test Update Stock

```bash
# Replace 1 with actual bentheid
curl -X PUT http://localhost:5001/api/store/inventory/1 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tonkho": 100,
    "note": "Nhập thêm hàng từ nhà cung cấp A"
  }'
```

**Expected Response:**

```json
{
  "message": "Stock updated",
  "data": {
    "bentheid": 1,
    "tonkho": 100,
    "giaban": 29000000,
    "updated_at": "2026-04-10T12:30:00Z"
  }
}
```

#### Test Low Stock Alerts

```bash
curl -X GET "http://localhost:5001/api/store/inventory/alerts/low-stock?threshold=10" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Expected Response:**

```json
{
  "message": "5 products with low stock",
  "threshold": 10,
  "data": [
    {
      "bentheid": 5,
      "sanpham_name": "Mouse Logitech",
      "sku": "LG-MOUSE",
      "tonkho": 5,
      "giaban": 500000
    }
  ]
}
```

---

### 🚚 Shipping Management

#### Test Get Pending Shipments

```bash
curl -X GET http://localhost:5001/api/store/shipping/pending \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Expected Response:**

```json
{
  "message": "10 orders ready for shipment",
  "data": [
    {
      "donhangid": 101,
      "userid": 50,
      "hoten": "Nguyễn Văn A",
      "tongthanhtoan": 1500000,
      "trangthai": "PAID",
      "created_at": "2026-04-10T10:00:00Z"
    }
  ]
}
```

#### Test Update Shipment Status

```bash
# Replace 101 with actual donhangid
curl -X PATCH http://localhost:5001/api/store/shipping/101 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "SHIPPED",
    "trackingNumber": "VN123456789",
    "carrier": "GHN"
  }'
```

**Expected Response:**

```json
{
  "message": "Shipment status updated",
  "data": {
    "donhangid": 101,
    "trangthai": "SHIPPED",
    "updated_at": "2026-04-10T12:30:00Z"
  }
}
```

---

### 👥 Customer Management

#### Test Get Customers List

```bash
# Basic list
curl -X GET "http://localhost:5001/api/store/customers?page=1&limit=20" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# With search
curl -X GET "http://localhost:5001/api/store/customers?page=1&limit=20&search=Nguyen" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Expected Response:**

```json
{
  "data": [
    {
      "userid": 50,
      "email": "nguyen@example.com",
      "hoten": "Nguyễn Văn A",
      "sdt": "0123456789",
      "created_at": "2026-01-01T00:00:00Z",
      "total_orders": 5,
      "total_spent": 7500000
    }
  ],
  "page": 1,
  "limit": 20,
  "total": 120
}
```

#### Test Get Customer Detail

```bash
# Replace 50 with actual userid
curl -X GET http://localhost:5001/api/store/customers/50 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Expected Response:**

```json
{
  "customer": {
    "userid": 50,
    "email": "nguyen@example.com",
    "hoten": "Nguyễn Văn A",
    "sdt": "0123456789",
    "avatarurl": null,
    "created_at": "2026-01-01T00:00:00Z"
  },
  "orders": [
    {
      "donhangid": 101,
      "tongthanhtoan": 1500000,
      "trangthai": "COMPLETED",
      "created_at": "2026-04-01T00:00:00Z"
    }
  ]
}
```

---

### ⚙️ Store Settings

#### Test Get Store Settings

```bash
curl -X GET http://localhost:5001/api/store/settings \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Expected Response:**

```json
{
  "storeName": "My Store",
  "storeEmail": "admin@mystore.com",
  "storePhone": "+84 123 456 789",
  "address": "123 Main St",
  "businessHours": {
    "monday": { "open": "08:00", "close": "17:00" },
    "saturday": { "open": "08:00", "close": "12:00" },
    "sunday": { "closed": true }
  },
  "currency": "VND",
  "timezone": "Asia/Ho_Chi_Minh"
}
```

#### Test Update Store Settings

```bash
curl -X PATCH http://localhost:5001/api/store/settings \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "storeName": "My Updated Store",
    "storeEmail": "newemail@mystore.com",
    "businessHours": {
      "monday": {"open": "07:00", "close": "18:00"}
    }
  }'
```

**Expected Response:**

```json
{
  "message": "Store settings updated",
  "data": {
    "storeName": "My Updated Store",
    "storeEmail": "newemail@mystore.com",
    "storePhone": "+84 123 456 789",
    "address": "123 Main St",
    "businessHours": {
      "monday": { "open": "07:00", "close": "18:00" }
    }
  }
}
```

---

### 💰 Financial Reports

#### Test Get Revenue Report

```bash
curl -X GET "http://localhost:5001/api/store/reports/revenue?startDate=2026-04-01&endDate=2026-04-30" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Expected Response:**

```json
{
  "startDate": "2026-04-01",
  "endDate": "2026-04-30",
  "totalRevenue": 50000000,
  "totalOrders": 50,
  "averageOrderValue": 1000000,
  "topProducts": [
    {
      "productName": "Laptop",
      "quantity": 10,
      "revenue": 20000000
    }
  ]
}
```

#### Test Get Profit Report

```bash
curl -X GET http://localhost:5001/api/store/reports/profit \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Expected Response:**

```json
{
  "totalRevenue": 50000000,
  "totalCosts": 30000000,
  "profit": 20000000,
  "profitMargin": 40
}
```

---

### 📋 Audit Logs

#### Test Get Audit Logs

```bash
curl -X GET "http://localhost:5001/api/store/audit-logs?page=1&limit=50" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Expected Response (Hiện tại - Chờ implementation table):**

```json
{
  "message": "Audit logging feature coming soon",
  "data": [],
  "page": 1,
  "limit": 50,
  "note": "Audit logs table needs to be created. See controller for schema."
}
```

---

## Common Error Cases

### 401 Unauthorized (Missing Token)

```bash
curl -X GET http://localhost:5001/api/store/dashboard

# Response:
{
  "status": 401,
  "message": "Invalid/expired token"
}
```

### 403 Forbidden (Insufficient Permissions)

```bash
# Logged in as regular user trying to access admin endpoint
curl -X GET http://localhost:5001/api/store/dashboard \
  -H "Authorization: Bearer USER_TOKEN"

# Response:
{
  "status": 403,
  "message": "Forbidden: insufficient permissions",
  "required": ["view:dashboard"],
  "userRole": "user"
}
```

### 404 Not Found

```bash
# Product variant doesn't exist
curl -X PUT http://localhost:5001/api/store/inventory/99999 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"tonkho": 100}'

# Response:
{
  "status": 404,
  "message": "Product variant not found"
}
```

### 400 Bad Request (Invalid Input)

```bash
# Invalid stock level (negative)
curl -X PUT http://localhost:5001/api/store/inventory/1 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"tonkho": -5}'

# Response:
{
  "status": 400,
  "message": "Invalid stock level",
  "code": "INVALID_STOCK"
}
```

---

## Advanced Testing with Postman

### 1. Import Collection

Tạo file `postman_collection.json`:

```json
{
  "info": {
    "name": "Store Management API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Dashboard",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}",
            "type": "text"
          }
        ],
        "url": {
          "raw": "http://localhost:5001/api/store/dashboard",
          "protocol": "http",
          "host": ["localhost"],
          "port": "5001",
          "path": ["api", "store", "dashboard"]
        }
      }
    }
  ]
}
```

### 2. Set Variables

Trong Postman > Environments > Create:

- `base_url`: `http://localhost:5001`
- `token`: Your access token

### 3. Use Variables

```
{{base_url}}/api/store/dashboard
Authorization: Bearer {{token}}
```

---

## Performance Testing

### Load Test với apache bench

```bash
# Get dashboard 100 times
ab -n 100 -c 10 -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5001/api/store/dashboard
```

### Test với curl loop

```bash
for i in {1..10}; do
  curl -X GET http://localhost:5001/api/store/dashboard \
    -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
  echo "Request $i done"
done
```

---

## Troubleshooting

### Database Connection Error

```json
{
  "message": "Database connection failed"
}
```

**Solution:**

- Kiểm tra DATABASE_URL environment variable
- Kiểm tra PostgreSQL service đang chạy

### CORS Error

```
Access to XMLHttpRequest has been blocked by CORS policy
```

**Solution:**

- Frontend sử dụng `http://localhost:3000`
- Backend đã configure CORS cho port 3000
- Kiểm tra `src/app.js` CORS settings

### Token Expired

```json
{
  "status": 401,
  "message": "Token expired"
}
```

**Solution:**

- Login lại để lấy token mới
- Sử dụng refresh token nếu có implement

---

## Next Steps

1. ✅ Test tất cả endpoints cơ bản
2. 📋 Implement audit_logs table trong schema
3. 🔍 Thêm data logging cho mỗi thao tác admin
4. 📊 Tạo frontend dashboard components
5. 🧪 Viết unit tests cho các endpoints
6. 📈 Optimize queries nếu cần performance improvement

---

## Support

Nếu gặp vấn đề:

1. Kiểm tra server logs: `npm run dev`
2. Kiểm tra database logs
3. Sử dụng browser DevTools Network tab
4. Liên hệ: support@mystore.com
