# Store Management API Documentation

## Giới Thiệu

Store Management API cung cấp các endpoint cho Admin quản lý các thao tác nghiệp vụ của cửa hàng bao gồm:

- 📊 **Dashboard & Analytics** - Thống kê và phân tích
- 📦 **Inventory Management** - Quản lý kho hàng
- 🚚 **Shipping Management** - Quản lý giao hàng
- 👥 **Customer Management** - Quản lý khách hàng
- ⚙️ **Store Settings** - Cấu hình cửa hàng
- 💰 **Financial Reports** - Báo cáo tài chính
- 📋 **Audit Logs** - Nhật ký hoạt động

## Base URL

```
http://localhost:5001/api/store
```

## Authentication

Tất cả các endpoint yêu cầu:

1. **Bearer Token** trong header `Authorization`
2. **Admin Role** - User phải có role = 'admin'

```bash
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" http://localhost:5001/api/store/dashboard
```

## Permissions Required

| Endpoint                        | Permission               |
| ------------------------------- | ------------------------ |
| GET /dashboard                  | `view:dashboard`         |
| GET /analytics/revenue          | `view:analytics`         |
| GET /inventory                  | `view:inventory`         |
| PUT /inventory/:bentheid        | `manage:inventory`       |
| GET /inventory/alerts/low-stock | `view:stock_alerts`      |
| GET /shipping/pending           | `view:shipments`         |
| PATCH /shipping/:donhangid      | `manage:shipments`       |
| GET /customers                  | `view:customers`         |
| GET /customers/:userid          | `view:customers`         |
| GET /settings                   | `manage:store_settings`  |
| PATCH /settings                 | `manage:store_settings`  |
| GET /reports/revenue            | `view:financial_reports` |
| GET /reports/profit             | `view:financial_reports` |
| GET /audit-logs                 | `view:audit_logs`        |

## API Endpoints

### 📊 Dashboard & Analytics

#### Get Dashboard Statistics

```http
GET /api/store/dashboard
```

**Response:**

```json
{
  "totalRevenue": 50000000,
  "totalOrders": 245,
  "totalCustomers": 1200,
  "lowStockItems": 15
}
```

**Quyền yêu cầu:** `view:dashboard`

#### Get Revenue Analytics

```http
GET /api/store/analytics/revenue?period=monthly
```

**Query Parameters:**

- `period` (string): `daily` | `weekly` | `monthly` | `yearly` (default: `daily`)

**Response:**

```json
[
  {
    "date": "2026-04-01",
    "revenue": 1000000,
    "orders": 10,
    "avgOrderValue": 100000
  },
  ...
]
```

**Quyền yêu cầu:** `view:analytics`

---

### 📦 Inventory Management

#### Get Inventory List

```http
GET /api/store/inventory?page=1&limit=20&search=sku123
```

**Query Parameters:**

- `page` (number): Trang (default: 1)
- `limit` (number): Số items trên trang (default: 20)
- `search` (string): Tìm kiếm theo tên sản phẩm hoặc SKU

**Response:**

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
  "limit": 20,
  "total": 150
}
```

**Quyền yêu cầu:** `view:inventory`

#### Update Stock Level

```http
PUT /api/store/inventory/:bentheid
Content-Type: application/json

{
  "tonkho": 100,
  "note": "Nhập hàng từ nhà cung cấp A"
}
```

**Request Body:**

- `tonkho` (number, required): Số lượng tồn kho mới
- `note` (string, optional): Ghi chú

**Response:**

```json
{
  "message": "Stock updated",
  "data": {
    "bentheid": 1,
    "tonkho": 100,
    "giaban": 29000000,
    "updated_at": "2026-04-10T12:00:00Z"
  }
}
```

**Quyền yêu cầu:** `manage:inventory`

#### Get Low Stock Alerts

```http
GET /api/store/inventory/alerts/low-stock?threshold=10
```

**Query Parameters:**

- `threshold` (number): Ngưỡng cảnh báo (default: 10)

**Response:**

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

**Quyền yêu cầu:** `view:stock_alerts`

---

### 🚚 Shipping Management

#### Get Pending Shipments

```http
GET /api/store/shipping/pending
```

**Response:**

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

**Quyền yêu cầu:** `view:shipments`

#### Update Shipment Status

```http
PATCH /api/store/shipping/:donhangid
Content-Type: application/json

{
  "status": "SHIPPED",
  "trackingNumber": "VN123456789"
}
```

**Request Body:**

- `status` (string, required): `SHIPPED` | `IN_TRANSIT` | `DELIVERED` | `FAILED`
- `trackingNumber` (string, optional): Mã theo dõi
- `carrier` (string, optional): Bên vận chuyển

**Response:**

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

**Quyền yêu cầu:** `manage:shipments`

---

### 👥 Customer Management

#### Get Customers List

```http
GET /api/store/customers?page=1&limit=20&search=Nguyen
```

**Query Parameters:**

- `page` (number): Trang (default: 1)
- `limit` (number): Số items (default: 20)
- `search` (string): Tìm kiếm theo tên hoặc email

**Response:**

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
  "limit": 20
}
```

**Quyền yêu cầu:** `view:customers`

#### Get Customer Detail

```http
GET /api/store/customers/:userid
```

**Response:**

```json
{
  "customer": {
    "userid": 50,
    "email": "nguyen@example.com",
    "hoten": "Nguyễn Văn A",
    "sdt": "0123456789",
    "avatarurl": "https://...",
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

**Quyền yêu cầu:** `view:customers`

---

### ⚙️ Store Settings

#### Get Store Settings

```http
GET /api/store/settings
```

**Response:**

```json
{
  "storeName": "My Online Store",
  "storeEmail": "admin@mystore.com",
  "storePhone": "+84 123 456 789",
  "address": "123 Main St, Da Nang",
  "businessHours": {
    "monday": { "open": "08:00", "close": "17:00" },
    "saturday": { "open": "08:00", "close": "12:00" },
    "sunday": { "closed": true }
  },
  "currency": "VND",
  "timezone": "Asia/Ho_Chi_Minh"
}
```

**Quyền yêu cầu:** `manage:store_settings`

#### Update Store Settings

```http
PATCH /api/store/settings
Content-Type: application/json

{
  "storeName": "My Updated Store",
  "storeEmail": "newemail@mystore.com",
  "businessHours": {
    "monday": { "open": "07:00", "close": "18:00" }
  }
}
```

**Request Body:**

- `storeName` (string): Tên cửa hàng
- `storeEmail` (string): Email cửa hàng
- `storePhone` (string): Số điện thoại
- `address` (string): Địa chỉ
- `businessHours` (object): Giờ kinh doanh

**Response:**

```json
{
  "message": "Store settings updated",
  "data": { ... }
}
```

**Quyền yêu cầu:** `manage:store_settings`

---

### 💰 Financial Reports

#### Get Revenue Report

```http
GET /api/store/reports/revenue?startDate=2026-04-01&endDate=2026-04-10
```

**Query Parameters:**

- `startDate` (string): Ngày bắt đầu (ISO format)
- `endDate` (string): Ngày kết thúc (ISO format)

**Response:**

```json
{
  "startDate": "2026-04-01",
  "endDate": "2026-04-10",
  "totalRevenue": 50000000,
  "totalOrders": 50,
  "averageOrderValue": 1000000,
  "topProducts": [
    {
      "productName": "Laptop",
      "revenue": 20000000,
      "quantity": 10
    }
  ]
}
```

**Quyền yêu cầu:** `view:financial_reports`

#### Get Profit Report

```http
GET /api/store/reports/profit
```

**Response:**

```json
{
  "totalRevenue": 50000000,
  "totalCosts": 30000000,
  "profit": 20000000,
  "profitMargin": 40
}
```

**Quyền yêu cầu:** `view:financial_reports`

---

### 📋 Audit Logs

#### Get Audit Logs

```http
GET /api/store/audit-logs?page=1&limit=50&action=update&actor=admin1
```

**Query Parameters:**

- `page` (number): Trang (default: 1)
- `limit` (number): Số items (default: 50)
- `action` (string): Lọc theo action
- `actor` (string): Lọc theo người thực hiện

**Response:**

```json
{
  "data": [
    {
      "logId": 1001,
      "actor": "admin@store.com",
      "action": "UPDATE_PRODUCT",
      "resource": "product:5",
      "details": { ... },
      "timestamp": "2026-04-10T12:00:00Z",
      "ipAddress": "192.168.1.1"
    }
  ],
  "page": 1,
  "limit": 50
}
```

**Quyền yêu cầu:** `view:audit_logs`

---

## Error Handling

### 401 Unauthorized

```json
{
  "status": 401,
  "message": "Invalid/expired token"
}
```

### 403 Forbidden

```json
{
  "status": 403,
  "message": "Forbidden: insufficient permissions",
  "required": ["manage:inventory"],
  "userRole": "user"
}
```

### 404 Not Found

```json
{
  "status": 404,
  "message": "Product variant not found"
}
```

### 400 Bad Request

```json
{
  "status": 400,
  "message": "Invalid stock level"
}
```

---

## Rate Limiting

- **Dashboard endpoints**: 100 requests/minute
- **Report endpoints**: 50 requests/minute
- **Other endpoints**: 200 requests/minute

---

## Webhooks (Optional)

Có thể setup webhooks để nhận thông báo khi:

- Hàng tồn kho thấp
- Đơn hàng mới được thanh toán
- Giao hàng thành công

---

## Best Practices

1. ✅ Luôn kiểm tra quyền trước khi thực hiện thao tác
2. ✅ Sử dụng query parameters để lọc/phân trang thay vì lấy hết data
3. ✅ Log tất cả các thao tác quan trọng
4. ✅ Validate input data trước khi cập nhật
5. ✅ Cache data nếu cần (ví dụ: store settings)
6. ✅ Implement retry logic cho các request quan trọng

---

## Integration Examples

### JavaScript/Node.js

```javascript
const response = await fetch("http://localhost:5001/api/store/dashboard", {
  method: "GET",
  headers: {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  },
});

const data = await response.json();
console.log(data);
```

### React Hook

```javascript
function useDashboard() {
  const [stats, setStats] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.isAdmin) return;

    fetch("/api/store/dashboard", {
      headers: {
        Authorization: `Bearer ${user.accessToken}`,
      },
    })
      .then((res) => res.json())
      .then(setStats);
  }, [user]);

  return stats;
}
```

---

## Người Liên Hệ

Nếu có câu hỏi, vui lòng liên hệ: support@mystore.com
