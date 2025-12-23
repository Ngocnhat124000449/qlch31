// src/lib/tokens.js
const ACCESS_KEY = "qc_access_token";
const REFRESH_KEY = "qc_refresh_token";
const AUTH_EVENT = "qc:auth";

function isBrowser() {
  return typeof window !== "undefined";
}

export function getAccessToken() {
  if (!isBrowser()) return null;
  return window.localStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken() {
  if (!isBrowser()) return null;
  return window.localStorage.getItem(REFRESH_KEY);
}

export function setTokens(accessToken, refreshToken) {
  if (!isBrowser()) return;
  if (accessToken) window.localStorage.setItem(ACCESS_KEY, accessToken);
  if (refreshToken) window.localStorage.setItem(REFRESH_KEY, refreshToken);

  // báo cho toàn app cập nhật trạng thái đăng nhập
  window.dispatchEvent(new Event(AUTH_EVENT));
}

export function clearTokens() {
  if (!isBrowser()) return;
  window.localStorage.removeItem(ACCESS_KEY);
  window.localStorage.removeItem(REFRESH_KEY);

  window.dispatchEvent(new Event(AUTH_EVENT));
}

export function hasTokens() {
  return !!getAccessToken();
}

export function onAuthChanged(handler) {
  if (!isBrowser()) return () => {};
  window.addEventListener(AUTH_EVENT, handler);
  return () => window.removeEventListener(AUTH_EVENT, handler);
}
