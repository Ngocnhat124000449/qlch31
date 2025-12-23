"use client";

import { useEffect, useState } from "react";
import { adminListProducts, adminListVariantsByProduct, toNumber } from "@/lib/adminApi";

function statusFromStock(stock) {
  return stock > 0 ? "Còn hàng" : "Hết hàng";
}

export default function InventoryPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const { products } = await adminListProducts({ all: true, page: 1, limit: 30 });
        const list = Array.isArray(products) ? products : [];

        const variantsRes = await Promise.all(
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

        const map = new Map(variantsRes.map((r) => [String(r.id), r.variants]));

        const enriched = list.map((p) => {
          const id = p?.sanphamid ?? p?.id;
          const variants = map.get(String(id)) || [];
          const stock = variants.reduce((sum, v) => sum + toNumber(v?.tonkho), 0);
          const sku = variants.find((v) => v?.sku)?.sku || p?.tenviettat || String(id);
          return { ...p, __stock: stock, __sku: sku };
        });

        if (!mounted) return;
        setRows(enriched);
      } catch (e) {
        if (!mounted) return;
        setError(e?.message || "Không thể tải tồn kho");
        setRows([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xl font-semibold">Tồn kho</div>
          <div className="text-sm text-white/55">
            Tồn kho được tính bằng tổng <span className="text-white/80">tonkho</span> của các biến thể (API /api/catalog/products/:id/variants).
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
        <div className="grid grid-cols-6 gap-3 px-5 py-3 text-xs text-white/55">
          <div className="col-span-2">Sản phẩm</div>
          <div>SKU</div>
          <div className="text-center">Tồn kho</div>
          <div className="text-center">Ngưỡng thấp</div>
          <div className="text-right">Trạng thái</div>
        </div>

        <div className="divide-y divide-white/10">
          {loading ? (
            <div className="px-5 py-6 text-sm text-white/60">Đang tải…</div>
          ) : rows.length === 0 ? (
            <div className="px-5 py-6 text-sm text-white/60">{error || "Chưa có dữ liệu."}</div>
          ) : (
            rows.map((r) => {
              const id = r?.sanphamid ?? r?.id;
              const stock = r.__stock ?? 0;
              return (
                <div key={String(id)} className="grid grid-cols-6 items-center gap-3 px-5 py-4">
                  <div className="col-span-2 min-w-0">
                    <div className="truncate text-sm font-medium">{r?.ten ?? "-"}</div>
                    <div className="truncate text-xs text-white/50">#{id}</div>
                  </div>
                  <div className="text-sm text-white/70">{r.__sku}</div>
                  <div className="text-center text-sm">{stock}</div>
                  <div className="text-center text-sm text-white/50">-</div>
                  <div className="text-right">
                    <span className="rounded-full bg-indigo-500/25 px-4 py-1 text-xs ring-1 ring-indigo-400/30">
                      {statusFromStock(stock)}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
