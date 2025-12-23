import { apiFetch } from "./apiClient";

// =====================
// AUTH / USER
// =====================

export const authApi = {
  // POST /api/auth/login { identifier, matkhau }
  login: (identifier, matkhau) =>
    apiFetch("/api/auth/login", {
      method: "POST",
      body: { identifier, matkhau },
    }),

  // POST /api/auth/register {...}
  register: (payload) =>
    apiFetch("/api/auth/register", {
      method: "POST",
      body: payload,
    }),

  // POST /api/auth/logout { refreshToken }
  logout: (refreshToken) =>
    apiFetch("/api/auth/logout", {
      method: "POST",
      body: { refreshToken },
    }),
};

export const userApi = {
  // GET /api/users/me
  me: () => apiFetch("/api/users/me"),

  // PUT /api/users/me
  updateMe: (payload) =>
    apiFetch("/api/users/me", {
      method: "PUT",
      body: payload,
    }),

  // PUT /api/users/me/password { oldPassword, newPassword }
  changePassword: (oldPassword, newPassword) =>
    apiFetch("/api/users/me/password", {
      method: "PUT",
      body: { oldPassword, newPassword },
    }),
};

// =====================
// CATALOG (PUBLIC)
// =====================

export const catalogApi = {
  // GET /api/catalog/products/:sanphamid
  product: (sanphamid) =>
    apiFetch(`/api/catalog/products/${encodeURIComponent(sanphamid)}`, {
      auth: false,
    }),

  // GET /api/catalog/products/:sanphamid/variants
  variantsByProduct: (sanphamid) =>
    apiFetch(`/api/catalog/products/${encodeURIComponent(sanphamid)}/variants`, {
      auth: false,
    }),
};

export const variantApi = {
  // GET /api/variants/:bentheid/attributes
  attributes: (bentheid) =>
    apiFetch(`/api/variants/${encodeURIComponent(bentheid)}/attributes`, {
      auth: false,
    }),
};

export const reviewApi = {
  // GET /api/reviews/variant/:bentheid
  byVariant: (bentheid) =>
    apiFetch(`/api/reviews/variant/${encodeURIComponent(bentheid)}`, {
      auth: false,
    }),
};

// =====================
// CART (AUTH)
// =====================

export const cartApi = {
  // GET /api/cart
  get: () => apiFetch("/api/cart"),

  // POST /api/cart/items { bentheid, soluong }
  addItem: (bentheid, soluong) =>
    apiFetch("/api/cart/items", {
      method: "POST",
      body: { bentheid, soluong },
    }),

  // PUT /api/cart/items/:bentheid { soluong }
  updateItem: (bentheid, soluong) =>
    apiFetch(`/api/cart/items/${encodeURIComponent(bentheid)}`, {
      method: "PUT",
      body: { soluong },
    }),

  // Alias để tương thích nơi khác
  setItemQuantity: (bentheid, soluong) => cartApi.updateItem(bentheid, soluong),

  // DELETE /api/cart/items/:bentheid
  removeItem: (bentheid) =>
    apiFetch(`/api/cart/items/${encodeURIComponent(bentheid)}`, {
      method: "DELETE",
    }),

  // DELETE /api/cart/clear
  clear: () => apiFetch("/api/cart/clear", { method: "DELETE" }),
};
