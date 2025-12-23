import { pool } from "../../db/db.js";
import { AppError } from "../../utils/appError.js";

async function safeRollback(client) {
  try {
    await client.query("ROLLBACK");
  } catch {}
}

function mapPgToAppError(err) {
  if (!err?.code) return null;

  // FK restrict: xoá address đã được dùng trong donhang => 23503
  if (err.code === "23503") {
    return new AppError(
      "Cannot delete address that is used by orders",
      409,
      "FK_VIOLATION",
      { constraint: err.constraint }
    );
  }

  // unique default per user (ux_address_default_per_user) hoặc thứ khác
  if (err.code === "23505") {
    return new AppError("Duplicate value", 409, "DUPLICATE", {
      constraint: err.constraint,
    });
  }

  if (err.code === "23514") {
    return new AppError("Invalid value", 400, "CHECK_VIOLATION", {
      constraint: err.constraint,
    });
  }

  return null;
}

export async function listMyAddresses(userid) {
  const { rows } = await pool.query(
    `
    SELECT diachiuserid, userid, tennguoinhan, sdtnguoinhan, tinhthanh, quanhuyen, phuongxa,
           diachichitiet, loaidiachi, macdinh, created_at
    FROM public.user_address
    WHERE userid = $1
    ORDER BY macdinh DESC, diachiuserid DESC
    `,
    [userid]
  );
  return rows;
}

export async function getMyAddress(userid, diachiuserid) {
  const { rows } = await pool.query(
    `
    SELECT diachiuserid, userid, tennguoinhan, sdtnguoinhan, tinhthanh, quanhuyen, phuongxa,
           diachichitiet, loaidiachi, macdinh, created_at
    FROM public.user_address
    WHERE userid = $1 AND diachiuserid = $2
    LIMIT 1
    `,
    [userid, diachiuserid]
  );
  return rows[0] || null;
}

export async function createMyAddress(userid, data) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Nếu set macdinh=true => hạ default cũ trước (tránh unique index fail)
    if (data.macdinh === true) {
      await client.query(
        `UPDATE public.user_address SET macdinh = FALSE WHERE userid = $1`,
        [userid]
      );
    }

    const { rows } = await client.query(
      `
      INSERT INTO public.user_address
        (userid, tennguoinhan, sdtnguoinhan, tinhthanh, quanhuyen, phuongxa, diachichitiet, loaidiachi, macdinh)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING diachiuserid, userid, tennguoinhan, sdtnguoinhan, tinhthanh, quanhuyen, phuongxa,
                diachichitiet, loaidiachi, macdinh, created_at
      `,
      [
        userid,
        data.tennguoinhan,
        data.sdtnguoinhan,
        data.tinhthanh,
        data.quanhuyen,
        data.phuongxa,
        data.diachichitiet,
        data.loaidiachi,
        data.macdinh,
      ]
    );

    await client.query("COMMIT");
    return rows[0];
  } catch (err) {
    await safeRollback(client);
    const mapped = mapPgToAppError(err);
    if (mapped) throw mapped;
    throw err;
  } finally {
    client.release();
  }
}

export async function updateMyAddress(userid, diachiuserid, patch) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const cur = await client.query(
      `
      SELECT *
      FROM public.user_address
      WHERE userid=$1 AND diachiuserid=$2
      LIMIT 1
      `,
      [userid, diachiuserid]
    );

    if (cur.rows.length === 0) {
      throw new AppError("Address not found", 404, "NOT_FOUND", {
        diachiuserid,
      });
    }

    // Nếu patch.macdinh=true => hạ default cũ trước
    if (patch.macdinh === true) {
      await client.query(
        `UPDATE public.user_address SET macdinh = FALSE WHERE userid = $1`,
        [userid]
      );
    }

    const now = cur.rows[0];
    const next = {
      tennguoinhan: patch.tennguoinhan ?? now.tennguoinhan,
      sdtnguoinhan: patch.sdtnguoinhan ?? now.sdtnguoinhan,
      tinhthanh: patch.tinhthanh ?? now.tinhthanh,
      quanhuyen: patch.quanhuyen ?? now.quanhuyen,
      phuongxa: patch.phuongxa ?? now.phuongxa,
      diachichitiet: patch.diachichitiet ?? now.diachichitiet,
      loaidiachi: patch.loaidiachi ?? now.loaidiachi,
      macdinh: patch.macdinh === undefined ? now.macdinh : patch.macdinh,
    };

    const { rows } = await client.query(
      `
      UPDATE public.user_address
      SET tennguoinhan=$1, sdtnguoinhan=$2, tinhthanh=$3, quanhuyen=$4, phuongxa=$5,
          diachichitiet=$6, loaidiachi=$7, macdinh=$8
      WHERE userid=$9 AND diachiuserid=$10
      RETURNING diachiuserid, userid, tennguoinhan, sdtnguoinhan, tinhthanh, quanhuyen, phuongxa,
                diachichitiet, loaidiachi, macdinh, created_at
      `,
      [
        next.tennguoinhan,
        next.sdtnguoinhan,
        next.tinhthanh,
        next.quanhuyen,
        next.phuongxa,
        next.diachichitiet,
        next.loaidiachi,
        next.macdinh,
        userid,
        diachiuserid,
      ]
    );

    await client.query("COMMIT");
    return rows[0];
  } catch (err) {
    await safeRollback(client);
    const mapped = mapPgToAppError(err);
    if (mapped) throw mapped;
    throw err;
  } finally {
    client.release();
  }
}

export async function deleteMyAddress(userid, diachiuserid) {
  try {
    const { rowCount } = await pool.query(
      `DELETE FROM public.user_address WHERE userid=$1 AND diachiuserid=$2`,
      [userid, diachiuserid]
    );

    if (rowCount === 0) {
      throw new AppError("Address not found", 404, "NOT_FOUND", {
        diachiuserid,
      });
    }

    return true;
  } catch (err) {
    const mapped = mapPgToAppError(err);
    if (mapped) throw mapped;
    throw err;
  }
}
