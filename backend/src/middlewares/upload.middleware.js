import multer from "multer";
import { AppError } from "../utils/appError.js";

const maxBytes = Number(process.env.UPLOAD_MAX_BYTES || 5 * 1024 * 1024); // default 5MB
const storage = multer.memoryStorage();

function fileFilter(req, file, cb) {
  const mt = String(file?.mimetype || "");
  const ok = /^image\/(jpeg|png|webp|gif|avif)$/.test(mt);
  if (!ok) {
    return cb(
      new AppError("Only image files are allowed", 400, "INVALID_FILE_TYPE", {
        mimetype: mt,
      })
    );
  }
  cb(null, true);
}

const uploader = multer({
  storage,
  fileFilter,
  limits: { fileSize: maxBytes },
});

export function uploadSingleImage(fieldName = "image") {
  return (req, res, next) => {
    uploader.single(fieldName)(req, res, (err) => {
      if (!err) return next();

      if (err.code === "LIMIT_FILE_SIZE") {
        return next(
          new AppError("File too large", 413, "FILE_TOO_LARGE", { maxBytes })
        );
      }
      return next(err);
    });
  };
}
