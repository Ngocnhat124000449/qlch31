// src/services/auth.js
import { apiFetch } from "@/lib/apiClient";

export function login({ identifier, matkhau }) {
  return apiFetch("/api/auth/login", {
    method: "POST",
    auth: false,
    body: { identifier, matkhau },
  });
}

export function register(payload) {
  return apiFetch("/api/auth/register", {
    method: "POST",
    auth: false,
    body: payload,
  });
}

export function logout({ refreshToken }) {
  return apiFetch("/api/auth/logout", {
    method: "POST",
    auth: false,
    body: { refreshToken },
  });
}
