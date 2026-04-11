"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/admin/PageHeader";
import { Boxes, Pencil, Trash2 } from "lucide-react";
import { adminListCategories, adminUpdateCategory, formatApiError } from "@/lib/adminApi";
import CategoryUpsertDialog from "@/components/admin/modals/CategoryUpsertDialog";
import ConfirmDialog from "@/components/admin/modals/ConfirmDialog";

function toStatusLabel(v) {
  const on = v === true || String(v).toLowerCase() === "true";
  return on ? "Hoạt động" : "Không hoạt động";
}

export default function CategoriesPage() {
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
      const { categories } = await adminListCategories({ all: true });
      setRows(Array.isArray(categories) ? categories : []);
    } catch (e) {
      setError(e?.message || "Không thể tải danh mục");
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
    const id = t?.danhmucid ?? t?.id;
    if (id == null || confirmLoading) return;
    setConfirmLoading(true);
    setError("");
    try {
      await adminUpdateCategory(id, { trangthai: false });
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
        title="Quản lý danh mục"
        subtitle="Danh sách danh mục lấy trực tiếp từ API."
        actionLabel="＋ Thêm danh mục"
        onAction={() => {
          setEditing(null);
          setModalOpen(true);
        }}
      />

      <div className="rounded-2xl border border-border bg-card backdrop-blur-xl">
        <div className="grid grid-cols-7 gap-3 px-5 py-3 text-xs text-muted-foreground">
          <div>Icon</div>
          <div>Tên danh mục</div>
          <div className="col-span-2">Slug</div>
          <div className="text-center">Trạng thái</div>
          <div>Ngày tạo</div>
          <div className="text-right">Hành động</div>
        </div>

        <div className="divide-y divide-border">
          {loading ? (
            <div className="px-5 py-6 text-sm text-muted-foreground">Đang tải…</div>
          ) : rows.length === 0 ? (
            <div className="px-5 py-6 text-sm text-muted-foreground">
              {error || "Chưa có danh mục."}
            </div>
          ) : (
            rows.map((r) => (
              <div
                key={String(r?.danhmucid ?? r?.id ?? r?.tenviettat ?? r?.ten ?? Math.random())}
                className="grid grid-cols-7 items-center gap-3 px-5 py-4"
              >
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-card ring-1 ring-border">
                  <Boxes className="h-5 w-5 text-foreground" />
                </div>
                <div className="text-sm font-medium">{r?.ten ?? r?.name ?? "-"}</div>
                <div className="col-span-2 text-sm text-muted-foreground">
                  {r?.tenviettat ?? r?.slug ?? "-"}
                </div>
                <div className="flex justify-center">
                  <span className="rounded-full bg-indigo-500/25 px-4 py-1 text-xs ring-1 ring-indigo-400/30">
                    {toStatusLabel(r?.trangthai)}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {r?.created_at ? new Date(r.created_at).toLocaleString("vi-VN") : "-"}
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    className="grid h-9 w-9 place-items-center rounded-xl bg-card ring-1 ring-border hover:bg-muted/50"
                    onClick={() => {
                      setEditing(r);
                      setModalOpen(true);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className="grid h-9 w-9 place-items-center rounded-xl bg-card ring-1 ring-border hover:bg-muted/50"
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

      <CategoryUpsertDialog
        open={modalOpen}
        onOpenChange={setModalOpen}
        initial={editing}
        onSaved={() => refresh()}
      />

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Tắt danh mục?"
        description="Danh mục sẽ chuyển sang trạng thái ‘Không hoạt động’ (không xóa vật lý)."
        confirmLabel="Tắt"
        destructive
        loading={confirmLoading}
        onConfirm={handleDisable}
      />
    </div>
  );
}
