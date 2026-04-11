import { Router } from "express";
import { requireAuth } from "../../middlewares/authz.middleware.js";
import { requirePermission } from "../../middlewares/permission.middleware.js";
import * as c from "./coupon.controller.js";

const router = Router();

/**
 * PUBLIC - Xem mã giảm giá đang hoạt động
 */
router.get("/active", c.listActive);

/**
 * USER - Sử dụng mã giảm giá
 */
router.post(
  "/apply",
  requireAuth(),
  requirePermission("apply:coupons"),
  c.apply,
);
router.post(
  "/cancel",
  requireAuth(),
  requirePermission("apply:coupons"),
  c.cancel,
);
router.get(
  "/my/history",
  requireAuth(),
  requirePermission("view:coupons"),
  c.myHistory,
);

/**
 * ADMIN - Quản lý mã giảm giá
 */
router.get(
  "/admin/all",
  requireAuth(),
  requirePermission("create:coupons"),
  c.adminListAll,
);
router.post(
  "/",
  requireAuth(),
  requirePermission("create:coupons"),
  c.adminCreate,
);
router.put(
  "/:magiamgiaid",
  requireAuth(),
  requirePermission("edit:coupons"),
  c.adminUpdate,
);
router.post(
  "/:magiamgiaid/variants",
  requireAuth(),
  requirePermission("edit:coupons"),
  c.adminAttachVariant,
);
router.delete(
  "/:magiamgiaid/variants/:bentheid",
  requireAuth(),
  requirePermission("delete:coupons"),
  c.adminDetachVariant,
);

export default router;
