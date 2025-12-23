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

export function validateUpdateMe(body) {
  const errors = [];

  const email = body?.email;
  const sdt = body?.sdt;
  const hoten = body?.hoten;
  const avatarurl = body?.avatarurl;

  // ít nhất 1 field
  const hasAny =
    email !== undefined ||
    sdt !== undefined ||
    hoten !== undefined ||
    avatarurl !== undefined;

  if (!hasAny)
    errors.push("At least one of email/sdt/hoten/avatarurl is required");

  if (email !== undefined && !isEmail(email)) errors.push("email is invalid");
  if (sdt !== undefined && !isPhone(sdt))
    errors.push("sdt is invalid (9-15 digits)");
  if (hoten !== undefined && !isNonEmptyString(hoten))
    errors.push("hoten must be non-empty");

  // avatarurl: string hoặc null (để xoá)
  if (
    avatarurl !== undefined &&
    avatarurl !== null &&
    typeof avatarurl !== "string"
  ) {
    errors.push("avatarurl must be string or null");
  }

  return {
    ok: errors.length === 0,
    errors,
    value: {
      email: email?.trim()?.toLowerCase(),
      sdt: sdt?.trim(),
      hoten: hoten?.trim(),
      avatarurl:
        avatarurl === undefined ? undefined : avatarurl?.trim?.() ?? avatarurl,
    },
  };
}

export function validateChangePassword(body) {
  const errors = [];
  const oldPassword = body?.oldPassword;
  const newPassword = body?.newPassword;

  if (!isNonEmptyString(oldPassword)) errors.push("oldPassword is required");
  if (!isNonEmptyString(newPassword) || newPassword.trim().length < 6) {
    errors.push("newPassword must be at least 6 chars");
  }

  return {
    ok: errors.length === 0,
    errors,
    value: { oldPassword, newPassword },
  };
}
