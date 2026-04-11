import {
  getMe,
  updateMe,
  changePassword,
  adminListUsers,
} from "./user.service.js";

import { validateUpdateMe, validateChangePassword } from "./user.validators.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { AppError } from "../../utils/appError.js";

export const me = asyncHandler(async (req, res) => {
  const profile = await getMe(req.user.userid);

  // Fallback: nếu service không trả về (user not found)
  if (!profile) {
    return res.json({
      user: {
        userid: req.user.userid,
        email: req.user.email,
        role: req.user.role,
        isAdmin: req.user.isAdmin,
      },
    });
  }

  // Double-check: nếu profile không có isAdmin hoặc role, lấy từ middleware (verified)
  // Middleware đã kiểm tra role từ DB khi xác thực token
  if (profile.isAdmin === undefined || profile.isAdmin === null) {
    profile.isAdmin = req.user.isAdmin;
  }
  if (!profile.role) {
    profile.role = req.user.role;
  }

  return res.json({ user: profile });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const val = validateUpdateMe(req.body);
  if (!val.ok) {
    throw new AppError("Validation error", 400, "VALIDATION_ERROR", {
      errors: val.errors,
    });
  }

  const user = await updateMe(req.user.userid, val.value);
  return res.json({ user });
});

export const updatePassword = asyncHandler(async (req, res) => {
  const val = validateChangePassword(req.body);
  if (!val.ok) {
    throw new AppError("Validation error", 400, "VALIDATION_ERROR", {
      errors: val.errors,
    });
  }

  await changePassword(req.user.userid, val.value);
  return res.json({ message: "Password updated" });
});

/**
 * Verify if user is admin
 * GET /api/users/verify-admin
 * Dùng để frontend xác minh quyền admin
 */
export const verifyAdmin = asyncHandler(async (req, res) => {
  // Middleware requireAuth đã xác minh token hợp lệ
  // req.user.isAdmin được set từ middleware authz
  return res.json({
    isAdmin: req.user.isAdmin,
    role: req.user.role,
    userid: req.user.userid,
  });
});

// Admin: list users
export const listUsers = asyncHandler(async (req, res) => {
  const limit = Math.min(Number(req.query.limit || 50), 200);
  const offset = Math.max(Number(req.query.offset || 0), 0);

  const users = await adminListUsers({ limit, offset });
  return res.json({ users, limit, offset });
});
