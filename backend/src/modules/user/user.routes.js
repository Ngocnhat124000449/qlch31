import { Router } from "express";
import { requireAuth } from "../../middlewares/authz.middleware.js";
import {
  requirePermission,
  requireOwner,
} from "../../middlewares/permission.middleware.js";
import {
  me,
  updateProfile,
  updatePassword,
  listUsers,
  verifyAdmin,
} from "./user.controller.js";

const router = Router();

/**
 * USER - Quản lý hồ sơ cá nhân
 */
router.get("/me", requireAuth(), requirePermission("view:profile"), me);
router.put(
  "/me",
  requireAuth(),
  requirePermission("edit:profile"),
  updateProfile,
);
router.put(
  "/me/password",
  requireAuth(),
  requirePermission("change:password"),
  updatePassword,
);

/**
 * VERIFY ADMIN - Frontend dùng để xác minh quyền admin
 */
router.get("/verify-admin", requireAuth(), verifyAdmin);

/**
 * ADMIN - Quản lý tất cả người dùng
 */
router.get(
  "/admin/users",
  requireAuth(),
  requirePermission("view:users"),
  listUsers,
);

export default router;
