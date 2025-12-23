// src/modules/promotion/promotion.service.js
import { pool } from "../../db/db.js";
import { AppError } from "../../utils/appError.js";

function mapPgToAppError(err) {
  if (!err?.code) return null;

  // UNIQUE
  if (err.code === "23505") {
    return new AppError("Duplicate value", 409, "DUPLICATE", {
      constraint: err.constraint,
    });
  }

  // FK
  if (err.code === "23503") {
    const c = String(err.constraint || "");

    // mapping promotion-product
    if (c.includes("fk_km_apdung_khuyenmai")) {
      return new AppError("Promotion not found", 404, "NOT_FOUND", {
        constraint: err.constraint,
      });
    }
    if (c.includes("fk_km_apdung_sanpham")) {
      return new AppError("Product not found", 404, "NOT_FOUND", {
        constraint: err.constraint,
      });
    }

    return new AppError("Foreign key constraint failed", 409, "FK_VIOLATION", {
      constraint: err.constraint,
    });
  }

  // CHECK (ck_km_time, ck_km_mode, ...)
  if (err.code === "23514") {
    return new AppError("Invalid value", 400, "CHECK_VIOLATION", {
      constraint: err.constraint,
    });
  }

  return null;
}

export async function listActivePromotions() {
  const { rows } = await pool.query(
    `
    SELECT khuyenmaiid, tenkhuyenmai, mota, loaigiamgia, giatrigiamcodinh, tylegiam,
           thoigianbatdau, thoigianketthuc, trangthai, cothecongdon
    FROM public.chuongtrinhkhuyenmai
    WHERE trangthai = TRUE
      AND NOW() BETWEEN thoigianbatdau AND thoigianketthuc
    ORDER BY khuyenmaiid DESC
    `
  );
  return rows;
}

export async function adminListAllPromotions() {
  const { rows } = await pool.query(
    `
    SELECT khuyenmaiid, tenkhuyenmai, mota, loaigiamgia, giatrigiamcodinh, tylegiam,
           thoigianbatdau, thoigianketthuc, trangthai, cothecongdon, created_at
    FROM public.chuongtrinhkhuyenmai
    ORDER BY khuyenmaiid DESC
    `
  );
  return rows;
}

export async function getActivePromotionDetail(khuyenmaiid) {
  const promo = await pool.query(
    `
    SELECT khuyenmaiid, tenkhuyenmai, mota, loaigiamgia, giatrigiamcodinh, tylegiam,
           thoigianbatdau, thoigianketthuc, trangthai, cothecongdon
    FROM public.chuongtrinhkhuyenmai
    WHERE khuyenmaiid = $1
      AND trangthai = TRUE
      AND NOW() BETWEEN thoigianbatdau AND thoigianketthuc
    LIMIT 1
    `,
    [khuyenmaiid]
  );

  if (promo.rows.length === 0) {
    throw new AppError("Promotion not found", 404, "NOT_FOUND", {
      khuyenmaiid,
    });
  }

  const products = await pool.query(
    `
    SELECT sp.sanphamid, sp.ten
    FROM public.khuyenmai_ap_dung_sanpham k
    JOIN public.sanpham sp ON sp.sanphamid = k.sanphamid
    WHERE k.khuyenmaiid = $1
    ORDER BY sp.sanphamid DESC
    `,
    [khuyenmaiid]
  );

  return { ...promo.rows[0], products: products.rows };
}

export async function createPromotion(data) {
  try {
    const { rows } = await pool.query(
      `
      INSERT INTO public.chuongtrinhkhuyenmai
        (tenkhuyenmai, mota, loaigiamgia, giatrigiamcodinh, tylegiam,
         thoigianbatdau, thoigianketthuc, trangthai, cothecongdon)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING *
      `,
      [
        data.tenkhuyenmai,
        data.mota,
        data.loaigiamgia,
        data.giatrigiamcodinh,
        data.tylegiam,
        data.thoigianbatdau,
        data.thoigianketthuc,
        data.trangthai,
        data.cothecongdon,
      ]
    );
    return rows[0];
  } catch (err) {
    const mapped = mapPgToAppError(err);
    if (mapped) throw mapped;
    throw err;
  }
}

export async function updatePromotion(khuyenmaiid, patch) {
  const { rows: curRows } = await pool.query(
    `SELECT * FROM public.chuongtrinhkhuyenmai WHERE khuyenmaiid=$1 LIMIT 1`,
    [khuyenmaiid]
  );

  if (curRows.length === 0) {
    throw new AppError("Promotion not found", 404, "NOT_FOUND", {
      khuyenmaiid,
    });
  }

  const cur = curRows[0];

  const next = {
    tenkhuyenmai: patch.tenkhuyenmai ?? cur.tenkhuyenmai,
    mota: patch.mota === undefined ? cur.mota : patch.mota,
    loaigiamgia: patch.loaigiamgia ?? cur.loaigiamgia,
    giatrigiamcodinh:
      patch.giatrigiamcodinh === undefined
        ? cur.giatrigiamcodinh
        : patch.giatrigiamcodinh,
    tylegiam: patch.tylegiam === undefined ? cur.tylegiam : patch.tylegiam,
    thoigianbatdau: patch.thoigianbatdau ?? cur.thoigianbatdau,
    thoigianketthuc: patch.thoigianketthuc ?? cur.thoigianketthuc,
    trangthai: patch.trangthai ?? cur.trangthai,
    cothecongdon: patch.cothecongdon ?? cur.cothecongdon,
  };

  try {
    const { rows } = await pool.query(
      `
      UPDATE public.chuongtrinhkhuyenmai
      SET tenkhuyenmai=$1, mota=$2, loaigiamgia=$3, giatrigiamcodinh=$4, tylegiam=$5,
          thoigianbatdau=$6, thoigianketthuc=$7, trangthai=$8, cothecongdon=$9
      WHERE khuyenmaiid=$10
      RETURNING *
      `,
      [
        next.tenkhuyenmai,
        next.mota,
        next.loaigiamgia,
        next.giatrigiamcodinh,
        next.tylegiam,
        next.thoigianbatdau,
        next.thoigianketthuc,
        next.trangthai,
        next.cothecongdon,
        khuyenmaiid,
      ]
    );
    return rows[0];
  } catch (err) {
    const mapped = mapPgToAppError(err);
    if (mapped) throw mapped;
    throw err;
  }
}

export async function attachPromotionProduct(khuyenmaiid, sanphamid) {
  try {
    await pool.query(
      `
      INSERT INTO public.khuyenmai_ap_dung_sanpham (khuyenmaiid, sanphamid)
      VALUES ($1,$2)
      ON CONFLICT (khuyenmaiid, sanphamid) DO NOTHING
      `,
      [khuyenmaiid, sanphamid]
    );
    return true;
  } catch (err) {
    const mapped = mapPgToAppError(err);
    if (mapped) throw mapped;
    throw err;
  }
}

export async function detachPromotionProduct(khuyenmaiid, sanphamid) {
  const { rowCount } = await pool.query(
    `DELETE FROM public.khuyenmai_ap_dung_sanpham WHERE khuyenmaiid=$1 AND sanphamid=$2`,
    [khuyenmaiid, sanphamid]
  );

  if (rowCount === 0) {
    throw new AppError("Mapping not found", 404, "NOT_FOUND", {
      khuyenmaiid,
      sanphamid,
    });
  }

  return true;
}
