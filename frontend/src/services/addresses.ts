// src/services/addresses.js
import { apiFetch } from "@/lib/apiClient";

export function getMyAddresses() {
  return apiFetch("/api/addresses"); // GET
}

export function getMyAddressDetail(diachiuserid) {
  return apiFetch(`/api/addresses/${diachiuserid}`);
}

export function createAddress(payload) {
  return apiFetch("/api/addresses", { method: "POST", body: payload });
}

export function updateAddress(diachiuserid, payload) {
  return apiFetch(`/api/addresses/${diachiuserid}`, {
    method: "PUT",
    body: payload,
  });
}

export function deleteAddress(diachiuserid) {
  return apiFetch(`/api/addresses/${diachiuserid}`, { method: "DELETE" });
}
