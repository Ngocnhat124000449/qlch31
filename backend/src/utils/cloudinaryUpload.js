import streamifier from "streamifier";
import cloudinary from "../config/cloudinary.js";
import { AppError } from "./appError.js";

const DEFAULT_FOLDER = process.env.CLOUDINARY_FOLDER || "uploads";

export function uploadBufferToCloudinary(
  buffer,
  {
    folder = DEFAULT_FOLDER,
    public_id,
    resource_type = "image",
    overwrite = true,
  } = {}
) {
  return new Promise((resolve, reject) => {
    if (!buffer || !Buffer.isBuffer(buffer)) {
      return reject(new AppError("No file buffer to upload", 400, "NO_FILE"));
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, public_id, resource_type, overwrite },
      (error, result) => {
        if (error) {
          return reject(
            new AppError(
              "Upload image failed",
              500,
              "CLOUDINARY_UPLOAD_FAILED",
              {
                message: error?.message,
                name: error?.name,
              }
            )
          );
        }

        resolve({
          url: result.secure_url,
          public_id: result.public_id,
          width: result.width,
          height: result.height,
          format: result.format,
          bytes: result.bytes,
        });
      }
    );

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
}
