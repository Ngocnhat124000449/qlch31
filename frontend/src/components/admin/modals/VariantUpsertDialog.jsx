"use client";

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
import { Label } from "@/components/ui/label";
import { adminCreateVariant, adminUpdateVariant, formatApiError, toNumber } from "@/lib/adminApi";

function pickId(v) {
  return v?.bentheid ?? v?.id ?? null;
}

export default function VariantUpsertDialog({
  open,
  onOpenChange,
  sanphamid,
  initial,
  onSaved,
}) {
  const id = useMemo(() => pickId(initial), [initial]);
  const isEdit = id != null;

  const [sku, setSku] = useState("");
  const [giaban, setGiaban] = useState("");
  const [tonkho, setTonkho] = useState("");
  const [image, setImage] = useState(null);
  const fileRef = useRef(null);
  const [imagePreview, setImagePreview] = useState("");
  const [trangthai, setTrangthai] = useState(true);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setError("");
    setSaving(false);
    setSku(initial?.sku ?? "");
    setGiaban(initial?.giaban != null ? String(initial.giaban) : "");
    setTonkho(initial?.tonkho != null ? String(initial.tonkho) : "");
    setImage(null);
    setTrangthai(initial?.trangthai ?? true);
  }, [open, initial]);

  const canSave = sku.trim().length > 0 && toNumber(giaban) > 0 && (isEdit ? true : !!image);

  async function handleSave() {
    if (!isEdit && !sanphamid) {
      setError("Hãy lưu sản phẩm trước, sau đó mới tạo biến thể theo sản phẩm.");
      return;
    }
    if (!canSave || saving) return;
    setSaving(true);
    setError("");
    try {
      const fields = {
        sku: sku.trim(),
        giaban: toNumber(giaban),
        tonkho: tonkho === "" ? undefined : toNumber(tonkho),
        image,
        trangthai: !!trangthai,
      };

      const res = isEdit
        ? await adminUpdateVariant(id, fields)
        : await adminCreateVariant(sanphamid, fields);

      onSaved?.(res);
      onOpenChange?.(false);
    } catch (e) {
      setError(formatApiError(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg border-white/10 bg-[#0b1020] text-white">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Cập nhật biến thể" : "Thêm biến thể"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {error ? (
            <div className="whitespace-pre-line rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
              {error}
            </div>
          ) : null}

          <div className="grid gap-2">
            <Label>SKU</Label>
            <Input value={sku} onChange={(e) => setSku(e.target.value)} placeholder="VD: LAP-001" />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>Giá bán</Label>
              <Input
                value={giaban}
                onChange={(e) => setGiaban(e.target.value)}
                inputMode="numeric"
                placeholder="VD: 19900000"
              />
            </div>

            <div className="grid gap-2">
              <Label>Tồn kho</Label>
              <Input
                value={tonkho}
                onChange={(e) => setTonkho(e.target.value)}
                inputMode="numeric"
                placeholder="VD: 10"
              />
            </div>
          </div>

          <div className="grid gap-2">
  <Label>Hình ảnh biến thể {isEdit ? "(tùy chọn)" : "(bắt buộc)"}</Label>

  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
    <input
      ref={fileRef}
      type="file"
      accept="image/*"
      className="hidden"
      onChange={(e) => setImage(e.target.files?.[0] || null)}
    />
    <Button
      type="button"
      variant="secondary"
      onClick={() => fileRef.current?.click()}
      className="w-full sm:w-auto"
    >
      Chọn ảnh từ thiết bị
    </Button>

    <div className="min-w-0 text-xs text-white/70">
      {image ? (
        <span className="truncate">Đã chọn: {image.name}</span>
      ) : initial?.hinhanhurl ? (
        <span className="truncate">Đang dùng ảnh hiện tại</span>
      ) : (
        <span className="truncate">Chưa chọn ảnh</span>
      )}
    </div>

    {image ? (
      <Button type="button" variant="ghost" onClick={() => setImage(null)} className="sm:ml-auto">
        Bỏ chọn
      </Button>
    ) : null}
  </div>

  {(imagePreview || initial?.hinhanhurl) ? (
    <div className="mt-1 overflow-hidden rounded-lg border border-white/10 bg-white/5 p-2">
      <div className="text-[11px] text-white/60">Xem trước</div>
      <img
        src={imagePreview || initial?.hinhanhurl}
        alt={sku ? `Ảnh ${sku}` : "Ảnh biến thể"}
        className="mt-2 h-28 w-full rounded-md object-cover"
      />
    </div>
  ) : null}

  <div className="text-xs text-white/50">Ảnh sẽ được backend upload lên Cloudinary và lưu link vào biến thể.</div>
</div>

          <label className="flex items-center gap-2 text-sm text-white/80">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-white/20"
              checked={!!trangthai}
              onChange={(e) => setTrangthai(e.target.checked)}
            />
            Hoạt động
          </label>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            className="border-white/15 bg-white/5 text-white hover:bg-white/10"
            onClick={() => onOpenChange?.(false)}
            disabled={saving}
          >
            Hủy
          </Button>
          <Button type="button" onClick={handleSave} disabled={!canSave || saving}>
            {saving ? "Đang lưu…" : "Lưu"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
