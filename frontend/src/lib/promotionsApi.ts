const RAW_BASE = process.env.NEXT_PUBLIC_API_BASE || "";
const API_BASE = RAW_BASE.replace(/\/$/, "");

async function fetchJson(path, init = {}) {
  if (!API_BASE) throw new Error("Missing NEXT_PUBLIC_API_BASE in .env.local");

  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      ...(init.headers || {}),
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const err = new Error(data?.message || "API error");
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

function normalizeList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.promotions)) return data.promotions;
  if (Array.isArray(data?.products)) return data.products;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

function unique(list) {
  const out = [];
  const seen = new Set();
  for (const v of list || []) {
    const key = String(v);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(v);
  }
  return out;
}

function pickBestVariant(variants) {
  const vs = Array.isArray(variants) ? variants : [];
  return (
    vs.find((v) => v?.trangthai === true) ||
    vs.find((v) => v?.tonkho > 0) ||
    vs[0] ||
    null
  );
}

async function getCatalogProducts(limit) {
  const data = await fetchJson(`/api/catalog/products?limit=${limit}`).catch(
    () => null
  );
  return normalizeList(data);
}

async function getCatalogProductDetail(sanphamid) {
  const data = await fetchJson(`/api/catalog/products/${sanphamid}`).catch(
    () => null
  );
  return data?.product || data || null;
}

/**
 * Trả về danh sách sản phẩm cho trang /promotions
 * - Ưu tiên sản phẩm nằm trong các promotions đang active (theo API /api/promotions)
 * - Nếu không có promotions => fallback sang list sản phẩm theo catalog
 */
export async function getPromotionPageProducts({ limit = 12 } = {}) {
  // 1) promotions -> product ids
  const promoListRes = await fetchJson(`/api/promotions`).catch(() => null);
  const promotions = normalizeList(promoListRes);

  let ids = [];

  if (promotions.length) {
    const details = await Promise.all(
      promotions
        .slice(0, 6)
        .map((p) =>
          fetchJson(`/api/promotions/${p.khuyenmaiid}`).catch(() => null)
        )
    );

    for (const d of details) {
      const promo = d?.promotion || d || null;
      const prods = normalizeList(promo);
      for (const pr of prods) {
        const pid = pr?.sanphamid ?? pr?.id;
        if (pid != null) ids.push(pid);
      }
    }
  }

  ids = unique(ids);

  // 2) fallback: catalog list
  if (!ids.length) {
    const list = await getCatalogProducts(limit);
    ids = unique(list.map((p) => p?.sanphamid ?? p?.id).filter(Boolean));
  }

  ids = ids.slice(0, limit);

  // 3) fetch detail để lấy giá/ảnh/mô tả
  const details = await Promise.all(ids.map((id) => getCatalogProductDetail(id)));

  const out = [];
  for (const p of details) {
    if (!p) continue;
    const best = pickBestVariant(p.variants);

    out.push({
      ...p,
      sanphamid: p.sanphamid ?? p.id,
      ten: p.ten ?? p.tensanpham,
      motangan: p.motangan ?? p.mota,
      hinhanhurl: p.hinhanhurl ?? p.imageUrl,
      giaban: best?.giaban ?? p.giaban ?? p.gia,
    });
  }

  return out;
}
