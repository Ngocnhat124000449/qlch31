function toInt(v) {
  const n = Number(v);
  return Number.isFinite(n) && Number.isInteger(n) ? n : null;
}
function toNum(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

const ALLOWED_STATUS = ["PENDING", "PAID", "SHIPPED", "COMPLETED", "CANCELLED"];

export function parseDonhangidParam(param) {
  return toInt(param);
}

export function validateCreateOrder(body) {
  const errors = [];

  const phuongthucid = toInt(body?.phuongthucid);
  const diachiuserid = toInt(body?.diachiuserid);
  const phivanchuyen = toNum(body?.phivanchuyen);
  const ghichu = body?.ghichu;

  // Optional: checkout selected items only.
  // items: [{ bentheid: int, soluong: int }]
  // If omitted, the server will checkout the whole cart (backward compatible).
  const rawItems = body?.items;
  let items = null;
  if (rawItems !== undefined) {
    if (!Array.isArray(rawItems) || rawItems.length === 0) {
      errors.push("items must be a non-empty array");
    } else {
      const map = new Map();
      for (const it of rawItems) {
        const bentheid = toInt(it?.bentheid);
        const soluong = toInt(it?.soluong);
        if (!bentheid) {
          errors.push("items[].bentheid must be integer");
          continue;
        }
        if (!soluong || soluong <= 0) {
          errors.push("items[].soluong must be integer > 0");
          continue;
        }

        map.set(bentheid, (map.get(bentheid) || 0) + soluong);
      }
      items = Array.from(map.entries()).map(([bentheid, soluong]) => ({
        bentheid,
        soluong,
      }));

      if (items.length === 0) {
        errors.push("items must contain at least 1 valid element");
      }
    }
  }

  if (!phuongthucid) errors.push("phuongthucid must be integer");
  if (!diachiuserid) errors.push("diachiuserid must be integer");
  if (phivanchuyen === null || phivanchuyen < 0)
    errors.push("phivanchuyen must be number >= 0");
  if (ghichu !== undefined && ghichu !== null && typeof ghichu !== "string")
    errors.push("ghichu must be string");

  return {
    ok: errors.length === 0,
    errors,
    value: {
      phuongthucid,
      diachiuserid,
      phivanchuyen,
      ghichu: ghichu?.trim() || null,
      items,
    },
  };
}

export function validateAdminUpdateStatus(body) {
  const errors = [];
  const trangthai = body?.trangthai;

  if (typeof trangthai !== "string" || !ALLOWED_STATUS.includes(trangthai)) {
    errors.push(`trangthai must be one of ${ALLOWED_STATUS.join(", ")}`);
  }

  return { ok: errors.length === 0, errors, value: { trangthai } };
}

export function parseListQuery(q) {
  const limit = Math.min(Number(q.limit || 10), 50);
  const page = Math.max(Number(q.page || 1), 1);
  const offset = (page - 1) * limit;

  const status = q.status ? String(q.status).toUpperCase() : null;
  const statusFilter =
    status && ALLOWED_STATUS.includes(status) ? status : null;

  return { page, limit, offset, status: statusFilter };
}
