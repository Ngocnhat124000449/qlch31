import { Router } from "express";
import * as controller from "./banner.controller.js";

// ✅ đúng file bạn đang dùng (named export)
import {
  requireAuth,
  requireAdmin,
} from "../../middlewares/authz.middleware.js";

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
 * ADMIN CRUD
 * - requireAuth(): bắt buộc đăng nhập
 * - requireAdmin: chỉ admin mới được CRUD
 * - uploadSingleImage("image"): nhận multipart/form-data field name = image
 */
router.post(
  "/",
  requireAuth(),
  requireAdmin,
  uploadSingleImage("image"),
  controller.createBanner
);

router.patch(
  "/:id",
  requireAuth(),
  requireAdmin,
  uploadSingleImage("image"),
  controller.updateBanner
);

router.delete("/:id", requireAuth(), requireAdmin, controller.deleteBanner);

export default router;
