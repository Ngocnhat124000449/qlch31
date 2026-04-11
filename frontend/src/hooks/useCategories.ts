"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiClient";
import { normalizeCategoryList } from "@/lib/catalogNormalize";

export function useCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);

        // bắt buộc dùng apiFetch để nó đi đúng baseURL backend (5001)
        const data = await apiFetch("/api/catalog/categories", {
          method: "GET",
        });

        if (!alive) return;
        setCategories(normalizeCategoryList(data));
      } catch {
        if (!alive) return;
        setCategories([]);
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  return { categories, loading };
}
