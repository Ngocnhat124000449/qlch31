const RAW_BASE = process.env.NEXT_PUBLIC_API_BASE || "";
const API_BASE = RAW_BASE.replace(/\/$/, "");

/**
 * Chỉ tập trung các API dùng cho trang chủ.
 * Nếu backend của bạn dùng path khác, bạn chỉ sửa tại đây.
 */
export const HOME_ENDPOINTS = {
  categories: "/api/catalog/categories",
  banners: "/api/banners",

  // promotions (public)
  promotions: "/api/promotions",
  promotionDetail: (khuyenmaiid) => `/api/promotions/${khuyenmaiid}`,

  hotProductsByCategory: (danhmucid, limit = 4) =>
    `/api/catalog/products?danhmucid=${encodeURIComponent(
      danhmucid
    )}&limit=${limit}&sort=hot`,

  // products by category (public)
  productsByCategory: (danhmucid, limit = 8) =>
    `/api/catalog/products?danhmucid=${encodeURIComponent(
      danhmucid
    )}&limit=${limit}`,
};

async function fetchJson(path, init = {}) {
  if (!API_BASE) {
    throw new Error("Missing NEXT_PUBLIC_API_BASE in .env.local");
  }

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

  // ✅ thêm các key list phổ biến theo API
  if (Array.isArray(data?.categories)) return data.categories;
  // products list (API doc trả { products: [...] })
  if (Array.isArray(data?.products)) return data.products;

  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;

  return [];
}

export async function getHomeCategories() {
  return normalizeList(await fetchJson(HOME_ENDPOINTS.categories));
}

export async function getHomeBanners() {
  return normalizeList(await fetchJson(HOME_ENDPOINTS.banners));
}

/**
 * Flash sale = promotion đang active đầu tiên.
 * Flow đúng theo API doc:
 * 1) GET /api/promotions (list active)
 * 2) GET /api/promotions/:khuyenmaiid (detail + products + thoigianketthuc)
 */
export async function getFlashSale() {
  const listRes = await fetchJson(HOME_ENDPOINTS.promotions);

  // API doc trả { promotions: [...] }
  const promotions = Array.isArray(listRes?.promotions)
    ? listRes.promotions
    : normalizeList(listRes);

  const first = promotions?.[0];
  const khuyenmaiid = first?.khuyenmaiid;

  if (!khuyenmaiid) {
    return { endsAt: null, items: [] };
  }

  const detailRes = await fetchJson(
    HOME_ENDPOINTS.promotionDetail(khuyenmaiid)
  );

  // API doc trả { promotion: { ..., thoigianketthuc, products: [...] } }
  const promo = detailRes?.promotion || detailRes;
  const items = Array.isArray(promo?.products)
    ? promo.products
    : normalizeList(promo);

  return {
    endsAt: promo?.thoigianketthuc || promo?.endsAt || null,
    items,
  };
}

export async function getHotProductsByCategory(danhmucid, limit = 4) {
  const data = await fetchJson(
    HOME_ENDPOINTS.hotProductsByCategory(danhmucid, limit)
  );
  return normalizeList(data);
}

/** ----------------------------------------------------------------
 * Helpers build section theo danh mục
 * - Dùng chung cho HomePage và các trang danh mục/sản phẩm sau này.
 * ---------------------------------------------------------------- */

function getCatId(cat) {
  return cat?.danhmucid ?? cat?.id ?? cat?._id ?? null;
}
function getCatName(cat) {
  return cat?.ten ?? cat?.tendanhmuc ?? cat?.name ?? "Danh mục";
}
function getProductId(p) {
  return p?.sanphamid ?? p?.id ?? p?._id ?? null;
}
function mergeUniqueById(list, limit = 8) {
  const seen = new Set();
  const out = [];
  for (const item of list || []) {
    const id = getProductId(item) ?? JSON.stringify(item);
    if (seen.has(id)) continue;
    seen.add(id);
    out.push(item);
    if (out.length >= limit) break;
  }
  return out;
}

/**
 * Build danh sách section sản phẩm theo danh mục (đại diện).
 *
 * @param {Array} categories - mảng danh mục từ getHomeCategories()
 * @param {Object} [opts]
 * @param {number} [opts.maxCategories=6] - số danh mục tối đa hiển thị
 * @param {number} [opts.limit=8] - số sản phẩm tối đa mỗi danh mục
 * @returns {Promise<Array<{id:any,title:string,products:Array}>>}
 */
export async function buildHotNewSectionsByCategories(categories, opts = {}) {
  const { maxCategories = 6, limit = 8 } = opts;

  const out = [];
  const list = Array.isArray(categories) ? categories : [];

  for (const cat of list) {
    if (out.length >= maxCategories) break;

    const catId = getCatId(cat);
    if (!catId) continue;

    const data = await fetchJson(
      HOME_ENDPOINTS.productsByCategory(catId, limit)
    ).catch(() => null);

    const products = mergeUniqueById(normalizeList(data), limit);
    if (!products.length) continue;

    out.push({
      id: catId,
      title: getCatName(cat),
      products,
    });
  }

  return out;
}
