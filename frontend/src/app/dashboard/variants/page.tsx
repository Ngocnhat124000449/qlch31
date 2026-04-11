"use client";

import { useEffect, useMemo, useState } from "react";
import { Pencil, RefreshCcw } from "lucide-react";
import PageHeader from "@/components/admin/PageHeader";
import SmartImage from "@/components/ui/SmartImage";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  adminListProducts,
  adminListVariantsByProduct,
  formatApiError,
  formatMoneyVND,
  toNumber,
} from "@/lib/adminApi";
import { getVariantDisplayName } from "@/lib/variantLabel";
import VariantUpsertDialog from "@/components/admin/modals/VariantUpsertDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function pickVariantId(v) {
  return v?.bentheid ?? v?.id ?? null;
}

function pickVariantImage(v) {
  return v?.hinhanhurl || v?.imageUrl || "";
}

function statusLabel(v) {
  const on = v === true || String(v).toLowerCase() === "true";
  return on ? "Hoạt động" : "Không hoạt động";
}

export default function VariantsAdminPage() {
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productQuery, setProductQuery] = useState("");

  const [productId, setProductId] = useState("");
  const [variants, setVariants] = useState([]);
  const [variantsLoading, setVariantsLoading] = useState(false);
  const [error, setError] = useState("");

  const [q, setQ] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  async function loadProducts(qText) {
    setProductsLoading(true);
    try {
      const { products: list } = await adminListProducts({
        all: true,
        page: 1,
        limit: 80,
        q: qText?.trim() ? qText.trim() : undefined,
      });
      setProducts(Array.isArray(list) ? list : []);
    } catch (e) {
      setProducts([]);
    } finally {
      setProductsLoading(false);
    }
  }

  async function loadVariants(pid) {
    if (!pid) {
      setVariants([]);
      return;
    }
    setVariantsLoading(true);
    setError("");
    try {
      const { variants: list } = await adminListVariantsByProduct(pid, { all: true });
      setVariants(Array.isArray(list) ? list : []);
    } catch (e) {
      setError(formatApiError(e));
      setVariants([]);
    } finally {
      setVariantsLoading(false);
    }
  }

  useEffect(() => {
    loadProducts("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reload variants when switching product
  useEffect(() => {
    const pid = productId ? Number(productId) : null;
    if (!pid) {
      setVariants([]);
      return;
    }
    loadVariants(pid);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  const selectedProduct = useMemo(() => {
    const pid = productId ? Number(productId) : null;
    if (!pid) return null;
    return (products || []).find((p) => (p?.sanphamid ?? p?.id) === pid) || null;
  }, [productId, products]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return variants;
    return (variants || []).filter((v) => {
      const sku = (v?.sku || "").toString().toLowerCase();
      const name = getVariantDisplayName(v).toLowerCase();
      const id = String(pickVariantId(v) ?? "");
      return sku.includes(s) || name.includes(s) || id.includes(s);
    });
  }, [variants, q]);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Biến thể"
        subtitle="Tạo/sửa biến thể cho sản phẩm đã có (ngoài màn hình Sản phẩm)."
        actionLabel="＋ Thêm biến thể"
        onAction={() => {
          setEditing(null);
          setModalOpen(true);
        }}
      />

      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 backdrop-blur-xl">
        <div className="grid gap-3 lg:grid-cols-[1fr_380px_auto]">
          <div className="space-y-1">
            <div className="text-sm font-medium text-foreground">Chọn sản phẩm</div>
            <div className="text-xs text-muted-foreground">
              Bạn cần chọn một sản phẩm đã tồn tại để xem/tạo biến thể.
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Input
              value={productQuery}
              onChange={(e) => setProductQuery(e.target.value)}
              placeholder="Tìm sản phẩm theo tên/slug…"
              className="sm:flex-1"
            />
            <Button
              type="button"
              variant="secondary"
              onClick={() => loadProducts(productQuery)}
              disabled={productsLoading}
              className="shrink-0"
            >
              {productsLoading ? "Đang tìm…" : "Tìm"}
            </Button>
          </div>

          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              loadProducts(productQuery);
              if (productId) loadVariants(Number(productId));
            }}
            disabled={productsLoading || variantsLoading}
            className="justify-start"
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            Làm mới
          </Button>
        </div>

        <Select value={productId} onValueChange={setProductId}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Chọn sản phẩm…" />
          </SelectTrigger>
          <SelectContent>
            {(products || []).map((p) => {
              const pid = p?.sanphamid ?? p?.id;
              if (pid == null) return null;
              const name = p?.ten ?? p?.name ?? `#${pid}`;
              return (
                <SelectItem key={String(pid)} value={String(pid)}>
                  {name} (#{pid})
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>

        {selectedProduct ? (
          <div className="text-xs text-muted-foreground">
            Đang chọn: <span className="text-foreground">{selectedProduct?.ten}</span> (#{selectedProduct?.sanphamid ?? selectedProduct?.id})
          </div>
        ) : (
          <div className="text-xs text-muted-foreground">Chưa chọn sản phẩm.</div>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Tìm biến thể theo SKU / ID…"
          className="sm:max-w-[360px]"
        />
        <div className="text-xs text-muted-foreground">
          {productId ? (
            <span>
              {variantsLoading ? "Đang tải biến thể…" : `Tổng: ${filtered.length} biến thể`}
            </span>
          ) : (
            <span>Hãy chọn một sản phẩm để xem biến thể.</span>
          )}
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-3 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      <div className="rounded-2xl border border-border bg-card backdrop-blur-xl">
        <div className="grid grid-cols-12 gap-3 px-5 py-3 text-xs text-muted-foreground">
          <div className="col-span-2">Ảnh</div>
          <div className="col-span-3">SKU</div>
          <div className="col-span-2">Giá bán</div>
          <div className="col-span-2 text-center">Tồn kho</div>
          <div className="col-span-2 text-center">Trạng thái</div>
          <div className="col-span-1 text-right">Hành động</div>
        </div>

        <div className="divide-y divide-border">
          {!productId ? (
            <div className="px-5 py-6 text-sm text-muted-foreground">Chưa chọn sản phẩm.</div>
          ) : variantsLoading ? (
            <div className="px-5 py-6 text-sm text-muted-foreground">Đang tải dữ liệu…</div>
          ) : filtered.length === 0 ? (
            <div className="px-5 py-6 text-sm text-muted-foreground">Chưa có biến thể nào cho sản phẩm này.</div>
          ) : (
            filtered.map((v) => {
              const id = pickVariantId(v);
              const price = toNumber(v?.giaban);
              const stock = toNumber(v?.tonkho);
              return (
                <div key={String(id)} className="grid grid-cols-12 items-center gap-3 px-5 py-4">
                  <div className="col-span-2">
                    <div className="h-12 w-16 overflow-hidden rounded-xl bg-muted/50 ring-1 ring-border">
                      <SmartImage
                        src={pickVariantImage(v)}
                        alt={getVariantDisplayName(v)}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </div>
                  <div className="col-span-3 min-w-0">
                    <div className="truncate text-sm font-medium">
                      {getVariantDisplayName(v)}
                    </div>
                    {v?.sku ? (
                      <div className="truncate text-xs text-muted-foreground">SKU: {v.sku}</div>
                    ) : null}
                    <div className="truncate text-xs text-muted-foreground">#{id}</div>
                  </div>
                  <div className="col-span-2 text-sm">{price > 0 ? formatMoneyVND(price) : "-"}</div>
                  <div className="col-span-2 text-center text-sm">{stock}</div>
                  <div className="col-span-2 flex justify-center">
                    <span className="rounded-full bg-indigo-500/25 px-4 py-1 text-xs ring-1 ring-indigo-400/30">
                      {statusLabel(v?.trangthai)}
                    </span>
                  </div>
                  <div className="col-span-1 flex items-center justify-end">
                    <button
                      className="grid h-9 w-9 place-items-center rounded-xl bg-card ring-1 ring-border hover:bg-muted/50"
                      type="button"
                      onClick={() => {
                        setEditing(v);
                        setModalOpen(true);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <VariantUpsertDialog
        open={modalOpen}
        onOpenChange={setModalOpen}
        sanphamid={productId ? Number(productId) : undefined}
        initial={editing}
        onSaved={() => {
          if (productId) loadVariants(Number(productId));
        }}
      />
    </div>
  );
}
