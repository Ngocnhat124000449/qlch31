import { apiFetch } from "@/lib/apiClient";

/** cố gắng lấy tên hãng/nhà cung cấp từ nhiều field khác nhau */
function pickVendorName(p) {
  return (
    // ✅ theo API doc products list
    p?.nhacungcap_ten ||
    p?.nhacungcapTen ||
    // các fallback khác
    p?.hangsanxuat?.ten ||
    p?.hangsanxuat?.name ||
    p?.nhacungcap?.ten ||
    p?.nhacungcap?.name ||
    p?.brand?.ten ||
    p?.brand?.name ||
    p?.vendor?.ten ||
    p?.vendor?.name ||
    p?.hang ||
    p?.thuonghieu ||
    null
  );
}

function normalizeList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.products)) return data.products;
  return [];
}

export async function getCategoryHoverData(danhmucid, opts = {}) {
  const {
    vendorLimit = 12,
    hotLimit = 6,
    newLimit = 6,
    sampleLimitForVendors = 60,
  } = opts;

  // 1) Lấy sample products (đủ để suy ra NCC + lấy luôn list cho HOT/Mới)
  const sampleRes = await apiFetch(
    `/api/catalog/products?danhmucid=${encodeURIComponent(
      danhmucid
    )}&limit=${sampleLimitForVendors}`,
    { method: "GET", auth: false }
  );
  const sampleProducts = normalizeList(sampleRes);

  // Vendors
  const vendorMap = new Map();

  for (const p of sampleProducts) {
    const id = p?.nhacungcapid ?? p?.supplierId ?? p?.nhacungcap_id ?? null;
    const name = pickVendorName(p);
    const label =
      (name && String(name).trim()) ||
      (id != null ? `Nhà cung cấp #${id}` : null);

    if (!label) continue;

    const key = id != null ? `id:${id}` : `name:${label}`;
    if (!vendorMap.has(key)) vendorMap.set(key, label);
  }

  const vendors = Array.from(vendorMap.values()).slice(0, vendorLimit);

  // HOT / Mới: vì bạn không quan trọng “hot/new”, dùng luôn dữ liệu có sẵn để chắc chắn có list
  const hotProducts = sampleProducts.slice(0, hotLimit);

  const newProducts = [...sampleProducts]
    .sort((a, b) => {
      const ta = new Date(a?.created_at || a?.createdAt || 0).getTime();
      const tb = new Date(b?.created_at || b?.createdAt || 0).getTime();
      return tb - ta;
    })
    .slice(0, newLimit);

  return { vendors, hotProducts, newProducts };
}
