import { Router } from "express";
import {
  requireAuth,
  requireAdmin,
  optionalAuth,
} from "../../middlewares/authz.middleware.js";
import { uploadSingleImage } from "../../middlewares/upload.middleware.js";
import * as c from "./catalog.controller.js";

const router = Router();

/**
 * CATEGORY (danhmuc)
 */
router.get("/categories", optionalAuth(), c.listCategories);
router.get("/categories/:danhmucid", optionalAuth(), c.getCategory);
router.post("/categories", requireAuth(), requireAdmin, c.createCategory);
router.put(
  "/categories/:danhmucid",
  requireAuth(),
  requireAdmin,
  c.updateCategory
);

/**
 * SUPPLIER (nhacungcap)
 */
router.get("/suppliers", optionalAuth(), c.listSuppliers);
router.get("/suppliers/:nhacungcapid", optionalAuth(), c.getSupplier);
router.post("/suppliers", requireAuth(), requireAdmin, c.createSupplier);
router.put(
  "/suppliers/:nhacungcapid",
  requireAuth(),
  requireAdmin,
  c.updateSupplier
);

/**
 * PRODUCT (sanpham) + VARIANTS
 */
router.get("/products", optionalAuth(), c.listProducts);
router.get("/products/:sanphamid", optionalAuth(), c.getProductDetail);

// upload field: "image"
router.post(
  "/products",
  requireAuth(),
  requireAdmin,
  uploadSingleImage("image"),
  c.createProduct
);

router.put(
  "/products/:sanphamid",
  requireAuth(),
  requireAdmin,
  uploadSingleImage("image"),
  c.updateProduct
);

// Variants: list theo product (public), create (admin)
router.get(
  "/products/:sanphamid/variants",
  optionalAuth(),
  c.listVariantsByProduct
);

router.post(
  "/products/:sanphamid/variants",
  requireAuth(),
  requireAdmin,
  uploadSingleImage("image"),
  c.createVariant
);

// Variant update (admin)
router.put(
  "/variants/:bentheid",
  requireAuth(),
  requireAdmin,
  uploadSingleImage("image"),
  c.updateVariant
);

export default router;
