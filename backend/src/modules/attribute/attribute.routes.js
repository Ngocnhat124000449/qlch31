import { Router } from "express";
import {
  requireAuth,
  requireAdmin,
} from "../../middlewares/authz.middleware.js";
import * as c from "./attribute.controller.js";

const router = Router();

/**
 * Public
 */
router.get("/attributes", c.listAttributes);
router.get("/attributes/:thuoctinhid", c.getAttribute);

router.get("/categories/:danhmucid/attributes", c.listCategoryAttributes);
router.get("/variants/:bentheid/attributes", c.listVariantAttributes);

/**
 * Admin
 */
router.post("/attributes", requireAuth(), requireAdmin, c.createAttribute);
router.put(
  "/attributes/:thuoctinhid",
  requireAuth(),
  requireAdmin,
  c.updateAttribute
);
router.delete(
  "/attributes/:thuoctinhid",
  requireAuth(),
  requireAdmin,
  c.deleteAttribute
);

router.post(
  "/categories/:danhmucid/attributes",
  requireAuth(),
  requireAdmin,
  c.attachCategoryAttribute
);
router.put(
  "/categories/:danhmucid/attributes/:thuoctinhid",
  requireAuth(),
  requireAdmin,
  c.updateCategoryAttribute
);
router.delete(
  "/categories/:danhmucid/attributes/:thuoctinhid",
  requireAuth(),
  requireAdmin,
  c.detachCategoryAttribute
);

router.put(
  "/variants/:bentheid/attributes",
  requireAuth(),
  requireAdmin,
  c.upsertVariantAttributes
);
router.delete(
  "/variants/:bentheid/attributes/:thuoctinhid",
  requireAuth(),
  requireAdmin,
  c.deleteVariantAttribute
);

export default router;
