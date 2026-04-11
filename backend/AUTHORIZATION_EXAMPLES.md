/\*\*

- Ví dụ thực tế về sử dụng hệ thống phân quyền
- Các route/controller pattern cho User vs Admin
  \*/

// ============================================
// EXAMPLE 1: Banner Routes (Admin Only CRUD)
// ============================================

import { Router } from "express";
import \* as controller from "./banner.controller.js";
import { requireAuth } from "../../middlewares/authz.middleware.js";
import { requirePermission } from "../../middlewares/permission.middleware.js";
import { uploadSingleImage } from "../../middlewares/upload.middleware.js";

const router = Router();

/\*\*

- PUBLIC - Bất cứ ai có thể xem banner
  \*/
  router.get("/", controller.listBanners);
  router.get("/:id", controller.getBannerById);

/\*\*

- ADMIN - Chỉ admin mới tạo/sửa/xóa
  \*/
  router.post(
  "/",
  requireAuth(),
  requirePermission("create:banners"),
  uploadSingleImage("image"),
  controller.createBanner
  );

router.patch(
"/:id",
requireAuth(),
requirePermission("edit:banners"),
uploadSingleImage("image"),
controller.updateBanner
);

router.delete(
"/:id",
requireAuth(),
requirePermission("delete:banners"),
controller.deleteBanner
);

// ============================================
// EXAMPLE 2: Order Routes (User + Admin)
// ============================================

/\*\*

- USER - Quản lý đơn hàng của chính mình
  \*/
  router.post(
  "/",
  requireAuth(),
  requirePermission("create:orders"),
  controller.createOrder
  );

router.get(
"/",
requireAuth(),
requirePermission("view:my_orders"),
controller.listMyOrders
);

router.get(
"/:orderId",
requireAuth(),
requirePermission("view:order_detail"),
requireResourceOwner(async (req) => {
const order = await getOrderById(req.params.orderId);
return order?.userid; // Kiểm tra order thuộc về user này không
}),
controller.getOrderDetail
);

/\*\*

- ADMIN - Quản lý tất cả đơn hàng
  \*/
  router.get(
  "/admin/all",
  requireAuth(),
  requirePermission("view:all_orders"),
  controller.adminListAllOrders
  );

router.patch(
"/:orderId/status",
requireAuth(),
requirePermission("update:order_status"),
controller.adminUpdateOrderStatus
);

// ============================================
// EXAMPLE 3: Product Routes (Public Read, Admin CRUD)
// ============================================

/\*\*

- PUBLIC - Xem sản phẩm
  \*/
  router.get(
  "/",
  controller.listProducts
  );

router.get(
"/:productId",
controller.getProductDetail
);

/\*\*

- ADMIN - Quản lý sản phẩm
  \*/
  router.post(
  "/",
  requireAuth(),
  requirePermission("create:products"),
  uploadSingleImage("image"),
  controller.createProduct
  );

router.put(
"/:productId",
requireAuth(),
requirePermission("edit:products"),
uploadSingleImage("image"),
controller.updateProduct
);

router.delete(
"/:productId",
requireAuth(),
requirePermission("delete:products"),
controller.deleteProduct
);

// ============================================
// EXAMPLE 4: Review Routes (User + Admin Moderate)
// ============================================

/\*\*

- PUBLIC - Xem đánh giá
  \*/
  router.get(
  "/product/:productId",
  controller.listProductReviews
  );

/\*\*

- USER - Để lại/chỉnh sửa đánh giá của mình
  \*/
  router.post(
  "/",
  requireAuth(),
  requirePermission("create:reviews"),
  controller.createReview
  );

router.patch(
"/:reviewId",
requireAuth(),
requirePermission("edit:own_reviews"),
requireResourceOwner(async (req) => {
const review = await getReviewById(req.params.reviewId);
return review?.userid; // Chỉ được sửa review của mình
}),
controller.updateReview
);

/\*\*

- ADMIN - Duyệt/xóa bất cứ đánh giá
  \*/
  router.patch(
  "/:reviewId/approve",
  requireAuth(),
  requirePermission("moderate:reviews"),
  controller.adminApproveReview
  );

router.delete(
"/:reviewId",
requireAuth(),
requirePermission("delete:all_reviews"),
controller.adminDeleteReview
);

// ============================================
// EXAMPLE 5: User Management (Admin Only)
// ============================================

/\*\*

- USER - Xem/sửa hồ sơ của mình
  \*/
  router.get(
  "/me",
  requireAuth(),
  requirePermission("view:profile"),
  controller.getMyProfile
  );

router.put(
"/me",
requireAuth(),
requirePermission("edit:profile"),
controller.updateMyProfile
);

/\*\*

- ADMIN - Quản lý tất cả user
  \*/
  router.get(
  "/admin/all",
  requireAuth(),
  requirePermission("view:users"),
  controller.adminListAllUsers
  );

router.put(
"/:userId",
requireAuth(),
requirePermission("edit:users"),
controller.adminUpdateUser
);

router.patch(
"/:userId/role",
requireAuth(),
requirePermission("manage:user_roles"),
controller.adminChangeUserRole
);

router.delete(
"/:userId",
requireAuth(),
requirePermission("delete:users"),
controller.adminDeleteUser
);

// ============================================
// EXAMPLE 6: Dynamic Permission Check
// ============================================

import { userHasPermission } from "../../utils/permissions.js";

export async function someAdvancedController(req, res) {
try {
// Kiểm tra quyền động
if (!userHasPermission(req.user, "edit:products")) {
return res.status(403).json({
message: "Forbidden: bạn không có quyền sửa sản phẩm"
});
}

    // Kiểm tra quyền của một trong nhiều action
    const hasModerateAccess = [
      "moderate:reviews",
      "moderate:posts"
    ].some(perm => userHasPermission(req.user, perm));

    if (!hasModerateAccess) {
      return res.status(403).json({
        message: "Forbidden: bạn không có quyền kiểm duyệt"
      });
    }

    // Logic tiếp theo...

} catch (error) {
// Error handling
}
}

// ============================================
// EXAMPLE 7: Frontend Hook (React)
// ============================================

"use client";

import { useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { userHasPermission } from "@/lib/permissions";

export function usePermission(permission) {
const { user } = useAuth();

return useCallback(() => {
return userHasPermission(user, permission);
}, [user, permission]);
}

// Sử dụng trong component
export function AdminDashboard() {
const canViewUsers = usePermission("view:users");
const canManageOrders = usePermission("view:all_orders");

if (!canViewUsers()) {
return <div>Bạn không có quyền truy cập trang này</div>;
}

return (
<div>
{canViewUsers() && <UserManagement />}
{canManageOrders() && <OrderManagement />}
</div>
);
}

export default {
// Export examples
};
