import * as v from "./coupon.validators.js";
import * as s from "./coupon.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { AppError } from "../../utils/appError.js";

export const listActive = asyncHandler(async (req, res) => {
  const coupons = await s.listActiveCouponsPublic();
  return res.json({ coupons });
});

export const adminListAll = asyncHandler(async (req, res) => {
  const coupons = await s.adminListAllCoupons();
  return res.json({ coupons });
});

export const adminCreate = asyncHandler(async (req, res) => {
  const val = v.validateAdminCreate(req.body);
  if (!val.ok) {
    throw new AppError("Validation error", 400, "VALIDATION_ERROR", {
      errors: val.errors,
    });
  }

  const coupon = await s.adminCreateCoupon(val.value);
  return res.status(201).json({ coupon });
});

export const adminUpdate = asyncHandler(async (req, res) => {
  const id = v.parseMagiamgiaidParam(req.params.magiamgiaid);
  if (!id) {
    throw new AppError("Invalid magiamgiaid", 400, "INVALID_PARAM", {
      param: "magiamgiaid",
    });
  }

  const val = v.validateAdminUpdate(req.body);
  if (!val.ok) {
    throw new AppError("Validation error", 400, "VALIDATION_ERROR", {
      errors: val.errors,
    });
  }

  const coupon = await s.adminUpdateCoupon(id, val.value);
  return res.json({ coupon });
});

export const adminAttachVariant = asyncHandler(async (req, res) => {
  const id = v.parseMagiamgiaidParam(req.params.magiamgiaid);
  if (!id) {
    throw new AppError("Invalid magiamgiaid", 400, "INVALID_PARAM", {
      param: "magiamgiaid",
    });
  }

  const val = v.validateAdminAttachVariant(req.body);
  if (!val.ok) {
    throw new AppError("Validation error", 400, "VALIDATION_ERROR", {
      errors: val.errors,
    });
  }

  await s.adminAttachVariant(id, val.value.bentheid);
  return res.json({
    message: "Attached",
    magiamgiaid: id,
    bentheid: val.value.bentheid,
  });
});

export const adminDetachVariant = asyncHandler(async (req, res) => {
  const id = v.parseMagiamgiaidParam(req.params.magiamgiaid);
  const bentheid = v.parseBentheidParam(req.params.bentheid);
  if (!id || !bentheid) {
    throw new AppError("Invalid params", 400, "INVALID_PARAM", {
      params: ["magiamgiaid", "bentheid"],
    });
  }

  await s.adminDetachVariant(id, bentheid);
  return res.json({ message: "Detached" });
});

export const apply = asyncHandler(async (req, res) => {
  const val = v.validateApply(req.body);
  if (!val.ok) {
    throw new AppError("Validation error", 400, "VALIDATION_ERROR", {
      errors: val.errors,
    });
  }

  const { applied, coupon } = await s.applyCoupon(req.user.userid, val.value);

  const order = await s.getOrderTotals(req.user.userid, val.value.donhangid);
  const totalDiscount = await s.calcOrderDiscountSum(val.value.donhangid);

  const tongtien = Number(order.tongtien);
  const phivanchuyen = Number(order.phivanchuyen);
  const tongthanhtoan = Number(order.tongthanhtoan);
  const payable = Math.max(tongthanhtoan - totalDiscount, 0);

  return res.json({
    message: "Applied",
    applied: {
      nhapmaid: applied.nhapmaid,
      donhangid: applied.donhangid,
      bentheid: applied.bentheid,
      code: coupon.code,
      sotiengiamthucte: Number(applied.sotiengiamthucte),
    },
    orderTotals: {
      tongtien,
      phivanchuyen,
      tongthanhtoan,
      totalDiscount,
      payable,
    },
  });
});

export const cancel = asyncHandler(async (req, res) => {
  const val = v.validateCancel(req.body);
  if (!val.ok) {
    throw new AppError("Validation error", 400, "VALIDATION_ERROR", {
      errors: val.errors,
    });
  }

  const applied = await s.cancelApplied(req.user.userid, val.value.nhapmaid);

  const order = await s.getOrderTotals(req.user.userid, applied.donhangid);
  const totalDiscount = await s.calcOrderDiscountSum(applied.donhangid);
  const payable = Math.max(Number(order.tongthanhtoan) - totalDiscount, 0);

  return res.json({
    message: "Cancelled",
    applied: { nhapmaid: applied.nhapmaid, trangthai: applied.trangthai },
    orderTotals: { totalDiscount, payable },
  });
});

export const myHistory = asyncHandler(async (req, res) => {
  const q = v.parseHistoryQuery(req.query);
  const history = await s.myHistory(req.user.userid, q);
  return res.json({ history, limit: q.limit, offset: q.offset });
});
