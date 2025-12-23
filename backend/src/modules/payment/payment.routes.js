import { Router } from "express";
import {
  requireAuth,
  requireAdmin,
} from "../../middlewares/authz.middleware.js";
import * as c from "./payment.controller.js";

const router = Router();

router.get("/", c.list);
router.get("/:phuongthucid", c.getOne);

router.post("/", requireAuth(), requireAdmin, c.create);
router.put("/:phuongthucid", requireAuth(), requireAdmin, c.update);
router.delete("/:phuongthucid", requireAuth(), requireAdmin, c.remove);

export default router;
