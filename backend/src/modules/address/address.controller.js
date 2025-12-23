import * as v from "./address.validators.js";
import * as s from "./address.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { AppError } from "../../utils/appError.js";

export const listMine = asyncHandler(async (req, res) => {
  const addresses = await s.listMyAddresses(req.user.userid);
  return res.json({ addresses });
});

export const getMine = asyncHandler(async (req, res) => {
  const diachiuserid = v.parseDiachiuseridParam(req.params.diachiuserid);
  if (!diachiuserid) {
    throw new AppError("Invalid diachiuserid", 400, "INVALID_PARAM", {
      param: "diachiuserid",
    });
  }

  const address = await s.getMyAddress(req.user.userid, diachiuserid);
  if (!address) throw new AppError("Not found", 404, "NOT_FOUND");

  return res.json({ address });
});

export const createMine = asyncHandler(async (req, res) => {
  const val = v.validateCreateAddress(req.body);
  if (!val.ok) {
    throw new AppError("Validation error", 400, "VALIDATION_ERROR", {
      errors: val.errors,
    });
  }

  const address = await s.createMyAddress(req.user.userid, val.value);
  return res.status(201).json({ address });
});

export const updateMine = asyncHandler(async (req, res) => {
  const diachiuserid = v.parseDiachiuseridParam(req.params.diachiuserid);
  if (!diachiuserid) {
    throw new AppError("Invalid diachiuserid", 400, "INVALID_PARAM", {
      param: "diachiuserid",
    });
  }

  const val = v.validateUpdateAddress(req.body);
  if (!val.ok) {
    throw new AppError("Validation error", 400, "VALIDATION_ERROR", {
      errors: val.errors,
    });
  }

  const address = await s.updateMyAddress(
    req.user.userid,
    diachiuserid,
    val.value
  );
  return res.json({ address });
});

export const removeMine = asyncHandler(async (req, res) => {
  const diachiuserid = v.parseDiachiuseridParam(req.params.diachiuserid);
  if (!diachiuserid) {
    throw new AppError("Invalid diachiuserid", 400, "INVALID_PARAM", {
      param: "diachiuserid",
    });
  }

  await s.deleteMyAddress(req.user.userid, diachiuserid);
  return res.json({ message: "Deleted" });
});
