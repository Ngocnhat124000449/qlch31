function toInt(v) {
  const n = Number(v);
  return Number.isFinite(n) && Number.isInteger(n) ? n : null;
}
function isNonEmptyString(v) {
  return typeof v === "string" && v.trim().length > 0;
}
function isBool(v) {
  return typeof v === "boolean";
}

const ALLOWED_TYPES = ["STRING", "TEXT", "INTEGER", "NUMBER", "BOOLEAN"];

export function parseIdParam(x) {
  return toInt(x);
}

export function validateCreateAttribute(body) {
  const errors = [];
  const tenthuoctinh = body?.tenthuoctinh;
  const donvitinh = body?.donvitinh;
  const kieudulieu = body?.kieudulieu;
  const mota = body?.mota;

  if (!isNonEmptyString(tenthuoctinh)) errors.push("tenthuoctinh is required");
  if (
    donvitinh !== undefined &&
    donvitinh !== null &&
    typeof donvitinh !== "string"
  )
    errors.push("donvitinh must be string or null");
  if (!isNonEmptyString(kieudulieu)) errors.push("kieudulieu is required");
  // Không ép enum ở DB, nhưng backend nên thống nhất:
  if (
    isNonEmptyString(kieudulieu) &&
    !ALLOWED_TYPES.includes(kieudulieu.trim().toUpperCase())
  )
    errors.push(`kieudulieu must be one of ${ALLOWED_TYPES.join(", ")}`);
  if (mota !== undefined && mota !== null && typeof mota !== "string")
    errors.push("mota must be string or null");

  return {
    ok: errors.length === 0,
    errors,
    value: {
      tenthuoctinh: tenthuoctinh?.trim(),
      donvitinh:
        donvitinh === undefined
          ? null
          : donvitinh === null
          ? null
          : donvitinh.trim(),
      kieudulieu: kieudulieu?.trim().toUpperCase(),
      mota: mota === undefined ? null : mota === null ? null : mota.trim(),
    },
  };
}

export function validateUpdateAttribute(body) {
  const errors = [];
  const hasAny = ["tenthuoctinh", "donvitinh", "kieudulieu", "mota"].some(
    (k) => body?.[k] !== undefined
  );
  if (!hasAny) errors.push("At least one field is required");

  if (body?.tenthuoctinh !== undefined && !isNonEmptyString(body.tenthuoctinh))
    errors.push("tenthuoctinh must be non-empty");
  if (
    body?.donvitinh !== undefined &&
    body.donvitinh !== null &&
    typeof body.donvitinh !== "string"
  )
    errors.push("donvitinh must be string or null");
  if (body?.kieudulieu !== undefined) {
    if (!isNonEmptyString(body.kieudulieu))
      errors.push("kieudulieu must be non-empty");
    else if (!ALLOWED_TYPES.includes(body.kieudulieu.trim().toUpperCase()))
      errors.push(`kieudulieu must be one of ${ALLOWED_TYPES.join(", ")}`);
  }
  if (
    body?.mota !== undefined &&
    body.mota !== null &&
    typeof body.mota !== "string"
  )
    errors.push("mota must be string or null");

  return {
    ok: errors.length === 0,
    errors,
    value: {
      tenthuoctinh:
        body?.tenthuoctinh === undefined ? undefined : body.tenthuoctinh.trim(),
      donvitinh:
        body?.donvitinh === undefined
          ? undefined
          : body.donvitinh === null
          ? null
          : body.donvitinh.trim(),
      kieudulieu:
        body?.kieudulieu === undefined
          ? undefined
          : body.kieudulieu.trim().toUpperCase(),
      mota:
        body?.mota === undefined
          ? undefined
          : body.mota === null
          ? null
          : body.mota.trim(),
    },
  };
}

export function validateAttachCategoryAttribute(body) {
  const errors = [];
  const thuoctinhid = toInt(body?.thuoctinhid);
  const batbuoc = body?.batbuoc;
  const thutuhienthi = body?.thutuhienthi;

  if (!thuoctinhid) errors.push("thuoctinhid must be integer");
  if (batbuoc !== undefined && !isBool(batbuoc))
    errors.push("batbuoc must be boolean");
  if (thutuhienthi !== undefined) {
    const n = toInt(thutuhienthi);
    if (n === null || n < 0) errors.push("thutuhienthi must be integer >= 0");
  }

  return {
    ok: errors.length === 0,
    errors,
    value: {
      thuoctinhid,
      batbuoc: batbuoc ?? false,
      thutuhienthi: thutuhienthi === undefined ? 0 : Number(thutuhienthi),
    },
  };
}

export function validateUpdateCategoryAttribute(body) {
  const errors = [];
  const hasAny = ["batbuoc", "thutuhienthi"].some(
    (k) => body?.[k] !== undefined
  );
  if (!hasAny) errors.push("At least one field is required");

  if (body?.batbuoc !== undefined && !isBool(body.batbuoc))
    errors.push("batbuoc must be boolean");
  let thutuhienthi = undefined;
  if (body?.thutuhienthi !== undefined) {
    const n = toInt(body.thutuhienthi);
    if (n === null || n < 0) errors.push("thutuhienthi must be integer >= 0");
    thutuhienthi = n;
  }

  return {
    ok: errors.length === 0,
    errors,
    value: { batbuoc: body?.batbuoc, thutuhienthi },
  };
}

// values: [{ thuoctinhid, giatri }]
export function validateUpsertVariantAttributes(body) {
  const errors = [];
  const values = body?.values;

  if (!Array.isArray(values) || values.length === 0)
    errors.push("values must be non-empty array");

  const cleaned = [];
  if (Array.isArray(values)) {
    for (let i = 0; i < values.length; i++) {
      const it = values[i];
      const thuoctinhid = toInt(it?.thuoctinhid);
      if (!thuoctinhid) errors.push(`values[${i}].thuoctinhid must be integer`);

      // giatri có thể là string/number/bool, convert to string ở service
      if (it?.giatri === undefined || it?.giatri === null)
        errors.push(`values[${i}].giatri is required`);

      cleaned.push({ thuoctinhid, giatri: it?.giatri });
    }
  }

  return { ok: errors.length === 0, errors, value: { values: cleaned } };
}
