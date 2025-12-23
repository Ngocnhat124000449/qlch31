// src/modules/user/user.service.js
import bcrypt from "bcryptjs";
import { pool } from "../../db/db.js";
import { AppError } from "../../utils/appError.js";

function mapPgUniqueToAppError(err) {
  // PostgreSQL unique_violation
  if (err?.code !== "23505") return null;

  const c = String(err.constraint || "");
  if (c.includes("uq_users_email")) {
    return new AppError("Email already exists", 409, "DUPLICATE", {
      field: "email",
    });
  }
  if (c.includes("uq_users_sdt")) {
    return new AppError("Phone already exists", 409, "DUPLICATE", {
      field: "sdt",
    });
  }
  if (c.includes("uq_users_tendangnhap")) {
    return new AppError("Username already exists", 409, "DUPLICATE", {
      field: "tendangnhap",
    });
  }

  return new AppError("Duplicate value", 409, "DUPLICATE", {
    constraint: err.constraint,
  });
}

export async function getMe(userid) {
  // Lấy thông tin user + profile (profile có thể chưa tồn tại với tài khoản admin tạo sẵn)
  const { rows } = await pool.query(
    `
    SELECT
      u.userid,
      u.tendangnhap,
      u.email,
      u.sdt,
      u.hoten,
      u.avatarurl,
      u.trangthai,
      u.created_at,
      LOWER(COALESCE(u.role, 'user')) AS role,
      (LOWER(COALESCE(u.role, 'user')) = 'admin') AS "isAdmin",
      to_jsonb(up) AS profile
    FROM public.users u
    LEFT JOIN public.user_profile up ON up.userid = u.userid
    WHERE u.userid = $1
    LIMIT 1
    `,
    [userid]
  );

  if (rows.length === 0) return null;

  const row = rows[0];
  const profile = row.profile && typeof row.profile === "object" ? row.profile : {};
  delete row.profile;

  // Trả object phẳng giống trước đây (up.* + role/isAdmin), nhưng luôn có userid/email...
  // profile nằm trước để userid/role/isAdmin từ users luôn được ưu tiên.
  return { ...profile, ...row };
}

export async function updateMe(userid, patch) {
  const current = await pool.query(
    `
    SELECT userid, email, sdt, hoten, avatarurl
    FROM public.users
    WHERE userid = $1
    LIMIT 1
    `,
    [userid]
  );

  if (current.rows.length === 0) {
    throw new AppError("User not found", 404, "NOT_FOUND");
  }

  const cur = current.rows[0];

  const nextEmail = patch.email ?? cur.email;
  const nextSdt = patch.sdt ?? cur.sdt;
  const nextHoten = patch.hoten ?? cur.hoten;

  // avatarurl: cho phép null để xoá
  const nextAvatar =
    patch.avatarurl === undefined ? cur.avatarurl : patch.avatarurl;

  try {
    const { rowCount } = await pool.query(
      `
      UPDATE public.users
      SET email = $1,
          sdt = $2,
          hoten = $3,
          avatarurl = $4
      WHERE userid = $5
      `,
      [nextEmail, nextSdt, nextHoten, nextAvatar, userid]
    );

    if (rowCount === 0) {
      throw new AppError("User not found", 404, "NOT_FOUND");
    }
  } catch (err) {
    const dup = mapPgUniqueToAppError(err);
    if (dup) throw dup;
    throw err;
  }

  return getMe(userid);
}

export async function changePassword(userid, { oldPassword, newPassword }) {
  const { rows } = await pool.query(
    `SELECT userid, matkhau FROM public.users WHERE userid = $1 LIMIT 1`,
    [userid]
  );

  if (rows.length === 0) {
    throw new AppError("User not found", 404, "NOT_FOUND");
  }

  const ok = await bcrypt.compare(oldPassword, rows[0].matkhau);
  if (!ok) {
    throw new AppError("Old password is incorrect", 401, "INVALID_CREDENTIALS");
  }

  const hashed = await bcrypt.hash(newPassword, 10);

  const { rowCount } = await pool.query(
    `UPDATE public.users SET matkhau = $1 WHERE userid = $2`,
    [hashed, userid]
  );

  if (rowCount === 0) {
    throw new AppError("User not found", 404, "NOT_FOUND");
  }

  return true;
}

// Admin list users (không trả mật khẩu)
export async function adminListUsers({ limit = 50, offset = 0 }) {
  const { rows } = await pool.query(
    `
    SELECT userid, tendangnhap, email, sdt, hoten, avatarurl, trangthai, created_at
    FROM public.users
    ORDER BY userid DESC
    LIMIT $1 OFFSET $2
    `,
    [limit, offset]
  );

  return rows;
}
