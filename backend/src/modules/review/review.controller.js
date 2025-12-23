import * as v from "./review.validators.js";
import * as s from "./review.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { AppError } from "../../utils/appError.js";

// Public: list reviews by variant
export const listByVariant = asyncHandler(async (req, res) => {
  const bentheid = v.parseBentheidParam(req.params.bentheid);
  if (!bentheid) {
    throw new AppError("Invalid bentheid", 400, "INVALID_PARAM", {
      param: "bentheid",
    });
  }

  const q = v.parseListQuery(req.query);
  const reviews = await s.listByVariant(bentheid, q);
  return res.json({ reviews, limit: q.limit, offset: q.offset });
});

// User: list my reviews
export const listMine = asyncHandler(async (req, res) => {
  const q = v.parseListQuery(req.query);
  const reviews = await s.listMine(req.user.userid, q);
  return res.json({ reviews, limit: q.limit, offset: q.offset });
});

// User: create review
export const create = asyncHandler(async (req, res) => {
  const val = v.validateCreateReview(req.body);
  if (!val.ok) {
    throw new AppError("Validation error", 400, "VALIDATION_ERROR", {
      errors: val.errors,
    });
  }

  const review = await s.createReview(req.user.userid, val.value);
  return res.status(201).json({ review });
});

// User: update my review
export const updateMine = asyncHandler(async (req, res) => {
  const danhgiaid = v.parseDanhgiaidParam(req.params.danhgiaid);
  if (!danhgiaid) {
    throw new AppError("Invalid danhgiaid", 400, "INVALID_PARAM", {
      param: "danhgiaid",
    });
  }

  const val = v.validateUpdateReview(req.body);
  if (!val.ok) {
    throw new AppError("Validation error", 400, "VALIDATION_ERROR", {
      errors: val.errors,
    });
  }

  const review = await s.updateMine(req.user.userid, danhgiaid, val.value);
  return res.json({ review });
});

// User: delete my review
export const removeMine = asyncHandler(async (req, res) => {
  const danhgiaid = v.parseDanhgiaidParam(req.params.danhgiaid);
  if (!danhgiaid) {
    throw new AppError("Invalid danhgiaid", 400, "INVALID_PARAM", {
      param: "danhgiaid",
    });
  }

  await s.removeMine(req.user.userid, danhgiaid);
  return res.json({ message: "Deleted" });
});

// Admin: list all
export const adminListAll = asyncHandler(async (req, res) => {
  const q = v.parseAdminFilter(req.query);
  const reviews = await s.adminListAll(q);
  return res.json({ reviews, limit: q.limit, offset: q.offset });
});

// Admin: set status
export const adminSetStatus = asyncHandler(async (req, res) => {
  const danhgiaid = v.parseDanhgiaidParam(req.params.danhgiaid);
  if (!danhgiaid) {
    throw new AppError("Invalid danhgiaid", 400, "INVALID_PARAM", {
      param: "danhgiaid",
    });
  }

  const val = v.validateAdminSetStatus(req.body);
  if (!val.ok) {
    throw new AppError("Validation error", 400, "VALIDATION_ERROR", {
      errors: val.errors,
    });
  }

  const review = await s.adminSetStatus(danhgiaid, val.value.trangthai);
  return res.json({ message: "Updated", review });
});
