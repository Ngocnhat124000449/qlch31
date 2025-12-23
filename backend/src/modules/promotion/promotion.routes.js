import { Router } from "express";
import {
  requireAuth,
  requireAdmin,
} from "../../middlewares/authz.middleware.js";
import * as c from "./promotion.controller.js";

const router = Router();

// admin (đặt trước param route)
router.get("/admin/all", requireAuth(), requireAdmin, c.adminListAll);

router.post("/", requireAuth(), requireAdmin, c.create);
router.put("/:khuyenmaiid", requireAuth(), requireAdmin, c.update);
router.post(
  "/:khuyenmaiid/products",
  requireAuth(),
  requireAdmin,
  c.attachProduct
);
router.delete(
  "/:khuyenmaiid/products/:sanphamid",
  requireAuth(),
  requireAdmin,
  c.detachProduct
);

// public
router.get("/", c.listActive);
router.get("/:khuyenmaiid", c.getActiveDetail);

export default router;
