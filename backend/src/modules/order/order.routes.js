import { Router } from "express";
import { requireAuth } from "../../middlewares/authz.middleware.js";
import { requirePermission } from "../../middlewares/permission.middleware.js";
import * as c from "./order.controller.js";

const router = Router();

/**
 * USER - Quản lý đơn hàng của mình
 */
router.post(
  "/",
  requireAuth(),
  requirePermission("create:orders"),
  c.createFromCart,
);
router.get("/", requireAuth(), requirePermission("view:my_orders"), c.listMine);
router.get(
  "/:donhangid",
  requireAuth(),
  requirePermission("view:order_detail"),
  c.getDetail,
);
router.patch(
  "/:donhangid/cancel",
  requireAuth(),
  requirePermission("cancel:my_orders"),
  c.cancelMine,
);

/**
 * ADMIN - Quản lý tất cả đơn hàng
 */
router.get(
  "/admin/all",
  requireAuth(),
  requirePermission("view:all_orders"),
  c.adminListAll,
);
router.patch(
  "/:donhangid/status",
  requireAuth(),
  requirePermission("update:order_status"),
  c.adminUpdateStatus,
);

export default router;
