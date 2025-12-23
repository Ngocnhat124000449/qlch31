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

function useDebounce(value, delay = 250) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

export default function SearchDialog({ open, onOpenChange }) {
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

    // TODO: đổi endpoint cho đúng backend bạn
    apiFetch(`/api/catalog/products?q=${encodeURIComponent(dq.trim())}`)
      .then((data) => {
        if (!alive) return;
        const list = Array.isArray(data) ? data : data?.items || [];
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
                // bạn có thể router.push(`/products/${p.sanphamid}`)
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
