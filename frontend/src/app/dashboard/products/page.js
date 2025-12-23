"use client";

import { useEffect, useMemo, useState } from "react";
import { Pencil, Trash2, Search } from "lucide-react";
import {
  adminListProducts,
  adminListVariantsByProduct,
  adminUpdateProduct,
  formatApiError,
  formatMoneyVND,
  toNumber,
} from "@/lib/adminApi";
import SmartImage from "@/components/ui/SmartImage";
import ProductUpsertDialog from "@/components/admin/modals/ProductUpsertDialog";
import ConfirmDialog from "@/components/admin/modals/ConfirmDialog";

function statusLabel(v) {
  const on = v === true || String(v).toLowerCase() === "true";
  return on ? "Hoạt động" : "Không hoạt động";
}

function pickFirstImage(p) {
  return p?.hinhanhurl || p?.imageUrl || p?.logo || "";
}

export default function ProductsPage() {
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rows, setRows] = useState([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState(null);

  const limit = 20;

  async function loadProducts() {
    setLoading(true);
    setError("");
    try {
      const { products } = await adminListProducts({ all: true, page, limit, q: q.trim() || undefined });
      const list = Array.isArray(products) ? products : [];

      // Fetch variants for displayed products to compute stock & min price
      const variantResults = await Promise.all(
        list.map(async (p) => {
          const id = p?.sanphamid ?? p?.id;
          if (id == null) return { id, variants: [] };
          try {
            const { variants } = await adminListVariantsByProduct(id, { all: true });
            return { id, variants: Array.isArray(variants) ? variants : [] };
          } catch {
            return { id, variants: [] };
          }
        })
      );

      const map = new Map(variantResults.map((r) => [String(r.id), r.variants]));

      const enriched = list.map((p) => {
        const id = p?.sanphamid ?? p?.id;
        const variants = map.get(String(id)) || [];

        const stock = variants.reduce((sum, v) => sum + toNumber(v?.tonkho), 0);
        const prices = variants.map((v) => toNumber(v?.giaban)).filter((n) => n > 0);
        const minPrice = prices.length ? Math.min(...prices) : 0;
        const sku = variants.find((v) => v?.sku)?.sku || p?.tenviettat || String(id);

        return { ...p, __stock: stock, __minPrice: minPrice, __sku: sku };
      });

      setRows(enriched);
    } catch (e) {
      setError(e?.message || "Không thể tải sản phẩm");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!mounted) return;
      await loadProducts();
    })();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, q]);

  async function handleDisable() {
    const t = confirmTarget;
    const id = t?.sanphamid ?? t?.id;
    if (id == null || confirmLoading) return;
    setConfirmLoading(true);
    setError("");
    try {
      await adminUpdateProduct(id, { trangthai: false });
      setConfirmOpen(false);
      setConfirmTarget(null);
      loadProducts();
    } catch (e) {
      setError(formatApiError(e));
    } finally {
      setConfirmLoading(false);
    }
  }

  const canPrev = page > 1;
  const canNext = rows.length === limit; // heuristic

  const title = useMemo(() => (q.trim() ? `Kết quả tìm kiếm: “${q.trim()}”` : "Danh sách sản phẩm"), [q]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-xl font-semibold">{title}</div>
          <div className="text-sm text-white/55">Dữ liệu lấy từ API /api/catalog/products (admin all=1).</div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2 ring-1 ring-white/10">
            <Search className="h-4 w-4 text-white/60" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tìm theo tên/slug…"
              className="w-56 bg-transparent text-sm outline-none placeholder:text-white/40"
            />
          </div>
          <button
            className="relative inline-flex items-center rounded-full p-[1px]"
            type="button"
            onClick={() => {
              setEditing(null);
              setModalOpen(true);
            }}
          >
            <span className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-pink-500" />
            <span
              className="relative rounded-full bg-[#0b1020] px-4 py-2 text-sm font-medium ring-1 ring-white/10"
            >
              ＋ Thêm sản phẩm
            </span>
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
        <div className="grid grid-cols-10 gap-3 px-5 py-3 text-xs text-white/55">
          <div>Ảnh</div>
          <div className="col-span-2">Tên sản phẩm</div>
          <div>SKU</div>
          <div>Danh mục</div>
          <div>Nhà cung cấp</div>
          <div>Giá (min)</div>
          <div className="text-center">Tồn kho</div>
          <div className="text-center">Trạng thái</div>
          <div className="text-right">Hành động</div>
        </div>

        <div className="divide-y divide-white/10">
          {loading ? (
            <div className="px-5 py-6 text-sm text-white/60">Đang tải…</div>
          ) : rows.length === 0 ? (
            <div className="px-5 py-6 text-sm text-white/60">{error || "Chưa có sản phẩm."}</div>
          ) : (
            rows.map((r) => {
              const id = r?.sanphamid ?? r?.id;
              return (
                <div key={String(id)} className="grid grid-cols-10 items-center gap-3 px-5 py-4">
                  <div className="h-10 w-10 overflow-hidden rounded-xl bg-white/10 ring-1 ring-white/10">
                    <SmartImage src={pickFirstImage(r)} alt={r?.ten || "product"} className="h-full w-full object-cover" />
                  </div>
                  <div className="col-span-2 min-w-0">
                    <div className="truncate text-sm font-medium">{r?.ten ?? "-"}</div>
                    <div className="truncate text-xs text-white/50">#{id}</div>
                  </div>
                  <div className="text-sm text-white/70">{r.__sku || "-"}</div>
                  <div className="text-sm text-white/70">{r?.danhmuc_ten ?? "-"}</div>
                  <div className="text-sm text-white/70">{r?.nhacungcap_ten ?? "-"}</div>
                  <div className="text-sm">{r.__minPrice > 0 ? formatMoneyVND(r.__minPrice) : "-"}</div>
                  <div className="text-center text-sm">{r.__stock}</div>
                  <div className="flex justify-center">
                    <span className="rounded-full bg-indigo-500/25 px-4 py-1 text-xs ring-1 ring-indigo-400/30">
                      {statusLabel(r?.trangthai)}
                    </span>
                  </div>
                  <div className="flex items-center justify-end gap-3">
                    <button
                      className="grid h-9 w-9 place-items-center rounded-xl bg-white/5 ring-1 ring-white/10 hover:bg-white/10"
                      type="button"
                      onClick={() => {
                        setEditing(r);
                        setModalOpen(true);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      className="grid h-9 w-9 place-items-center rounded-xl bg-white/5 ring-1 ring-white/10 hover:bg-white/10"
                      type="button"
                      onClick={() => {
                        setConfirmTarget(r);
                        setConfirmOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-rose-300" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="flex items-center justify-between px-5 py-4">
          <div className="text-xs text-white/55">Trang {page}</div>
          <div className="flex gap-2">
            <button
              className="rounded-xl bg-white/5 px-3 py-2 text-sm ring-1 ring-white/10 disabled:opacity-40"
              onClick={() => canPrev && setPage((p) => Math.max(1, p - 1))}
              disabled={!canPrev}
              type="button"
            >
              ← Trước
            </button>
            <button
              className="rounded-xl bg-white/5 px-3 py-2 text-sm ring-1 ring-white/10 disabled:opacity-40"
              onClick={() => canNext && setPage((p) => p + 1)}
              disabled={!canNext}
              type="button"
            >
              Sau →
            </button>
          </div>
        </div>
      </div>

      <ProductUpsertDialog
        open={modalOpen}
        onOpenChange={setModalOpen}
        initial={editing}
        onSaved={() => loadProducts()}
      />

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Tắt sản phẩm?"
        description="Sản phẩm sẽ được chuyển sang trạng thái ‘Không hoạt động’ (không xóa vật lý)."
        confirmLabel="Tắt"
        destructive
        loading={confirmLoading}
        onConfirm={handleDisable}
      />
    </div>
  );
}
