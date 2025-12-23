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

export function parseBentheidParam(x) {
  return toInt(x);
}
export function parseDanhgiaidParam(x) {
  return toInt(x);
}

export function parseListQuery(q) {
  const limit = Math.min(Number(q.limit || 20), 100);
  const offset = Math.max(Number(q.offset || 0), 0);
  return { limit, offset };
}

export function validateCreateReview(body) {
  const errors = [];
  const bentheid = toInt(body?.bentheid);
  const sosao = toInt(body?.sosao);
  const tieude = body?.tieude;
  const noidung = body?.noidung;

  if (!bentheid) errors.push("bentheid must be integer");
  if (!sosao || sosao < 1 || sosao > 5)
    errors.push("sosao must be integer 1..5");
  if (tieude !== undefined && tieude !== null && typeof tieude !== "string")
    errors.push("tieude must be string");
  if (noidung !== undefined && noidung !== null && typeof noidung !== "string")
    errors.push("noidung must be string");

  return {
    ok: errors.length === 0,
    errors,
    value: {
      bentheid,
      sosao,
      tieude: isNonEmptyString(tieude) ? tieude.trim() : null,
      noidung: isNonEmptyString(noidung) ? noidung.trim() : null,
    },
  };
}

export function validateUpdateReview(body) {
  const errors = [];
  const hasAny = ["sosao", "tieude", "noidung", "trangthai"].some(
    (k) => body?.[k] !== undefined
  );
  if (!hasAny) errors.push("At least one field is required");

  let sosao = undefined;
  if (body?.sosao !== undefined) {
    sosao = toInt(body.sosao);
    if (!sosao || sosao < 1 || sosao > 5)
      errors.push("sosao must be integer 1..5");
  }

  if (
    body?.tieude !== undefined &&
    body.tieude !== null &&
    typeof body.tieude !== "string"
  )
    errors.push("tieude must be string or null");
  if (
    body?.noidung !== undefined &&
    body.noidung !== null &&
    typeof body.noidung !== "string"
  )
    errors.push("noidung must be string or null");

  return {
    ok: errors.length === 0,
    errors,
    value: {
      sosao,
      tieude:
        body?.tieude === undefined
          ? undefined
          : body.tieude === null
          ? null
          : body.tieude.trim(),
      noidung:
        body?.noidung === undefined
          ? undefined
          : body.noidung === null
          ? null
          : body.noidung.trim(),
    },
  };
}

export function validateAdminSetStatus(body) {
  const errors = [];
  const trangthai = body?.trangthai;
  if (!isBool(trangthai)) errors.push("trangthai must be boolean");
  return { ok: errors.length === 0, errors, value: { trangthai } };
}

export function parseAdminFilter(q) {
  const { limit, offset } = parseListQuery(q);
  const bentheid = q.bentheid ? toInt(q.bentheid) : null;
  const userid = q.userid ? toInt(q.userid) : null;
  const active = q.active ? String(q.active).toLowerCase() : "all"; // true|false|all
  const activeFilter =
    active === "true" ? true : active === "false" ? false : null;
  return { limit, offset, bentheid, userid, active: activeFilter };
}
