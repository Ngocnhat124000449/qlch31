// src/lib/publicApi.js
// Helper fetch cho các Server Components (public endpoints).
// - Ưu tiên NEXT_PUBLIC_API_BASE (đang dùng trong apiClient/homeApi)
// - Fallback NEXT_PUBLIC_API_BASE_URL (trong server-api.js cũ)
// - Dev fallback: http://localhost:5001

const DEV_FALLBACK = "http://localhost:5001";

export function getPublicApiBase() {
  const raw =
    process.env.NEXT_PUBLIC_API_BASE ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    (process.env.NODE_ENV === "development" ? DEV_FALLBACK : "");

  return String(raw || "").replace(/\/$/, "");
}

function joinUrl(base, path) {
  if (!path) return base || "";
  if (/^https?:\/\//i.test(path)) return path;
  if (!base) return path; // nếu dự án có rewrite/proxy thì vẫn OK
  const b = base.endsWith("/") ? base.slice(0, -1) : base;
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${b}${p}`;
}

function pickMessage(data, fallback) {
  if (!data) return fallback;
  if (typeof data === "string") return data;
  return data.message || data.error || fallback;
}

/**
 * publicFetchJson()
 * - dùng cho API public (không cần token)
 * - default cache: no-store để tránh dữ liệu cũ khi dev
 */
export async function publicFetchJson(path, init = {}) {
  const base = getPublicApiBase();
  const url = joinUrl(base, path);

  const res = await fetch(url, {
    ...init,
    headers: {
      ...(init.headers || {}),
      "Content-Type": "application/json",
    },
    cache: init.cache ?? "no-store",
  });

  const contentType = res.headers.get("content-type") || "";
  const data =
    res.status === 204
      ? null
      : contentType.includes("application/json")
      ? await res.json().catch(() => null)
      : await res.text().catch(() => null);

  if (!res.ok) {
    const err = new Error(pickMessage(data, "API error"));
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}
