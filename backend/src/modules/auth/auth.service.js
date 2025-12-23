// src/modules/auth/auth.service.js
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { pool } from "../../db/db.js";
import { AppError } from "../../utils/appError.js";

function refreshPepper() {
  const p = process.env.REFRESH_TOKEN_SECRET;
  if (!p) {
    throw new AppError(
      "Missing REFRESH_TOKEN_SECRET in .env",
      500,
      "CONFIG_ERROR"
    );
  }
  return p;
}

function hashRefreshToken(token) {
  // hash(token + pepper) => lưu DB
  return crypto
    .createHash("sha256")
    .update(token + refreshPepper())
    .digest("hex");
}

function generateRefreshToken() {
  return crypto.randomBytes(48).toString("hex");
}

function calcRefreshExpiry() {
  const days = Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS || 30);
  const ms = days * 24 * 60 * 60 * 1000;
  return new Date(Date.now() + ms);
}

async function fetchProfileWithRole(db, userid) {
  const { rows } = await db.query(
    `
    SELECT up.*,
           LOWER(COALESCE(u.role, 'user')) AS role,
           (LOWER(COALESCE(u.role, 'user')) = 'admin') AS "isAdmin"
    FROM public.user_profile up
    JOIN public.users u ON u.userid = up.userid
    WHERE up.userid = $1
    LIMIT 1
    `,
    [userid]
  );
  return rows[0] || null;
}

export async function createUserAndDefaults({
  tendangnhap,
  matkhau,
  email,
  sdt,
  hoten,
  avatarurl,
}) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const hashedPw = await bcrypt.hash(matkhau, 10);

    const ins = await client.query(
      `
      INSERT INTO public.users (tendangnhap, matkhau, email, sdt, hoten, avatarurl)
      VALUES ($1,$2,$3,$4,$5,$6)
      RETURNING userid
      `,
      [tendangnhap, hashedPw, email, sdt, hoten, avatarurl]
    );

    const userid = ins.rows[0].userid;

    await client.query(
      `INSERT INTO public.giohang (userid) VALUES ($1) ON CONFLICT (userid) DO NOTHING`,
      [userid]
    );
    await client.query(
      `INSERT INTO public.danhsachyeuthich (userid) VALUES ($1) ON CONFLICT (userid) DO NOTHING`,
      [userid]
    );

    const profile = await fetchProfileWithRole(client, userid);

    await client.query("COMMIT");
    return { userid, profile };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err; // pg errors để errorHandler xử lý
  } finally {
    client.release();
  }
}

export async function verifyUserCredentials({ identifier, matkhau }) {
  const { rows } = await pool.query(
    `
    SELECT userid, matkhau, trangthai
    FROM public.users
    WHERE tendangnhap = $1 OR email = $1 OR sdt = $1
    LIMIT 1
    `,
    [identifier]
  );

  if (rows.length === 0) {
    throw new AppError("Invalid credentials", 401, "INVALID_CREDENTIALS");
  }

  const u = rows[0];

  if (u.trangthai === false) {
    throw new AppError("User is disabled", 403, "USER_DISABLED");
  }

  const ok = await bcrypt.compare(matkhau, u.matkhau);
  if (!ok) {
    throw new AppError("Invalid credentials", 401, "INVALID_CREDENTIALS");
  }

  const profile = await fetchProfileWithRole(pool, u.userid);

  return { userid: u.userid, profile };
}

export async function createSession(userid) {
  const refreshToken = generateRefreshToken();
  const refreshHash = hashRefreshToken(refreshToken);
  const expiresAt = calcRefreshExpiry();

  const { rows } = await pool.query(
    `
    INSERT INTO public.phien_dang_nhap (userid, refresh_hash, expires_at)
    VALUES ($1,$2,$3)
    RETURNING phienid, expires_at
    `,
    [userid, refreshHash, expiresAt]
  );

  return {
    sid: rows[0].phienid,
    refreshToken,
    refreshExpiresAt: rows[0].expires_at,
  };
}

export async function rotateSession(refreshToken) {
  const refreshHash = hashRefreshToken(refreshToken);

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const found = await client.query(
      `
      SELECT phienid, userid, revoked_at, expires_at
      FROM public.phien_dang_nhap
      WHERE refresh_hash = $1
      FOR UPDATE
      `,
      [refreshHash]
    );

    if (found.rows.length === 0) {
      throw new AppError("Invalid refresh token", 401, "INVALID_REFRESH");
    }

    const s = found.rows[0];

    if (s.revoked_at) {
      throw new AppError("Refresh token revoked", 401, "REFRESH_REVOKED");
    }

    if (new Date(s.expires_at).getTime() <= Date.now()) {
      throw new AppError("Refresh token expired", 401, "REFRESH_EXPIRED");
    }

    // revoke session cũ
    await client.query(
      `UPDATE public.phien_dang_nhap SET revoked_at = NOW() WHERE phienid = $1 AND revoked_at IS NULL`,
      [s.phienid]
    );

    // tạo session mới
    const newRefreshToken = generateRefreshToken();
    const newHash = hashRefreshToken(newRefreshToken);
    const newExpires = calcRefreshExpiry();

    const created = await client.query(
      `
      INSERT INTO public.phien_dang_nhap (userid, refresh_hash, expires_at)
      VALUES ($1,$2,$3)
      RETURNING phienid, expires_at
      `,
      [s.userid, newHash, newExpires]
    );

    await client.query("COMMIT");
    return {
      userid: s.userid,
      sid: created.rows[0].phienid,
      refreshToken: newRefreshToken,
      refreshExpiresAt: created.rows[0].expires_at,
    };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function revokeSessionByRefreshToken(refreshToken) {
  const refreshHash = hashRefreshToken(refreshToken);

  const { rowCount } = await pool.query(
    `
    UPDATE public.phien_dang_nhap
    SET revoked_at = NOW()
    WHERE refresh_hash = $1 AND revoked_at IS NULL
    `,
    [refreshHash]
  );

  // idempotent logout: token sai/đã revoke => vẫn coi là OK ở controller
  return rowCount;
}

export async function revokeAllSessions(userid) {
  const { rowCount } = await pool.query(
    `
    UPDATE public.phien_dang_nhap
    SET revoked_at = NOW()
    WHERE userid = $1 AND revoked_at IS NULL
    `,
    [userid]
  );
  return rowCount;
}
