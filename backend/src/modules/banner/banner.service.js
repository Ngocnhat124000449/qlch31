import * as model from "./banner.model.js";
import * as cloudinaryModule from "../../config/cloudinary.js";

function getCloudinaryClient() {
  // hỗ trợ nhiều kiểu export khác nhau
  return (
    cloudinaryModule.cloudinary ||
    cloudinaryModule.default ||
    cloudinaryModule.v2 ||
    cloudinaryModule
  );
}

async function uploadBannerImage(file) {
  if (!file) {
    const err = new Error("Thiếu file ảnh (field name: image)");
    err.statusCode = 400;
    throw err;
  }

  const cloudinary = getCloudinaryClient();
  if (!cloudinary?.uploader) {
    const err = new Error("Cloudinary chưa được cấu hình đúng");
    err.statusCode = 500;
    throw err;
  }

  // diskStorage (có file.path)
  if (file.path) {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: "banners",
      resource_type: "image",
    });
    return result.secure_url;
  }

  // memoryStorage (có file.buffer)
  if (file.buffer) {
    const secureUrl = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "banners", resource_type: "image" },
        (error, result) => {
          if (error) return reject(error);
          resolve(result.secure_url);
        }
      );
      stream.end(file.buffer);
    });
    return secureUrl;
  }

  const err = new Error("File upload không hỗ trợ (không có path/buffer)");
  err.statusCode = 400;
  throw err;
}

function toBool(v, defaultValue) {
  if (v === undefined || v === null || v === "") return defaultValue;
  if (typeof v === "boolean") return v;
  return String(v).toLowerCase() === "true";
}

function toInt(v, defaultValue) {
  if (v === undefined || v === null || v === "") return defaultValue;
  const n = Number(v);
  return Number.isFinite(n) ? n : defaultValue;
}

export async function listBanners({ vitri, includeInactive }) {
  return model.findAll({
    vitri,
    activeOnly: !includeInactive,
    visibleNowOnly: !includeInactive, // public mặc định lọc theo thời gian
  });
}

export async function getBannerById(id) {
  if (!Number.isFinite(id) || id <= 0) return null;
  return model.findById(id);
}

export async function createBanner(body, file) {
  const ten = (body.ten || "").trim();
  if (!ten) {
    const err = new Error("Thiếu tên banner (ten)");
    err.statusCode = 400;
    throw err;
  }

  const imageurl = await uploadBannerImage(file);

  const payload = {
    ten,
    mota: body.mota ?? null,
    imageurl,
    linkurl: body.linkurl ?? null,
    vitri: (body.vitri || "HOME_TOP").trim(),
    thutuhienthi: toInt(body.thutuhienthi, 0),
    trangthai: toBool(body.trangthai, true),
    thoigianbatdau: body.thoigianbatdau || null,
    thoigianketthuc: body.thoigianketthuc || null,
  };

  return model.insert(payload);
}

export async function updateBanner(id, body, file) {
  if (!Number.isFinite(id) || id <= 0) {
    const err = new Error("ID không hợp lệ");
    err.statusCode = 400;
    throw err;
  }

  const current = await model.findById(id);
  if (!current) return null;

  let imageurl = current.imageurl;
  if (file) {
    // Có ảnh mới => upload, DB cập nhật imageurl
    imageurl = await uploadBannerImage(file);
  }

  const patch = {
    ten: body.ten !== undefined ? String(body.ten).trim() : undefined,
    mota: body.mota !== undefined ? body.mota : undefined,
    imageurl,
    linkurl: body.linkurl !== undefined ? body.linkurl : undefined,
    vitri: body.vitri !== undefined ? String(body.vitri).trim() : undefined,
    thutuhienthi:
      body.thutuhienthi !== undefined ? toInt(body.thutuhienthi, 0) : undefined,
    trangthai:
      body.trangthai !== undefined ? toBool(body.trangthai, true) : undefined,
    thoigianbatdau:
      body.thoigianbatdau !== undefined ? body.thoigianbatdau : undefined,
    thoigianketthuc:
      body.thoigianketthuc !== undefined ? body.thoigianketthuc : undefined,
  };

  if (patch.ten !== undefined && !patch.ten) {
    const err = new Error("Tên banner (ten) không được rỗng");
    err.statusCode = 400;
    throw err;
  }

  return model.updateById(id, patch);
}

export async function deleteBanner(id) {
  if (!Number.isFinite(id) || id <= 0) return false;
  return model.deleteById(id);
}
