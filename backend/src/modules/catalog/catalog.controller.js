import * as v from "./catalog.validators.js";
import * as s from "./catalog.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { AppError } from "../../utils/appError.js";

function toIntOrNull(x) {
  if (x === undefined || x === null || x === "") return null;
  const n = Number(x);
  return Number.isFinite(n) && Number.isInteger(n) ? n : null;
}

function toNumberOrKeep(x) {
  if (x === undefined || x === null || x === "") return x;
  const n = Number(x);
  return Number.isFinite(n) ? n : x;
}

function toBoolOrKeep(x) {
  if (x === true || x === false) return x;
  if (typeof x === "string") {
    const s = x.trim().toLowerCase();
    if (s === "true") return true;
    if (s === "false") return false;
  }
  return x;
}

function pickUploadedImageUrl(req) {
  return (
    req?.uploadedImage?.url ||
    req?.uploadedImageUrl ||
    req?.file?.path ||
    req?.file?.url ||
    req?.file?.secure_url ||
    null
  );
}

export const listCategories = asyncHandler(async (req, res) => {
  const includeInactive = req.query.all === "1" && req.user?.isAdmin === true;
  const data = await s.listCategories({ includeInactive });
  return res.json({ categories: data });
});

export const getCategory = asyncHandler(async (req, res) => {
  const id = toIntOrNull(req.params.danhmucid);
  if (!id) {
    throw new AppError("Invalid danhmucid", 400, "INVALID_PARAM", {
      param: "danhmucid",
    });
  }

  const data = await s.getCategory(id);
  if (!data) throw new AppError("Not found", 404, "NOT_FOUND");

  return res.json({ category: data });
});

export const createCategory = asyncHandler(async (req, res) => {
  const val = v.validateCategoryCreate(req.body);
  if (!val.ok) {
    throw new AppError("Validation error", 400, "VALIDATION_ERROR", {
      errors: val.errors,
    });
  }

  const data = await s.createCategory(val.value);
  return res.status(201).json({ category: data });
});

export const updateCategory = asyncHandler(async (req, res) => {
  const id = toIntOrNull(req.params.danhmucid);
  if (!id) {
    throw new AppError("Invalid danhmucid", 400, "INVALID_PARAM", {
      param: "danhmucid",
    });
  }

  const val = v.validateCategoryUpdate(req.body);
  if (!val.ok) {
    throw new AppError("Validation error", 400, "VALIDATION_ERROR", {
      errors: val.errors,
    });
  }

  const data = await s.updateCategory(id, val.value);
  return res.json({ category: data });
});

export const listSuppliers = asyncHandler(async (req, res) => {
  const includeInactive = req.query.all === "1" && req.user?.isAdmin === true;
  const data = await s.listSuppliers({ includeInactive });
  return res.json({ suppliers: data });
});

export const getSupplier = asyncHandler(async (req, res) => {
  const id = toIntOrNull(req.params.nhacungcapid);
  if (!id) {
    throw new AppError("Invalid nhacungcapid", 400, "INVALID_PARAM", {
      param: "nhacungcapid",
    });
  }

  const data = await s.getSupplier(id);
  if (!data) throw new AppError("Not found", 404, "NOT_FOUND");

  return res.json({ supplier: data });
});

export const createSupplier = asyncHandler(async (req, res) => {
  const val = v.validateSupplierCreate(req.body);
  if (!val.ok) {
    throw new AppError("Validation error", 400, "VALIDATION_ERROR", {
      errors: val.errors,
    });
  }

  const data = await s.createSupplier(val.value);
  return res.status(201).json({ supplier: data });
});

export const updateSupplier = asyncHandler(async (req, res) => {
  const id = toIntOrNull(req.params.nhacungcapid);
  if (!id) {
    throw new AppError("Invalid nhacungcapid", 400, "INVALID_PARAM", {
      param: "nhacungcapid",
    });
  }

  const val = v.validateSupplierUpdate(req.body);
  if (!val.ok) {
    throw new AppError("Validation error", 400, "VALIDATION_ERROR", {
      errors: val.errors,
    });
  }

  const data = await s.updateSupplier(id, val.value);
  return res.json({ supplier: data });
});

export const listProducts = asyncHandler(async (req, res) => {
  const includeInactive = req.query.all === "1" && req.user?.isAdmin === true;

  const danhmucid = toIntOrNull(req.query.danhmucid);
  const nhacungcapid = toIntOrNull(req.query.nhacungcapid);
  const q = (req.query.q || "").trim() || null;

  const limit = Math.min(Number(req.query.limit || 20), 100);
  const page = Math.max(Number(req.query.page || 1), 1);
  const offset = (page - 1) * limit;

  const data = await s.listProducts({
    includeInactive,
    danhmucid,
    nhacungcapid,
    q,
    limit,
    offset,
  });

  return res.json({ products: data, page, limit });
});

export const getProductDetail = asyncHandler(async (req, res) => {
  const id = toIntOrNull(req.params.sanphamid);
  if (!id) {
    throw new AppError("Invalid sanphamid", 400, "INVALID_PARAM", {
      param: "sanphamid",
    });
  }

  const data = await s.getProductDetail(id);
  if (!data) throw new AppError("Not found", 404, "NOT_FOUND");

  // Public: nếu sản phẩm bị tắt, chỉ admin xem được
  if (data.trangthai === false && req.user?.isAdmin !== true) {
    throw new AppError("Not found", 404, "NOT_FOUND");
  }

  return res.json({ product: data });
});

export const createProduct = asyncHandler(async (req, res) => {
  const imageUrl = pickUploadedImageUrl(req);

  const body = {
    ...req.body,
    danhmucid: toNumberOrKeep(req.body?.danhmucid),
    nhacungcapid: toNumberOrKeep(req.body?.nhacungcapid),
    trangthai: toBoolOrKeep(req.body?.trangthai),
    hinhanhurl: imageUrl ?? req.body?.hinhanhurl,
  };

  const val = v.validateProductCreate(body);
  if (!val.ok) {
    throw new AppError("Validation error", 400, "VALIDATION_ERROR", {
      errors: val.errors,
    });
  }

  const data = await s.createProduct(val.value);
  return res.status(201).json({ product: data });
});

export const updateProduct = asyncHandler(async (req, res) => {
  const id = toIntOrNull(req.params.sanphamid);
  if (!id) {
    throw new AppError("Invalid sanphamid", 400, "INVALID_PARAM", {
      param: "sanphamid",
    });
  }

  const imageUrl = pickUploadedImageUrl(req);

  const body = {
    ...req.body,
    danhmucid: toNumberOrKeep(req.body?.danhmucid),
    nhacungcapid: toNumberOrKeep(req.body?.nhacungcapid),
    trangthai: toBoolOrKeep(req.body?.trangthai),
    hinhanhurl: imageUrl ?? req.body?.hinhanhurl,
  };

  const val = v.validateProductUpdate(body);
  if (!val.ok) {
    throw new AppError("Validation error", 400, "VALIDATION_ERROR", {
      errors: val.errors,
    });
  }

  const data = await s.updateProduct(id, val.value);
  return res.json({ product: data });
});

export const listVariantsByProduct = asyncHandler(async (req, res) => {
  const sanphamid = toIntOrNull(req.params.sanphamid);
  if (!sanphamid) {
    throw new AppError("Invalid sanphamid", 400, "INVALID_PARAM", {
      param: "sanphamid",
    });
  }

  const includeInactive = req.query.all === "1" && req.user?.isAdmin === true;
  const data = await s.listVariantsByProduct(sanphamid, { includeInactive });

  return res.json({ variants: data });
});

export const createVariant = asyncHandler(async (req, res) => {
  const sanphamid = toIntOrNull(req.params.sanphamid);
  if (!sanphamid) {
    throw new AppError("Invalid sanphamid", 400, "INVALID_PARAM", {
      param: "sanphamid",
    });
  }

  const imageUrl = pickUploadedImageUrl(req);

  const body = {
    ...req.body,
    giaban: toNumberOrKeep(req.body?.giaban),
    tonkho: toNumberOrKeep(req.body?.tonkho),
    trangthai: toBoolOrKeep(req.body?.trangthai),
    hinhanhurl: imageUrl ?? req.body?.hinhanhurl,
  };

  const val = v.validateVariantCreate(body);
  if (!val.ok) {
    throw new AppError("Validation error", 400, "VALIDATION_ERROR", {
      errors: val.errors,
    });
  }

  const data = await s.createVariant(sanphamid, val.value);
  return res.status(201).json({ variant: data });
});

export const updateVariant = asyncHandler(async (req, res) => {
  const bentheid = toIntOrNull(req.params.bentheid);
  if (!bentheid) {
    throw new AppError("Invalid bentheid", 400, "INVALID_PARAM", {
      param: "bentheid",
    });
  }

  const imageUrl = pickUploadedImageUrl(req);

  const body = {
    ...req.body,
    giaban: toNumberOrKeep(req.body?.giaban),
    tonkho: toNumberOrKeep(req.body?.tonkho),
    trangthai: toBoolOrKeep(req.body?.trangthai),
    hinhanhurl: imageUrl ?? req.body?.hinhanhurl,
  };

  const val = v.validateVariantUpdate(body);
  if (!val.ok) {
    throw new AppError("Validation error", 400, "VALIDATION_ERROR", {
      errors: val.errors,
    });
  }

  const data = await s.updateVariant(bentheid, val.value);
  return res.json({ variant: data });
});
