import * as v from "./promotion.validators.js";
import * as s from "./promotion.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { AppError } from "../../utils/appError.js";

export const listActive = asyncHandler(async (req, res) => {
  const promotions = await s.listActivePromotions();
  return res.json({ promotions });
});

export const getActiveDetail = asyncHandler(async (req, res) => {
  const id = v.parseKhuyenmaiidParam(req.params.khuyenmaiid);
  if (!id) {
    throw new AppError("Invalid khuyenmaiid", 400, "INVALID_PARAM", {
      param: "khuyenmaiid",
    });
  }

  const promotion = await s.getActivePromotionDetail(id);
  if (!promotion) throw new AppError("Not found", 404, "NOT_FOUND");

  return res.json({ promotion });
});

export const adminListAll = asyncHandler(async (req, res) => {
  const promotions = await s.adminListAllPromotions();
  return res.json({ promotions });
});

export const create = asyncHandler(async (req, res) => {
  const val = v.validateCreatePromotion(req.body);
  if (!val.ok) {
    throw new AppError("Validation error", 400, "VALIDATION_ERROR", {
      errors: val.errors,
    });
  }

  const promotion = await s.createPromotion(val.value);
  return res.status(201).json({ promotion });
});

export const update = asyncHandler(async (req, res) => {
  const id = v.parseKhuyenmaiidParam(req.params.khuyenmaiid);
  if (!id) {
    throw new AppError("Invalid khuyenmaiid", 400, "INVALID_PARAM", {
      param: "khuyenmaiid",
    });
  }

  const val = v.validateUpdatePromotion(req.body);
  if (!val.ok) {
    throw new AppError("Validation error", 400, "VALIDATION_ERROR", {
      errors: val.errors,
    });
  }

  const promotion = await s.updatePromotion(id, val.value);
  return res.json({ promotion });
});

export const attachProduct = asyncHandler(async (req, res) => {
  const id = v.parseKhuyenmaiidParam(req.params.khuyenmaiid);
  if (!id) {
    throw new AppError("Invalid khuyenmaiid", 400, "INVALID_PARAM", {
      param: "khuyenmaiid",
    });
  }

  const val = v.validateAttachProduct(req.body);
  if (!val.ok) {
    throw new AppError("Validation error", 400, "VALIDATION_ERROR", {
      errors: val.errors,
    });
  }

  await s.attachPromotionProduct(id, val.value.sanphamid);
  return res.json({
    message: "Attached",
    khuyenmaiid: id,
    sanphamid: val.value.sanphamid,
  });
});

export const detachProduct = asyncHandler(async (req, res) => {
  const id = v.parseKhuyenmaiidParam(req.params.khuyenmaiid);
  const sanphamid = v.parseSanphamidParam(req.params.sanphamid);

  if (!id || !sanphamid) {
    throw new AppError("Invalid params", 400, "INVALID_PARAM", {
      params: ["khuyenmaiid", "sanphamid"],
    });
  }

  await s.detachPromotionProduct(id, sanphamid);
  return res.json({ message: "Detached" });
});
