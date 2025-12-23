import { verifyAccessToken } from "../utils/jwt.js";
import { pool } from "../db/db.js";

function getBearerToken(req) {
  const auth = req.headers.authorization || "";
  const [type, token] = auth.split(" ");
  if (type !== "Bearer" || !token) return null;
  return token;
}

function parseCsvEnv(value) {
  if (!value) return [];
  return value
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

function authError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

/**
 * Helper: nếu token hợp lệ thì attach req.user (có check user + session)
 * Nếu không hợp lệ thì throw Error có {status}.
 */
async function attachUserFromToken(req, token) {
  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch {
    throw authError(401, "Invalid/expired token");
  }

  const userid = payload.userid ?? payload.userId;
  if (!userid) {
    throw authError(401, "Token missing userid");
  }

  const sid = payload.sid;
  if (!sid) {
    throw authError(401, "Token missing sid");
  }

  // 1) Check user tồn tại + trạng thái (bị khóa thì chặn)
  const { rows: userRows } = await pool.query(
    `
    SELECT userid, email, trangthai, role
    FROM public.users
    WHERE userid = $1
    LIMIT 1
    `,
    [userid]
  );

  if (userRows.length === 0) {
    throw authError(401, "User not found");
  }

  const user = userRows[0];

  if (user.trangthai === false) {
    throw authError(403, "User is disabled");
  }

  // 2) Check session còn active không (để revoke/logout có hiệu lực ngay)
  const { rows: sess } = await pool.query(
    `
    SELECT phienid
    FROM public.phien_dang_nhap
    WHERE phienid = $1
      AND userid = $2
      AND revoked_at IS NULL
      AND expires_at > NOW()
    LIMIT 1
    `,
    [sid, userid]
  );

  if (sess.length === 0) {
    throw authError(401, "Session revoked/expired");
  }
  // 3) Check admin theo DB role
  const roleRaw = user.role;
  const roleStr = String(roleRaw ?? "user").toLowerCase();
  const isAdmin =
    roleStr === "admin" ||
    roleStr === "administrator" ||
    roleStr === "role_admin";

  const role = isAdmin ? "admin" : roleStr;

  req.user = {
    userid: user.userid,
    email: user.email,
    role,
    isAdmin,
    sid: Number(sid),
  };

  return req.user;
}

/**
 * Require đăng nhập (verify access token) + attach req.user
 * Có kiểm tra session theo sid để logout/thu hồi token có hiệu lực ngay.
 */
export function requireAuth() {
  return async (req, res, next) => {
    try {
      const token = getBearerToken(req);
      if (!token) {
        return res.status(401).json({ message: "Missing Bearer token" });
      }

      await attachUserFromToken(req, token);
      return next();
    } catch (err) {
      if (err?.status) {
        return res.status(err.status).json({ message: err.message });
      }
      console.error("requireAuth error:", err);
      return res.status(500).json({ message: "Server error" });
    }
  };
}

/**
 * Optional auth (không bắt buộc đăng nhập):
 * - Không có Bearer token => next()
 * - Có Bearer token => verify + attach req.user
 */
export function optionalAuth() {
  return async (req, res, next) => {
    try {
      const token = getBearerToken(req);
      if (!token) return next();

      await attachUserFromToken(req, token);
      return next();
    } catch (err) {
      if (err?.status) {
        return res.status(err.status).json({ message: err.message });
      }
      console.error("optionalAuth error:", err);
      return res.status(500).json({ message: "Server error" });
    }
  };
}

/** Require admin */
export function requireAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ message: "Unauthenticated" });
  if (!req.user.isAdmin) {
    return res.status(403).json({ message: "Forbidden (admin only)" });
  }
  return next();
}
