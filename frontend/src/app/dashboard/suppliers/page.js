"use client";

import { useEffect, useMemo, useState } from "react";
import PageHeader from "@/components/admin/PageHeader";
import { Pencil, Trash2 } from "lucide-react";
import {
  adminGetOrderDetail,
  adminListOrders,
  adminListProducts,
  adminListSuppliers,
  adminUpdateSupplier,
  formatApiError,
  formatMoneyVND,
  normalizeList,
  toNumber,
} from "@/lib/adminApi";
import SupplierUpsertDialog from "@/components/admin/modals/SupplierUpsertDialog";
import ConfirmDialog from "@/components/admin/modals/ConfirmDialog";

function statusLabel(v) {
  const on = v === true || String(v).toLowerCase() === "true";
  return on ? "Hoạt động" : "Không hoạt động";
}

export default function SuppliersPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rows, setRows] = useState([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState(null);

  async function refresh() {
    setLoading(true);
    setError("");
    try {
      const [{ suppliers }, { products }] = await Promise.all([
        adminListSuppliers({ all: true }),
        adminListProducts({ all: true, page: 1, limit: 100 }),
      ]);

      const supList = Array.isArray(suppliers) ? suppliers : [];
      const prodList = Array.isArray(products) ? products : [];

      const productToSupplier = new Map();
      for (const p of prodList) {
        const pid = p?.sanphamid ?? p?.id;
        const sid = p?.nhacungcapid ?? p?.supplierId;
        if (pid != null && sid != null) productToSupplier.set(String(pid), String(sid));
      }

      const { raw: ordersRaw, orders } = await adminListOrders({ page: 1, limit: 50 });
      const orderList = Array.isArray(orders) ? orders : normalizeList(ordersRaw);
      const orderIds = orderList.map((o) => o?.donhangid ?? o?.id).filter((v) => v != null);
      const details = await Promise.all(orderIds.map((id) => adminGetOrderDetail(id).catch(() => null)));

      const stats = new Map();
      for (const s of supList) {
        const sid = s?.nhacungcapid ?? s?.id;
        if (sid == null) continue;
        stats.set(String(sid), { orders: new Set(), revenue: 0 });
      }

      for (const o of details) {
        if (!o) continue;
        const oid = o?.donhangid ?? o?.id;
        const items = Array.isArray(o?.items) ? o.items : [];
        for (const it of items) {
          const pid = it?.sanpham?.sanphamid ?? it?.sanphamid;
          if (pid == null) continue;
          const sid = productToSupplier.get(String(pid));
          if (!sid) continue;

          if (!stats.has(sid)) stats.set(sid, { orders: new Set(), revenue: 0 });
          const st = stats.get(sid);
          st.orders.add(String(oid));
          st.revenue += toNumber(it?.dongia) * toNumber(it?.soluong);
        }
      }

      const enriched = supList.map((s) => {
        const sid = String(s?.nhacungcapid ?? s?.id);
        const st = stats.get(sid) || { orders: new Set(), revenue: 0 };
        return {
          ...s,
          __orders: st.orders.size,
          __revenue: st.revenue,
        };
      });

      setRows(enriched);
    } catch (e) {
      setError(e?.message || "Không thể tải nhà cung cấp");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleDisable() {
    const t = confirmTarget;
    const id = t?.nhacungcapid ?? t?.id;
    if (id == null || confirmLoading) return;
    setConfirmLoading(true);
    setError("");
    try {
      await adminUpdateSupplier(id, { trangthai: false });
      setConfirmOpen(false);
      setConfirmTarget(null);
      refresh();
    } catch (e) {
      setError(formatApiError(e));
    } finally {
      setConfirmLoading(false);
    }
  }

  const note = useMemo(() => {
    if (loading) return "";
    if (rows.length === 0) return "";
    return "(Doanh thu & số đơn tính từ 50 đơn gần nhất)";
  }, [loading, rows.length]);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Nhà cung cấp"
        subtitle={`Danh sách lấy từ API /api/catalog/suppliers?all=1. ${note}`}
        actionLabel="＋ Thêm nhà cung cấp"
        onAction={() => {
          setEditing(null);
          setModalOpen(true);
        }}
      />

      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
        <div className="grid grid-cols-9 gap-3 px-5 py-3 text-xs text-white/55">
          <div className="col-span-2">Nhà cung cấp</div>
          <div>Email</div>
          <div>SĐT</div>
          <div className="text-center">Trạng thái</div>
          <div className="text-center">Số đơn</div>
          <div className="text-right">Doanh thu</div>
          <div className="text-right">Ngày tạo</div>
          <div className="text-right">Hành động</div>
        </div>

        <div className="divide-y divide-white/10">
          {loading ? (
            <div className="px-5 py-6 text-sm text-white/60">Đang tải…</div>
          ) : rows.length === 0 ? (
            <div className="px-5 py-6 text-sm text-white/60">{error || "Chưa có nhà cung cấp."}</div>
          ) : (
            rows.map((r) => {
              const id = r?.nhacungcapid ?? r?.id;
              return (
                <div key={String(id)} className="grid grid-cols-9 items-center gap-3 px-5 py-4">
                  <div className="col-span-2 min-w-0">
                    <div className="truncate text-sm font-medium">{r?.ten ?? "-"}</div>
                    <div className="truncate text-xs text-white/50">#{id}</div>
                  </div>
                  <div className="truncate text-sm text-white/70">{r?.email ?? "-"}</div>
                  <div className="truncate text-sm text-white/70">{r?.sdt ?? "-"}</div>
                  <div className="flex justify-center">
                    <span className="rounded-full bg-indigo-500/25 px-4 py-1 text-xs ring-1 ring-indigo-400/30">
                      {statusLabel(r?.trangthai)}
                    </span>
                  </div>
                  <div className="text-center text-sm">{r.__orders ?? 0}</div>
                  <div className="text-right text-sm">{formatMoneyVND(r.__revenue || 0)}</div>
                  <div className="text-right text-sm text-white/70">
                    {r?.created_at ? new Date(r.created_at).toLocaleDateString("vi-VN") : "-"}
                  </div>
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      className="grid h-9 w-9 place-items-center rounded-xl bg-white/5 ring-1 ring-white/10 hover:bg-white/10"
                      onClick={() => {
                        setEditing(r);
                        setModalOpen(true);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      className="grid h-9 w-9 place-items-center rounded-xl bg-white/5 ring-1 ring-white/10 hover:bg-white/10"
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
      </div>

      <SupplierUpsertDialog
        open={modalOpen}
        onOpenChange={setModalOpen}
        initial={editing}
        onSaved={() => refresh()}
      />

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Tắt nhà cung cấp?"
        description="Nhà cung cấp sẽ chuyển sang trạng thái ‘Không hoạt động’ (không xóa vật lý)."
        confirmLabel="Tắt"
        destructive
        loading={confirmLoading}
        onConfirm={handleDisable}
      />
    </div>
  );
}
