// src/hooks/useMe.js
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { apiFetch } from "@/lib/apiClient";
import { clearTokens, hasTokens, onAuthChanged } from "@/lib/tokens";

// Module-level cache to avoid auth UI flicker across client navigations.
let CACHED_ME = null;
let CACHED_STATUS = "loading"; // "guest" | "loading" | "auth"
let FETCH_IN_PROGRESS = false;
let HAS_INITIAL_FETCH = false; // Track if initial fetch completed

export function useMe() {
  const [me, setMe] = useState(() => CACHED_ME);
  const [status, setStatus] = useState(() => CACHED_STATUS);

  const abortRef = useRef(null);
  const isMountedRef = useRef(true);

  const fetchMe = useCallback(async (force = false) => {
    // Tránh fetch đồng thời nếu đang fetch (trừ khi force)
    if (FETCH_IN_PROGRESS && !force) {
      return;
    }

    // Không có token = guest
    if (!hasTokens()) {
      CACHED_ME = null;
      CACHED_STATUS = "guest";
      if (isMountedRef.current) {
        setMe(null);
        setStatus("guest");
      }
      HAS_INITIAL_FETCH = true;
      return null;
    }

    FETCH_IN_PROGRESS = true;

    // Nếu lần đầu, set loading
    if (!HAS_INITIAL_FETCH) {
      CACHED_STATUS = "loading";
      if (isMountedRef.current) {
        setStatus("loading");
      }
    }

    // Abort previous request
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const data = await apiFetch("/api/users/me", {
        method: "GET",
        signal: controller.signal,
      });

      // Extract user từ response
      const user =
        data?.user ??
        data?.data?.user ??
        data?.profile ??
        data?.me ??
        data ??
        null;

      CACHED_ME = user;
      CACHED_STATUS = user ? "auth" : "guest";

      if (isMountedRef.current) {
        setMe(user);
        setStatus(user ? "auth" : "guest");
      }

      HAS_INITIAL_FETCH = true;
      return user;
    } catch (err) {
      // Abort không phải lỗi thực sự
      if (err?.name === "AbortError") {
        return null;
      }

      // Token hết hạn → logout
      if (err?.status === 401 || err?.status === 403) {
        clearTokens();
      }

      CACHED_ME = null;
      CACHED_STATUS = "guest";

      if (isMountedRef.current) {
        setMe(null);
        setStatus("guest");
      }

      HAS_INITIAL_FETCH = true;
      return null;
    } finally {
      FETCH_IN_PROGRESS = false;
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;

    // Chỉ fetch lần đầu hoặc khi component mount
    if (!HAS_INITIAL_FETCH) {
      if (CACHED_STATUS === "loading") {
        setStatus("loading");
      }
      fetchMe();
    } else {
      // Nếu đã fetch trước đó, sync state từ cache
      setMe(CACHED_ME);
      setStatus(CACHED_STATUS);
    }

    // Lắng nghe auth change (logout, token expiry, etc)
    const off = onAuthChanged(() => {
      // Force refetch khi token thay đổi
      fetchMe(true);
    });

    return () => {
      isMountedRef.current = false;
      off?.();
      if (abortRef.current) abortRef.current.abort();
    };
  }, []); // Empty dependency - chỉ run mount

  return { me, status, loading: status === "loading", refresh: fetchMe };
}
