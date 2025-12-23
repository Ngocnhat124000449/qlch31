import { Router } from "express";
import {
  requireAuth,
  requireAdmin,
} from "../../middlewares/authz.middleware.js";
import {
  me,
  updateProfile,
  updatePassword,
  listUsers,
} from "./user.controller.js";

const router = Router();

// User (cần đăng nhập)
router.get("/me", requireAuth(), me);
router.put("/me", requireAuth(), updateProfile);
router.put("/me/password", requireAuth(), updatePassword);

// Admin (tuỳ chọn)
router.get("/admin/users", requireAuth(), requireAdmin, listUsers);

export default router;
