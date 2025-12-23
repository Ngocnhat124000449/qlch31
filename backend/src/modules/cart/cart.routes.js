import { Router } from "express";
import { requireAuth } from "../../middlewares/authz.middleware.js";
import * as c from "./cart.controller.js";

const router = Router();

router.get("/", requireAuth(), c.getCart);
router.post("/items", requireAuth(), c.addItem);
router.put("/items/:bentheid", requireAuth(), c.setItemQty);
router.delete("/items/:bentheid", requireAuth(), c.removeItem);
router.delete("/clear", requireAuth(), c.clearCart);

export default router;
