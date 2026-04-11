function titleizeToken(token) {
  if (!token) return "";
  if (/\d/.test(token)) {
    return token.charAt(0).toUpperCase() + token.slice(1);
  }
  return token.charAt(0).toUpperCase() + token.slice(1).toLowerCase();
}

export function humanizeVariantSku(sku) {
  const raw = String(sku || "").trim();
  if (!raw) return "";

  const cleaned = raw.replace(/^sku[-_\s]*/i, "").trim();
  if (!cleaned) return raw;

  if (/[-_]/.test(cleaned)) {
    return cleaned
      .split(/[-_]+/)
      .filter(Boolean)
      .map(titleizeToken)
      .join(" ");
  }

  return cleaned;
}

export function getVariantDisplayName(variant) {
  const named = String(
    variant?.tenbienthe || variant?.tenBienThe || variant?.variantName || ""
  ).trim();
  if (named) return named;

  const humanSku = humanizeVariantSku(variant?.sku);
  if (humanSku) return humanSku;

  const id = variant?.bentheid ?? variant?.id ?? null;
  return id != null ? `Variant #${id}` : "Biến thể";
}
