// src/lib/catalogNormalize.js

export function normalizeList(data) {
  if (Array.isArray(data)) return data;

  // các dạng hay gặp
  const candidates = [
    data?.items,
    data?.data,
    data?.rows,
    data?.result,
    data?.results,
    data?.payload,
    data?.categories,
    data?.danhmucs,
  ];

  for (const c of candidates) {
    if (Array.isArray(c)) return c;
  }

  // dạng lồng sâu
  if (Array.isArray(data?.data?.items)) return data.data.items;
  if (Array.isArray(data?.data?.rows)) return data.data.rows;

  return [];
}

export function normalizeCategory(raw) {
  const danhmucid = raw?.danhmucid ?? raw?.id ?? raw?.categoryId ?? raw?._id;
  const ten = raw?.ten ?? raw?.name ?? raw?.title ?? "";
  const tenviettat = raw?.tenviettat ?? raw?.slug ?? raw?.code ?? "";
  const trangthai =
    raw?.trangthai ?? raw?.active ?? raw?.isActive ?? raw?.enabled ?? true;

  return {
    ...raw,
    danhmucid,
    ten,
    tenviettat,
    trangthai,
  };
}

export function normalizeCategoryList(payload) {
  return normalizeList(payload)
    .map(normalizeCategory)
    .filter((c) => c?.danhmucid && c?.ten && c?.trangthai !== false);
}
