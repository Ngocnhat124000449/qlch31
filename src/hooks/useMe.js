// src/hooks/useMe.js
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { apiFetch } from "@/lib/apiClient";
import { clearTokens, hasTokens, onAuthChanged } from "@/lib/tokens";

export function useMe() {
  const [me, setMe] = useState(null);
  const [status, setStatus] = useState(hasTokens() ? "loading" : "guest");
  // status: "guest" | "loading" | "auth"

  const abortRef = useRef(null);

  const fetchMe = useCallback(async () => {
    if (!hasTokens()) {
      setMe(null);
      setStatus("guest");
      return null;
    }

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

      setMe(data || null);
      setStatus(data ? "auth" : "guest");
      return data;
    } catch (err) {
      // nếu token sai/hết hạn => về guest
      if (err?.status === 401 || err?.status === 403) {
        clearTokens();
      }
      setMe(null);
      setStatus("guest");
      return null;
    }
  }, []);

  useEffect(() => {
    fetchMe();
    const off = onAuthChanged(() => fetchMe());
    return () => {
      off?.();
      if (abortRef.current) abortRef.current.abort();
    };
  }, [fetchMe]);

  return { me, status, refresh: fetchMe };
}
