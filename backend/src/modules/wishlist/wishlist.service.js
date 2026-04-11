// src/modules/wishlist/wishlist.service.js
import { pool } from "../../db/db.js";
import { AppError } from "../../utils/appError.js";

function mapPgToAppError(err) {
  if (!err?.code) return null;

  // foreign_key_violation
  if (err.code === "23503") {
    return new AppError("Foreign key constraint failed", 409, "FK_VIOLATION", {
      constraint: err.constraint,
    });
  }

  // check_violation
  if (err.code === "23514") {
    return new AppError("Invalid value", 400, "CHECK_VIOLATION", {
      constraint: err.constraint,
    });
  }

  return null;
}

async function safeRollback(client) {
  try {
    await client.query("ROLLBACK");
  } catch {
    // ignore
  }
}

async function getOrCreateWishlistId(client, userid) {
  await client.query(
    `INSERT INTO public.danhsachyeuthich (userid)
     VALUES ($1)
     ON CONFLICT (userid) DO NOTHING`,
    [userid]
  );

  const { rows } = await client.query(
    `SELECT danhsachyeuthichid
     FROM public.danhsachyeuthich
     WHERE userid=$1
     LIMIT 1`,
    [userid]
  );

  const id = rows[0]?.danhsachyeuthichid;
  if (!id) {
    throw new AppError("Wishlist not found/created", 500, "WISHLIST_ERROR");
  }
  return id;
}

async function getWishlistItems(danhsachyeuthichid) {
  const { rows } = await pool.query(
    `
    SELECT
      bg.bentheid,
      bg.added_at,

      bt.tenbienthe,
      bt.sku,
      bt.giaban,
      bt.tonkho,
      bt.trangthai AS variant_trangthai,

      sp.sanphamid,
      sp.ten AS sanpham_ten,
      sp.trangthai AS sanpham_trangthai
    FROM public.bao_gom bg
    JOIN public.bienthe_sanpham bt ON bt.bentheid = bg.bentheid
    JOIN public.sanpham sp ON sp.sanphamid = bt.sanphamid
    WHERE bg.danhsachyeuthichid = $1
    ORDER BY bg.added_at DESC
    `,
    [danhsachyeuthichid]
  );

  return rows.map((r) => ({
    bentheid: r.bentheid,
    added_at: r.added_at,
    tenbienthe: r.tenbienthe,
    sku: r.sku,
    giaban: r.giaban,
    tonkho: r.tonkho,
    variant_trangthai: r.variant_trangthai,
    sanpham: {
      sanphamid: r.sanphamid,
      ten: r.sanpham_ten,
      trangthai: r.sanpham_trangthai,
    },
  }));
}

export async function getWishlist(userid) {
  const client = await pool.connect();
  try {
    const danhsachyeuthichid = await getOrCreateWishlistId(client, userid);
    const items = await getWishlistItems(danhsachyeuthichid);
    return { danhsachyeuthichid, items, count: items.length };
  } finally {
    client.release();
  }
}

export async function addWishlistItem(userid, bentheid) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const danhsachyeuthichid = await getOrCreateWishlistId(client, userid);

    // check variant + product active
    const { rows: vr } = await client.query(
      `
      SELECT bt.bentheid, bt.trangthai AS bt_on, sp.trangthai AS sp_on
      FROM public.bienthe_sanpham bt
      JOIN public.sanpham sp ON sp.sanphamid = bt.sanphamid
      WHERE bt.bentheid = $1
      LIMIT 1
      `,
      [bentheid]
    );

    if (vr.length === 0) {
      throw new AppError("Variant not found", 404, "NOT_FOUND", {
        entity: "bienthe_sanpham",
        bentheid,
      });
    }

    if (vr[0].bt_on === false || vr[0].sp_on === false) {
      throw new AppError("Product/variant is disabled", 400, "DISABLED", {
        bentheid,
      });
    }

    // insert (idempotent)
    await client.query(
      `
      INSERT INTO public.bao_gom (danhsachyeuthichid, bentheid)
      VALUES ($1,$2)
      ON CONFLICT (danhsachyeuthichid, bentheid) DO NOTHING
      `,
      [danhsachyeuthichid, bentheid]
    );

    await client.query("COMMIT");
    return getWishlist(userid);
  } catch (err) {
    await safeRollback(client);
    const mapped = mapPgToAppError(err);
    if (mapped) throw mapped;
    throw err;
  } finally {
    client.release();
  }
}

export async function removeWishlistItem(userid, bentheid) {
  const client = await pool.connect();
  try {
    const danhsachyeuthichid = await getOrCreateWishlistId(client, userid);

    const { rowCount } = await pool.query(
      `DELETE FROM public.bao_gom
       WHERE danhsachyeuthichid=$1 AND bentheid=$2`,
      [danhsachyeuthichid, bentheid]
    );

    if (rowCount === 0) {
      throw new AppError("Wishlist item not found", 404, "NOT_FOUND", {
        bentheid,
      });
    }

    return getWishlist(userid);
  } catch (err) {
    const mapped = mapPgToAppError(err);
    if (mapped) throw mapped;
    throw err;
  } finally {
    client.release();
  }
}

export async function clearWishlist(userid) {
  const client = await pool.connect();
  try {
    const danhsachyeuthichid = await getOrCreateWishlistId(client, userid);

    await pool.query(`DELETE FROM public.bao_gom WHERE danhsachyeuthichid=$1`, [
      danhsachyeuthichid,
    ]);

    return getWishlist(userid);
  } catch (err) {
    const mapped = mapPgToAppError(err);
    if (mapped) throw mapped;
    throw err;
  } finally {
    client.release();
  }
}
