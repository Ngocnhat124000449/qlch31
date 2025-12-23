import { pool } from "../../db/db.js";
import { AppError } from "../../utils/appError.js";

function mapPgUniqueToAppError(err) {
  // PostgreSQL unique_violation
  if (err?.code !== "23505") return null;
  return new AppError("Duplicate value", 409, "DUPLICATE", {
    constraint: err.constraint,
  });
}

const SELECT_FIELDS = `
  dg.danhgiaid,
  dg.userid,
  u.tendangnhap,
  u.hoten,
  u.avatarurl,
  dg.bentheid,
  dg.sosao,
  dg.tieude,
  dg.noidung,
  dg.trangthai,
  dg.created_at
`;

function normalizeRow(r) {
  // đảm bảo sosao là number nếu PostgreSQL trả string
  if (r && r.sosao !== undefined && r.sosao !== null) {
    const n = Number(r.sosao);
    if (Number.isFinite(n)) r.sosao = n;
  }
  return r;
}

/** Public: list active reviews by variant */
export async function listByVariant(bentheid, { limit = 20, offset = 0 }) {
  const { rows } = await pool.query(
    `
    SELECT ${SELECT_FIELDS}
    FROM public.danhgia dg
    JOIN public.users u ON u.userid = dg.userid
    WHERE dg.bentheid = $1
      AND dg.trangthai = true
    ORDER BY dg.created_at DESC, dg.danhgiaid DESC
    LIMIT $2 OFFSET $3
    `,
    [bentheid, limit, offset]
  );

  return rows.map(normalizeRow);
}

/** User: list my reviews */
export async function listMine(userid, { limit = 20, offset = 0 }) {
  const { rows } = await pool.query(
    `
    SELECT ${SELECT_FIELDS}
    FROM public.danhgia dg
    JOIN public.users u ON u.userid = dg.userid
    WHERE dg.userid = $1
    ORDER BY dg.created_at DESC, dg.danhgiaid DESC
    LIMIT $2 OFFSET $3
    `,
    [userid, limit, offset]
  );

  return rows.map(normalizeRow);
}

/** User: create review */
export async function createReview(userid, { bentheid, sosao, tieude, noidung }) {
  try {
    const { rows } = await pool.query(
      `
      INSERT INTO public.danhgia (userid, bentheid, sosao, tieude, noidung, trangthai)
      VALUES ($1, $2, $3, $4, $5, true)
      RETURNING danhgiaid
      `,
      [userid, bentheid, sosao, tieude, noidung]
    );

    const danhgiaid = rows?.[0]?.danhgiaid;
    return getById(danhgiaid);
  } catch (err) {
    const dup = mapPgUniqueToAppError(err);
    if (dup) throw dup;
    throw err;
  }
}

async function getById(danhgiaid) {
  if (!danhgiaid) return null;

  const { rows } = await pool.query(
    `
    SELECT ${SELECT_FIELDS}
    FROM public.danhgia dg
    JOIN public.users u ON u.userid = dg.userid
    WHERE dg.danhgiaid = $1
    LIMIT 1
    `,
    [danhgiaid]
  );

  return rows[0] ? normalizeRow(rows[0]) : null;
}

/** User: update my review */
export async function updateMine(userid, danhgiaid, patch) {
  // build update dynamically
  const fields = [];
  const values = [];
  let i = 1;

  if (patch.sosao !== undefined) {
    fields.push(`sosao = $${i++}`);
    values.push(patch.sosao);
  }
  if (patch.tieude !== undefined) {
    fields.push(`tieude = $${i++}`);
    values.push(patch.tieude);
  }
  if (patch.noidung !== undefined) {
    fields.push(`noidung = $${i++}`);
    values.push(patch.noidung);
  }

  if (fields.length === 0) {
    throw new AppError("No fields to update", 400, "VALIDATION_ERROR");
  }

  values.push(danhgiaid);
  values.push(userid);

  const { rowCount } = await pool.query(
    `
    UPDATE public.danhgia
    SET ${fields.join(", ")}
    WHERE danhgiaid = $${i++}
      AND userid = $${i}
    `,
    values
  );

  if (rowCount === 0) {
    throw new AppError("Not found", 404, "NOT_FOUND");
  }

  return getById(danhgiaid);
}

/** User: remove my review */
export async function removeMine(userid, danhgiaid) {
  const { rowCount } = await pool.query(
    `DELETE FROM public.danhgia WHERE danhgiaid = $1 AND userid = $2`,
    [danhgiaid, userid]
  );

  if (rowCount === 0) {
    throw new AppError("Not found", 404, "NOT_FOUND");
  }

  return true;
}

/** Admin: list all reviews (optional filters) */
export async function adminListAll({ limit = 20, offset = 0, bentheid, userid, active }) {
  const where = [];
  const values = [];
  let i = 1;

  if (bentheid) {
    where.push(`dg.bentheid = $${i++}`);
    values.push(bentheid);
  }
  if (userid) {
    where.push(`dg.userid = $${i++}`);
    values.push(userid);
  }
  if (active === true || active === false) {
    where.push(`dg.trangthai = $${i++}`);
    values.push(active);
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  values.push(limit);
  values.push(offset);

  const { rows } = await pool.query(
    `
    SELECT ${SELECT_FIELDS}
    FROM public.danhgia dg
    JOIN public.users u ON u.userid = dg.userid
    ${whereSql}
    ORDER BY dg.created_at DESC, dg.danhgiaid DESC
    LIMIT $${i++} OFFSET $${i}
    `,
    values
  );

  return rows.map(normalizeRow);
}

/** Admin: set review status */
export async function adminSetStatus(danhgiaid, trangthai) {
  const { rowCount } = await pool.query(
    `UPDATE public.danhgia SET trangthai = $1 WHERE danhgiaid = $2`,
    [trangthai, danhgiaid]
  );

  if (rowCount === 0) {
    throw new AppError("Not found", 404, "NOT_FOUND");
  }

  return getById(danhgiaid);
}
