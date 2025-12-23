import { Router } from "express";
import {
  requireAuth,
  requireAdmin,
} from "../../middlewares/authz.middleware.js";
import * as c from "./coupon.controller.js";

const router = Router();

// admin (đặt trước param route)
router.get("/admin/all", requireAuth(), requireAdmin, c.adminListAll);
router.post("/", requireAuth(), requireAdmin, c.adminCreate);
router.put("/:magiamgiaid", requireAuth(), requireAdmin, c.adminUpdate);
router.post(
  "/:magiamgiaid/variants",
  requireAuth(),
  requireAdmin,
  c.adminAttachVariant
);
router.delete(
  "/:magiamgiaid/variants/:bentheid",
  requireAuth(),
  requireAdmin,
  c.adminDetachVariant
);

// public
router.get("/active", c.listActive);

// user
router.post("/apply", requireAuth(), c.apply);
router.post("/cancel", requireAuth(), c.cancel);
router.get("/my/history", requireAuth(), c.myHistory);

export default router;
