import { Router } from "express";
import {
  requireAuth,
  requireAdmin,
} from "../../middlewares/authz.middleware.js";
import * as c from "./order.controller.js";

const router = Router();

// user
router.post("/", requireAuth(), c.createFromCart);
router.get("/", requireAuth(), c.listMine);
router.get("/:donhangid", requireAuth(), c.getDetail);
router.patch("/:donhangid/cancel", requireAuth(), c.cancelMine);

// admin
router.get("/admin/all", requireAuth(), requireAdmin, c.adminListAll);
router.patch(
  "/:donhangid/status",
  requireAuth(),
  requireAdmin,
  c.adminUpdateStatus
);

export default router;
