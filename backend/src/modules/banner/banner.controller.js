import * as service from "./banner.service.js";

export const listBanners = async (req, res) => {
  try {
    const { vitri, all } = req.query;

    // mặc định: chỉ lấy banner đang bật + trong thời gian hợp lệ
    const data = await service.listBanners({
      vitri: vitri || null,
      includeInactive: all === "true",
    });

    return res.json({ message: "OK", data });
  } catch (err) {
    return res.status(500).json({ message: err.message || "Server error" });
  }
};

export const getBannerById = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const data = await service.getBannerById(id);

    if (!data) return res.status(404).json({ message: "Banner không tồn tại" });
    return res.json({ message: "OK", data });
  } catch (err) {
    return res.status(500).json({ message: err.message || "Server error" });
  }
};

export const createBanner = async (req, res) => {
  try {
    const data = await service.createBanner(req.body, req.file);
    return res.status(201).json({ message: "Tạo banner thành công", data });
  } catch (err) {
    const status = err.statusCode || 400;
    return res.status(status).json({ message: err.message || "Bad request" });
  }
};

export const updateBanner = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const data = await service.updateBanner(id, req.body, req.file);

    if (!data) return res.status(404).json({ message: "Banner không tồn tại" });
    return res.json({ message: "Cập nhật banner thành công", data });
  } catch (err) {
    const status = err.statusCode || 400;
    return res.status(status).json({ message: err.message || "Bad request" });
  }
};

export const deleteBanner = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const ok = await service.deleteBanner(id);

    if (!ok) return res.status(404).json({ message: "Banner không tồn tại" });
    return res.json({ message: "Xoá banner thành công" });
  } catch (err) {
    return res.status(500).json({ message: err.message || "Server error" });
  }
};
