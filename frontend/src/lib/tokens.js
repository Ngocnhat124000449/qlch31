// src/lib/tokens.js
const ACCESS_KEY = "qc_access_token";
const REFRESH_KEY = "qc_refresh_token";
// Primary auth event used by the app
const AUTH_EVENT = "qc:auth";
// Legacy event used in a few components
const LEGACY_AUTH_EVENT = "auth:changed";

// Legacy storage keys used by older UI code
const LEGACY_ACCESS_KEY = "accessToken";
const LEGACY_REFRESH_KEY = "refreshToken";

function isBrowser() {
  return typeof window !== "undefined";
}

export function getAccessToken() {
  if (!isBrowser()) return null;
  return (
    window.localStorage.getItem(ACCESS_KEY) ||
    window.localStorage.getItem(LEGACY_ACCESS_KEY)
  );
}

export function getRefreshToken() {
  if (!isBrowser()) return null;
  return (
    window.localStorage.getItem(REFRESH_KEY) ||
    window.localStorage.getItem(LEGACY_REFRESH_KEY)
  );
}

export function notifyAuthChanged() {
  if (!isBrowser()) return;
  window.dispatchEvent(new Event(AUTH_EVENT));
  window.dispatchEvent(new Event(LEGACY_AUTH_EVENT));
}

export function setTokens(accessToken, refreshToken) {
  if (!isBrowser()) return;
  if (accessToken) window.localStorage.setItem(ACCESS_KEY, accessToken);
  if (refreshToken) window.localStorage.setItem(REFRESH_KEY, refreshToken);

  // also keep legacy keys for compatibility (optional)
  if (accessToken) window.localStorage.setItem(LEGACY_ACCESS_KEY, accessToken);
  if (refreshToken)
    window.localStorage.setItem(LEGACY_REFRESH_KEY, refreshToken);

  // báo cho toàn app cập nhật trạng thái đăng nhập
  notifyAuthChanged();
}

export function clearTokens() {
  if (!isBrowser()) return;
  window.localStorage.removeItem(ACCESS_KEY);
  window.localStorage.removeItem(REFRESH_KEY);

  // legacy cleanup
  window.localStorage.removeItem(LEGACY_ACCESS_KEY);
  window.localStorage.removeItem(LEGACY_REFRESH_KEY);

  notifyAuthChanged();
}

export function hasTokens() {
  return !!getAccessToken();
}

export function onAuthChanged(handler) {
  if (!isBrowser()) return () => {};
  window.addEventListener(AUTH_EVENT, handler);
  window.addEventListener(LEGACY_AUTH_EVENT, handler);
  return () => {
    window.removeEventListener(AUTH_EVENT, handler);
    window.removeEventListener(LEGACY_AUTH_EVENT, handler);
  };
}
