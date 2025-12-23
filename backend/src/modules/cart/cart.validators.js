function toInt(v) {
  const n = Number(v);
  return Number.isFinite(n) && Number.isInteger(n) ? n : null;
}

export function validateAddItem(body) {
  const errors = [];
  const bentheid = toInt(body?.bentheid);
  const soluong = toInt(body?.soluong);

  if (!bentheid) errors.push("bentheid must be integer");
  if (!soluong || soluong <= 0) errors.push("soluong must be integer > 0");

  return { ok: errors.length === 0, errors, value: { bentheid, soluong } };
}

export function validateSetQty(body) {
  const errors = [];
  const soluong = toInt(body?.soluong);

  // cho phép 0 => remove
  if (soluong === null || soluong < 0)
    errors.push("soluong must be integer >= 0");

  return { ok: errors.length === 0, errors, value: { soluong } };
}

export function parseBentheidParam(param) {
  const bentheid = toInt(param);
  return bentheid;
}
