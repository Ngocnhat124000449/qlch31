import * as v from "./wishlist.validators.js";
import * as s from "./wishlist.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { AppError } from "../../utils/appError.js";

export const getWishlist = asyncHandler(async (req, res) => {
  const wishlist = await s.getWishlist(req.user.userid);
  return res.json({ wishlist });
});

export const addItem = asyncHandler(async (req, res) => {
  const val = v.validateAddWishlistItem(req.body);
  if (!val.ok) {
    throw new AppError("Validation error", 400, "VALIDATION_ERROR", {
      errors: val.errors,
    });
  }

  const wishlist = await s.addWishlistItem(req.user.userid, val.value.bentheid);
  return res.json({ wishlist });
});

export const removeItem = asyncHandler(async (req, res) => {
  const bentheid = v.parseBentheidParam(req.params.bentheid);
  if (!bentheid) {
    throw new AppError("Invalid bentheid", 400, "INVALID_PARAM", {
      param: "bentheid",
    });
  }

  const wishlist = await s.removeWishlistItem(req.user.userid, bentheid);
  return res.json({ wishlist });
});

export const clear = asyncHandler(async (req, res) => {
  const wishlist = await s.clearWishlist(req.user.userid);
  return res.json({ wishlist });
});
