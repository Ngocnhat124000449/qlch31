import * as v from "./cart.validators.js";
import * as s from "./cart.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { AppError } from "../../utils/appError.js";

export const getCart = asyncHandler(async (req, res) => {
  const cart = await s.getCart(req.user.userid);
  return res.json({ cart });
});

export const addItem = asyncHandler(async (req, res) => {
  const val = v.validateAddItem(req.body);
  if (!val.ok) {
    throw new AppError("Validation error", 400, "VALIDATION_ERROR", {
      errors: val.errors,
    });
  }

  const cart = await s.addItem(req.user.userid, val.value);
  return res.json({ cart });
});

export const setItemQty = asyncHandler(async (req, res) => {
  const bentheid = v.parseBentheidParam(req.params.bentheid);
  if (!bentheid) {
    throw new AppError("Invalid bentheid", 400, "INVALID_PARAM", {
      param: "bentheid",
    });
  }

  const val = v.validateSetQty(req.body);
  if (!val.ok) {
    throw new AppError("Validation error", 400, "VALIDATION_ERROR", {
      errors: val.errors,
    });
  }

  const cart = await s.setItemQty(req.user.userid, bentheid, val.value.soluong);
  return res.json({ cart });
});

export const removeItem = asyncHandler(async (req, res) => {
  const bentheid = v.parseBentheidParam(req.params.bentheid);
  if (!bentheid) {
    throw new AppError("Invalid bentheid", 400, "INVALID_PARAM", {
      param: "bentheid",
    });
  }

  const cart = await s.removeItem(req.user.userid, bentheid);
  return res.json({ cart });
});

export const clearCart = asyncHandler(async (req, res) => {
  const cart = await s.clearCart(req.user.userid);
  return res.json({ cart });
});
