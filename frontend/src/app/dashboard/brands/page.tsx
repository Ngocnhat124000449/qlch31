"use client";

import { useEffect, useMemo, useState } from "react";
import PageHeader from "@/components/admin/PageHeader";
import { adminListProducts, adminListSuppliers } from "@/lib/adminApi";

function pickSupplierId(s) {
  return s?.nhacungcapid ?? s?.id ?? null;
}

function pickSupplierName(s) {
  return s?.ten ?? s?.name ?? s?.tên ?? "-";
}

function statusLabel(v) {
  const on = v === true || String(v).toLowerCase() === "true";
  return on ? "Hoạt động" : "Không hoạt động";
}

export default function BrandsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");
  const [rows, setRows] = useState([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const [{ suppliers }, { products }] = await Promise.all([
          adminListSuppliers({ all: true }),
          adminListProducts({ all: true, page: 1, limit: 200 }),
        ]);

        const supList = Array.isArray(suppliers) ? suppliers : [];
        const prodList = Array.isArray(products) ? products : [];

        const countBySupplier = new Map();
        for (const p of prodList) {
          const sid = p?.nhacungcapid ?? p?.supplierId ?? null;
          if (sid == null) continue;
          const key = String(sid);
          countBySupplier.set(key, (countBySupplier.get(key) || 0) + 1);
        }

        const enriched = supList.map((s) => {
          const id = pickSupplierId(s);
          const key = id != null ? String(id) : "";
          return {
            ...s,
            __products: countBySupplier.get(key) || 0,
          };
        });

        if (!mounted) return;
        setRows(enriched);
      } catch (e) {
        if (!mounted) return;
        setError(e?.message || "Không thể tải thương hiệu (derive từ nhà cung cấp)");
        setRows([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter((r) => {
      const name = pickSupplierName(r).toLowerCase();
      const email = String(r?.email || "").toLowerCase();
      const phone = String(r?.sdt || r?.phone || "").toLowerCase();
      return name.includes(term) || email.includes(term) || phone.includes(term);
    });
  }, [rows, q]);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Quản lý thương hiệu"
        subtitle="Không có API brands riêng nên thương hiệu được derive từ nhà cung cấp (GET /api/catalog/suppliers?all=1)."
        actionLabel=""
        onAction={() => {}}
      />

      <div className="rounded-2xl border border-border bg-card p-4 backdrop-blur-xl">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Tìm theo tên / email / SĐT"
          className="w-full rounded-xl bg-card px-4 py-3 text-sm outline-none ring-1 ring-border focus:ring-indigo-400/30"
        />
      </div>

      <div className="rounded-2xl border border-border bg-card backdrop-blur-xl">
        <div className="grid grid-cols-7 gap-3 px-5 py-3 text-xs text-muted-foreground">
          <div className="col-span-2">Thương hiệu (Nhà cung cấp)</div>
          <div>Email</div>
          <div>SĐT</div>
          <div className="text-center">Số sản phẩm</div>
          <div className="text-center">Trạng thái</div>
          <div className="text-right">Ngày tạo</div>
        </div>

        <div className="divide-y divide-border">
          {loading ? (
            <div className="px-5 py-6 text-sm text-muted-foreground">Đang tải…</div>
          ) : filtered.length === 0 ? (
            <div className="px-5 py-6 text-sm text-muted-foreground">{error || "Chưa có dữ liệu."}</div>
          ) : (
            filtered.map((r) => {
              const id = pickSupplierId(r);
              return (
                <div key={String(id)} className="grid grid-cols-7 items-center gap-3 px-5 py-4">
                  <div className="col-span-2 min-w-0">
                    <div className="truncate text-sm font-medium">{pickSupplierName(r)}</div>
                    <div className="truncate text-xs text-muted-foreground">#{id}</div>
                  </div>
                  <div className="truncate text-sm text-muted-foreground">{r?.email ?? "-"}</div>
                  <div className="truncate text-sm text-muted-foreground">{r?.sdt ?? r?.phone ?? "-"}</div>
                  <div className="text-center text-sm">{r.__products ?? 0}</div>
                  <div className="flex justify-center">
                    <span className="rounded-full bg-indigo-500/25 px-4 py-1 text-xs ring-1 ring-indigo-400/30">
                      {statusLabel(r?.trangthai)}
                    </span>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    {r?.created_at ? new Date(r.created_at).toLocaleDateString("vi-VN") : "-"}
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
