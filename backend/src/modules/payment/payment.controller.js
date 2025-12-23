import * as v from "./payment.validators.js";
import * as s from "./payment.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { AppError } from "../../utils/appError.js";

export const list = asyncHandler(async (req, res) => {
  const paymentMethods = await s.listPaymentMethods();
  return res.json({ paymentMethods });
});

export const getOne = asyncHandler(async (req, res) => {
  const id = v.parsePhuongthucidParam(req.params.phuongthucid);
  if (!id) {
    throw new AppError("Invalid phuongthucid", 400, "INVALID_PARAM", {
      param: "phuongthucid",
    });
  }

  const pm = await s.getPaymentMethod(id);
  if (!pm) throw new AppError("Not found", 404, "NOT_FOUND");

  return res.json({ paymentMethod: pm });
});

export const create = asyncHandler(async (req, res) => {
  const val = v.validateCreatePaymentMethod(req.body);
  if (!val.ok) {
    throw new AppError("Validation error", 400, "VALIDATION_ERROR", {
      errors: val.errors,
    });
  }

  const paymentMethod = await s.createPaymentMethod(val.value);
  return res.status(201).json({ paymentMethod });
});

export const update = asyncHandler(async (req, res) => {
  const id = v.parsePhuongthucidParam(req.params.phuongthucid);
  if (!id) {
    throw new AppError("Invalid phuongthucid", 400, "INVALID_PARAM", {
      param: "phuongthucid",
    });
  }

  const val = v.validateUpdatePaymentMethod(req.body);
  if (!val.ok) {
    throw new AppError("Validation error", 400, "VALIDATION_ERROR", {
      errors: val.errors,
    });
  }

  const paymentMethod = await s.updatePaymentMethod(id, val.value);
  return res.json({ paymentMethod });
});

export const remove = asyncHandler(async (req, res) => {
  const id = v.parsePhuongthucidParam(req.params.phuongthucid);
  if (!id) {
    throw new AppError("Invalid phuongthucid", 400, "INVALID_PARAM", {
      param: "phuongthucid",
    });
  }

  await s.deletePaymentMethod(id);
  return res.json({ message: "Deleted" });
});
