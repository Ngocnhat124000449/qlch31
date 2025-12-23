import * as v from "./attribute.validators.js";
import * as s from "./attribute.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { AppError } from "../../utils/appError.js";

export const listAttributes = asyncHandler(async (req, res) => {
  const attributes = await s.listAttributes();
  return res.json({ attributes });
});

export const getAttribute = asyncHandler(async (req, res) => {
  const id = v.parseIdParam(req.params.thuoctinhid);
  if (!id) {
    throw new AppError("Invalid thuoctinhid", 400, "INVALID_PARAM", {
      param: "thuoctinhid",
    });
  }

  const attribute = await s.getAttribute(id);
  if (!attribute) {
    throw new AppError("Not found", 404, "NOT_FOUND");
  }

  return res.json({ attribute });
});

export const createAttribute = asyncHandler(async (req, res) => {
  const val = v.validateCreateAttribute(req.body);
  if (!val.ok) {
    throw new AppError("Validation error", 400, "VALIDATION_ERROR", {
      errors: val.errors,
    });
  }

  const attribute = await s.createAttribute(val.value);
  return res.status(201).json({ attribute });
});

export const updateAttribute = asyncHandler(async (req, res) => {
  const id = v.parseIdParam(req.params.thuoctinhid);
  if (!id) {
    throw new AppError("Invalid thuoctinhid", 400, "INVALID_PARAM", {
      param: "thuoctinhid",
    });
  }

  const val = v.validateUpdateAttribute(req.body);
  if (!val.ok) {
    throw new AppError("Validation error", 400, "VALIDATION_ERROR", {
      errors: val.errors,
    });
  }

  const attribute = await s.updateAttribute(id, val.value);
  return res.json({ attribute });
});

export const deleteAttribute = asyncHandler(async (req, res) => {
  const id = v.parseIdParam(req.params.thuoctinhid);
  if (!id) {
    throw new AppError("Invalid thuoctinhid", 400, "INVALID_PARAM", {
      param: "thuoctinhid",
    });
  }

  await s.deleteAttribute(id);
  return res.json({ message: "Deleted" });
});

/**
 * Category ↔ Attribute mapping
 */
export const listCategoryAttributes = asyncHandler(async (req, res) => {
  const danhmucid = v.parseIdParam(req.params.danhmucid);
  if (!danhmucid) {
    throw new AppError("Invalid danhmucid", 400, "INVALID_PARAM", {
      param: "danhmucid",
    });
  }

  const categoryAttributes = await s.listCategoryAttributes(danhmucid);
  return res.json({ categoryAttributes });
});

export const attachCategoryAttribute = asyncHandler(async (req, res) => {
  const danhmucid = v.parseIdParam(req.params.danhmucid);
  if (!danhmucid) {
    throw new AppError("Invalid danhmucid", 400, "INVALID_PARAM", {
      param: "danhmucid",
    });
  }

  const val = v.validateAttachCategoryAttribute(req.body);
  if (!val.ok) {
    throw new AppError("Validation error", 400, "VALIDATION_ERROR", {
      errors: val.errors,
    });
  }

  const mapping = await s.attachCategoryAttribute(danhmucid, val.value);
  return res.json({ message: "Attached", mapping });
});

export const updateCategoryAttribute = asyncHandler(async (req, res) => {
  const danhmucid = v.parseIdParam(req.params.danhmucid);
  const thuoctinhid = v.parseIdParam(req.params.thuoctinhid);
  if (!danhmucid || !thuoctinhid) {
    throw new AppError("Invalid params", 400, "INVALID_PARAM", {
      params: ["danhmucid", "thuoctinhid"],
    });
  }

  const val = v.validateUpdateCategoryAttribute(req.body);
  if (!val.ok) {
    throw new AppError("Validation error", 400, "VALIDATION_ERROR", {
      errors: val.errors,
    });
  }

  const mapping = await s.updateCategoryAttribute(
    danhmucid,
    thuoctinhid,
    val.value
  );
  return res.json({ message: "Updated", mapping });
});

export const detachCategoryAttribute = asyncHandler(async (req, res) => {
  const danhmucid = v.parseIdParam(req.params.danhmucid);
  const thuoctinhid = v.parseIdParam(req.params.thuoctinhid);
  if (!danhmucid || !thuoctinhid) {
    throw new AppError("Invalid params", 400, "INVALID_PARAM", {
      params: ["danhmucid", "thuoctinhid"],
    });
  }

  await s.detachCategoryAttribute(danhmucid, thuoctinhid);
  return res.json({ message: "Detached" });
});

/**
 * Variant attribute values
 */
export const listVariantAttributes = asyncHandler(async (req, res) => {
  const bentheid = v.parseIdParam(req.params.bentheid);
  if (!bentheid) {
    throw new AppError("Invalid bentheid", 400, "INVALID_PARAM", {
      param: "bentheid",
    });
  }

  const data = await s.listVariantAttributes(bentheid);
  return res.json(data);
});

export const upsertVariantAttributes = asyncHandler(async (req, res) => {
  const bentheid = v.parseIdParam(req.params.bentheid);
  if (!bentheid) {
    throw new AppError("Invalid bentheid", 400, "INVALID_PARAM", {
      param: "bentheid",
    });
  }

  const strict = String(req.query.strict || "false").toLowerCase() === "true";

  const val = v.validateUpsertVariantAttributes(req.body);
  if (!val.ok) {
    throw new AppError("Validation error", 400, "VALIDATION_ERROR", {
      errors: val.errors,
    });
  }

  const upserted = await s.upsertVariantAttributes(bentheid, val.value.values, {
    strict,
  });
  return res.json({ message: "Upserted", upserted });
});

export const deleteVariantAttribute = asyncHandler(async (req, res) => {
  const bentheid = v.parseIdParam(req.params.bentheid);
  const thuoctinhid = v.parseIdParam(req.params.thuoctinhid);
  if (!bentheid || !thuoctinhid) {
    throw new AppError("Invalid params", 400, "INVALID_PARAM", {
      params: ["bentheid", "thuoctinhid"],
    });
  }

  await s.deleteVariantAttribute(bentheid, thuoctinhid);
  return res.json({ message: "Deleted" });
});
