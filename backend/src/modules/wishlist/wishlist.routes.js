import { Router } from "express";
import { requireAuth } from "../../middlewares/authz.middleware.js";
import * as c from "./wishlist.controller.js";

const router = Router();

router.get("/", requireAuth(), c.getWishlist);
router.post("/items", requireAuth(), c.addItem);
router.delete("/items/:bentheid", requireAuth(), c.removeItem);
router.delete("/clear", requireAuth(), c.clear);

export default router;
