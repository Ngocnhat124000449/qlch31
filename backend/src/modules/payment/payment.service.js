import { pool } from "../../db/db.js";
import { AppError } from "../../utils/appError.js";

function mapPgToAppError(err) {
  if (!err?.code) return null;

  // unique_violation: uq_payment_name (ten)
  if (err.code === "23505") {
    return new AppError(
      "Payment method name already exists",
      409,
      "DUPLICATE",
      {
        field: "ten",
        constraint: err.constraint,
      }
    );
  }

  // FK restrict khi xóa method đã dùng trong donhang
  if (err.code === "23503") {
    return new AppError(
      "Cannot delete payment method that is used by orders",
      409,
      "FK_VIOLATION",
      { constraint: err.constraint }
    );
  }

  // check_violation (nếu sau này có)
  if (err.code === "23514") {
    return new AppError("Invalid value", 400, "CHECK_VIOLATION", {
      constraint: err.constraint,
    });
  }

  return null;
}

export async function listPaymentMethods() {
  const { rows } = await pool.query(
    `SELECT phuongthucid, ten
     FROM public.phuongthucthanhtoan
     ORDER BY phuongthucid ASC`
  );
  return rows;
}

export async function getPaymentMethod(phuongthucid) {
  const { rows } = await pool.query(
    `SELECT phuongthucid, ten
     FROM public.phuongthucthanhtoan
     WHERE phuongthucid=$1
     LIMIT 1`,
    [phuongthucid]
  );
  return rows[0] || null;
}

export async function createPaymentMethod({ ten }) {
  try {
    const { rows } = await pool.query(
      `INSERT INTO public.phuongthucthanhtoan (ten)
       VALUES ($1)
       RETURNING phuongthucid, ten`,
      [ten]
    );
    return rows[0];
  } catch (err) {
    const mapped = mapPgToAppError(err);
    if (mapped) throw mapped;
    throw err;
  }
}

export async function updatePaymentMethod(phuongthucid, { ten }) {
  try {
    const { rows } = await pool.query(
      `UPDATE public.phuongthucthanhtoan
       SET ten=$2
       WHERE phuongthucid=$1
       RETURNING phuongthucid, ten`,
      [phuongthucid, ten]
    );

    if (rows.length === 0) {
      throw new AppError("Payment method not found", 404, "NOT_FOUND", {
        phuongthucid,
      });
    }

    return rows[0];
  } catch (err) {
    const mapped = mapPgToAppError(err);
    if (mapped) throw mapped;
    throw err;
  }
}

export async function deletePaymentMethod(phuongthucid) {
  try {
    const { rowCount } = await pool.query(
      `DELETE FROM public.phuongthucthanhtoan WHERE phuongthucid=$1`,
      [phuongthucid]
    );

    if (rowCount === 0) {
      throw new AppError("Payment method not found", 404, "NOT_FOUND", {
        phuongthucid,
      });
    }

    return true;
  } catch (err) {
    const mapped = mapPgToAppError(err);
    if (mapped) throw mapped;
    throw err;
  }
}
