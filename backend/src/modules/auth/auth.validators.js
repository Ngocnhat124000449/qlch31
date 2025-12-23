function isNonEmptyString(v) {
  return typeof v === "string" && v.trim().length > 0;
}
function isEmail(v) {
  if (!isNonEmptyString(v)) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}
function isPhone(v) {
  if (!isNonEmptyString(v)) return false;
  return /^[0-9]{9,15}$/.test(v.trim());
}

export function validateRegister(body) {
  const errors = [];
  const tendangnhap = body?.tendangnhap;
  const matkhau = body?.matkhau;
  const email = body?.email;
  const sdt = body?.sdt;
  const hoten = body?.hoten;
  const avatarurl = body?.avatarurl;

  if (!isNonEmptyString(tendangnhap)) errors.push("tendangnhap is required");
  if (!isNonEmptyString(matkhau) || matkhau.trim().length < 6)
    errors.push("matkhau must be at least 6 chars");
  if (!isEmail(email)) errors.push("email is invalid");
  if (!isPhone(sdt)) errors.push("sdt is invalid (9-15 digits)");
  if (!isNonEmptyString(hoten)) errors.push("hoten is required");
  if (
    avatarurl !== undefined &&
    avatarurl !== null &&
    typeof avatarurl !== "string"
  )
    errors.push("avatarurl must be string");

  return {
    ok: errors.length === 0,
    errors,
    value: {
      tendangnhap: tendangnhap?.trim(),
      matkhau,
      email: email?.trim().toLowerCase(),
      sdt: sdt?.trim(),
      hoten: hoten?.trim(),
      avatarurl: avatarurl?.trim() || null,
    },
  };
}

export function validateLogin(body) {
  const errors = [];
  const identifier = body?.identifier;
  const matkhau = body?.matkhau;

  if (!isNonEmptyString(identifier))
    errors.push("identifier is required (tendangnhap/email/sdt)");
  if (!isNonEmptyString(matkhau)) errors.push("matkhau is required");

  return {
    ok: errors.length === 0,
    errors,
    value: { identifier: identifier?.trim(), matkhau },
  };
}

export function validateRefresh(body) {
  const errors = [];
  const refreshToken = body?.refreshToken;
  if (!isNonEmptyString(refreshToken)) errors.push("refreshToken is required");
  return {
    ok: errors.length === 0,
    errors,
    value: { refreshToken: refreshToken?.trim() },
  };
}

export function validateLogout(body) {
  // logout bằng refreshToken (không cần access token)
  return validateRefresh(body);
}
