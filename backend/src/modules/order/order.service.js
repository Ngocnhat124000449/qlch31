// src/modules/order/order.service.js
import { pool } from "../../db/db.js";
import { AppError } from "../../utils/appError.js";

function toNumber(numericStringOrNumber) {
  const n = Number(numericStringOrNumber);
  return Number.isFinite(n) ? n : 0;
}

async function safeRollback(client) {
  try {
    await client.query("ROLLBACK");
  } catch {
    // ignore
  }
}

async function getCartItemsForUser(client, userid) {
  const cart = await client.query(
    `SELECT magiohang FROM public.giohang WHERE userid=$1 LIMIT 1`,
    [userid]
  );
  if (cart.rows.length === 0) return { magiohang: null, items: [] };

  const magiohang = cart.rows[0].magiohang;

  const items = await client.query(
    `
    SELECT ci.bentheid, ci.soluong,
           bt.giaban, bt.tonkho, bt.trangthai AS bt_on,
           sp.trangthai AS sp_on
    FROM public.giohang_chua_bienthesanpham ci
    JOIN public.bienthe_sanpham bt ON bt.bentheid = ci.bentheid
    JOIN public.sanpham sp ON sp.sanphamid = bt.sanphamid
    WHERE ci.magiohang = $1
    ORDER BY ci.added_at DESC
    `,
    [magiohang]
  );

  return { magiohang, items: items.rows };
}

export async function createOrderFromCart(
  userid,
  { phuongthucid, diachiuserid, phivanchuyen, ghichu, items: selectedItems }
) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // check payment exists
    const pay = await client.query(
      `SELECT phuongthucid FROM public.phuongthucthanhtoan WHERE phuongthucid=$1 LIMIT 1`,
      [phuongthucid]
    );
    if (pay.rows.length === 0) {
      throw new AppError("Payment method not found", 404, "NOT_FOUND", {
        phuongthucid,
      });
    }

    // check address owned
    const addr = await client.query(
      `SELECT diachiuserid FROM public.user_address WHERE userid=$1 AND diachiuserid=$2 LIMIT 1`,
      [userid, diachiuserid]
    );
    if (addr.rows.length === 0) {
      throw new AppError("Address not found", 404, "NOT_FOUND", {
        diachiuserid,
      });
    }

    // cart items
    const { magiohang, items: cartItems } = await getCartItemsForUser(
      client,
      userid
    );
    if (!magiohang || cartItems.length === 0) {
      throw new AppError("Cart is empty", 400, "CART_EMPTY");
    }

    // If client provides selected items, checkout only those. Otherwise checkout whole cart.
    // selectedItems: [{ bentheid, soluong }]
    const cartMap = new Map(
      cartItems.map((it) => [Number(it.bentheid), it])
    );

    const items = (() => {
      if (!Array.isArray(selectedItems)) {
        return cartItems.map((it) => ({ ...it, soluong: Number(it.soluong) }));
      }

      const picked = [];
      for (const sel of selectedItems) {
        const bentheid = Number(sel?.bentheid);
        const qty = Number(sel?.soluong);
        const row = cartMap.get(bentheid);
        if (!row) {
          throw new AppError(
            "Selected item is not in cart",
            400,
            "ITEM_NOT_IN_CART",
            { bentheid }
          );
        }

        const inCartQty = Number(row.soluong);
        if (!Number.isInteger(qty) || qty <= 0) {
          throw new AppError(
            "Invalid selected quantity",
            400,
            "INVALID_QTY",
            { bentheid, qty }
          );
        }
        if (qty > inCartQty) {
          throw new AppError(
            "Selected quantity exceeds cart quantity",
            409,
            "QTY_EXCEEDS_CART",
            { bentheid, requested: qty, inCart: inCartQty }
          );
        }

        picked.push({ ...row, soluong: qty, _inCartQty: inCartQty });
      }

      if (picked.length === 0) {
        throw new AppError(
          "No valid items selected",
          400,
          "NO_ITEMS_SELECTED"
        );
      }
      return picked;
    })();

    // validate stock + active, compute tongtien
    let tongtien = 0;
    for (const it of items) {
      if (it.bt_on === false || it.sp_on === false) {
        throw new AppError(
          "Cart contains disabled product/variant",
          400,
          "DISABLED_ITEM",
          { bentheid: it.bentheid }
        );
      }

      if (Number(it.soluong) > Number(it.tonkho)) {
        throw new AppError(
          "Not enough stock for some items",
          409,
          "OUT_OF_STOCK",
          {
            bentheid: it.bentheid,
            requested: Number(it.soluong),
            available: Number(it.tonkho),
          }
        );
      }

      tongtien += toNumber(it.giaban) * Number(it.soluong);
    }

    const tongthanhtoan = tongtien + toNumber(phivanchuyen);

    // insert order
    const orderIns = await client.query(
      `
      INSERT INTO public.donhang (phuongthucid, userid, diachiuserid, tongtien, phivanchuyen, tongthanhtoan, ghichu)
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      RETURNING *
      `,
      [
        phuongthucid,
        userid,
        diachiuserid,
        tongtien,
        phivanchuyen,
        tongthanhtoan,
        ghichu,
      ]
    );

    const order = orderIns.rows[0];
    const donhangid = order.donhangid;

    // insert items + decrement stock atomically
    const insertedItems = [];
    for (const it of items) {
      // decrement stock with guard
      const dec = await client.query(
        `
        UPDATE public.bienthe_sanpham
        SET tonkho = tonkho - $2
        WHERE bentheid = $1 AND tonkho >= $2
        `,
        [it.bentheid, it.soluong]
      );

      if (dec.rowCount !== 1) {
        throw new AppError(
          "Not enough stock (race condition)",
          409,
          "OUT_OF_STOCK",
          { bentheid: it.bentheid, requested: Number(it.soluong) }
        );
      }

      const oi = await client.query(
        `
        INSERT INTO public.ordor_gom (donhangid, bentheid, soluong, dongia)
        VALUES ($1,$2,$3,$4)
        RETURNING donhangid, bentheid, soluong, dongia
        `,
        [donhangid, it.bentheid, it.soluong, it.giaban]
      );

      insertedItems.push({
        bentheid: oi.rows[0].bentheid,
        soluong: Number(oi.rows[0].soluong),
        dongia: toNumber(oi.rows[0].dongia),
      });
    }

    // update cart
    if (!Array.isArray(selectedItems)) {
      // old behavior: clear whole cart
      await client.query(
        `DELETE FROM public.giohang_chua_bienthesanpham WHERE magiohang=$1`,
        [magiohang]
      );
    } else {
      // new behavior: remove only selected items (or decrement their quantities)
      for (const it of items) {
        const remaining = Number(it._inCartQty) - Number(it.soluong);
        if (remaining <= 0) {
          await client.query(
            `DELETE FROM public.giohang_chua_bienthesanpham WHERE magiohang=$1 AND bentheid=$2`,
            [magiohang, it.bentheid]
          );
        } else {
          await client.query(
            `UPDATE public.giohang_chua_bienthesanpham SET soluong=$3 WHERE magiohang=$1 AND bentheid=$2`,
            [magiohang, it.bentheid, remaining]
          );
        }
      }
    }

    await client.query("COMMIT");

    return {
      ...order,
      tongtien: toNumber(order.tongtien),
      phivanchuyen: toNumber(order.phivanchuyen),
      tongthanhtoan: toNumber(order.tongthanhtoan),
      items: insertedItems,
    };
  } catch (err) {
    await safeRollback(client);
    throw err;
  } finally {
    client.release();
  }
}

export async function listMyOrders(userid, { limit, offset, status }) {
  const { rows } = await pool.query(
    `
    SELECT donhangid, tongtien, phivanchuyen, tongthanhtoan, trangthai, created_at
    FROM public.donhang
    WHERE userid = $1
      AND ($2::text IS NULL OR trangthai = $2::text)
    ORDER BY donhangid DESC
    LIMIT $3 OFFSET $4
    `,
    [userid, status, limit, offset]
  );

  return rows.map((r) => ({
    ...r,
    tongtien: toNumber(r.tongtien),
    phivanchuyen: toNumber(r.phivanchuyen),
    tongthanhtoan: toNumber(r.tongthanhtoan),
  }));
}

export async function adminListOrders({ limit, offset, status }) {
  const { rows } = await pool.query(
    `
    SELECT donhangid, userid, tongtien, phivanchuyen, tongthanhtoan, trangthai, created_at
    FROM public.donhang
    WHERE ($1::text IS NULL OR trangthai = $1::text)
    ORDER BY donhangid DESC
    LIMIT $2 OFFSET $3
    `,
    [status, limit, offset]
  );

  return rows.map((r) => ({
    ...r,
    tongtien: toNumber(r.tongtien),
    phivanchuyen: toNumber(r.phivanchuyen),
    tongthanhtoan: toNumber(r.tongthanhtoan),
  }));
}

export async function getOrderDetail(userid, donhangid, isAdmin) {
  const base = await pool.query(
    `
    SELECT *
    FROM public.donhang
    WHERE donhangid = $1
    LIMIT 1
    `,
    [donhangid]
  );

  if (base.rows.length === 0) {
    throw new AppError("Order not found", 404, "NOT_FOUND", { donhangid });
  }

  const order = base.rows[0];

  if (!isAdmin && String(order.userid) !== String(userid)) {
    throw new AppError("Forbidden", 403, "FORBIDDEN");
  }

  const items = await pool.query(
    `
    SELECT og.bentheid, og.soluong, og.dongia,
           bt.sku, bt.sanphamid,
           sp.ten AS sanpham_ten
    FROM public.ordor_gom og
    JOIN public.bienthe_sanpham bt ON bt.bentheid = og.bentheid
    JOIN public.sanpham sp ON sp.sanphamid = bt.sanphamid
    WHERE og.donhangid = $1
    ORDER BY og.bentheid DESC
    `,
    [donhangid]
  );

  return {
    ...order,
    tongtien: toNumber(order.tongtien),
    phivanchuyen: toNumber(order.phivanchuyen),
    tongthanhtoan: toNumber(order.tongthanhtoan),
    items: items.rows.map((r) => ({
      bentheid: r.bentheid,
      soluong: Number(r.soluong),
      dongia: toNumber(r.dongia),
      sku: r.sku,
      sanpham: { sanphamid: r.sanphamid, ten: r.sanpham_ten },
    })),
  };
}

export async function cancelMyOrder(userid, donhangid) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const ord = await client.query(
      `SELECT donhangid, userid, trangthai FROM public.donhang WHERE donhangid=$1 LIMIT 1`,
      [donhangid]
    );

    if (ord.rows.length === 0) {
      throw new AppError("Order not found", 404, "NOT_FOUND", { donhangid });
    }

    if (String(ord.rows[0].userid) !== String(userid)) {
      throw new AppError("Forbidden", 403, "FORBIDDEN");
    }

    if (ord.rows[0].trangthai !== "PENDING") {
      throw new AppError(
        "Only PENDING order can be cancelled",
        409,
        "INVALID_STATE",
        { current: ord.rows[0].trangthai }
      );
    }

    // restock
    const items = await client.query(
      `SELECT bentheid, soluong FROM public.ordor_gom WHERE donhangid=$1`,
      [donhangid]
    );

    for (const it of items.rows) {
      await client.query(
        `UPDATE public.bienthe_sanpham SET tonkho = tonkho + $2 WHERE bentheid = $1`,
        [it.bentheid, it.soluong]
      );
    }

    const upd = await client.query(
      `UPDATE public.donhang SET trangthai='CANCELLED' WHERE donhangid=$1 RETURNING donhangid, trangthai`,
      [donhangid]
    );

    await client.query("COMMIT");
    return upd.rows[0];
  } catch (err) {
    await safeRollback(client);
    throw err;
  } finally {
    client.release();
  }
}

export async function adminUpdateOrderStatus(donhangid, trangthai) {
  const { rows } = await pool.query(
    `UPDATE public.donhang SET trangthai=$2 WHERE donhangid=$1 RETURNING donhangid, trangthai`,
    [donhangid, trangthai]
  );

  if (rows.length === 0) {
    throw new AppError("Order not found", 404, "NOT_FOUND", { donhangid });
  }

  return rows[0];
}
