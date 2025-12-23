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

  // Fallback: nếu thiếu user_profile (hay gặp với tài khoản admin tạo sẵn),
  // vẫn trả tối thiểu thông tin để frontend không hiểu nhầm là guest.
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

  // Đảm bảo luôn có role/isAdmin từ middleware (nếu service chưa map)
  if (profile.role === undefined) profile.role = req.user.role;
  if (profile.isAdmin === undefined) profile.isAdmin = req.user.isAdmin;

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

// Admin: list users
export const listUsers = asyncHandler(async (req, res) => {
  const limit = Math.min(Number(req.query.limit || 50), 200);
  const offset = Math.max(Number(req.query.offset || 0), 0);

  const users = await adminListUsers({ limit, offset });
  return res.json({ users, limit, offset });
});
