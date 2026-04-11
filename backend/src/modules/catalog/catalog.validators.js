function isNonEmptyString(v) {
  return typeof v === "string" && v.trim().length > 0;
}
function isBool(v) {
  return typeof v === "boolean";
}
function isInt(v) {
  return Number.isInteger(v);
}
function toInt(v) {
  const n = Number(v);
  return Number.isFinite(n) && Number.isInteger(n) ? n : null;
}
function toNum(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export function validateCategoryCreate(body) {
  const errors = [];
  const ten = body?.ten;
  const tenviettat = body?.tenviettat;
  const trangthai = body?.trangthai;

  if (!isNonEmptyString(ten)) errors.push("ten is required");
  if (!isNonEmptyString(tenviettat)) errors.push("tenviettat is required");
  if (trangthai !== undefined && !isBool(trangthai))
    errors.push("trangthai must be boolean");

  return {
    ok: errors.length === 0,
    errors,
    value: {
      ten: ten?.trim(),
      tenviettat: tenviettat?.trim(),
      trangthai: trangthai ?? true,
    },
  };
}

export function validateCategoryUpdate(body) {
  const errors = [];
  const ten = body?.ten;
  const tenviettat = body?.tenviettat;
  const trangthai = body?.trangthai;

  const hasAny =
    ten !== undefined || tenviettat !== undefined || trangthai !== undefined;
  if (!hasAny)
    errors.push("At least one of ten/tenviettat/trangthai is required");

  if (ten !== undefined && !isNonEmptyString(ten))
    errors.push("ten must be non-empty");
  if (tenviettat !== undefined && !isNonEmptyString(tenviettat))
    errors.push("tenviettat must be non-empty");
  if (trangthai !== undefined && !isBool(trangthai))
    errors.push("trangthai must be boolean");

  return {
    ok: errors.length === 0,
    errors,
    value: {
      ten: ten?.trim(),
      tenviettat: tenviettat?.trim(),
      trangthai,
    },
  };
}

export function validateSupplierCreate(body) {
  const errors = [];
  const ten = body?.ten;
  const tenviettat = body?.tenviettat;
  const email = body?.email;
  const sdt = body?.sdt;
  const logourl = body?.logourl;
  const trangthai = body?.trangthai;

  if (!isNonEmptyString(ten)) errors.push("ten is required");
  if (!isNonEmptyString(tenviettat)) errors.push("tenviettat is required");
  if (!isNonEmptyString(email)) errors.push("email is required");
  if (!isNonEmptyString(sdt)) errors.push("sdt is required");
  if (logourl !== undefined && logourl !== null && typeof logourl !== "string")
    errors.push("logourl must be string");
  if (trangthai !== undefined && !isBool(trangthai))
    errors.push("trangthai must be boolean");

  return {
    ok: errors.length === 0,
    errors,
    value: {
      ten: ten?.trim(),
      tenviettat: tenviettat?.trim(),
      email: email?.trim().toLowerCase(),
      sdt: sdt?.trim(),
      logourl: logourl?.trim() || null,
      trangthai: trangthai ?? true,
    },
  };
}

export function validateSupplierUpdate(body) {
  const errors = [];
  const ten = body?.ten;
  const tenviettat = body?.tenviettat;
  const email = body?.email;
  const sdt = body?.sdt;
  const logourl = body?.logourl;
  const trangthai = body?.trangthai;

  const hasAny =
    ten !== undefined ||
    tenviettat !== undefined ||
    email !== undefined ||
    sdt !== undefined ||
    logourl !== undefined ||
    trangthai !== undefined;

  if (!hasAny) errors.push("At least one field is required");

  if (ten !== undefined && !isNonEmptyString(ten))
    errors.push("ten must be non-empty");
  if (tenviettat !== undefined && !isNonEmptyString(tenviettat))
    errors.push("tenviettat must be non-empty");
  if (email !== undefined && !isNonEmptyString(email))
    errors.push("email must be non-empty");
  if (sdt !== undefined && !isNonEmptyString(sdt))
    errors.push("sdt must be non-empty");
  if (logourl !== undefined && logourl !== null && typeof logourl !== "string")
    errors.push("logourl must be string");
  if (trangthai !== undefined && !isBool(trangthai))
    errors.push("trangthai must be boolean");

  return {
    ok: errors.length === 0,
    errors,
    value: {
      ten: ten?.trim(),
      tenviettat: tenviettat?.trim(),
      email: email?.trim()?.toLowerCase(),
      sdt: sdt?.trim(),
      logourl: logourl === undefined ? undefined : logourl?.trim?.() ?? logourl,
      trangthai,
    },
  };
}

export function validateProductCreate(body) {
  const errors = [];

  const danhmucid = toInt(body?.danhmucid);
  const nhacungcapid = toInt(body?.nhacungcapid);

  const ten = body?.ten;
  const motangan = body?.motangan;
  const motachitiet = body?.motachitiet;
  const tenviettat = body?.tenviettat;
  const hinhanhurl = body?.hinhanhurl;
  const trangthai = body?.trangthai;

  if (!danhmucid) errors.push("danhmucid must be integer");
  if (!nhacungcapid) errors.push("nhacungcapid must be integer");
  if (!isNonEmptyString(ten)) errors.push("ten is required");
  if (!isNonEmptyString(motangan)) errors.push("motangan is required");
  if (!isNonEmptyString(motachitiet)) errors.push("motachitiet is required");
  if (!isNonEmptyString(tenviettat)) errors.push("tenviettat is required");
  if (
    hinhanhurl !== undefined &&
    hinhanhurl !== null &&
    typeof hinhanhurl !== "string"
  )
    errors.push("hinhanhurl must be string");
  if (trangthai !== undefined && !isBool(trangthai))
    errors.push("trangthai must be boolean");

  return {
    ok: errors.length === 0,
    errors,
    value: {
      danhmucid,
      nhacungcapid,
      ten: ten?.trim(),
      motangan: motangan,
      motachitiet: motachitiet,
      tenviettat: tenviettat?.trim(),
      hinhanhurl: hinhanhurl?.trim() || null,
      trangthai: trangthai ?? true,
    },
  };
}

export function validateProductUpdate(body) {
  const errors = [];
  const danhmucid =
    body?.danhmucid !== undefined ? toInt(body?.danhmucid) : undefined;
  const nhacungcapid =
    body?.nhacungcapid !== undefined ? toInt(body?.nhacungcapid) : undefined;

  const ten = body?.ten;
  const motangan = body?.motangan;
  const motachitiet = body?.motachitiet;
  const tenviettat = body?.tenviettat;
  const hinhanhurl = body?.hinhanhurl;
  const trangthai = body?.trangthai;

  const hasAny =
    danhmucid !== undefined ||
    nhacungcapid !== undefined ||
    ten !== undefined ||
    motangan !== undefined ||
    motachitiet !== undefined ||
    tenviettat !== undefined ||
    hinhanhurl !== undefined ||
    trangthai !== undefined;

  if (!hasAny) errors.push("At least one field is required");

  if (danhmucid !== undefined && !danhmucid)
    errors.push("danhmucid must be integer");
  if (nhacungcapid !== undefined && !nhacungcapid)
    errors.push("nhacungcapid must be integer");
  if (ten !== undefined && !isNonEmptyString(ten))
    errors.push("ten must be non-empty");
  if (tenviettat !== undefined && !isNonEmptyString(tenviettat))
    errors.push("tenviettat must be non-empty");
  if (
    hinhanhurl !== undefined &&
    hinhanhurl !== null &&
    typeof hinhanhurl !== "string"
  )
    errors.push("hinhanhurl must be string");
  if (trangthai !== undefined && !isBool(trangthai))
    errors.push("trangthai must be boolean");

  return {
    ok: errors.length === 0,
    errors,
    value: {
      danhmucid,
      nhacungcapid,
      ten: ten?.trim(),
      motangan,
      motachitiet,
      tenviettat: tenviettat?.trim(),
      hinhanhurl:
        hinhanhurl === undefined
          ? undefined
          : hinhanhurl?.trim?.() ?? hinhanhurl,
      trangthai,
    },
  };
}

export function validateVariantCreate(body) {
  const errors = [];
  const tenbienthe = body?.tenbienthe;
  const sku = body?.sku;
  const giaban = toNum(body?.giaban);
  const tonkho = body?.tonkho !== undefined ? toInt(body?.tonkho) : 0;
  const hinhanhurl = body?.hinhanhurl;
  const trangthai = body?.trangthai;

  if (tenbienthe !== undefined && !isNonEmptyString(tenbienthe))
    errors.push("tenbienthe must be non-empty");
  if (sku !== undefined && sku !== null && typeof sku !== "string")
    errors.push("sku must be string");
  if (giaban === null || giaban === undefined || giaban < 0)
    errors.push("giaban must be number >= 0");
  if (tonkho === null || tonkho === undefined || tonkho < 0)
    errors.push("tonkho must be integer >= 0");
  if (
    hinhanhurl !== undefined &&
    hinhanhurl !== null &&
    typeof hinhanhurl !== "string"
  )
    errors.push("hinhanhurl must be string");
  if (trangthai !== undefined && !isBool(trangthai))
    errors.push("trangthai must be boolean");

  return {
    ok: errors.length === 0,
    errors,
    value: {
      tenbienthe: tenbienthe?.trim() || null,
      sku: sku?.trim() || null,
      giaban,
      tonkho,
      hinhanhurl: hinhanhurl?.trim() || null,
      trangthai: trangthai ?? true,
    },
  };
}

export function validateVariantUpdate(body) {
  const errors = [];
  const tenbienthe = body?.tenbienthe;
  const sku = body?.sku;
  const giaban = body?.giaban !== undefined ? toNum(body?.giaban) : undefined;
  const tonkho = body?.tonkho !== undefined ? toInt(body?.tonkho) : undefined;
  const hinhanhurl = body?.hinhanhurl;
  const trangthai = body?.trangthai;

  const hasAny =
    tenbienthe !== undefined ||
    sku !== undefined ||
    giaban !== undefined ||
    tonkho !== undefined ||
    hinhanhurl !== undefined ||
    trangthai !== undefined;

  if (!hasAny) errors.push("At least one field is required");

  if (tenbienthe !== undefined && !isNonEmptyString(tenbienthe))
    errors.push("tenbienthe must be non-empty");
  if (sku !== undefined && sku !== null && typeof sku !== "string")
    errors.push("sku must be string");
  if (giaban !== undefined && (giaban === null || giaban < 0))
    errors.push("giaban must be number >= 0");
  if (tonkho !== undefined && (tonkho === null || tonkho < 0))
    errors.push("tonkho must be integer >= 0");
  if (
    hinhanhurl !== undefined &&
    hinhanhurl !== null &&
    typeof hinhanhurl !== "string"
  )
    errors.push("hinhanhurl must be string");
  if (trangthai !== undefined && !isBool(trangthai))
    errors.push("trangthai must be boolean");

  return {
    ok: errors.length === 0,
    errors,
    value: {
      tenbienthe:
        tenbienthe === undefined
          ? undefined
          : tenbienthe?.trim?.() ?? tenbienthe,
      sku: sku === undefined ? undefined : sku?.trim?.() ?? sku,
      giaban,
      tonkho,
      hinhanhurl:
        hinhanhurl === undefined
          ? undefined
          : hinhanhurl?.trim?.() ?? hinhanhurl,
      trangthai,
    },
  };
}
