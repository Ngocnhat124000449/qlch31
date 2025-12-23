// src/modules/coupon/coupon.service.js
import { pool } from "../../db/db.js";
import { AppError } from "../../utils/appError.js";

function num(x) {
  const n = Number(x);
  return Number.isFinite(n) ? n : 0;
}

async function safeRollback(client) {
  try {
    await client.query("ROLLBACK");
  } catch {
    // ignore
  }
}

export async function listActiveCouponsPublic() {
  const { rows } = await pool.query(
    `
    SELECT magiamgiaid, code, tenma, loaigiamgia, giatrigiamcodinh, tylegiam,
           thoigianbatdau, thoigianketthuc, giatridonhangtoithieu, giamtoida, trangthai
    FROM public.magiamgia
    WHERE trangthai = TRUE
      AND NOW() BETWEEN thoigianbatdau AND thoigianketthuc
      AND soluongdadung < soluongtoida
    ORDER BY magiamgiaid DESC
    `
  );

  // public: không trả soluongtoida/soluongdadung/gioihanmoiuser
  return rows.map((r) => ({
    magiamgiaid: r.magiamgiaid,
    code: r.code,
    tenma: r.tenma,
    loaigiamgia: r.loaigiamgia,
    giatrigiamcodinh: r.giatrigiamcodinh,
    tylegiam: r.tylegiam,
    thoigianbatdau: r.thoigianbatdau,
    thoigianketthuc: r.thoigianketthuc,
    giatridonhangtoithieu: r.giatridonhangtoithieu,
    giamtoida: r.giamtoida,
  }));
}

export async function adminListAllCoupons() {
  const { rows } = await pool.query(
    `
    SELECT *
    FROM public.magiamgia
    ORDER BY magiamgiaid DESC
    `
  );
  return rows;
}

export async function adminCreateCoupon(data) {
  const { rows } = await pool.query(
    `
    INSERT INTO public.magiamgia
      (code, tenma, loaigiamgia, giatrigiamcodinh, tylegiam,
       thoigianbatdau, thoigianketthuc,
       soluongtoida, soluongdadung, gioihanmoiuser, giatridonhangtoithieu, giamtoida, trangthai)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,0,$9,$10,$11,$12)
    RETURNING *
    `,
    [
      data.code,
      data.tenma,
      data.loaigiamgia,
      data.giatrigiamcodinh,
      data.tylegiam,
      data.thoigianbatdau,
      data.thoigianketthuc,
      data.soluongtoida,
      data.gioihanmoiuser,
      data.giatridonhangtoithieu,
      data.giamtoida,
      data.trangthai,
    ]
  );
  return rows[0];
}

export async function adminUpdateCoupon(magiamgiaid, patch) {
  const { rows: curRows } = await pool.query(
    `SELECT * FROM public.magiamgia WHERE magiamgiaid=$1 LIMIT 1`,
    [magiamgiaid]
  );

  if (curRows.length === 0) {
    throw new AppError("Coupon not found", 404, "NOT_FOUND", { magiamgiaid });
  }

  const cur = curRows[0];

  const next = {
    code: patch.code ?? cur.code,
    tenma: patch.tenma === undefined ? cur.tenma : patch.tenma,
    loaigiamgia: patch.loaigiamgia ?? cur.loaigiamgia,
    giatrigiamcodinh:
      patch.giatrigiamcodinh === undefined
        ? cur.giatrigiamcodinh
        : patch.giatrigiamcodinh,
    tylegiam: patch.tylegiam === undefined ? cur.tylegiam : patch.tylegiam,
    thoigianbatdau: patch.thoigianbatdau ?? cur.thoigianbatdau,
    thoigianketthuc: patch.thoigianketthuc ?? cur.thoigianketthuc,
    soluongtoida: patch.soluongtoida ?? cur.soluongtoida,
    gioihanmoiuser: patch.gioihanmoiuser ?? cur.gioihanmoiuser,
    giatridonhangtoithieu:
      patch.giatridonhangtoithieu ?? cur.giatridonhangtoithieu,
    giamtoida: patch.giamtoida === undefined ? cur.giamtoida : patch.giamtoida,
    trangthai: patch.trangthai ?? cur.trangthai,
  };

  const { rows } = await pool.query(
    `
    UPDATE public.magiamgia
    SET code=$1, tenma=$2, loaigiamgia=$3, giatrigiamcodinh=$4, tylegiam=$5,
        thoigianbatdau=$6, thoigianketthuc=$7,
        soluongtoida=$8, gioihanmoiuser=$9, giatridonhangtoithieu=$10, giamtoida=$11, trangthai=$12
    WHERE magiamgiaid=$13
    RETURNING *
    `,
    [
      next.code,
      next.tenma,
      next.loaigiamgia,
      next.giatrigiamcodinh,
      next.tylegiam,
      next.thoigianbatdau,
      next.thoigianketthuc,
      next.soluongtoida,
      next.gioihanmoiuser,
      next.giatridonhangtoithieu,
      next.giamtoida,
      next.trangthai,
      magiamgiaid,
    ]
  );

  return rows[0];
}

export async function adminAttachVariant(magiamgiaid, bentheid) {
  const cp = await pool.query(
    `SELECT magiamgiaid FROM public.magiamgia WHERE magiamgiaid=$1 LIMIT 1`,
    [magiamgiaid]
  );
  if (cp.rows.length === 0) {
    throw new AppError("Coupon not found", 404, "NOT_FOUND", { magiamgiaid });
  }

  const v = await pool.query(
    `SELECT bentheid FROM public.bienthe_sanpham WHERE bentheid=$1 LIMIT 1`,
    [bentheid]
  );
  if (v.rows.length === 0) {
    throw new AppError("Variant not found", 404, "NOT_FOUND", { bentheid });
  }

  await pool.query(
    `
    INSERT INTO public.dung_cho (bentheid, magiamgiaid)
    VALUES ($1,$2)
    ON CONFLICT (bentheid, magiamgiaid) DO NOTHING
    `,
    [bentheid, magiamgiaid]
  );
  return true;
}

export async function adminDetachVariant(magiamgiaid, bentheid) {
  await pool.query(
    `DELETE FROM public.dung_cho WHERE bentheid=$1 AND magiamgiaid=$2`,
    [bentheid, magiamgiaid]
  );
  return true;
}

export async function getOrderTotals(userid, donhangid) {
  const { rows } = await pool.query(
    `
    SELECT donhangid, userid, tongtien, phivanchuyen, tongthanhtoan, trangthai
    FROM public.donhang
    WHERE donhangid=$1 AND userid=$2
    LIMIT 1
    `,
    [donhangid, userid]
  );
  return rows[0] || null;
}

export async function calcOrderDiscountSum(donhangid) {
  const { rows } = await pool.query(
    `
    SELECT COALESCE(SUM(sotiengiamthucte), 0) AS total
    FROM public.nhap_ma
    WHERE donhangid = $1 AND trangthai = 'APPLIED'
    `,
    [donhangid]
  );
  return num(rows[0]?.total);
}

export async function applyCoupon(userid, { code, donhangid, bentheid }) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // lock coupon row để chống race count
    const cp = await client.query(
      `
      SELECT *
      FROM public.magiamgia
      WHERE code = $1
      FOR UPDATE
      `,
      [code]
    );

    if (cp.rows.length === 0) {
      throw new AppError("Coupon not found", 404, "NOT_FOUND", { code });
    }

    const coupon = cp.rows[0];

    if (coupon.trangthai !== true) {
      throw new AppError("Coupon is disabled", 400, "DISABLED", { code });
    }

    const now = Date.now();
    if (
      now < Date.parse(coupon.thoigianbatdau) ||
      now > Date.parse(coupon.thoigianketthuc)
    ) {
      throw new AppError("Coupon is not in active time", 400, "NOT_ACTIVE", {
        code,
      });
    }

    if (num(coupon.soluongdadung) >= num(coupon.soluongtoida)) {
      throw new AppError("Coupon is exhausted", 409, "EXHAUSTED", { code });
    }

    // order owned + pending
    const ord = await client.query(
      `
      SELECT donhangid, userid, tongtien, phivanchuyen, tongthanhtoan, trangthai
      FROM public.donhang
      WHERE donhangid=$1 AND userid=$2
      LIMIT 1
      `,
      [donhangid, userid]
    );

    if (ord.rows.length === 0) {
      throw new AppError("Order not found", 404, "NOT_FOUND", { donhangid });
    }

    const order = ord.rows[0];

    if (order.trangthai !== "PENDING") {
      throw new AppError(
        "Only PENDING order can apply coupon",
        409,
        "INVALID_STATE",
        { current: order.trangthai }
      );
    }

    const minTotal = num(coupon.giatridonhangtoithieu);
    if (num(order.tongtien) < minTotal) {
      throw new AppError(
        "Order total does not meet minimum",
        400,
        "MIN_NOT_MET",
        { min: minTotal, tongtien: num(order.tongtien) }
      );
    }

    // order contains variant
    const line = await client.query(
      `
      SELECT donhangid, bentheid, soluong, dongia
      FROM public.ordor_gom
      WHERE donhangid=$1 AND bentheid=$2
      LIMIT 1
      `,
      [donhangid, bentheid]
    );

    if (line.rows.length === 0) {
      throw new AppError(
        "Order does not contain this variant",
        400,
        "INVALID_ORDER_LINE",
        { donhangid, bentheid }
      );
    }

    // coupon applies to variant
    const okVar = await client.query(
      `
      SELECT 1
      FROM public.dung_cho
      WHERE bentheid=$1 AND magiamgiaid=$2
      LIMIT 1
      `,
      [bentheid, coupon.magiamgiaid]
    );

    if (okVar.rows.length === 0) {
      throw new AppError(
        "Coupon is not applicable to this variant",
        400,
        "NOT_APPLICABLE",
        { code, bentheid }
      );
    }

    // per-user limit (nếu null => coi như không giới hạn)
    if (coupon.gioihanmoiuser !== null && coupon.gioihanmoiuser !== undefined) {
      const usedByUser = await client.query(
        `
        SELECT COUNT(*)::int AS cnt
        FROM public.nhap_ma
        WHERE userid=$1 AND magiamgiaid=$2 AND trangthai='APPLIED'
        `,
        [userid, coupon.magiamgiaid]
      );

      if (usedByUser.rows[0].cnt >= Number(coupon.gioihanmoiuser)) {
        throw new AppError(
          "Reached per-user usage limit",
          409,
          "LIMIT_REACHED",
          { limit: Number(coupon.gioihanmoiuser) }
        );
      }
    }

    // compute discount based on line total
    const lineTotal = num(line.rows[0].dongia) * Number(line.rows[0].soluong);
    let discount = 0;

    if (coupon.loaigiamgia === "FIXED") {
      discount = Math.min(num(coupon.giatrigiamcodinh), lineTotal);
    } else {
      discount = (lineTotal * num(coupon.tylegiam)) / 100;
      if (coupon.giamtoida !== null && coupon.giamtoida !== undefined) {
        discount = Math.min(discount, num(coupon.giamtoida));
      }
      discount = Math.min(discount, lineTotal);
    }
    if (discount < 0) discount = 0;

    // insert nhap_ma trước (nếu duplicate thì fail luôn, không đụng quota)
    const ins = await client.query(
      `
      INSERT INTO public.nhap_ma (userid, magiamgiaid, bentheid, donhangid, sotiengiamthucte, trangthai)
      VALUES ($1,$2,$3,$4,$5,'APPLIED')
      RETURNING nhapmaid, donhangid, bentheid, sotiengiamthucte, trangthai
      `,
      [userid, coupon.magiamgiaid, bentheid, donhangid, discount]
    );

    // tăng usage với guard (nếu hết quota -> rollback sẽ huỷ luôn insert phía trên)
    const upd = await client.query(
      `
      UPDATE public.magiamgia
      SET soluongdadung = soluongdadung + 1
      WHERE magiamgiaid=$1 AND soluongdadung < soluongtoida
      `,
      [coupon.magiamgiaid]
    );

    if (upd.rowCount !== 1) {
      throw new AppError("Coupon is exhausted", 409, "EXHAUSTED", { code });
    }

    await client.query("COMMIT");
    return { applied: ins.rows[0], coupon };
  } catch (err) {
    await safeRollback(client);
    throw err;
  } finally {
    client.release();
  }
}

export async function cancelApplied(userid, nhapmaid) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const row = await client.query(
      `
      SELECT nm.*, mg.code
      FROM public.nhap_ma nm
      JOIN public.magiamgia mg ON mg.magiamgiaid = nm.magiamgiaid
      WHERE nm.nhapmaid=$1 AND nm.userid=$2
      FOR UPDATE
      `,
      [nhapmaid, userid]
    );

    if (row.rows.length === 0) {
      throw new AppError("Applied coupon not found", 404, "NOT_FOUND", {
        nhapmaid,
      });
    }

    const nm = row.rows[0];

    if (nm.trangthai !== "APPLIED") {
      throw new AppError(
        "Only APPLIED can be cancelled",
        409,
        "INVALID_STATE",
        { current: nm.trangthai }
      );
    }

    // only allow cancel on PENDING order
    const ord = await client.query(
      `SELECT trangthai FROM public.donhang WHERE donhangid=$1 AND userid=$2 LIMIT 1`,
      [nm.donhangid, userid]
    );

    if (ord.rows.length === 0) {
      throw new AppError("Order not found", 404, "NOT_FOUND", {
        donhangid: nm.donhangid,
      });
    }

    if (ord.rows[0].trangthai !== "PENDING") {
      throw new AppError(
        "Only PENDING order can cancel coupon",
        409,
        "INVALID_STATE",
        { current: ord.rows[0].trangthai }
      );
    }

    const cancelled = await client.query(
      `
      UPDATE public.nhap_ma
      SET trangthai='CANCELLED'
      WHERE nhapmaid=$1 AND trangthai='APPLIED'
      `,
      [nhapmaid]
    );

    if (cancelled.rowCount !== 1) {
      throw new AppError(
        "Only APPLIED can be cancelled",
        409,
        "INVALID_STATE",
        { current: nm.trangthai }
      );
    }

    await client.query(
      `
      UPDATE public.magiamgia
      SET soluongdadung = GREATEST(soluongdadung - 1, 0)
      WHERE magiamgiaid = $1
      `,
      [nm.magiamgiaid]
    );

    await client.query("COMMIT");
    return {
      nhapmaid: nm.nhapmaid,
      donhangid: nm.donhangid,
      bentheid: nm.bentheid,
      code: nm.code,
      trangthai: "CANCELLED",
    };
  } catch (err) {
    await safeRollback(client);
    throw err;
  } finally {
    client.release();
  }
}

export async function myHistory(userid, { limit, offset }) {
  const { rows } = await pool.query(
    `
    SELECT nm.nhapmaid, mg.code, nm.donhangid, nm.bentheid, nm.sotiengiamthucte, nm.trangthai, nm.thoidiem
    FROM public.nhap_ma nm
    JOIN public.magiamgia mg ON mg.magiamgiaid = nm.magiamgiaid
    WHERE nm.userid = $1
    ORDER BY nm.nhapmaid DESC
    LIMIT $2 OFFSET $3
    `,
    [userid, limit, offset]
  );

  return rows;
}
