import * as v from "./post.validators.js";
import * as s from "./post.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { AppError } from "../../utils/appError.js";

export const listPublic = asyncHandler(async (req, res) => {
  const q = v.parsePublicListQuery(req.query);
  const posts = await s.listPublic(q);
  return res.json({ posts, page: q.page, limit: q.limit });
});

export const getPublic = asyncHandler(async (req, res) => {
  const id = v.parseBaidangidParam(req.params.baidangid);
  if (!id) {
    throw new AppError("Invalid baidangid", 400, "INVALID_PARAM", {
      param: "baidangid",
    });
  }

  const post = await s.getPublicDetail(id);
  if (!post) throw new AppError("Not found", 404, "NOT_FOUND");

  return res.json({ post });
});

export const adminListAll = asyncHandler(async (req, res) => {
  const q = v.parseAdminListQuery(req.query);
  const posts = await s.adminListAll(q);
  return res.json({ posts, limit: q.limit, offset: q.offset });
});

export const adminCreate = asyncHandler(async (req, res) => {
  const val = v.validateCreatePost(req.body);
  if (!val.ok) {
    throw new AppError("Validation error", 400, "VALIDATION_ERROR", {
      errors: val.errors,
    });
  }

  const post = await s.adminCreatePost(req.user.userid, val.value);
  return res.status(201).json({ post });
});

export const adminUpdate = asyncHandler(async (req, res) => {
  const id = v.parseBaidangidParam(req.params.baidangid);
  if (!id) {
    throw new AppError("Invalid baidangid", 400, "INVALID_PARAM", {
      param: "baidangid",
    });
  }

  const val = v.validateUpdatePost(req.body);
  if (!val.ok) {
    throw new AppError("Validation error", 400, "VALIDATION_ERROR", {
      errors: val.errors,
    });
  }

  const post = await s.adminUpdatePost(id, val.value);
  return res.json({ post });
});

export const adminSetStatus = asyncHandler(async (req, res) => {
  const id = v.parseBaidangidParam(req.params.baidangid);
  if (!id) {
    throw new AppError("Invalid baidangid", 400, "INVALID_PARAM", {
      param: "baidangid",
    });
  }

  const val = v.validateSetStatus(req.body);
  if (!val.ok) {
    throw new AppError("Validation error", 400, "VALIDATION_ERROR", {
      errors: val.errors,
    });
  }

  const post = await s.adminSetStatus(id, val.value.trangthai);
  return res.json({ message: "Updated", post });
});
