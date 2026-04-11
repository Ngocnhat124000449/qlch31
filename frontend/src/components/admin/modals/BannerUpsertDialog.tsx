"use client";
import styles from "./BannerUpsertDialog.module.scss";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import SmartImage from "@/components/ui/SmartImage";
import { adminCreateBanner, adminUpdateBanner, formatApiError } from "@/lib/adminApi";

function pickId(b) {
  return b?.bannerid ?? b?.id ?? null;
}

function toDateValue(v) {
  // hỗ trợ cả ISO datetime và date; Input type="date" cần YYYY-MM-DD
  if (!v) return "";
  try {
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return String(v).slice(0, 10);
    return d.toISOString().slice(0, 10);
  } catch {
    return String(v).slice(0, 10);
  }
}

export default function BannerUpsertDialog({ open, onOpenChange, initial, onSaved }) {
  const id = useMemo(() => pickId(initial), [initial]);
  const isEdit = id != null;

  const fileRef = useRef(null);

  const [ten, setTen] = useState("");
  const [mota, setMota] = useState("");
  const [linkurl, setLink] = useState("");
  const [vitri, setVitri] = useState("HOME_TOP");
  const [thutuhienthi, setThuTu] = useState(0);
  const [trangthai, setTrangThai] = useState(true);
  const [thoigianbatdau, setStart] = useState("");
  const [thoigianketthuc, setEnd] = useState("");

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;

    setError("");
    setSaving(false);

    setTen((initial?.ten || "").toString());
    setMota((initial?.mota || "").toString());
    setLink((initial?.linkurl || "").toString());
    setVitri((initial?.vitri || "HOME_TOP").toString());
    setThuTu(Number(initial?.thutuhienthi ?? 0) || 0);
    setTrangThai(Boolean(initial?.trangthai ?? true));
    setStart(toDateValue(initial?.thoigianbatdau));
    setEnd(toDateValue(initial?.thoigianketthuc));

    setImageFile(null);
    setImagePreview((initial?.imageurl || "").toString());
  }, [open, initial]);

  useEffect(() => {
    if (!imageFile) return;
    const url = URL.createObjectURL(imageFile);
    setImagePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  async function submit() {
    setError("");

    const name = ten.trim();
    if (!name) {
      setError("Vui lòng nhập tên banner (ten).");
      return;
    }

    const fields = {
      ten: name,
      mota: mota?.toString?.() ?? "",
      linkurl: linkurl?.toString?.() ?? "",
      vitri: vitri?.toString?.() ?? "",
      thutuhienthi: String(Number(thutuhienthi || 0)),
      trangthai: !!trangthai,
      thoigianbatdau: thoigianbatdau || undefined,
      thoigianketthuc: thoigianketthuc || undefined,
      image: imageFile || undefined,
    };

    setSaving(true);
    try {
      const res = isEdit
        ? await adminUpdateBanner(id, fields)
        : await adminCreateBanner(fields);

      onOpenChange?.(false);
      onSaved?.(res);
    } catch (e) {
      setError(formatApiError(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Cập nhật banner" : "Tạo banner"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {error ? (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>Tên banner *</Label>
              <Input value={ten} onChange={(e) => setTen(e.target.value)} placeholder="Ví dụ: Sale cuối năm" />
            </div>

            <div className="grid gap-2">
              <Label>Vị trí (vitri)</Label>
              <Input
                value={vitri}
                onChange={(e) => setVitri(e.target.value)}
                placeholder="HOME_TOP / HOME_MIDDLE / HOME_BOTTOM..."
                list="banner-positions"
              />
              <datalist id="banner-positions">
                <option value="HOME_TOP" />
                <option value="HOME_MIDDLE" />
                <option value="HOME_BOTTOM" />
                <option value="CATEGORY_TOP" />
              </datalist>
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Mô tả (mota)</Label>
            <Textarea value={mota} onChange={(e) => setMota(e.target.value)} placeholder="Mô tả ngắn cho banner..." />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>Link (linkurl)</Label>
              <Input value={linkurl} onChange={(e) => setLink(e.target.value)} placeholder="https://..." />
            </div>

            <div className="grid gap-2">
              <Label>Thứ tự hiển thị (thutuhienthi)</Label>
              <Input
                type="number"
                value={thutuhienthi}
                onChange={(e) => setThuTu(e.target.value)}
                min={0}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>Bắt đầu (thoigianbatdau)</Label>
              <Input type="date" value={thoigianbatdau} onChange={(e) => setStart(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>Kết thúc (thoigianketthuc)</Label>
              <Input type="date" value={thoigianketthuc} onChange={(e) => setEnd(e.target.value)} />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-border"
                checked={!!trangthai}
                onChange={(e) => setTrangThai(e.target.checked)}
              />
              Bật banner (trangthai)
            </label>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-2">
                <div className="text-sm font-medium">Ảnh banner</div>
                <div className="text-xs text-muted-foreground">Upload ảnh (field name: <span className="font-mono">image</span>)</div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => fileRef.current?.click()}
                    disabled={saving}
                  >
                    Chọn ảnh…
                  </Button>
                  {imageFile ? (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setImageFile(null)}
                      disabled={saving}
                    >
                      Bỏ chọn
                    </Button>
                  ) : null}
                </div>

                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                />
              </div>

              <div className="w-full sm:w-[320px]">
                <div className="aspect-[16/7] overflow-hidden rounded-xl ring-1 ring-border">
                  <SmartImage
                    src={imagePreview}
                    alt={ten || "Banner preview"}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => onOpenChange?.(false)}
            disabled={saving}
          >
            Huỷ
          </Button>
          <Button type="button" onClick={submit} disabled={saving}>
            {saving ? "Đang lưu…" : isEdit ? "Cập nhật" : "Tạo mới"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
