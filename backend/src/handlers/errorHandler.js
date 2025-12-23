import { AppError } from "../utils/appError.js";

// map constraint -> field (bạn có thể bổ sung dần)
const UNIQUE_FIELD_BY_CONSTRAINT = {
  uq_users_tendangnhap: "tendangnhap",
  uq_users_email: "email",
  uq_users_sdt: "sdt",
  uq_magiamgia_code: "code",
  uq_bienthe_sku: "sku",
  uq_ncc_email: "email",
  uq_ncc_tenviettat: "tenviettat",
  uq_danhmuc_tenviettat: "tenviettat",
};

// 404 cuối cùng
export function notFound(req, res, next) {
  next(
    new AppError(
      `Route not found: ${req.method} ${req.originalUrl}`,
      404,
      "NOT_FOUND"
    )
  );
}

// chuẩn hoá lỗi từ Postgres (pg)
function mapPgError(err) {
  if (!err || !err.code) return null;

  // https://www.postgresql.org/docs/current/errcodes-appendix.html
  switch (err.code) {
    case "23505": {
      // unique_violation
      const field = UNIQUE_FIELD_BY_CONSTRAINT[err.constraint];
      return new AppError(
        "Duplicate value",
        409,
        "DUPLICATE",
        field ? { field } : { constraint: err.constraint }
      );
    }
    case "23503": // foreign_key_violation
      return new AppError(
        "Foreign key constraint failed",
        409,
        "FK_VIOLATION",
        { constraint: err.constraint }
      );

    case "23502": // not_null_violation
      return new AppError("Missing required field", 400, "NOT_NULL", {
        column: err.column,
      });

    case "23514": // check_violation
      return new AppError(
        "Invalid value (check constraint)",
        400,
        "CHECK_VIOLATION",
        { constraint: err.constraint }
      );

    case "22001": // string_data_right_truncation
      return new AppError("Value too long", 400, "VALUE_TOO_LONG", {
        column: err.column,
      });

    case "22P02": // invalid_text_representation
      return new AppError("Invalid input type", 400, "INVALID_TYPE", {
        detail: err.detail,
      });

    case "40001": // serialization_failure
      return new AppError("Please retry (serialization failure)", 409, "RETRY");

    default:
      return new AppError("Database error", 500, "DB_ERROR", {
        pgcode: err.code,
        constraint: err.constraint,
      });
  }
}

// handler chung cuối app
export function errorHandler(err, req, res, next) {
  // nếu response đã gửi rồi thì nhường cho express
  if (res.headersSent) return next(err);

  // AppError (lỗi mình chủ động throw)
  let normalized = err instanceof AppError ? err : null;

  // pg error
  if (!normalized) {
    const pgMapped = mapPgError(err);
    if (pgMapped) normalized = pgMapped;
  }

  // fallback: lỗi không rõ
  if (!normalized) {
    normalized = new AppError("Server error", 500, "SERVER_ERROR");
  }

  const status = normalized.status || 500;

  const payload = {
    message: normalized.message,
    code: normalized.code || "ERROR",
  };

  if (normalized.details) payload.details = normalized.details;

  // debug thêm khi dev
  if (process.env.NODE_ENV !== "production") {
    payload.debug = {
      name: err?.name,
      pgcode: err?.code,
      constraint: err?.constraint,
      stack: err?.stack,
    };
  }

  return res.status(status).json(payload);
}
