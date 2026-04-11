// src/modules/catalog/catalog.service.js
import { pool } from "../../db/db.js";
import { AppError } from "../../utils/appError.js";

/** ========== CATEGORY ========== */
export async function listCategories({ includeInactive = false }) {
  const { rows } = await pool.query(
    `
    SELECT danhmucid, ten, tenviettat, trangthai, created_at
    FROM public.danhmuc
    WHERE ($1::boolean = true) OR (trangthai = true)
    ORDER BY danhmucid DESC
    `,
    [includeInactive]
  );
  return rows;
}

export async function getCategory(danhmucid) {
  const { rows } = await pool.query(
    `
    SELECT danhmucid, ten, tenviettat, trangthai, created_at
    FROM public.danhmuc
    WHERE danhmucid = $1
    LIMIT 1
    `,
    [danhmucid]
  );
  return rows[0] || null;
}

export async function createCategory(data) {
  const { rows } = await pool.query(
    `
    INSERT INTO public.danhmuc (ten, tenviettat, trangthai)
    VALUES ($1,$2,$3)
    RETURNING danhmucid, ten, tenviettat, trangthai, created_at
    `,
    [data.ten, data.tenviettat, data.trangthai]
  );
  return rows[0];
}

export async function updateCategory(danhmucid, patch) {
  const cur = await getCategory(danhmucid);
  if (!cur) throw new AppError("Category not found", 404, "NOT_FOUND");

  const next = {
    ten: patch.ten ?? cur.ten,
    tenviettat: patch.tenviettat ?? cur.tenviettat,
    trangthai: patch.trangthai ?? cur.trangthai,
  };

  const { rows } = await pool.query(
    `
    UPDATE public.danhmuc
    SET ten = $1, tenviettat = $2, trangthai = $3
    WHERE danhmucid = $4
    RETURNING danhmucid, ten, tenviettat, trangthai, created_at
    `,
    [next.ten, next.tenviettat, next.trangthai, danhmucid]
  );

  return rows[0];
}

/** ========== SUPPLIER ========== */
export async function listSuppliers({ includeInactive = false }) {
  const { rows } = await pool.query(
    `
    SELECT nhacungcapid, ten, tenviettat, email, sdt, logourl, trangthai, created_at
    FROM public.nhacungcap
    WHERE ($1::boolean = true) OR (trangthai = true)
    ORDER BY nhacungcapid DESC
    `,
    [includeInactive]
  );
  return rows;
}

export async function getSupplier(nhacungcapid) {
  const { rows } = await pool.query(
    `
    SELECT nhacungcapid, ten, tenviettat, email, sdt, logourl, trangthai, created_at
    FROM public.nhacungcap
    WHERE nhacungcapid = $1
    LIMIT 1
    `,
    [nhacungcapid]
  );
  return rows[0] || null;
}

export async function createSupplier(data) {
  const { rows } = await pool.query(
    `
    INSERT INTO public.nhacungcap (ten, tenviettat, email, sdt, logourl, trangthai)
    VALUES ($1,$2,$3,$4,$5,$6)
    RETURNING nhacungcapid, ten, tenviettat, email, sdt, logourl, trangthai, created_at
    `,
    [
      data.ten,
      data.tenviettat,
      data.email,
      data.sdt,
      data.logourl,
      data.trangthai,
    ]
  );
  return rows[0];
}

export async function updateSupplier(nhacungcapid, patch) {
  const cur = await getSupplier(nhacungcapid);
  if (!cur) throw new AppError("Supplier not found", 404, "NOT_FOUND");

  const next = {
    ten: patch.ten ?? cur.ten,
    tenviettat: patch.tenviettat ?? cur.tenviettat,
    email: patch.email ?? cur.email,
    sdt: patch.sdt ?? cur.sdt,
    logourl: patch.logourl === undefined ? cur.logourl : patch.logourl,
    trangthai: patch.trangthai ?? cur.trangthai,
  };

  const { rows } = await pool.query(
    `
    UPDATE public.nhacungcap
    SET ten=$1, tenviettat=$2, email=$3, sdt=$4, logourl=$5, trangthai=$6
    WHERE nhacungcapid=$7
    RETURNING nhacungcapid, ten, tenviettat, email, sdt, logourl, trangthai, created_at
    `,
    [
      next.ten,
      next.tenviettat,
      next.email,
      next.sdt,
      next.logourl,
      next.trangthai,
      nhacungcapid,
    ]
  );

  return rows[0];
}

/** ========== PRODUCT + VARIANT ========== */
export async function listProducts({
  includeInactive = false,
  danhmucid,
  nhacungcapid,
  q,
  limit,
  offset,
}) {
  const { rows } = await pool.query(
    `
    SELECT sp.sanphamid, sp.danhmucid, dm.ten AS danhmuc_ten,
           sp.nhacungcapid, ncc.ten AS nhacungcap_ten,
           sp.ten, sp.motangan, sp.tenviettat, sp.hinhanhurl, sp.trangthai, sp.created_at
    FROM public.sanpham sp
    JOIN public.danhmuc dm ON dm.danhmucid = sp.danhmucid
    JOIN public.nhacungcap ncc ON ncc.nhacungcapid = sp.nhacungcapid
    WHERE
      (($1::boolean = true) OR (sp.trangthai = true))
      AND ($2::bigint IS NULL OR sp.danhmucid = $2::bigint)
      AND ($3::bigint IS NULL OR sp.nhacungcapid = $3::bigint)
      AND (
        $4::text IS NULL
        OR sp.ten ILIKE ('%' || $4 || '%')
        OR sp.tenviettat ILIKE ('%' || $4 || '%')
      )
    ORDER BY sp.sanphamid DESC
    LIMIT $5 OFFSET $6
    `,
    [includeInactive, danhmucid, nhacungcapid, q, limit, offset]
  );
  return rows;
}

export async function getProduct(sanphamid) {
  const { rows } = await pool.query(
    `
    SELECT sanphamid, danhmucid, nhacungcapid, ten, motangan, motachitiet, tenviettat, hinhanhurl, trangthai, created_at
    FROM public.sanpham
    WHERE sanphamid = $1
    LIMIT 1
    `,
    [sanphamid]
  );
  return rows[0] || null;
}

export async function getProductDetail(sanphamid) {
  const prod = await pool.query(
    `
    SELECT sp.sanphamid, sp.danhmucid, dm.ten AS danhmuc_ten,
           sp.nhacungcapid, ncc.ten AS nhacungcap_ten,
           sp.ten, sp.motangan, sp.motachitiet, sp.tenviettat, sp.hinhanhurl, sp.trangthai, sp.created_at
    FROM public.sanpham sp
    JOIN public.danhmuc dm ON dm.danhmucid = sp.danhmucid
    JOIN public.nhacungcap ncc ON ncc.nhacungcapid = sp.nhacungcapid
    WHERE sp.sanphamid = $1
    LIMIT 1
    `,
    [sanphamid]
  );

  if (prod.rows.length === 0) return null;

  const vars = await pool.query(
    `
    SELECT bentheid, sanphamid, tenbienthe, sku, giaban, tonkho, hinhanhurl, trangthai, created_at
    FROM public.bienthe_sanpham
    WHERE sanphamid = $1
    ORDER BY bentheid DESC
    `,
    [sanphamid]
  );

  return { ...prod.rows[0], variants: vars.rows };
}

export async function createProduct(data) {
  const dm = await getCategory(data.danhmucid);
  if (!dm) throw new AppError("Category not found", 404, "NOT_FOUND");

  const ncc = await getSupplier(data.nhacungcapid);
  if (!ncc) throw new AppError("Supplier not found", 404, "NOT_FOUND");

  const { rows } = await pool.query(
    `
    INSERT INTO public.sanpham
      (danhmucid, nhacungcapid, ten, motangan, motachitiet, tenviettat, hinhanhurl, trangthai)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
    RETURNING sanphamid, danhmucid, nhacungcapid, ten, motangan, motachitiet, tenviettat, hinhanhurl, trangthai, created_at
    `,
    [
      data.danhmucid,
      data.nhacungcapid,
      data.ten,
      data.motangan,
      data.motachitiet,
      data.tenviettat,
      data.hinhanhurl,
      data.trangthai,
    ]
  );

  return rows[0];
}

export async function updateProduct(sanphamid, patch) {
  const cur = await getProduct(sanphamid);
  if (!cur) throw new AppError("Product not found", 404, "NOT_FOUND");

  const next = {
    danhmucid: patch.danhmucid ?? cur.danhmucid,
    nhacungcapid: patch.nhacungcapid ?? cur.nhacungcapid,
    ten: patch.ten ?? cur.ten,
    motangan: patch.motangan ?? cur.motangan,
    motachitiet: patch.motachitiet ?? cur.motachitiet,
    tenviettat: patch.tenviettat ?? cur.tenviettat,
    hinhanhurl:
      patch.hinhanhurl === undefined ? cur.hinhanhurl : patch.hinhanhurl,
    trangthai: patch.trangthai ?? cur.trangthai,
  };

  if (patch.danhmucid !== undefined) {
    const dm = await getCategory(next.danhmucid);
    if (!dm) throw new AppError("Category not found", 404, "NOT_FOUND");
  }
  if (patch.nhacungcapid !== undefined) {
    const ncc = await getSupplier(next.nhacungcapid);
    if (!ncc) throw new AppError("Supplier not found", 404, "NOT_FOUND");
  }

  const { rows } = await pool.query(
    `
    UPDATE public.sanpham
    SET danhmucid=$1, nhacungcapid=$2, ten=$3, motangan=$4, motachitiet=$5, tenviettat=$6, hinhanhurl=$7, trangthai=$8
    WHERE sanphamid=$9
    RETURNING sanphamid, danhmucid, nhacungcapid, ten, motangan, motachitiet, tenviettat, hinhanhurl, trangthai, created_at
    `,
    [
      next.danhmucid,
      next.nhacungcapid,
      next.ten,
      next.motangan,
      next.motachitiet,
      next.tenviettat,
      next.hinhanhurl,
      next.trangthai,
      sanphamid,
    ]
  );

  return rows[0];
}

export async function listVariantsByProduct(
  sanphamid,
  { includeInactive = false }
) {
  const { rows } = await pool.query(
    `
    SELECT bentheid, sanphamid, tenbienthe, sku, giaban, tonkho, hinhanhurl, trangthai, created_at
    FROM public.bienthe_sanpham
    WHERE sanphamid = $1
      AND (($2::boolean = true) OR (trangthai = true))
    ORDER BY bentheid DESC
    `,
    [sanphamid, includeInactive]
  );
  return rows;
}

export async function createVariant(sanphamid, data) {
  const p = await getProduct(sanphamid);
  if (!p) throw new AppError("Product not found", 404, "NOT_FOUND");

  const { rows } = await pool.query(
    `
    INSERT INTO public.bienthe_sanpham
      (sanphamid, tenbienthe, sku, giaban, tonkho, hinhanhurl, trangthai)
    VALUES ($1,$2,$3,$4,$5,$6,$7)
    RETURNING bentheid, sanphamid, tenbienthe, sku, giaban, tonkho, hinhanhurl, trangthai, created_at
    `,
    [
      sanphamid,
      data.tenbienthe,
      data.sku,
      data.giaban,
      data.tonkho,
      data.hinhanhurl,
      data.trangthai,
    ]
  );

  return rows[0];
}

export async function updateVariant(bentheid, patch) {
  const { rows: curRows } = await pool.query(
    `
    SELECT bentheid, sanphamid, tenbienthe, sku, giaban, tonkho, hinhanhurl, trangthai
    FROM public.bienthe_sanpham
    WHERE bentheid = $1
    LIMIT 1
    `,
    [bentheid]
  );

  if (curRows.length === 0) {
    throw new AppError("Variant not found", 404, "NOT_FOUND");
  }

  const cur = curRows[0];
  const next = {
    tenbienthe:
      patch.tenbienthe === undefined
        ? cur.tenbienthe
        : patch.tenbienthe || null,
    sku: patch.sku === undefined ? cur.sku : patch.sku || null,
    giaban: patch.giaban === undefined ? cur.giaban : patch.giaban,
    tonkho: patch.tonkho === undefined ? cur.tonkho : patch.tonkho,
    hinhanhurl:
      patch.hinhanhurl === undefined ? cur.hinhanhurl : patch.hinhanhurl,
    trangthai: patch.trangthai === undefined ? cur.trangthai : patch.trangthai,
  };

  const { rows } = await pool.query(
    `
    UPDATE public.bienthe_sanpham
    SET tenbienthe=$1, sku=$2, giaban=$3, tonkho=$4, hinhanhurl=$5, trangthai=$6
    WHERE bentheid=$7
    RETURNING bentheid, sanphamid, tenbienthe, sku, giaban, tonkho, hinhanhurl, trangthai, created_at
    `,
    [
      next.tenbienthe,
      next.sku,
      next.giaban,
      next.tonkho,
      next.hinhanhurl,
      next.trangthai,
      bentheid,
    ]
  );

  return rows[0];
}
