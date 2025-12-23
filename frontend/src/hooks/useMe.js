// src/hooks/useMe.js
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { apiFetch } from "@/lib/apiClient";
import { clearTokens, hasTokens, onAuthChanged } from "@/lib/tokens";

// Module-level cache to avoid auth UI flicker across client navigations.
// Notes:
// - On the server, we can't read localStorage, so we always start in "loading".
// - On the client, once we have fetched /users/me successfully, we reuse the
//   cached user so headers/guards don't briefly render as "guest".
let CACHED_ME = null;
let CACHED_STATUS = "loading"; // "guest" | "loading" | "auth"

export function useMe() {
  const [me, setMe] = useState(() => CACHED_ME);
  const [status, setStatus] = useState(() => CACHED_STATUS);
  // status: "guest" | "loading" | "auth"

  const abortRef = useRef(null);

  const fetchMe = useCallback(async () => {
    // IMPORTANT: never decide "guest" during SSR.
    // We only check localStorage on the client, inside effects/callbacks.
    if (!hasTokens()) {
      CACHED_ME = null;
      CACHED_STATUS = "guest";
      setMe(null);
      setStatus("guest");
      return null;
    }

    CACHED_STATUS = "loading";
    setStatus("loading");

    // abort previous
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const data = await apiFetch("/api/users/me", {
        method: "GET",
        signal: controller.signal,
      });

      // Backend may return { user: {...} } (preferred) or other wrappers.
      const user =
        data?.user ??
        data?.data?.user ??
        data?.profile ??
        data?.me ??
        data ??
        null;

      CACHED_ME = user;
      CACHED_STATUS = user ? "auth" : "guest";
      setMe(user);
      setStatus(user ? "auth" : "guest");
      return user;
    } catch (err) {
      // If the request was aborted (component unmount / new request),
      // ignore it. Aborts are normal in Next dev mode and should NOT
      // flip auth state to "guest" (otherwise dashboard can redirect).
      if (err?.name === "AbortError") {
        return null;
      }

      // nếu token sai/hết hạn => về guest
      if (err?.status === 401 || err?.status === 403) {
        clearTokens();
      }

      CACHED_ME = null;
      CACHED_STATUS = "guest";
      setMe(null);
      setStatus("guest");
      return null;
    }
  }, []);

  useEffect(() => {
    // Always start in loading on the client; then resolve to guest/auth.
    // This avoids a SSR-initialized "guest" state that can trigger
    // incorrect redirects before /me finishes.
    if (CACHED_STATUS === "loading") {
      setStatus("loading");
    }
    fetchMe();
    const off = onAuthChanged(() => fetchMe());
    return () => {
      off?.();
      if (abortRef.current) abortRef.current.abort();
    };
  }, [fetchMe]);

  return { me, status, loading: status === "loading", refresh: fetchMe };
}
