import { Router } from "express";
import {
  requireAuth,
  optionalAuth,
} from "../../middlewares/authz.middleware.js";
import { requirePermission } from "../../middlewares/permission.middleware.js";
import { uploadSingleImage } from "../../middlewares/upload.middleware.js";
import * as c from "./catalog.controller.js";

const router = Router();

/**
 * CATEGORY (danhmuc) - Admin only (create/update/delete), public read
 */
router.get("/categories", optionalAuth(), c.listCategories);
router.get("/categories/:danhmucid", optionalAuth(), c.getCategory);
router.post(
  "/categories",
  requireAuth(),
  requirePermission("create:categories"),
  c.createCategory,
);
router.put(
  "/categories/:danhmucid",
  requireAuth(),
  requirePermission("edit:categories"),
  c.updateCategory,
);

/**
 * SUPPLIER (nhacungcap) - Admin only (create/update/delete), public read
 */
router.get("/suppliers", optionalAuth(), c.listSuppliers);
router.get("/suppliers/:nhacungcapid", optionalAuth(), c.getSupplier);
router.post(
  "/suppliers",
  requireAuth(),
  requirePermission("create:suppliers"),
  c.createSupplier,
);
router.put(
  "/suppliers/:nhacungcapid",
  requireAuth(),
  requirePermission("edit:suppliers"),
  c.updateSupplier,
);

/**
 * PRODUCT (sanpham) + VARIANTS - Admin only (create/update/delete), public read
 */
router.get("/products", optionalAuth(), c.listProducts);
router.get("/products/:sanphamid", optionalAuth(), c.getProductDetail);

// upload field: "image"
router.post(
  "/products",
  requireAuth(),
  requirePermission("create:products"),
  uploadSingleImage("image"),
  c.createProduct,
);

router.put(
  "/products/:sanphamid",
  requireAuth(),
  requirePermission("edit:products"),
  uploadSingleImage("image"),
  c.updateProduct,
);

// Variants: list theo product (public), create (admin)
router.get(
  "/products/:sanphamid/variants",
  optionalAuth(),
  c.listVariantsByProduct,
);

router.post(
  "/products/:sanphamid/variants",
  requireAuth(),
  requirePermission("edit:product_variants"),
  uploadSingleImage("image"),
  c.createVariant,
);

// Variant update (admin)
router.put(
  "/variants/:bentheid",
  requireAuth(),
  requirePermission("edit:product_variants"),
  uploadSingleImage("image"),
  c.updateVariant,
);

export default router;
