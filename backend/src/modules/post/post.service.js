// src/modules/post/post.service.js
import { pool } from "../../db/db.js";
import { AppError } from "../../utils/appError.js";

function mapPgToAppError(err) {
  if (!err?.code) return null;

  // FK: userid không tồn tại / join users fail khi insert
  if (err.code === "23503") {
    return new AppError("Author not found", 404, "NOT_FOUND", {
      constraint: err.constraint,
    });
  }

  // CHECK (nếu có)
  if (err.code === "23514") {
    return new AppError("Invalid value", 400, "CHECK_VIOLATION", {
      constraint: err.constraint,
    });
  }

  return null;
}

export async function listPublic({ limit, offset, type, search }) {
  const { rows } = await pool.query(
    `
    SELECT b.baidangid, b.tieude, b.tomtat, b.hinhanhurl, b.loaibaidang, b.created_at,
           u.userid AS author_userid, u.hoten AS author_hoten
    FROM public.baidang b
    JOIN public.users u ON u.userid = b.userid
    WHERE b.trangthai = TRUE
      AND u.trangthai = TRUE
      AND ($1::text IS NULL OR b.loaibaidang = $1)
      AND ($2::text IS NULL OR (b.tieude ILIKE '%'||$2||'%' OR b.tomtat ILIKE '%'||$2||'%'))
    ORDER BY b.baidangid DESC
    LIMIT $3 OFFSET $4
    `,
    [type, search, limit, offset]
  );

  return rows.map((r) => ({
    baidangid: r.baidangid,
    tieude: r.tieude,
    tomtat: r.tomtat,
    hinhanhurl: r.hinhanhurl,
    loaibaidang: r.loaibaidang,
    created_at: r.created_at,
    author: { userid: r.author_userid, hoten: r.author_hoten },
  }));
}

export async function getPublicDetail(baidangid) {
  const { rows } = await pool.query(
    `
    SELECT b.*, u.hoten, u.avatarurl
    FROM public.baidang b
    JOIN public.users u ON u.userid = b.userid
    WHERE b.baidangid = $1 AND b.trangthai = TRUE AND u.trangthai = TRUE
    LIMIT 1
    `,
    [baidangid]
  );

  if (rows.length === 0) {
    throw new AppError("Post not found", 404, "NOT_FOUND", { baidangid });
  }

  const r = rows[0];
  return {
    ...r,
    author: { userid: r.userid, hoten: r.hoten, avatarurl: r.avatarurl },
  };
}

export async function adminListAll({ limit, offset, active }) {
  const { rows } = await pool.query(
    `
    SELECT b.*, u.hoten
    FROM public.baidang b
    JOIN public.users u ON u.userid = b.userid
    WHERE ($1::boolean IS NULL OR b.trangthai = $1)
    ORDER BY b.baidangid DESC
    LIMIT $2 OFFSET $3
    `,
    [active, limit, offset]
  );
  return rows;
}

export async function adminCreatePost(userid, data) {
  try {
    const { rows } = await pool.query(
      `
      INSERT INTO public.baidang (userid, tieude, tomtat, noidung, hinhanhurl, loaibaidang, trangthai)
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      RETURNING *
      `,
      [
        userid,
        data.tieude,
        data.tomtat,
        data.noidung,
        data.hinhanhurl,
        data.loaibaidang,
        data.trangthai,
      ]
    );
    return rows[0];
  } catch (err) {
    const mapped = mapPgToAppError(err);
    if (mapped) throw mapped;
    throw err;
  }
}

export async function adminUpdatePost(baidangid, patch) {
  const { rows: cur } = await pool.query(
    `SELECT * FROM public.baidang WHERE baidangid=$1 LIMIT 1`,
    [baidangid]
  );

  if (cur.length === 0) {
    throw new AppError("Post not found", 404, "NOT_FOUND", { baidangid });
  }

  const now = cur[0];

  const next = {
    tieude: patch.tieude ?? now.tieude,
    tomtat: patch.tomtat ?? now.tomtat,
    noidung: patch.noidung ?? now.noidung,
    hinhanhurl:
      patch.hinhanhurl === undefined ? now.hinhanhurl : patch.hinhanhurl,
    loaibaidang: patch.loaibaidang ?? now.loaibaidang,
    trangthai: patch.trangthai ?? now.trangthai,
  };

  const { rows } = await pool.query(
    `
    UPDATE public.baidang
    SET tieude=$1, tomtat=$2, noidung=$3, hinhanhurl=$4, loaibaidang=$5, trangthai=$6
    WHERE baidangid=$7
    RETURNING *
    `,
    [
      next.tieude,
      next.tomtat,
      next.noidung,
      next.hinhanhurl,
      next.loaibaidang,
      next.trangthai,
      baidangid,
    ]
  );

  return rows[0];
}

export async function adminSetStatus(baidangid, trangthai) {
  const { rows } = await pool.query(
    `UPDATE public.baidang
     SET trangthai=$2
     WHERE baidangid=$1
     RETURNING baidangid, trangthai`,
    [baidangid, trangthai]
  );

  if (rows.length === 0) {
    throw new AppError("Post not found", 404, "NOT_FOUND", { baidangid });
  }

  return rows[0];
}
