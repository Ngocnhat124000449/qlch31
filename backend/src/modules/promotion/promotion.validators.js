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

export function parseKhuyenmaiidParam(x) {
  return toInt(x);
}
export function parseSanphamidParam(x) {
  return toInt(x);
}

export function validateCreatePromotion(body) {
  const errors = [];

  const tenkhuyenmai = body?.tenkhuyenmai;
  const mota = body?.mota;
  const loaigiamgia = body?.loaigiamgia;
  const giatrigiamcodinh =
    body?.giatrigiamcodinh === null ? null : toNum(body?.giatrigiamcodinh);
  const tylegiam = body?.tylegiam === null ? null : toNum(body?.tylegiam);
  const thoigianbatdau = body?.thoigianbatdau;
  const thoigianketthuc = body?.thoigianketthuc;
  const trangthai = body?.trangthai;
  const cothecongdon = body?.cothecongdon;

  if (!isNonEmptyString(tenkhuyenmai)) errors.push("tenkhuyenmai is required");
  if (mota !== undefined && mota !== null && typeof mota !== "string")
    errors.push("mota must be string");
  if (!MODE.includes(loaigiamgia))
    errors.push("loaigiamgia must be FIXED|PERCENT");

  if (!isIsoDate(thoigianbatdau))
    errors.push("thoigianbatdau must be ISO date string");
  if (!isIsoDate(thoigianketthuc))
    errors.push("thoigianketthuc must be ISO date string");

  if (trangthai !== undefined && !isBool(trangthai))
    errors.push("trangthai must be boolean");
  if (cothecongdon !== undefined && !isBool(cothecongdon))
    errors.push("cothecongdon must be boolean");

  // mode check (giống DB constraint)
  if (loaigiamgia === "FIXED") {
    if (
      giatrigiamcodinh === null ||
      giatrigiamcodinh === undefined ||
      giatrigiamcodinh < 0
    )
      errors.push("giatrigiamcodinh must be number >= 0 (FIXED)");
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
      tenkhuyenmai: tenkhuyenmai?.trim(),
      mota: mota?.trim() || null,
      loaigiamgia,
      giatrigiamcodinh: giatrigiamcodinh ?? null,
      tylegiam: tylegiam ?? null,
      thoigianbatdau,
      thoigianketthuc,
      trangthai: trangthai ?? true,
      cothecongdon: cothecongdon ?? false,
    },
  };
}

export function validateUpdatePromotion(body) {
  // partial update: chỉ validate field nào có
  const errors = [];
  const hasAny = Object.keys(body || {}).length > 0;
  if (!hasAny) errors.push("At least one field is required");

  // reuse create-style checks but tolerant
  const loaigiamgia = body?.loaigiamgia;
  if (loaigiamgia !== undefined && !MODE.includes(loaigiamgia))
    errors.push("loaigiamgia must be FIXED|PERCENT");

  if (body?.tenkhuyenmai !== undefined && !isNonEmptyString(body.tenkhuyenmai))
    errors.push("tenkhuyenmai must be non-empty");
  if (
    body?.mota !== undefined &&
    body?.mota !== null &&
    typeof body.mota !== "string"
  )
    errors.push("mota must be string");

  if (body?.thoigianbatdau !== undefined && !isIsoDate(body.thoigianbatdau))
    errors.push("thoigianbatdau invalid");
  if (body?.thoigianketthuc !== undefined && !isIsoDate(body.thoigianketthuc))
    errors.push("thoigianketthuc invalid");

  if (body?.trangthai !== undefined && !isBool(body.trangthai))
    errors.push("trangthai must be boolean");
  if (body?.cothecongdon !== undefined && !isBool(body.cothecongdon))
    errors.push("cothecongdon must be boolean");

  const giatrigiamcodinh =
    body?.giatrigiamcodinh === undefined
      ? undefined
      : body?.giatrigiamcodinh === null
      ? null
      : toNum(body.giatrigiamcodinh);
  const tylegiam =
    body?.tylegiam === undefined
      ? undefined
      : body?.tylegiam === null
      ? null
      : toNum(body.tylegiam);

  if (
    giatrigiamcodinh !== undefined &&
    giatrigiamcodinh !== null &&
    giatrigiamcodinh < 0
  )
    errors.push("giatrigiamcodinh must be >= 0");
  if (
    tylegiam !== undefined &&
    tylegiam !== null &&
    (tylegiam <= 0 || tylegiam > 100)
  )
    errors.push("tylegiam must be (0,100]");

  return {
    ok: errors.length === 0,
    errors,
    value: {
      tenkhuyenmai: body?.tenkhuyenmai?.trim(),
      mota:
        body?.mota === undefined
          ? undefined
          : body?.mota?.trim?.() ?? body.mota,
      loaigiamgia,
      giatrigiamcodinh,
      tylegiam,
      thoigianbatdau: body?.thoigianbatdau,
      thoigianketthuc: body?.thoigianketthuc,
      trangthai: body?.trangthai,
      cothecongdon: body?.cothecongdon,
    },
  };
}

export function validateAttachProduct(body) {
  const errors = [];
  const sanphamid = toInt(body?.sanphamid);
  if (!sanphamid) errors.push("sanphamid must be integer");
  return { ok: errors.length === 0, errors, value: { sanphamid } };
}
