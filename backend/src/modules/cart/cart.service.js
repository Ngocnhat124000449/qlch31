// src/modules/cart/cart.service.js
import { pool } from "../../db/db.js";
import { AppError } from "../../utils/appError.js";

function toNumber(x) {
  const n = Number(x);
  return Number.isFinite(n) ? n : 0;
}

async function getOrCreateCart(userid) {
  await pool.query(
    `
    INSERT INTO public.giohang (userid)
    VALUES ($1)
    ON CONFLICT (userid) DO NOTHING
    `,
    [userid]
  );

  const { rows } = await pool.query(
    `SELECT magiohang FROM public.giohang WHERE userid = $1 LIMIT 1`,
    [userid]
  );

  const magiohang = rows[0]?.magiohang;
  if (!magiohang) {
    throw new AppError("Cannot create cart", 500, "CART_CREATE_FAILED");
  }
  return magiohang;
}

async function getOrCreateCartTx(client, userid) {
  await client.query(
    `INSERT INTO public.giohang (userid) VALUES ($1) ON CONFLICT (userid) DO NOTHING`,
    [userid]
  );

  const { rows } = await client.query(
    `SELECT magiohang FROM public.giohang WHERE userid = $1 LIMIT 1`,
    [userid]
  );

  const magiohang = rows[0]?.magiohang;
  if (!magiohang) {
    throw new AppError("Cannot create cart", 500, "CART_CREATE_FAILED");
  }
  return magiohang;
}

export async function getCart(userid) {
  const magiohang = await getOrCreateCart(userid);

  const { rows } = await pool.query(
    `
    SELECT
      ci.magiohang,
      ci.bentheid,
      ci.soluong,
      ci.added_at,

      bt.sku,
      bt.giaban,
      bt.tonkho,
      bt.hinhanhurl AS variant_hinhanhurl,
      bt.trangthai AS variant_trangthai,

      sp.sanphamid,
      sp.ten AS sanpham_ten,
      sp.hinhanhurl AS sanpham_hinhanhurl,
      sp.trangthai AS sanpham_trangthai
    FROM public.giohang_chua_bienthesanpham ci
    JOIN public.bienthe_sanpham bt ON bt.bentheid = ci.bentheid
    JOIN public.sanpham sp ON sp.sanphamid = bt.sanphamid
    WHERE ci.magiohang = $1
    ORDER BY ci.added_at DESC
    `,
    [magiohang]
  );

  const items = rows.map((r) => ({
    bentheid: r.bentheid,
    soluong: Number(r.soluong),
    added_at: r.added_at,

    sku: r.sku,
    giaban: toNumber(r.giaban),
    tonkho: Number(r.tonkho),
    variant_hinhanhurl: r.variant_hinhanhurl,
    variant_trangthai: r.variant_trangthai,

    sanpham: {
      sanphamid: r.sanphamid,
      ten: r.sanpham_ten,
      hinhanhurl: r.sanpham_hinhanhurl,
      trangthai: r.sanpham_trangthai,
    },
  }));

  const subtotal = items.reduce((sum, it) => sum + it.giaban * it.soluong, 0);

  return { magiohang, items, subtotal };
}

export async function addItem(userid, { bentheid, soluong }) {
  if (!Number.isInteger(soluong) || soluong <= 0) {
    throw new AppError(
      "soluong must be a positive integer",
      400,
      "VALIDATION",
      {
        field: "soluong",
      }
    );
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const magiohang = await getOrCreateCartTx(client, userid);

    const { rows: vr } = await client.query(
      `
      SELECT bt.bentheid, bt.tonkho, bt.trangthai AS bt_on,
             sp.trangthai AS sp_on
      FROM public.bienthe_sanpham bt
      JOIN public.sanpham sp ON sp.sanphamid = bt.sanphamid
      WHERE bt.bentheid = $1
      LIMIT 1
      `,
      [bentheid]
    );

    if (vr.length === 0) {
      throw new AppError("Variant not found", 404, "NOT_FOUND", { bentheid });
    }
    if (vr[0].bt_on === false || vr[0].sp_on === false) {
      throw new AppError("Product/variant is disabled", 400, "DISABLED", {
        bentheid,
      });
    }

    const { rows: existing } = await client.query(
      `
      SELECT soluong
      FROM public.giohang_chua_bienthesanpham
      WHERE magiohang = $1 AND bentheid = $2
      LIMIT 1
      `,
      [magiohang, bentheid]
    );

    const currentQty = existing.length ? Number(existing[0].soluong) : 0;
    const nextQty = currentQty + soluong;

    if (nextQty > Number(vr[0].tonkho)) {
      throw new AppError("Not enough stock", 400, "OUT_OF_STOCK", {
        bentheid,
        tonkho: Number(vr[0].tonkho),
        requested: nextQty,
      });
    }

    await client.query(
      `
      INSERT INTO public.giohang_chua_bienthesanpham (magiohang, bentheid, soluong)
      VALUES ($1,$2,$3)
      ON CONFLICT (magiohang, bentheid)
      DO UPDATE SET soluong = EXCLUDED.soluong
      `,
      [magiohang, bentheid, nextQty]
    );

    await client.query("COMMIT");
    return getCart(userid);
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function setItemQty(userid, bentheid, soluong) {
  if (!Number.isInteger(soluong) || soluong < 0) {
    throw new AppError("soluong must be an integer >= 0", 400, "VALIDATION", {
      field: "soluong",
    });
  }

  const magiohang = await getOrCreateCart(userid);

  if (soluong === 0) {
    await pool.query(
      `DELETE FROM public.giohang_chua_bienthesanpham WHERE magiohang=$1 AND bentheid=$2`,
      [magiohang, bentheid]
    );
    return getCart(userid);
  }

  const { rows: vr } = await pool.query(
    `
    SELECT bt.tonkho, bt.trangthai AS bt_on, sp.trangthai AS sp_on
    FROM public.bienthe_sanpham bt
    JOIN public.sanpham sp ON sp.sanphamid = bt.sanphamid
    WHERE bt.bentheid = $1
    LIMIT 1
    `,
    [bentheid]
  );

  if (vr.length === 0) {
    throw new AppError("Variant not found", 404, "NOT_FOUND", { bentheid });
  }
  if (vr[0].bt_on === false || vr[0].sp_on === false) {
    throw new AppError("Product/variant is disabled", 400, "DISABLED", {
      bentheid,
    });
  }
  if (soluong > Number(vr[0].tonkho)) {
    throw new AppError("Not enough stock", 400, "OUT_OF_STOCK", {
      bentheid,
      tonkho: Number(vr[0].tonkho),
      requested: soluong,
    });
  }

  const { rowCount } = await pool.query(
    `
    UPDATE public.giohang_chua_bienthesanpham
    SET soluong = $3
    WHERE magiohang = $1 AND bentheid = $2
    `,
    [magiohang, bentheid, soluong]
  );

  if (rowCount === 0) {
    throw new AppError("Item not found in cart", 404, "NOT_FOUND", {
      bentheid,
    });
  }

  return getCart(userid);
}

export async function removeItem(userid, bentheid) {
  const magiohang = await getOrCreateCart(userid);

  await pool.query(
    `DELETE FROM public.giohang_chua_bienthesanpham WHERE magiohang=$1 AND bentheid=$2`,
    [magiohang, bentheid]
  );

  return getCart(userid);
}

export async function clearCart(userid) {
  const magiohang = await getOrCreateCart(userid);

  await pool.query(
    `DELETE FROM public.giohang_chua_bienthesanpham WHERE magiohang=$1`,
    [magiohang]
  );

  return getCart(userid);
}
