// src/lib/checkoutSelection.js
// Store selected cart items for partial checkout.

const KEY = "checkout_items";

export function saveCheckoutItems(items) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(items || []));
  } catch {
    // ignore
  }
}

export function loadCheckoutItems() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.sessionStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function clearCheckoutItems() {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
