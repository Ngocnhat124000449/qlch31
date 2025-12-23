"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { apiFetch } from "@/lib/apiClient";
import { usePopups } from "@/components/popups/PopupProvider";

function useDebounce(value, delay = 250) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

export default function SearchDialog({ open, onOpenChange }) {
  const { openQuickView } = usePopups();
  const [q, setQ] = useState("");
  const dq = useDebounce(q, 250);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const canSearch = useMemo(() => dq.trim().length >= 2, [dq]);

  useEffect(() => {
    if (!open) return;
    setQ("");
    setItems([]);
  }, [open]);

  useEffect(() => {
    if (!open || !canSearch) return;

    let alive = true;
    setLoading(true);

    apiFetch(`/api/catalog/products?q=${encodeURIComponent(dq.trim())}`, {
      method: "GET",
      auth: false,
    })
      .then((data) => {
        if (!alive) return;
        const list = Array.isArray(data)
          ? data
          : data?.products || data?.items || data?.data || [];
        setItems(list);
      })
      .catch(() => alive && setItems([]))
      .finally(() => alive && setLoading(false));

    return () => {
      alive = false;
    };
  }, [open, dq, canSearch]);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Search products..."
        value={q}
        onValueChange={setQ}
      />
      <CommandList>
        <CommandEmpty>
          {loading ? "Đang tìm..." : "Không tìm thấy."}
        </CommandEmpty>

        <CommandGroup heading="Sản phẩm">
          {items.map((p) => (
            <CommandItem
              key={p.sanphamid || p.id}
              onSelect={() => {
                onOpenChange(false);
                const id = p.sanphamid || p.id;
                if (id) openQuickView(id);
              }}
            >
              {p.tensanpham || p.ten || "—"}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
