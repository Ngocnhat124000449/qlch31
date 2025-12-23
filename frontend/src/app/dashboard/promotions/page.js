"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/admin/PageHeader";
import { Pencil, Trash2 } from "lucide-react";
import { adminListPromotions, adminUpdatePromotion, formatApiError } from "@/lib/adminApi";
import PromotionUpsertDialog from "@/components/admin/modals/PromotionUpsertDialog";
import ConfirmDialog from "@/components/admin/modals/ConfirmDialog";

function discountLabel(p) {
  const type = String(p?.loaigiamgia || "").toUpperCase();
  if (type === "PERCENT") return `${p?.tylegiam ?? 0}%`;
  if (type === "FIXED") return `${p?.giatrigiamcodinh ?? 0}`;
  return "-";
}

export default function PromotionsAdminPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState(null);

  async function refresh() {
    setLoading(true);
    setError("");
    try {
      const { promotions } = await adminListPromotions();
      setRows(Array.isArray(promotions) ? promotions : []);
    } catch (e) {
      setError(e?.message || "Không thể tải khuyến mãi");
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
    const id = t?.khuyenmaiid ?? t?.id;
    if (id == null || confirmLoading) return;
    setConfirmLoading(true);
    setError("");
    try {
      await adminUpdatePromotion(id, { trangthai: false });
      setConfirmOpen(false);
      setConfirmTarget(null);
      refresh();
    } catch (e) {
      setError(formatApiError(e));
    } finally {
      setConfirmLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Khuyến mãi"
        subtitle="Dữ liệu lấy từ API /api/promotions/admin/all."
        actionLabel="＋ Tạo khuyến mãi"
        onAction={() => {
          setEditing(null);
          setModalOpen(true);
        }}
      />

      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
        <div className="grid grid-cols-7 gap-3 px-5 py-3 text-xs text-white/55">
          <div className="col-span-2">Tên khuyến mãi</div>
          <div>Giảm</div>
          <div>Bắt đầu</div>
          <div>Kết thúc</div>
          <div className="text-center">Trạng thái</div>
          <div className="text-right">Hành động</div>
        </div>

        <div className="divide-y divide-white/10">
          {loading ? (
            <div className="px-5 py-6 text-sm text-white/60">Đang tải…</div>
          ) : rows.length === 0 ? (
            <div className="px-5 py-6 text-sm text-white/60">{error || "Chưa có khuyến mãi."}</div>
          ) : (
            rows.map((r) => (
              <div key={String(r?.khuyenmaiid ?? r?.id)} className="grid grid-cols-7 items-center gap-3 px-5 py-4">
                <div className="col-span-2 min-w-0">
                  <div className="truncate text-sm font-medium">{r?.tenkhuyenmai ?? "-"}</div>
                  <div className="truncate text-xs text-white/50">#{r?.khuyenmaiid}</div>
                </div>
                <div className="text-sm">{discountLabel(r)}</div>
                <div className="text-sm text-white/70">
                  {r?.thoigianbatdau ? new Date(r.thoigianbatdau).toLocaleDateString("vi-VN") : "-"}
                </div>
                <div className="text-sm text-white/70">
                  {r?.thoigianketthuc ? new Date(r.thoigianketthuc).toLocaleDateString("vi-VN") : "-"}
                </div>
                <div className="flex justify-center">
                  <span className="rounded-full bg-indigo-500/25 px-4 py-1 text-xs ring-1 ring-indigo-400/30">
                    {r?.trangthai ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="flex justify-end gap-3">
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
            ))
          )}
        </div>
      </div>

      <PromotionUpsertDialog
        open={modalOpen}
        onOpenChange={setModalOpen}
        initial={editing}
        onSaved={() => refresh()}
      />

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Tắt khuyến mãi?"
        description="Khuyến mãi sẽ chuyển sang trạng thái ‘Inactive’ (không xóa vật lý)."
        confirmLabel="Tắt"
        destructive
        loading={confirmLoading}
        onConfirm={handleDisable}
      />
    </div>
  );
}
