// src/lib/adminApi.js
// Admin-only API helpers for dashboard pages.

import { apiFetch } from "@/lib/apiClient";

// ----------------------------
// Helpers
// ----------------------------

function toQuery(params) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params || {})) {
    if (v === undefined || v === null || v === "") continue;
    sp.set(k, String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : "";
}

export function normalizeList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.orders)) return data.orders;
  if (Array.isArray(data?.users)) return data.users;
  if (Array.isArray(data?.products)) return data.products;
  if (Array.isArray(data?.categories)) return data.categories;
  if (Array.isArray(data?.suppliers)) return data.suppliers;
  if (Array.isArray(data?.promotions)) return data.promotions;
  if (Array.isArray(data?.variants)) return data.variants;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.reviews)) return data.reviews;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

export function toNumber(v) {
  if (v == null) return 0;
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  const n = Number(String(v).replace(/[^0-9.-]+/g, ""));
  return Number.isFinite(n) ? n : 0;
}

export function formatMoneyVND(value) {
  const v = toNumber(value);
  try {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(v);
  } catch {
    return String(v);
  }
}

export function formatApiError(err) {
  const metaErrors = err?.data?.meta?.errors;
  if (Array.isArray(metaErrors) && metaErrors.length) return metaErrors.join("\n");
  return err?.data?.message || err?.message || "Có lỗi xảy ra";
}

function buildFormData(fields = {}, fileField = "image") {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields || {})) {
    if (v === undefined) continue;
    if (k === fileField) {
      if (v) fd.append(fileField, v);
      continue;
    }
    if (v === null) {
      fd.append(k, "");
      continue;
    }
    if (typeof v === "boolean") fd.append(k, v ? "true" : "false");
    else fd.append(k, String(v));
  }
  return fd;
}

// ----------------------------
// Orders
// ----------------------------

export async function adminListOrders({ page = 1, limit = 50, status } = {}) {
  const qs = toQuery({ page, limit, status });
  const res = await apiFetch(`/api/orders/admin/all${qs}`);
  return { raw: res, orders: normalizeList(res) };
}

export async function adminGetOrderDetail(donhangid) {
  const res = await apiFetch(`/api/orders/${encodeURIComponent(donhangid)}`);
  return res?.order ?? res?.data?.order ?? res;
}

// ----------------------------
// Users
// ----------------------------

export async function adminListUsers({ limit = 50, offset = 0 } = {}) {
  const qs = toQuery({ limit, offset });
  const res = await apiFetch(`/api/users/admin/users${qs}`);
  return { raw: res, users: normalizeList(res) };
}

// ----------------------------
// Catalog
// ----------------------------

export async function adminListCategories({ all = true } = {}) {
  const qs = toQuery({ all: all ? 1 : undefined });
  const res = await apiFetch(`/api/catalog/categories${qs}`);
  return { raw: res, categories: normalizeList(res) };
}

export async function adminCreateCategory(body) {
  const res = await apiFetch(`/api/catalog/categories`, {
    method: "POST",
    body,
  });
  return res?.category ?? res;
}

export async function adminUpdateCategory(danhmucid, body) {
  const res = await apiFetch(`/api/catalog/categories/${encodeURIComponent(danhmucid)}`, {
    method: "PUT",
    body,
  });
  return res?.category ?? res;
}

export async function adminListSuppliers({ all = true } = {}) {
  const qs = toQuery({ all: all ? 1 : undefined });
  const res = await apiFetch(`/api/catalog/suppliers${qs}`);
  return { raw: res, suppliers: normalizeList(res) };
}

export async function adminCreateSupplier(body) {
  const res = await apiFetch(`/api/catalog/suppliers`, {
    method: "POST",
    body,
  });
  return res?.supplier ?? res;
}

export async function adminUpdateSupplier(nhacungcapid, body) {
  const res = await apiFetch(`/api/catalog/suppliers/${encodeURIComponent(nhacungcapid)}`, {
    method: "PUT",
    body,
  });
  return res?.supplier ?? res;
}

export async function adminListProducts({ all = true, page = 1, limit = 20, danhmucid, nhacungcapid, q } = {}) {
  const qs = toQuery({ all: all ? 1 : undefined, page, limit, danhmucid, nhacungcapid, q });
  const res = await apiFetch(`/api/catalog/products${qs}`);
  return { raw: res, products: normalizeList(res) };
}

export async function adminGetProductDetail(sanphamid) {
  const res = await apiFetch(`/api/catalog/products/${encodeURIComponent(sanphamid)}`);
  return res?.product ?? res;
}

export async function adminCreateProduct(fields = {}) {
  const fd = buildFormData(fields, "image");
  const res = await apiFetch(`/api/catalog/products`, {
    method: "POST",
    body: fd,
  });
  return res?.product ?? res;
}

export async function adminUpdateProduct(sanphamid, fields = {}) {
  const fd = buildFormData(fields, "image");
  const res = await apiFetch(`/api/catalog/products/${encodeURIComponent(sanphamid)}`, {
    method: "PUT",
    body: fd,
  });
  return res?.product ?? res;
}

export async function adminListVariantsByProduct(sanphamid, { all = true } = {}) {
  const qs = toQuery({ all: all ? 1 : undefined });
  const res = await apiFetch(`/api/catalog/products/${encodeURIComponent(sanphamid)}/variants${qs}`);
  return { raw: res, variants: normalizeList(res) };
}

export async function adminCreateVariant(sanphamid, fields = {}) {
  const fd = buildFormData(fields, "image");
  const res = await apiFetch(`/api/catalog/products/${encodeURIComponent(sanphamid)}/variants`, {
    method: "POST",
    body: fd,
  });
  return res?.variant ?? res;
}

export async function adminUpdateVariant(bentheid, fields = {}) {
  const fd = buildFormData(fields, "image");
  const res = await apiFetch(`/api/catalog/variants/${encodeURIComponent(bentheid)}`, {
    method: "PUT",
    body: fd,
  });
  return res?.variant ?? res;
}

// ----------------------------
// Promotions
// ----------------------------

export async function adminListPromotions() {
  const res = await apiFetch(`/api/promotions/admin/all`);
  return { raw: res, promotions: normalizeList(res) };
}

export async function adminCreatePromotion(body) {
  const res = await apiFetch(`/api/promotions`, {
    method: "POST",
    body,
  });
  return res?.promotion ?? res;
}

export async function adminUpdatePromotion(khuyenmaiid, body) {
  const res = await apiFetch(`/api/promotions/${encodeURIComponent(khuyenmaiid)}`, {
    method: "PUT",
    body,
  });
  return res?.promotion ?? res;
}

export async function adminAttachPromotionProduct(khuyenmaiid, sanphamid) {
  return apiFetch(`/api/promotions/${encodeURIComponent(khuyenmaiid)}/products`, {
    method: "POST",
    body: { sanphamid },
  });
}

export async function adminDetachPromotionProduct(khuyenmaiid, sanphamid) {
  return apiFetch(
    `/api/promotions/${encodeURIComponent(khuyenmaiid)}/products/${encodeURIComponent(sanphamid)}`,
    { method: "DELETE" }
  );
}

export async function publicGetPromotionDetail(khuyenmaiid) {
  const res = await apiFetch(`/api/promotions/${encodeURIComponent(khuyenmaiid)}`, {
    method: "GET",
    auth: false,
  });
  return res?.promotion ?? res;
}

// ----------------------------
// Reviews (Public)
// ----------------------------

export async function publicGetReviewsByVariant(bentheid, { limit = 1, offset = 0 } = {}) {
  const qs = toQuery({ limit, offset });
  const res = await apiFetch(`/api/reviews/variant/${encodeURIComponent(bentheid)}${qs}`, {
    method: "GET",
    auth: false,
  });

  const summary = res?.summary ?? res?.data?.summary ?? res?.result?.summary ?? null;

  return {
    raw: res,
    summary,
    reviews: normalizeList(res),
  };
}
