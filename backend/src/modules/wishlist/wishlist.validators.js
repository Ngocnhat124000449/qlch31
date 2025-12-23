function toInt(v) {
  const n = Number(v);
  return Number.isFinite(n) && Number.isInteger(n) ? n : null;
}

export function validateAddWishlistItem(body) {
  const errors = [];
  const bentheid = toInt(body?.bentheid);

  if (!bentheid) errors.push("bentheid must be integer");

  return { ok: errors.length === 0, errors, value: { bentheid } };
}

export function parseBentheidParam(param) {
  return toInt(param);
}
