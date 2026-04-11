/**
 * Middleware helper untuk phân quyền dựa trên permission
 */

import { hasPermission, userHasPermission } from "../utils/permissions.js";

/**
 * Middleware factory: kiểm tra xem user có quyền thực hiện action
 * @param {string|string[]} permissions - permission hoặc mảng permissions
 * @returns {function} middleware
 *
 * Ví dụ:
 *   router.post("/", requireAuth(), requirePermission("create:products"), controller)
 *   router.get("/", requirePermission(["view:orders", "view:my_orders"]), controller)
 */
export function requirePermission(permissions) {
  const permList = Array.isArray(permissions) ? permissions : [permissions];

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthenticated" });
    }

    // Kiểm tra xem user có ít nhất một trong các quyền
    const hasAny = permList.some((perm) => userHasPermission(req.user, perm));

    if (!hasAny) {
      return res.status(403).json({
        message: "Forbidden: insufficient permissions",
        required: permList,
        userRole: req.user.role,
      });
    }

    return next();
  };
}

/**
 * Middleware: Chỉ có Admin mới truy cập (shorthand)
 */
export function requireAdminOnly(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthenticated" });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({
      message: "Forbidden: admin only",
    });
  }

  return next();
}

/**
 * Middleware: User chỉ được xem thông tin của chính họ
 * Ví dụ: dùng cho /api/users/:userid -> chỉ được xem profile của chính mình
 */
export function requireOwner(paramName = "userid") {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthenticated" });
    }

    const targetId = Number(req.params[paramName]);
    const userId = Number(req.user.userid);

    // Admin được xem bất cứ ai, user chỉ được xem của chính mình
    if (req.user.role === "admin") {
      return next();
    }

    if (targetId !== userId) {
      return res.status(403).json({
        message: "Forbidden: can only access your own data",
      });
    }

    return next();
  };
}

/**
 * Middleware: Resource access control
 * Kiểm tra xem resource có phải của user này không hoặc user là admin
 *
 * @param {function} getOwnerId - async function(req) return owner user id
 */
export function requireResourceOwner(getOwnerId) {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthenticated" });
      }

      // Admin được quản lý mọi resource
      if (req.user.role === "admin") {
        return next();
      }

      // Lấy owner id dari function
      const ownerId = await getOwnerId(req);
      if (!ownerId) {
        return res.status(404).json({ message: "Resource not found" });
      }

      // User chỉ được quản lý resource của chính họ
      if (Number(ownerId) !== Number(req.user.userid)) {
        return res.status(403).json({
          message: "Forbidden: can only manage your own resources",
        });
      }

      return next();
    } catch (err) {
      console.error("requireResourceOwner error:", err);
      return res.status(500).json({ message: "Server error" });
    }
  };
}

export default {
  requirePermission,
  requireAdminOnly,
  requireOwner,
  requireResourceOwner,
};
