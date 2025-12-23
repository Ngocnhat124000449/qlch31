function isNonEmptyString(v) {
  return typeof v === "string" && v.trim().length > 0;
}
function toInt(v) {
  const n = Number(v);
  return Number.isFinite(n) && Number.isInteger(n) ? n : null;
}

export function parsePhuongthucidParam(param) {
  return toInt(param);
}

export function validateCreatePaymentMethod(body) {
  const errors = [];
  const ten = body?.ten;

  if (!isNonEmptyString(ten)) errors.push("ten is required");

  return {
    ok: errors.length === 0,
    errors,
    value: { ten: ten?.trim() },
  };
}

export function validateUpdatePaymentMethod(body) {
  // update chỉ đổi "ten"
  return validateCreatePaymentMethod(body);
}
