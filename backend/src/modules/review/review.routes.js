import { Router } from "express";
import {
  requireAuth,
  requireAdmin,
} from "../../middlewares/authz.middleware.js";
import * as c from "./review.controller.js";

const router = Router();

// admin (đặt trước param)
router.get("/admin/all", requireAuth(), requireAdmin, c.adminListAll);
router.patch(
  "/:danhgiaid/status",
  requireAuth(),
  requireAdmin,
  c.adminSetStatus
);

// public
router.get("/variant/:bentheid", c.listByVariant);

// user
router.get("/my", requireAuth(), c.listMine);
router.post("/", requireAuth(), c.create);
router.put("/:danhgiaid", requireAuth(), c.updateMine);
router.delete("/:danhgiaid", requireAuth(), c.removeMine);

export default router;
