import { apiFetch } from "./apiClient";

export const authApi = {
  // POST /api/auth/login { identifier, matkhau }
  login: (identifier, matkhau) =>
    apiFetch("/api/auth/login", {
      method: "POST",
      body: { identifier, matkhau },
    }),

  // POST /api/auth/register {...}:contentReference[oaicite:10]{index=10}
  register: (payload) =>
    apiFetch("/api/auth/register", { method: "POST", body: payload }),

  // POST /api/auth/logout { refreshToken }:contentReference[oaicite:11]{index=11}
  logout: (refreshToken) =>
    apiFetch("/api/auth/logout", { method: "POST", body: { refreshToken } }),
};

export const userApi = {
  // GET /api/users/me:contentReference[oaicite:12]{index=12}
  me: () => apiFetch("/api/users/me"),

  // PUT /api/users/me:contentReference[oaicite:13]{index=13}
  updateMe: (payload) =>
    apiFetch("/api/users/me", { method: "PUT", body: payload }),

  // PUT /api/users/me/password { oldPassword, newPassword }:contentReference[oaicite:14]{index=14}
  changePassword: (oldPassword, newPassword) =>
    apiFetch("/api/users/me/password", {
      method: "PUT",
      body: { oldPassword, newPassword },
    }),
};

export const catalogApi = {
  product: (sanphamid) => apiFetch(`/api/catalog/products/${sanphamid}`),
  variantsByProduct: (sanphamid) =>
    apiFetch(`/api/catalog/products/${sanphamid}/variants`),
};

export const variantApi = {
  attributes: (bentheid) => apiFetch(`/api/variants/${bentheid}/attributes`),
};

export const reviewApi = {
  byVariant: (bentheid) => apiFetch(`/api/reviews/variant/${bentheid}`),
};

export const cartApi = {
  // GET /api/cart:contentReference[oaicite:15]{index=15}
  get: () => apiFetch("/api/cart"),

  // POST /api/cart/items { bentheid, soluong }
  addItem: (bentheid, soluong) =>
    apiFetch("/api/cart/items", {
      method: "POST",
      body: { bentheid, soluong },
    }),

  // PUT /api/cart/items/:giohangchitietid { soluong }
  updateItem: (giohangchitietid, soluong) =>
    apiFetch(`/api/cart/items/${giohangchitietid}`, {
      method: "PUT",
      body: { soluong },
    }),

  // DELETE /api/cart/items/:giohangchitietid
  removeItem: (giohangchitietid) =>
    apiFetch(`/api/cart/items/${giohangchitietid}`, { method: "DELETE" }),

  // DELETE /api/cart/clear
  clear: () => apiFetch("/api/cart/clear", { method: "DELETE" }),
};
