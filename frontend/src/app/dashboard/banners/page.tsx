"use client";

import { useEffect, useMemo, useState } from "react";
import PageHeader from "@/components/admin/PageHeader";
import SmartImage from "@/components/ui/SmartImage";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, RefreshCcw } from "lucide-react";
import {
  adminDeleteBanner,
  adminListBanners,
  adminUpdateBanner,
  formatApiError,
} from "@/lib/adminApi";
import BannerUpsertDialog from "@/components/admin/modals/BannerUpsertDialog";
import ConfirmDialog from "@/components/admin/modals/ConfirmDialog";

function pickId(b) {
  return b?.bannerid ?? b?.id ?? null;
}

function dateLabel(v) {
  if (!v) return "-";
  try {
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return String(v);
    return d.toLocaleDateString("vi-VN");
  } catch {
    return String(v);
  }
}

export default function BannersAdminPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [q, setQ] = useState("");
  const [vitri, setVitri] = useState("");
  const [includeAll, setIncludeAll] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  async function refresh() {
    setLoading(true);
    setError("");
    try {
      const { banners } = await adminListBanners({
        vitri: vitri || undefined,
        all: includeAll,
      });
      setRows(Array.isArray(banners) ? banners : []);
    } catch (e) {
      setError(formatApiError(e));
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vitri, includeAll]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;

    return rows.filter((b) => {
      const name = (b?.ten || "").toString().toLowerCase();
      const link = (b?.linkurl || "").toString().toLowerCase();
      const pos = (b?.vitri || "").toString().toLowerCase();
      return name.includes(s) || link.includes(s) || pos.includes(s);
    });
  }, [rows, q]);

  async function toggleStatus(b) {
    const id = pickId(b);
    if (id == null) return;
    setError("");
    try {
      await adminUpdateBanner(id, { trangthai: !b?.trangthai });
      refresh();
    } catch (e) {
      setError(formatApiError(e));
    }
  }

  async function doDelete() {
    const id = pickId(confirmTarget);
    if (id == null) return;

    setConfirmLoading(true);
    setError("");
    try {
      await adminDeleteBanner(id);
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
        title="Banners"
        subtitle="CRUD banner + upload ảnh thật qua /api/banners (admin)."
        actionLabel="＋ Tạo banner"
        onAction={() => {
          setEditing(null);
          setModalOpen(true);
        }}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tìm theo tên / vị trí / link..."
            className="sm:max-w-[360px]"
          />

          <div className="flex flex-wrap items-center gap-3">
            <Input
              value={vitri}
              onChange={(e) => setVitri(e.target.value)}
              placeholder="Lọc theo vitri (vd: HOME_TOP)"
              list="banner-positions"
              className="w-[220px]"
            />
            <datalist id="banner-positions">
              <option value="HOME_TOP" />
              <option value="HOME_MIDDLE" />
              <option value="HOME_BOTTOM" />
              <option value="CATEGORY_TOP" />
            </datalist>

            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-border"
                checked={!!includeAll}
                onChange={(e) => setIncludeAll(e.target.checked)}
              />
              Hiện cả banner tắt / ngoài thời gian
            </label>
          </div>
        </div>

        <Button
          type="button"
          variant="secondary"
          onClick={refresh}
          disabled={loading}
          className="self-start sm:self-auto"
        >
          <RefreshCcw className="mr-2 h-4 w-4" />
          Làm mới
        </Button>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-3 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      <div className="rounded-2xl border border-border bg-card backdrop-blur-xl">
        <div className="grid grid-cols-12 gap-3 px-5 py-3 text-xs text-muted-foreground">
          <div className="col-span-2">Ảnh</div>
          <div className="col-span-3">Tên</div>
          <div className="col-span-2">Vị trí</div>
          <div className="text-center">Thứ tự</div>
          <div className="text-center">Trạng thái</div>
          <div className="col-span-2">Thời gian</div>
          <div className="col-span-1 text-right">Thao tác</div>
        </div>

        <div className="divide-y divide-border">
          {loading ? (
            <div className="px-5 py-6 text-sm text-muted-foreground">Đang tải dữ liệu…</div>
          ) : null}

          {!loading && filtered.length === 0 ? (
            <div className="px-5 py-6 text-sm text-muted-foreground">Chưa có banner nào.</div>
          ) : null}

          {filtered.map((b) => {
            const id = pickId(b);
            return (
              <div key={id ?? JSON.stringify(b)} className="grid grid-cols-12 items-center gap-3 px-5 py-4">
                <div className="col-span-2">
                  <div className="aspect-[16/7] overflow-hidden rounded-xl ring-1 ring-border">
                    <SmartImage
                      src={b?.imageurl}
                      alt={b?.ten || "banner"}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>

                <div className="col-span-3 min-w-0">
                  <div className="truncate text-sm font-medium">{b?.ten || "-"}</div>
                  <div className="truncate text-xs text-muted-foreground">{b?.linkurl || "-"}</div>
                  <div className="truncate text-xs text-muted-foreground">#{id ?? "-"}</div>
                </div>

                <div className="col-span-2">
                  <div className="text-sm text-foreground">{b?.vitri || "-"}</div>
                </div>

                <div className="text-center text-sm text-foreground">{b?.thutuhienthi ?? 0}</div>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => toggleStatus(b)}
                    className={[
                      "rounded-full px-3 py-1 text-xs ring-1 transition",
                      b?.trangthai
                        ? "bg-emerald-500/15 text-emerald-200 ring-emerald-400/30 hover:bg-emerald-500/20"
                        : "bg-muted/50 text-muted-foreground ring-border hover:bg-muted",
                    ].join(" ")}
                  >
                    {b?.trangthai ? "Active" : "Inactive"}
                  </button>
                </div>

                <div className="col-span-2 text-xs text-muted-foreground">
                  <div>BĐ: {dateLabel(b?.thoigianbatdau)}</div>
                  <div>KT: {dateLabel(b?.thoigianketthuc)}</div>
                </div>

                <div className="col-span-1 flex justify-end gap-3">
                  <button
                    type="button"
                    className="rounded-lg p-2 hover:bg-muted/50"
                    onClick={() => {
                      setEditing(b);
                      setModalOpen(true);
                    }}
                    title="Sửa"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    className="rounded-lg p-2 hover:bg-muted/50"
                    onClick={() => {
                      setConfirmTarget(b);
                      setConfirmOpen(true);
                    }}
                    title="Xoá"
                  >
                    <Trash2 className="h-4 w-4 text-rose-300" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <BannerUpsertDialog
        open={modalOpen}
        onOpenChange={setModalOpen}
        initial={editing}
        onSaved={() => refresh()}
      />

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Xoá banner"
        description={`Bạn có chắc muốn xoá banner “${confirmTarget?.ten || ""}” không? Hành động này không thể hoàn tác.`}
        confirmLabel={confirmLoading ? "Đang xoá…" : "Xoá"}
        loading={confirmLoading}
        onConfirm={doDelete}
      />
    </div>
  );
}
