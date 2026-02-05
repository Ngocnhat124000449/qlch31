"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import CategoryMegaPanel from "@/components/home/CategoryMegaPanel";
import { getCategoryHoverData } from "@/lib/categoryMenuApi";

function getCatId(cat) {
  return cat?.danhmucid ?? cat?.id ?? cat?._id ?? null;
}
function getCatName(cat) {
  return cat?.ten ?? cat?.name ?? cat?.tendanhmuc ?? "Danh mục";
}

export default function CategorySidebar({ categories = [] }) {
  const [activeId, setActiveId] = useState(null);
  const [open, setOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [vendors, setVendors] = useState([]);
  const [hotProducts, setHotProducts] = useState([]);
  const [newProducts, setNewProducts] = useState([]);

  // cache để hover lại không gọi API nữa
  const cacheRef = useRef(new Map());

  // delay close để rê chuột sang panel không bị tắt
  const closeTimer = useRef(null);

  const cats = useMemo(() => categories || [], [categories]);

  async function loadData(catId) {
    if (!catId) return;

    // cache hit
    const cached = cacheRef.current.get(catId);
    if (cached) {
      setVendors(cached.vendors);
      setHotProducts(cached.hotProducts);
      setNewProducts(cached.newProducts);
      setError(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(false);
    try {
      const data = await getCategoryHoverData(catId);
      cacheRef.current.set(catId, data);
      setVendors(data.vendors || []);
      setHotProducts(data.hotProducts || []);
      setNewProducts(data.newProducts || []);
    } catch {
      setError(true);
      setVendors([]);
      setHotProducts([]);
      setNewProducts([]);
    } finally {
      setLoading(false);
    }
  }

  function onEnterCat(catId) {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
    setActiveId(catId);
    loadData(catId);
  }

  function onLeaveAll() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => {
      setOpen(false);
    }, 180);
  }

  function onEnterPanel() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  }

  function onLeavePanel() {
    onLeaveAll();
  }

  // auto chọn category đầu tiên (để panel có dữ liệu khi hover nhanh)
  useEffect(() => {
    if (!cats.length) return;
    const firstId = getCatId(cats[0]);
    setActiveId(firstId);
  }, [cats]);

  return (
    <div
      className="relative rounded-2xl border border-border bg-muted/40 dark:bg-muted/30 dark:bg-slate-950/40 p-4"
      onMouseLeave={onLeaveAll}
    >
      <div className="space-y-2">
        {cats.map((c) => {
          const id = getCatId(c);
          const name = getCatName(c);
          const active = String(id) === String(activeId);

          return (
            <Link
              key={String(id ?? name)}
              href={id ? `/categories/${id}` : "/categories"}
              onMouseEnter={() => onEnterCat(id)}
              className={[
                "flex items-center justify-between rounded-xl px-3 py-3 text-foreground",
                active ? "bg-muted/50" : "hover:bg-card",
              ].join(" ")}
            >
              <span className="text-sm font-medium">{name}</span>
              <span className="text-muted-foreground">{">"}</span>
            </Link>
          );
        })}
      </div>

      <CategoryMegaPanel
        open={open}
        loading={loading}
        error={error}
        vendors={vendors}
        hotProducts={hotProducts}
        newProducts={newProducts}
        onEnter={onEnterPanel}
        onLeave={onLeavePanel}
      />
    </div>
  );
}
