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

export function parseBaidangidParam(x) {
  return toInt(x);
}

export function parsePublicListQuery(q) {
  const limit = Math.min(Number(q.limit || 10), 50);
  const page = Math.max(Number(q.page || 1), 1);
  const offset = (page - 1) * limit;
  const type = q.type ? String(q.type).trim() : null;
  const search = q.q ? String(q.q).trim() : null;
  return { page, limit, offset, type, search };
}

export function validateCreatePost(body) {
  const errors = [];
  const tieude = body?.tieude;
  const tomtat = body?.tomtat;
  const noidung = body?.noidung;
  const hinhanhurl = body?.hinhanhurl;
  const loaibaidang = body?.loaibaidang;
  const trangthai = body?.trangthai;

  if (!isNonEmptyString(tieude)) errors.push("tieude is required");
  if (!isNonEmptyString(tomtat)) errors.push("tomtat is required");
  if (!isNonEmptyString(noidung)) errors.push("noidung is required");
  if (!isNonEmptyString(loaibaidang)) errors.push("loaibaidang is required");
  if (
    hinhanhurl !== undefined &&
    hinhanhurl !== null &&
    typeof hinhanhurl !== "string"
  )
    errors.push("hinhanhurl must be string or null");
  if (trangthai !== undefined && !isBool(trangthai))
    errors.push("trangthai must be boolean");

  return {
    ok: errors.length === 0,
    errors,
    value: {
      tieude: tieude?.trim(),
      tomtat: tomtat?.trim(),
      noidung: noidung?.trim(),
      hinhanhurl:
        hinhanhurl === undefined
          ? null
          : hinhanhurl === null
          ? null
          : hinhanhurl.trim(),
      loaibaidang: loaibaidang?.trim(),
      trangthai: trangthai ?? true,
    },
  };
}

export function validateUpdatePost(body) {
  const errors = [];
  const hasAny = [
    "tieude",
    "tomtat",
    "noidung",
    "hinhanhurl",
    "loaibaidang",
    "trangthai",
  ].some((k) => body?.[k] !== undefined);
  if (!hasAny) errors.push("At least one field is required");

  if (body?.tieude !== undefined && !isNonEmptyString(body.tieude))
    errors.push("tieude must be non-empty");
  if (body?.tomtat !== undefined && !isNonEmptyString(body.tomtat))
    errors.push("tomtat must be non-empty");
  if (body?.noidung !== undefined && !isNonEmptyString(body.noidung))
    errors.push("noidung must be non-empty");
  if (body?.loaibaidang !== undefined && !isNonEmptyString(body.loaibaidang))
    errors.push("loaibaidang must be non-empty");
  if (
    body?.hinhanhurl !== undefined &&
    body.hinhanhurl !== null &&
    typeof body.hinhanhurl !== "string"
  )
    errors.push("hinhanhurl must be string or null");
  if (body?.trangthai !== undefined && !isBool(body.trangthai))
    errors.push("trangthai must be boolean");

  return {
    ok: errors.length === 0,
    errors,
    value: {
      tieude: body?.tieude === undefined ? undefined : body.tieude.trim(),
      tomtat: body?.tomtat === undefined ? undefined : body.tomtat.trim(),
      noidung: body?.noidung === undefined ? undefined : body.noidung.trim(),
      hinhanhurl:
        body?.hinhanhurl === undefined
          ? undefined
          : body.hinhanhurl === null
          ? null
          : body.hinhanhurl.trim(),
      loaibaidang:
        body?.loaibaidang === undefined ? undefined : body.loaibaidang.trim(),
      trangthai: body?.trangthai,
    },
  };
}

export function validateSetStatus(body) {
  const errors = [];
  if (!isBool(body?.trangthai)) errors.push("trangthai must be boolean");
  return {
    ok: errors.length === 0,
    errors,
    value: { trangthai: body.trangthai },
  };
}

export function parseAdminListQuery(q) {
  const limit = Math.min(Number(q.limit || 50), 200);
  const offset = Math.max(Number(q.offset || 0), 0);
  const active = q.active ? String(q.active).toLowerCase() : "all";
  const activeFilter =
    active === "true" ? true : active === "false" ? false : null;
  return { limit, offset, active: activeFilter };
}
