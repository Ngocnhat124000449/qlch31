// src/lib/apiClient.js
import { getAccessToken } from "@/lib/tokens";

const DEFAULT_BASE =
  process.env.NODE_ENV === "development" ? "http://localhost:5001" : "";

export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || DEFAULT_BASE;

function joinUrl(base, path) {
  if (!path) return base || "";
  if (/^https?:\/\//i.test(path)) return path;
  if (!base) return path; // nếu bạn có rewrite proxy thì OK
  const b = base.endsWith("/") ? base.slice(0, -1) : base;
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${b}${p}`;
}

function isFormData(v) {
  return typeof FormData !== "undefined" && v instanceof FormData;
}

function shouldJsonStringify(body) {
  if (body == null) return false;
  if (typeof body === "string") return false;
  if (isFormData(body)) return false;
  if (body instanceof Blob) return false;
  if (body instanceof ArrayBuffer) return false;
  return typeof body === "object";
}

function pickMessage(data, fallback) {
  if (!data) return fallback;
  if (typeof data === "string") return data;
  return data.message || data.error || fallback;
}

export async function apiFetch(path, init = {}) {
  const url = joinUrl(API_BASE, path);

  const method = (init.method || "GET").toUpperCase();
  const headers = { ...(init.headers || {}) };

  // body
  let body = init.body;
  if (shouldJsonStringify(body)) {
    body = JSON.stringify(body);
    if (!headers["Content-Type"]) headers["Content-Type"] = "application/json";
  }

  // auth header
  const auth = init.auth !== false; // mặc định true
  if (auth) {
    const token = getAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  // NOTE: Many of our API endpoints (including /users/me) should not be cached.
  // In devtools you may see 304 (Not Modified) when the browser sends a
  // conditional request (ETag). `fetch()` treats 304 as non-ok, which then
  // breaks auth guards (they think the user is guest).
  // Default to `no-store` to avoid 304 and keep auth state stable.
  const res = await fetch(url, {
    cache: "no-store",
    ...init,
    method,
    headers,
    body,
  });

  // parse response
  const contentType = res.headers.get("content-type") || "";
  let data = null;

  if (res.status !== 204) {
    if (contentType.includes("application/json")) {
      data = await res.json().catch(() => null);
    } else {
      data = await res.text().catch(() => null);
    }
  }

  if (!res.ok) {
    const err = new Error(pickMessage(data, "API error"));
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}
