import { Router } from "express";
import * as controller from "./banner.controller.js";

// ✅ đúng file bạn đang dùng (named export)
import { requireAuth } from "../../middlewares/authz.middleware.js";
import { requirePermission } from "../../middlewares/permission.middleware.js";

// ✅ đúng file upload middleware (named export)
import { uploadSingleImage } from "../../middlewares/upload.middleware.js";

const router = Router();

/**
 * PUBLIC
 * GET /api/banners?vitri=HOME_TOP
 */
router.get("/", controller.listBanners);
router.get("/:id", controller.getBannerById);

/**
 * ADMIN ONLY - Quản lý banner
 * - requireAuth(): bắt buộc đăng nhập
 * - requirePermission("create:banners"): chỉ admin mới được tạo banner
 */
router.post(
  "/",
  requireAuth(),
  requirePermission("create:banners"),
  uploadSingleImage("image"),
  controller.createBanner,
);

router.patch(
  "/:id",
  requireAuth(),
  requirePermission("edit:banners"),
  uploadSingleImage("image"),
  controller.updateBanner,
);

router.delete(
  "/:id",
  requireAuth(),
  requirePermission("delete:banners"),
  controller.deleteBanner,
);

export default router;
