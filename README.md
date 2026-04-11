===============================
E-COMMERCE FULLSTACK PROJECT
===============================

[Badges]
Node.js | Express | PostgreSQL | Next.js | Tailwind | JWT | Cloudinary

-------------------------------
GIỚI THIỆU
-------------------------------
Dự án hệ thống thương mại điện tử gồm:

- Backend API (Node.js + Express)
- Frontend (Next.js + TailwindCSS + shadcn/ui)
- 
-------------------------------
CÁCH CHẠY BACKEND
-------------------------------

cd backend
npm install

Tạo .env:

DATABASE_URL=postgresql://neondb_owner:npg_4uDMSHk3xird@ep-muddy-snow-a1d0dn6f-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
JWT_SECRET="f4b9b2f3c7e94d8d1fcb8e1a2d9f65c3b1a7e8d4c29f44e1b95a7f23d4c8b7e9c2d1e4f6a9c8b3d7e1f4a6c9b2d8e3f7a9"
CLOUDINARY_CLOUD_NAME="dkczxprrd"
CLOUDINARY_API_KEY="644759851737567"
CLOUDINARY_API_SECRET="4WoskVAzsT7Wc5p9BB6yXhSg6hM"
CLOUDINARY_UPLOAD_PRESET=ml_default
PORT=5001
JWT_EXPIRES_IN=7d
ACCESS_TOKEN_SECRET=Qe9mX2pK7vL4nT1sR8yH3uD6cB0aZ5wJ
REFRESH_TOKEN_SECRET=H7qN3sV9kP2xL6mT1rY8cD4uA0zE5bWj
ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d


Chạy:
npm run dev

-------------------------------
CÁCH CHẠY FRONTEND
-------------------------------

cd frontend
npm install

Tạo .env.local:

NEXT_PUBLIC_API_BASE_URL=http://localhost:5001
NEXT_PUBLIC_API_BASE=http://localhost:5001


Chạy:
npm run dev

-------------------------------
CÁC MODULE CHÍNH
-------------------------------

1. AUTH MODULE (Xác thực)
- Đăng ký, đăng nhập
- JWT access + refresh token
- Logout / Logout all
- Bảo mật API

2. USER MODULE (Người dùng)
- Quản lý thông tin cá nhân
- Cập nhật profile
- Đổi mật khẩu

3. ADDRESS MODULE (Địa chỉ)
- Thêm / sửa / xoá địa chỉ
- Đặt địa chỉ mặc định
- Dùng cho đặt hàng

4. CATALOG MODULE (Danh mục & Sản phẩm)
- Quản lý danh mục (Category)
- Quản lý nhà cung cấp (Supplier)
- Quản lý sản phẩm (Product)
- Quản lý biến thể (Variant)
- Upload ảnh sản phẩm

5. ATTRIBUTE MODULE (Thuộc tính sản phẩm)
- Tạo thuộc tính (màu, size...)
- Gán thuộc tính vào danh mục
- Gán giá trị thuộc tính cho variant

6. CART MODULE (Giỏ hàng)
- Thêm sản phẩm vào giỏ
- Cập nhật số lượng
- Xoá sản phẩm
- Tính tổng tiền (subtotal)

7. ORDER MODULE (Đơn hàng)
- Tạo đơn từ giỏ hàng
- Xem danh sách đơn
- Huỷ đơn
- Admin cập nhật trạng thái

8. COUPON MODULE (Mã giảm giá)
- Tạo mã giảm giá
- Áp dụng coupon vào đơn hàng
- Giới hạn số lần dùng
- Lịch sử sử dụng coupon

9. PROMOTION MODULE (Khuyến mãi)
- Tạo chương trình giảm giá
- Áp dụng cho sản phẩm
- Hỗ trợ giảm theo % hoặc số tiền

10. WISHLIST MODULE
- Thêm sản phẩm yêu thích
- Xoá sản phẩm
- Lưu danh sách cá nhân

11. REVIEW MODULE (Đánh giá)
- Đánh giá sản phẩm (1–5 sao)
- Mỗi user chỉ review 1 lần
- Thống kê rating

12. POST MODULE (Bài đăng)
- Blog / News
- Hiển thị bài viết cho user
- Admin CRUD bài viết

13. BANNER MODULE
- Quản lý banner trang chủ
- Upload ảnh
- Hiển thị theo vị trí & thời gian

14. PAYMENT MODULE
- Quản lý phương thức thanh toán
- COD / Banking

-------------------------------
KIẾN TRÚC HỆ THỐNG
-------------------------------

Frontend (Next.js)
        |
        v
Backend API (Express)
        |
        v
Controller → Service → Database

+ Cloudinary (Upload ảnh)

-------------------------------
CÔNG NGHỆ
-------------------------------

Backend:
- Node.js + Express
- PostgreSQL
- JWT Authentication

Frontend:
- Next.js 16
- TailwindCSS
- shadcn/ui


-------------------------------
ERROR FORMAT
-------------------------------

{
  "message": "Error message",
  "statusCode": 400,
  "code": "VALIDATION_ERROR",
  "meta": {}
}

-------------------------------
AUTHOR
-------------------------------

Nguyễn Ngọc Nhật
Sinh viên CNTT - Đại học Lạc Hồng

-------------------------------
NOTES
-------------------------------

- Phân quyền: Public / User / Admin
- API chuẩn RESTful
- Upload ảnh qua Cloudinary
- Có pagination & filter
