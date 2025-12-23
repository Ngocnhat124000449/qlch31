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

function isPhone(v) {
  if (!isNonEmptyString(v)) return false;
  return /^[0-9]{9,15}$/.test(v.trim());
}

export function parseDiachiuseridParam(x) {
  return toInt(x);
}

export function validateCreateAddress(body) {
  const errors = [];

  const tennguoinhan = body?.tennguoinhan;
  const sdtnguoinhan = body?.sdtnguoinhan;
  const tinhthanh = body?.tinhthanh;
  const quanhuyen = body?.quanhuyen;
  const phuongxa = body?.phuongxa;
  const diachichitiet = body?.diachichitiet;
  const loaidiachi = body?.loaidiachi;
  const macdinh = body?.macdinh;

  if (!isNonEmptyString(tennguoinhan)) errors.push("tennguoinhan is required");
  if (!isPhone(sdtnguoinhan))
    errors.push("sdtnguoinhan is invalid (9-15 digits)");
  if (!isNonEmptyString(tinhthanh)) errors.push("tinhthanh is required");
  if (!isNonEmptyString(quanhuyen)) errors.push("quanhuyen is required");
  if (!isNonEmptyString(phuongxa)) errors.push("phuongxa is required");
  if (!isNonEmptyString(diachichitiet))
    errors.push("diachichitiet is required");
  if (!isNonEmptyString(loaidiachi)) errors.push("loaidiachi is required");
  if (macdinh !== undefined && !isBool(macdinh))
    errors.push("macdinh must be boolean");

  return {
    ok: errors.length === 0,
    errors,
    value: {
      tennguoinhan: tennguoinhan?.trim(),
      sdtnguoinhan: sdtnguoinhan?.trim(),
      tinhthanh: tinhthanh?.trim(),
      quanhuyen: quanhuyen?.trim(),
      phuongxa: phuongxa?.trim(),
      diachichitiet: diachichitiet?.trim(),
      loaidiachi: loaidiachi?.trim(),
      macdinh: macdinh ?? false,
    },
  };
}

export function validateUpdateAddress(body) {
  const errors = [];
  const keys = [
    "tennguoinhan",
    "sdtnguoinhan",
    "tinhthanh",
    "quanhuyen",
    "phuongxa",
    "diachichitiet",
    "loaidiachi",
    "macdinh",
  ];
  const hasAny = keys.some((k) => body?.[k] !== undefined);
  if (!hasAny) errors.push("At least one field is required");

  if (body?.tennguoinhan !== undefined && !isNonEmptyString(body.tennguoinhan))
    errors.push("tennguoinhan must be non-empty");

  if (body?.sdtnguoinhan !== undefined && !isPhone(body.sdtnguoinhan))
    errors.push("sdtnguoinhan is invalid (9-15 digits)");

  if (body?.tinhthanh !== undefined && !isNonEmptyString(body.tinhthanh))
    errors.push("tinhthanh must be non-empty");

  if (body?.quanhuyen !== undefined && !isNonEmptyString(body.quanhuyen))
    errors.push("quanhuyen must be non-empty");

  if (body?.phuongxa !== undefined && !isNonEmptyString(body.phuongxa))
    errors.push("phuongxa must be non-empty");

  if (
    body?.diachichitiet !== undefined &&
    !isNonEmptyString(body.diachichitiet)
  )
    errors.push("diachichitiet must be non-empty");

  if (body?.loaidiachi !== undefined && !isNonEmptyString(body.loaidiachi))
    errors.push("loaidiachi must be non-empty");

  if (body?.macdinh !== undefined && !isBool(body.macdinh))
    errors.push("macdinh must be boolean");

  return {
    ok: errors.length === 0,
    errors,
    value: {
      tennguoinhan:
        body?.tennguoinhan === undefined ? undefined : body.tennguoinhan.trim(),
      sdtnguoinhan:
        body?.sdtnguoinhan === undefined ? undefined : body.sdtnguoinhan.trim(),
      tinhthanh:
        body?.tinhthanh === undefined ? undefined : body.tinhthanh.trim(),
      quanhuyen:
        body?.quanhuyen === undefined ? undefined : body.quanhuyen.trim(),
      phuongxa: body?.phuongxa === undefined ? undefined : body.phuongxa.trim(),
      diachichitiet:
        body?.diachichitiet === undefined
          ? undefined
          : body.diachichitiet.trim(),
      loaidiachi:
        body?.loaidiachi === undefined ? undefined : body.loaidiachi.trim(),
      macdinh: body?.macdinh,
    },
  };
}
