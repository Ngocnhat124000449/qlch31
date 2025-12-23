import { Router } from "express";
import {
  requireAuth,
  requireAdmin,
} from "../../middlewares/authz.middleware.js";
import * as c from "./post.controller.js";

const router = Router();

// admin (đặt trước param)
router.get("/admin/all", requireAuth(), requireAdmin, c.adminListAll);
router.post("/", requireAuth(), requireAdmin, c.adminCreate);
router.put("/:baidangid", requireAuth(), requireAdmin, c.adminUpdate);
router.patch(
  "/:baidangid/status",
  requireAuth(),
  requireAdmin,
  c.adminSetStatus
);

// public
router.get("/", c.listPublic);
router.get("/:baidangid", c.getPublic);

export default router;
