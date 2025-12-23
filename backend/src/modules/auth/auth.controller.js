import { signAccessToken } from "../../utils/jwt.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { AppError } from "../../utils/appError.js";

import {
  createUserAndDefaults,
  verifyUserCredentials,
  createSession,
  rotateSession,
  revokeSessionByRefreshToken,
  revokeAllSessions,
} from "./auth.service.js";

import {
  validateRegister,
  validateLogin,
  validateRefresh,
  validateLogout,
} from "./auth.validators.js";

// POST /api/auth/register
export const register = asyncHandler(async (req, res) => {
  const val = validateRegister(req.body);
  if (!val.ok) {
    throw new AppError("Validation error", 400, "VALIDATION_ERROR", {
      errors: val.errors,
    });
  }

  const { userid, profile } = await createUserAndDefaults(val.value);

  const session = await createSession(userid);
  const accessToken = signAccessToken({ userid, sid: session.sid });

  return res.status(201).json({
    accessToken,
    refreshToken: session.refreshToken,
    user: profile,
  });
});

// POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const val = validateLogin(req.body);
  if (!val.ok) {
    throw new AppError("Validation error", 400, "VALIDATION_ERROR", {
      errors: val.errors,
    });
  }

  const { userid, profile } = await verifyUserCredentials(val.value);

  const session = await createSession(userid);
  const accessToken = signAccessToken({ userid, sid: session.sid });

  return res.json({
    accessToken,
    refreshToken: session.refreshToken,
    user: profile,
  });
});

// POST /api/auth/refresh (rotate refresh token)
export const refresh = asyncHandler(async (req, res) => {
  const val = validateRefresh(req.body);
  if (!val.ok) {
    throw new AppError("Validation error", 400, "VALIDATION_ERROR", {
      errors: val.errors,
    });
  }

  const rotated = await rotateSession(val.value.refreshToken);

  const accessToken = signAccessToken({
    userid: rotated.userid,
    sid: rotated.sid,
  });

  return res.json({
    accessToken,
    refreshToken: rotated.refreshToken,
  });
});

// POST /api/auth/logout (revoke theo refreshToken)
export const logout = asyncHandler(async (req, res) => {
  const val = validateLogout(req.body);
  if (!val.ok) {
    throw new AppError("Validation error", 400, "VALIDATION_ERROR", {
      errors: val.errors,
    });
  }

  await revokeSessionByRefreshToken(val.value.refreshToken);
  return res.json({ message: "Logged out" });
});

// POST /api/auth/logout-all (cần đăng nhập)
export const logoutAll = asyncHandler(async (req, res) => {
  // requireAuth đã gắn req.user rồi, nhưng check nhẹ cho chắc
  if (!req.user?.userid) {
    throw new AppError("Unauthenticated", 401, "UNAUTHENTICATED");
  }

  const count = await revokeAllSessions(req.user.userid);
  return res.json({
    message: "Logged out all sessions",
    revoked: count,
  });
});
