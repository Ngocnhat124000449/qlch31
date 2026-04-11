"use client";
import styles from "./CategoriesDropdown.module.scss";

/**
 * CategoriesDropdown (Header)
 * - Menu danh mục ở thanh header.
 * - Mở bằng hover (có fallback click) và hiển thị Mega Panel giống CategorySidebar.
 * - Khi hover vào từng danh mục: gọi getCategoryHoverData() và cache kết quả để hover lại không gọi API.
 */

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

import { useCategories } from "@/hooks/useCategories";
import CategoryMegaPanel from "@/components/home/CategoryMegaPanel";
import { getCategoryHoverData } from "@/lib/categoryMenuApi";

function getCatId(cat) {
  return cat?.danhmucid ?? cat?.id ?? cat?._id ?? null;
}

function getCatName(cat) {
  return cat?.ten ?? cat?.name ?? cat?.tendanhmuc ?? "Danh mục";
}

export default function CategoriesDropdown({ active = false }) {
  const { categories, loading: catsLoading } = useCategories();
  const cats = useMemo(() => categories || [], [categories]);

  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [vendors, setVendors] = useState([]);
  const [hotProducts, setHotProducts] = useState([]);
  const [newProducts, setNewProducts] = useState([]);

  // cache để hover lại không gọi API nữa
  const cacheRef = useRef(new Map());

  // delay close để rê chuột sang panel không bị tắt
  const closeTimer = useRef(null);

  async function loadData(catId) {
    if (!catId) return;

    // cache hit
    const cached = cacheRef.current.get(catId);
    if (cached) {
      setVendors(cached.vendors || []);
      setHotProducts(cached.hotProducts || []);
      setNewProducts(cached.newProducts || []);
      setError(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(false);
    try {
      const data = await getCategoryHoverData(catId, {
        vendorLimit: 12,
        hotLimit: 6,
        newLimit: 6,
        sampleLimitForVendors: 60,
      });

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

  function openMenu() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);

    // đảm bảo có activeId để panel có dữ liệu ngay
    const firstId = getCatId(cats[0]);
    const nextId = activeId ?? firstId;
    if (nextId && String(nextId) !== String(activeId)) {
      setActiveId(nextId);
    }

    // nếu chưa có cache cho active thì load trước
    if (nextId && !cacheRef.current.get(nextId)) {
      loadData(nextId);
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

  // auto chọn category đầu tiên (để panel có dữ liệu khi mở nhanh)
  useEffect(() => {
    if (!cats.length) return;
    const firstId = getCatId(cats[0]);
    setActiveId(firstId);
  }, [cats]);

  // cleanup timer
  useEffect(() => {
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, []);

  return (
    <div className={styles.wrapper} onMouseLeave={onLeaveAll}>
      <button
        type="button"
        onMouseEnter={openMenu}
        onClick={() => setOpen((v) => !v)} // fallback cho thiết bị không hover
        className={[styles.trigger, active && styles.active].filter(Boolean).join(" ")}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        Categories <ChevronDown />
      </button>

      {open ? (
        <div
          className={styles.dropdownWrap}
          onMouseEnter={openMenu}
        >
          {/* Container relative để CategoryMegaPanel định vị absolute (left-[280px], top-0) */}
          <div className={styles.dropdownInner}>
            {/* Cột trái: danh mục */}
            <div className={styles.leftCol}>
              {catsLoading ? (
                <div className={styles.emptyState}>
                  Đang tải danh mục...
                </div>
              ) : cats.length ? (
                <div className={styles.catList}>
                  {cats.map((c) => {
                    const id = getCatId(c);
                    const name = getCatName(c);
                    const isActive = String(id) === String(activeId);

                    return (
                      <div
                        key={String(id ?? name)}
                        onMouseEnter={() => onEnterCat(id)}
                        className={[
                          styles.catItem,
                          isActive && styles.activeItem,
                        ].filter(Boolean).join(" ")}
                      >
                        <Link
                          href={id ? `/categories/${id}` : "/categories"}
                          className={styles.catLink}
                          onClick={() => setOpen(false)}
                        >
                          <span className="truncate">{name}</span>
                          <span className={styles.iconArrow}>{">"}</span>
                        </Link>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className={styles.emptyState}>
                  Chưa có danh mục
                </div>
              )}
            </div>

            {/* Cột phải: panel (vendors/hot/new) */}
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
        </div>
      ) : null}
    </div>
  );
}
