import { Router } from "express";
import { requireAuth } from "../../middlewares/authz.middleware.js";
import * as c from "./address.controller.js";

const router = Router();

// user only
router.get("/", requireAuth(), c.listMine);
router.get("/:diachiuserid", requireAuth(), c.getMine);
router.post("/", requireAuth(), c.createMine);
router.put("/:diachiuserid", requireAuth(), c.updateMine);
router.delete("/:diachiuserid", requireAuth(), c.removeMine);

export default router;
