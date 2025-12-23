// src/modules/attribute/attribute.service.js
import { pool } from "../../db/db.js";
import { AppError } from "../../utils/appError.js";

function normalizeValueByType(type, value) {
  const t = String(type || "").toUpperCase();

  if (t === "BOOLEAN") {
    if (value === true || value === false) return String(value);
    const s = String(value).trim().toLowerCase();
    if (s === "true" || s === "false") return s;
    throw new AppError("Invalid BOOLEAN value", 400, "VALIDATION_ERROR");
  }

  if (t === "INTEGER") {
    const n = Number(value);
    if (!Number.isInteger(n)) {
      throw new AppError("Invalid INTEGER value", 400, "VALIDATION_ERROR");
    }
    return String(n);
  }

  if (t === "NUMBER") {
    const n = Number(value);
    if (!Number.isFinite(n)) {
      throw new AppError("Invalid NUMBER value", 400, "VALIDATION_ERROR");
    }
    return String(n);
  }

  // STRING / TEXT
  const s = typeof value === "string" ? value.trim() : String(value);
  if (s.length === 0) {
    throw new AppError("Invalid STRING/TEXT value", 400, "VALIDATION_ERROR");
  }
  return s;
}

/**
 * thuoctinh
 */
export async function listAttributes() {
  const { rows } = await pool.query(
    `SELECT thuoctinhid, tenthuoctinh, donvitinh, kieudulieu, mota
     FROM public.thuoctinh
     ORDER BY thuoctinhid DESC`
  );
  return rows;
}

export async function getAttribute(thuoctinhid) {
  const { rows } = await pool.query(
    `SELECT thuoctinhid, tenthuoctinh, donvitinh, kieudulieu, mota
     FROM public.thuoctinh
     WHERE thuoctinhid=$1
     LIMIT 1`,
    [thuoctinhid]
  );
  return rows[0] || null;
}

export async function createAttribute(data) {
  const { rows } = await pool.query(
    `
    INSERT INTO public.thuoctinh (tenthuoctinh, donvitinh, kieudulieu, mota)
    VALUES ($1,$2,$3,$4)
    RETURNING thuoctinhid, tenthuoctinh, donvitinh, kieudulieu, mota
    `,
    [data.tenthuoctinh, data.donvitinh, data.kieudulieu, data.mota]
  );
  return rows[0];
}

export async function updateAttribute(thuoctinhid, patch) {
  const cur = await getAttribute(thuoctinhid);
  if (!cur) throw new AppError("Attribute not found", 404, "NOT_FOUND");

  const next = {
    tenthuoctinh: patch.tenthuoctinh ?? cur.tenthuoctinh,
    donvitinh: patch.donvitinh === undefined ? cur.donvitinh : patch.donvitinh,
    kieudulieu: patch.kieudulieu ?? cur.kieudulieu,
    mota: patch.mota === undefined ? cur.mota : patch.mota,
  };

  const { rows } = await pool.query(
    `
    UPDATE public.thuoctinh
    SET tenthuoctinh=$1, donvitinh=$2, kieudulieu=$3, mota=$4
    WHERE thuoctinhid=$5
    RETURNING thuoctinhid, tenthuoctinh, donvitinh, kieudulieu, mota
    `,
    [next.tenthuoctinh, next.donvitinh, next.kieudulieu, next.mota, thuoctinhid]
  );
  return rows[0];
}

export async function deleteAttribute(thuoctinhid) {
  const { rowCount } = await pool.query(
    `DELETE FROM public.thuoctinh WHERE thuoctinhid=$1`,
    [thuoctinhid]
  );
  if (rowCount === 0)
    throw new AppError("Attribute not found", 404, "NOT_FOUND");
  return true;
}

/**
 * thuoctinhdanhmuc
 */
export async function listCategoryAttributes(danhmucid) {
  const { rows } = await pool.query(
    `
    SELECT m.dmttid, m.danhmucid, m.thuoctinhid, m.batbuoc, m.thutuhienthi,
           a.tenthuoctinh, a.donvitinh, a.kieudulieu, a.mota
    FROM public.thuoctinhdanhmuc m
    JOIN public.thuoctinh a ON a.thuoctinhid = m.thuoctinhid
    WHERE m.danhmucid = $1
    ORDER BY m.thutuhienthi ASC, m.dmttid ASC
    `,
    [danhmucid]
  );

  return rows.map((r) => ({
    dmttid: r.dmttid,
    danhmucid: r.danhmucid,
    thuoctinhid: r.thuoctinhid,
    batbuoc: r.batbuoc,
    thutuhienthi: r.thutuhienthi,
    attribute: {
      tenthuoctinh: r.tenthuoctinh,
      donvitinh: r.donvitinh,
      kieudulieu: r.kieudulieu,
      mota: r.mota,
    },
  }));
}

export async function attachCategoryAttribute(
  danhmucid,
  { thuoctinhid, batbuoc, thutuhienthi }
) {
  const { rows } = await pool.query(
    `
    INSERT INTO public.thuoctinhdanhmuc (danhmucid, thuoctinhid, batbuoc, thutuhienthi)
    VALUES ($1,$2,$3,$4)
    RETURNING dmttid, danhmucid, thuoctinhid, batbuoc, thutuhienthi
    `,
    [danhmucid, thuoctinhid, batbuoc, thutuhienthi]
  );
  return rows[0];
}

export async function updateCategoryAttribute(danhmucid, thuoctinhid, patch) {
  const { rows: cur } = await pool.query(
    `SELECT * FROM public.thuoctinhdanhmuc WHERE danhmucid=$1 AND thuoctinhid=$2 LIMIT 1`,
    [danhmucid, thuoctinhid]
  );
  if (cur.length === 0)
    throw new AppError("Mapping not found", 404, "NOT_FOUND");

  const now = cur[0];
  const next = {
    batbuoc: patch.batbuoc ?? now.batbuoc,
    thutuhienthi: patch.thutuhienthi ?? now.thutuhienthi,
  };

  const { rows } = await pool.query(
    `
    UPDATE public.thuoctinhdanhmuc
    SET batbuoc=$1, thutuhienthi=$2
    WHERE danhmucid=$3 AND thuoctinhid=$4
    RETURNING dmttid, danhmucid, thuoctinhid, batbuoc, thutuhienthi
    `,
    [next.batbuoc, next.thutuhienthi, danhmucid, thuoctinhid]
  );
  return rows[0];
}

export async function detachCategoryAttribute(danhmucid, thuoctinhid) {
  const { rowCount } = await pool.query(
    `DELETE FROM public.thuoctinhdanhmuc WHERE danhmucid=$1 AND thuoctinhid=$2`,
    [danhmucid, thuoctinhid]
  );
  if (rowCount === 0) throw new AppError("Mapping not found", 404, "NOT_FOUND");
  return true;
}

/**
 * mang (variant attribute values)
 */
export async function listVariantAttributes(bentheid) {
  const v = await pool.query(
    `
    SELECT bt.bentheid, bt.sanphamid, sp.danhmucid
    FROM public.bienthe_sanpham bt
    JOIN public.sanpham sp ON sp.sanphamid = bt.sanphamid
    WHERE bt.bentheid = $1
    LIMIT 1
    `,
    [bentheid]
  );

  if (v.rows.length === 0)
    throw new AppError("Variant not found", 404, "NOT_FOUND");
  const variant = v.rows[0];

  const { rows } = await pool.query(
    `
    SELECT a.thuoctinhid, a.tenthuoctinh, a.donvitinh, a.kieudulieu,
           m2.batbuoc, m2.thutuhienthi,
           mv.giatri
    FROM public.thuoctinhdanhmuc m2
    JOIN public.thuoctinh a ON a.thuoctinhid = m2.thuoctinhid
    LEFT JOIN public.mang mv ON mv.thuoctinhid = a.thuoctinhid AND mv.bentheid = $1
    WHERE m2.danhmucid = $2
    ORDER BY m2.thutuhienthi ASC, a.thuoctinhid ASC
    `,
    [bentheid, variant.danhmucid]
  );

  return {
    variant: {
      bentheid: variant.bentheid,
      sanphamid: variant.sanphamid,
      danhmucid: variant.danhmucid,
    },
    attributes: rows.map((r) => ({
      thuoctinhid: r.thuoctinhid,
      tenthuoctinh: r.tenthuoctinh,
      donvitinh: r.donvitinh,
      kieudulieu: r.kieudulieu,
      batbuoc: r.batbuoc,
      thutuhienthi: r.thutuhienthi,
      giatri: r.giatri ?? null,
    })),
  };
}

export async function upsertVariantAttributes(bentheid, values, { strict }) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // get variant + category
    const v = await client.query(
      `
      SELECT bt.bentheid, bt.sanphamid, sp.danhmucid
      FROM public.bienthe_sanpham bt
      JOIN public.sanpham sp ON sp.sanphamid = bt.sanphamid
      WHERE bt.bentheid = $1
      LIMIT 1
      `,
      [bentheid]
    );
    if (v.rows.length === 0)
      throw new AppError("Variant not found", 404, "NOT_FOUND");
    const danhmucid = v.rows[0].danhmucid;

    // verify each thuoctinhid is mapped to this category + get type
    const ids = [...new Set(values.map((x) => x.thuoctinhid))];

    const mapped = await client.query(
      `
      SELECT m.thuoctinhid, m.batbuoc, a.kieudulieu
      FROM public.thuoctinhdanhmuc m
      JOIN public.thuoctinh a ON a.thuoctinhid = m.thuoctinhid
      WHERE m.danhmucid = $1 AND m.thuoctinhid = ANY($2::bigint[])
      `,
      [danhmucid, ids]
    );

    const mapById = new Map(mapped.rows.map((r) => [String(r.thuoctinhid), r]));

    for (const id of ids) {
      if (!mapById.has(String(id))) {
        throw new AppError(
          `Attribute ${id} is not mapped to this category`,
          400,
          "VALIDATION_ERROR"
        );
      }
    }

    // strict: ensure all required attributes end up having values
    if (strict === true) {
      const required = await client.query(
        `
        SELECT thuoctinhid
        FROM public.thuoctinhdanhmuc
        WHERE danhmucid=$1 AND batbuoc=TRUE
        `,
        [danhmucid]
      );

      const requiredIds = required.rows.map((r) => Number(r.thuoctinhid));

      // current existing values
      const existing = await client.query(
        `SELECT thuoctinhid FROM public.mang WHERE bentheid=$1`,
        [bentheid]
      );
      const existingSet = new Set(
        existing.rows.map((r) => Number(r.thuoctinhid))
      );
      for (const it of values) existingSet.add(Number(it.thuoctinhid));

      const missing = requiredIds.filter((id) => !existingSet.has(id));
      if (missing.length > 0) {
        throw new AppError(
          `Missing required attributes: ${missing.join(", ")}`,
          400,
          "VALIDATION_ERROR"
        );
      }
    }

    let upserted = 0;

    for (const it of values) {
      const info = mapById.get(String(it.thuoctinhid));
      const giatri = normalizeValueByType(info.kieudulieu, it.giatri);

      const r = await client.query(
        `
        INSERT INTO public.mang (bentheid, thuoctinhid, giatri)
        VALUES ($1,$2,$3)
        ON CONFLICT (bentheid, thuoctinhid)
        DO UPDATE SET giatri = EXCLUDED.giatri
        `,
        [bentheid, it.thuoctinhid, giatri]
      );

      if (r.rowCount > 0) upserted += 1;
    }

    await client.query("COMMIT");
    return upserted;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err; // pg errors để errorHandler xử lý
  } finally {
    client.release();
  }
}

export async function deleteVariantAttribute(bentheid, thuoctinhid) {
  const { rowCount } = await pool.query(
    `DELETE FROM public.mang WHERE bentheid=$1 AND thuoctinhid=$2`,
    [bentheid, thuoctinhid]
  );
  if (rowCount === 0) throw new AppError("Value not found", 404, "NOT_FOUND");
  return true;
}
