function isNonEmptyString(v) {
  return typeof v === "string" && v.trim().length > 0;
}
function isBool(v) {
  return typeof v === "boolean";
}
function toInt(v) {
  const n = Number(v);
  return Number.isFinite(n) && Number.isInteger(n) ? n : null;
}
function toNum(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}
function isIsoDate(v) {
  return typeof v === "string" && !Number.isNaN(Date.parse(v));
}

const MODE = ["FIXED", "PERCENT"];

export function parseMagiamgiaidParam(x) {
  return toInt(x);
}
export function parseBentheidParam(x) {
  return toInt(x);
}

export function validateApply(body) {
  const errors = [];
  const code = body?.code;
  const donhangid = toInt(body?.donhangid);
  const bentheid = toInt(body?.bentheid);

  if (!isNonEmptyString(code)) errors.push("code is required");
  if (!donhangid) errors.push("donhangid must be integer");
  if (!bentheid) errors.push("bentheid must be integer");

  return {
    ok: errors.length === 0,
    errors,
    value: { code: code?.trim().toUpperCase(), donhangid, bentheid },
  };
}

export function validateCancel(body) {
  const errors = [];
  const nhapmaid = toInt(body?.nhapmaid);
  if (!nhapmaid) errors.push("nhapmaid must be integer");
  return { ok: errors.length === 0, errors, value: { nhapmaid } };
}

export function validateAdminCreate(body) {
  const errors = [];

  const code = body?.code;
  const tenma = body?.tenma;
  const loaigiamgia = body?.loaigiamgia;

  const giatrigiamcodinh =
    body?.giatrigiamcodinh === null ? null : toNum(body?.giatrigiamcodinh);
  const tylegiam = body?.tylegiam === null ? null : toNum(body?.tylegiam);

  const thoigianbatdau = body?.thoigianbatdau;
  const thoigianketthuc = body?.thoigianketthuc;

  const soluongtoida = toInt(body?.soluongtoida);
  const gioihanmoiuser = toInt(body?.gioihanmoiuser);
  const giatridonhangtoithieu = toNum(body?.giatridonhangtoithieu);
  const giamtoida = body?.giamtoida === null ? null : toNum(body?.giamtoida);

  const trangthai = body?.trangthai;

  if (!isNonEmptyString(code)) errors.push("code is required");
  if (tenma !== undefined && tenma !== null && typeof tenma !== "string")
    errors.push("tenma must be string");
  if (!MODE.includes(loaigiamgia))
    errors.push("loaigiamgia must be FIXED|PERCENT");

  if (!isIsoDate(thoigianbatdau))
    errors.push("thoigianbatdau must be ISO string");
  if (!isIsoDate(thoigianketthuc))
    errors.push("thoigianketthuc must be ISO string");

  if (soluongtoida === null || soluongtoida < 0)
    errors.push("soluongtoida must be integer >= 0");
  if (gioihanmoiuser === null || gioihanmoiuser < 1)
    errors.push("gioihanmoiuser must be integer >= 1");
  if (giatridonhangtoithieu === null || giatridonhangtoithieu < 0)
    errors.push("giatridonhangtoithieu must be number >= 0");
  if (giamtoida !== null && giamtoida !== undefined && giamtoida < 0)
    errors.push("giamtoida must be >= 0 or null");

  if (trangthai !== undefined && !isBool(trangthai))
    errors.push("trangthai must be boolean");

  // mode check
  if (loaigiamgia === "FIXED") {
    if (
      giatrigiamcodinh === null ||
      giatrigiamcodinh === undefined ||
      giatrigiamcodinh < 0
    )
      errors.push("giatrigiamcodinh must be >= 0 (FIXED)");
    if (tylegiam !== null && tylegiam !== undefined)
      errors.push("tylegiam must be null (FIXED)");
  }
  if (loaigiamgia === "PERCENT") {
    if (
      tylegiam === null ||
      tylegiam === undefined ||
      tylegiam <= 0 ||
      tylegiam > 100
    )
      errors.push("tylegiam must be (0,100] (PERCENT)");
    if (giatrigiamcodinh !== null && giatrigiamcodinh !== undefined)
      errors.push("giatrigiamcodinh must be null (PERCENT)");
  }

  return {
    ok: errors.length === 0,
    errors,
    value: {
      code: code?.trim().toUpperCase(),
      tenma: tenma?.trim() || null,
      loaigiamgia,
      giatrigiamcodinh: giatrigiamcodinh ?? null,
      tylegiam: tylegiam ?? null,
      thoigianbatdau,
      thoigianketthuc,
      soluongtoida,
      gioihanmoiuser,
      giatridonhangtoithieu,
      giamtoida: giamtoida ?? null,
      trangthai: trangthai ?? true,
    },
  };
}

export function validateAdminUpdate(body) {
  const errors = [];
  const hasAny = Object.keys(body || {}).length > 0;
  if (!hasAny) errors.push("At least one field is required");

  const patch = {};

  if (body?.code !== undefined) {
    if (!isNonEmptyString(body.code)) errors.push("code must be non-empty");
    patch.code = body.code.trim().toUpperCase();
  }
  if (body?.tenma !== undefined) {
    if (body.tenma !== null && typeof body.tenma !== "string")
      errors.push("tenma must be string or null");
    patch.tenma = body.tenma === null ? null : body.tenma.trim();
  }
  if (body?.loaigiamgia !== undefined) {
    if (!MODE.includes(body.loaigiamgia))
      errors.push("loaigiamgia must be FIXED|PERCENT");
    patch.loaigiamgia = body.loaigiamgia;
  }
  if (body?.giatrigiamcodinh !== undefined)
    patch.giatrigiamcodinh =
      body.giatrigiamcodinh === null ? null : toNum(body.giatrigiamcodinh);
  if (body?.tylegiam !== undefined)
    patch.tylegiam = body.tylegiam === null ? null : toNum(body.tylegiam);

  if (body?.thoigianbatdau !== undefined) {
    if (!isIsoDate(body.thoigianbatdau)) errors.push("thoigianbatdau invalid");
    patch.thoigianbatdau = body.thoigianbatdau;
  }
  if (body?.thoigianketthuc !== undefined) {
    if (!isIsoDate(body.thoigianketthuc))
      errors.push("thoigianketthuc invalid");
    patch.thoigianketthuc = body.thoigianketthuc;
  }

  if (body?.soluongtoida !== undefined) {
    const n = toInt(body.soluongtoida);
    if (n === null || n < 0) errors.push("soluongtoida must be integer >= 0");
    patch.soluongtoida = n;
  }
  if (body?.gioihanmoiuser !== undefined) {
    const n = toInt(body.gioihanmoiuser);
    if (n === null || n < 1) errors.push("gioihanmoiuser must be integer >= 1");
    patch.gioihanmoiuser = n;
  }
  if (body?.giatridonhangtoithieu !== undefined) {
    const n = toNum(body.giatridonhangtoithieu);
    if (n === null || n < 0) errors.push("giatridonhangtoithieu must be >= 0");
    patch.giatridonhangtoithieu = n;
  }
  if (body?.giamtoida !== undefined) {
    const n = body.giamtoida === null ? null : toNum(body.giamtoida);
    if (n !== null && n !== undefined && n < 0)
      errors.push("giamtoida must be >= 0 or null");
    patch.giamtoida = n;
  }

  if (body?.trangthai !== undefined) {
    if (!isBool(body.trangthai)) errors.push("trangthai must be boolean");
    patch.trangthai = body.trangthai;
  }

  return { ok: errors.length === 0, errors, value: patch };
}

export function validateAdminAttachVariant(body) {
  const errors = [];
  const bentheid = toInt(body?.bentheid);
  if (!bentheid) errors.push("bentheid must be integer");
  return { ok: errors.length === 0, errors, value: { bentheid } };
}

export function parseHistoryQuery(q) {
  const limit = Math.min(Number(q.limit || 20), 100);
  const offset = Math.max(Number(q.offset || 0), 0);
  return { limit, offset };
}
