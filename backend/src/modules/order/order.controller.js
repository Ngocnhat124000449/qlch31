import * as v from "./order.validators.js";
import * as s from "./order.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { AppError } from "../../utils/appError.js";

export const createFromCart = asyncHandler(async (req, res) => {
  const val = v.validateCreateOrder(req.body);
  if (!val.ok) {
    throw new AppError("Validation error", 400, "VALIDATION_ERROR", {
      errors: val.errors,
    });
  }

  const order = await s.createOrderFromCart(req.user.userid, val.value);
  return res.status(201).json({ order });
});

export const listMine = asyncHandler(async (req, res) => {
  const q = v.parseListQuery(req.query);
  const rows = await s.listMyOrders(req.user.userid, q);
  return res.json({ orders: rows, page: q.page, limit: q.limit });
});

export const getDetail = asyncHandler(async (req, res) => {
  const donhangid = v.parseDonhangidParam(req.params.donhangid);
  if (!donhangid) {
    throw new AppError("Invalid donhangid", 400, "INVALID_PARAM", {
      param: "donhangid",
    });
  }

  const order = await s.getOrderDetail(
    req.user.userid,
    donhangid,
    req.user.isAdmin === true
  );

  return res.json({ order });
});

export const cancelMine = asyncHandler(async (req, res) => {
  const donhangid = v.parseDonhangidParam(req.params.donhangid);
  if (!donhangid) {
    throw new AppError("Invalid donhangid", 400, "INVALID_PARAM", {
      param: "donhangid",
    });
  }

  const order = await s.cancelMyOrder(req.user.userid, donhangid);
  return res.json({ message: "Cancelled", order });
});

export const adminListAll = asyncHandler(async (req, res) => {
  const q = v.parseListQuery(req.query);
  const rows = await s.adminListOrders(q);
  return res.json({ orders: rows, page: q.page, limit: q.limit });
});

export const adminUpdateStatus = asyncHandler(async (req, res) => {
  const donhangid = v.parseDonhangidParam(req.params.donhangid);
  if (!donhangid) {
    throw new AppError("Invalid donhangid", 400, "INVALID_PARAM", {
      param: "donhangid",
    });
  }

  const val = v.validateAdminUpdateStatus(req.body);
  if (!val.ok) {
    throw new AppError("Validation error", 400, "VALIDATION_ERROR", {
      errors: val.errors,
    });
  }

  const order = await s.adminUpdateOrderStatus(donhangid, val.value.trangthai);
  return res.json({ message: "Updated", order });
});
