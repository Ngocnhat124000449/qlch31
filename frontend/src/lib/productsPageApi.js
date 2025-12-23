const RAW_BASE = process.env.NEXT_PUBLIC_API_BASE || "";
const API_BASE = RAW_BASE.replace(/\/$/, "");

/**
 * API helper cho trang /products (server component).
 * - Group theo danh mục
 * - Mỗi sản phẩm kèm danh sách biến thể
 */

export const PRODUCTS_ENDPOINTS = {
  categories: "/api/catalog/categories",
  products: "/api/catalog/products",
  productsByCategory: (danhmucid, limit = 8) =>
    `/api/catalog/products?danhmucid=${encodeURIComponent(
      danhmucid
    )}&limit=${limit}`,
  productsBySearch: (q, limit = 24) =>
    `/api/catalog/products?q=${encodeURIComponent(q)}&limit=${limit}`,
  variantsByProduct: (sanphamid) =>
    `/api/catalog/products/${encodeURIComponent(sanphamid)}/variants`,
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
  if (Array.isArray(data?.categories)) return data.categories;
  if (Array.isArray(data?.products)) return data.products;
  if (Array.isArray(data?.variants)) return data.variants;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

function getCatId(cat) {
  return cat?.danhmucid ?? cat?.id ?? cat?._id ?? null;
}
function getCatName(cat) {
  return cat?.ten ?? cat?.tendanhmuc ?? cat?.name ?? "Danh mục";
}
function getProductId(p) {
  return p?.sanphamid ?? p?.id ?? p?._id ?? null;
}

function getVariantId(v) {
  return v?.bentheid ?? v?.id ?? v?._id ?? null;
}

function mergeUnique(list, getId, limit = 8) {
  const seen = new Set();
  const out = [];

  for (const item of list || []) {
    const id = getId(item) ?? JSON.stringify(item);
    const key = String(id);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
    if (out.length >= limit) break;
  }

  return out;
}

function mergeUniqueProducts(list, limit = 8) {
  return mergeUnique(list, getProductId, limit);
}

function mergeUniqueVariants(list, limit = 6) {
  return mergeUnique(list, getVariantId, limit);
}

async function attachVariantsToProducts(products, variantLimit = 6) {
  const list = Array.isArray(products) ? products : [];

  const variantRes = await Promise.all(
    list.map((p) => {
      const id = getProductId(p);
      if (!id) return Promise.resolve(null);
      return fetchJson(PRODUCTS_ENDPOINTS.variantsByProduct(id)).catch(
        () => null
      );
    })
  );

  const lim = Math.max(0, Number(variantLimit) || 0) || 6;
  return list.map((p, idx) => ({
    ...p,
    variants: mergeUniqueVariants(normalizeList(variantRes[idx]), lim),
  }));
}

/**
 * Build blocks dạng:
 * [{ id, title, products: [{...product, variants: [...]}, ...] }, ...]
 */
export async function buildProductsPageByCategories(opts = {}) {
  const {
    maxCategories = 8,
    productLimit = 8,
    variantLimit = 6,
  } = opts;

  const catsRes = await fetchJson(PRODUCTS_ENDPOINTS.categories).catch(
    () => ({ categories: [] })
  );
  const categories = normalizeList(catsRes);

  const picked = categories.slice(0, Math.max(1, Number(maxCategories) || 8));

  const productResList = await Promise.all(
    picked.map((cat) => {
      const id = getCatId(cat);
      if (!id) return Promise.resolve(null);
      return fetchJson(
        PRODUCTS_ENDPOINTS.productsByCategory(id, productLimit)
      ).catch(() => null);
    })
  );

  const blocks = [];
  for (let i = 0; i < picked.length; i++) {
    const cat = picked[i];
    const catId = getCatId(cat);
    if (!catId) continue;

    const products = mergeUniqueProducts(
      normalizeList(productResList[i]),
      productLimit
    );
    if (!products.length) continue;

    const productsWithVariants = await attachVariantsToProducts(
      products,
      variantLimit
    );

    blocks.push({
      id: catId,
      title: getCatName(cat),
      products: productsWithVariants,
    });
  }

  return blocks;
}

/**
 * Search mode: trả về sản phẩm (kèm variants) + map danh mục để hiển thị nhãn.
 */
export async function buildProductsPageBySearch(q, opts = {}) {
  const { limit = 24, variantLimit = 6 } = opts;
  const keyword = String(q || "").trim();
  if (!keyword) return { keyword: "", products: [], categoryMap: {} };

  const [catsRes, prodRes] = await Promise.all([
    fetchJson(PRODUCTS_ENDPOINTS.categories).catch(() => ({ categories: [] })),
    fetchJson(PRODUCTS_ENDPOINTS.productsBySearch(keyword, limit)).catch(
      () => ({ products: [] })
    ),
  ]);

  const categories = normalizeList(catsRes);
  const categoryMap = {};
  categories.forEach((c) => {
    const id = getCatId(c);
    if (id != null) categoryMap[String(id)] = getCatName(c);
  });

  const products = mergeUniqueProducts(normalizeList(prodRes), limit);
  const productsWithVariants = await attachVariantsToProducts(
    products,
    variantLimit
  );

  return { keyword, products: productsWithVariants, categoryMap };
}
