"use client";

import { useEffect, useMemo, useState } from "react";
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
import { adminCreateCategory, adminUpdateCategory, formatApiError } from "@/lib/adminApi";

function pickId(c) {
  return c?.danhmucid ?? c?.id ?? null;
}

export default function CategoryUpsertDialog({ open, onOpenChange, initial, onSaved }) {
  const id = useMemo(() => pickId(initial), [initial]);
  const isEdit = id != null;

  const [ten, setTen] = useState("");
  const [tenviettat, setTenviettat] = useState("");
  const [trangthai, setTrangthai] = useState(true);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setError("");
    setSaving(false);
    setTen(initial?.ten ?? "");
    setTenviettat(initial?.tenviettat ?? initial?.slug ?? "");
    setTrangthai(initial?.trangthai ?? true);
  }, [open, initial]);

  const canSave = ten.trim().length > 0 && tenviettat.trim().length > 0;

  async function handleSave() {
    if (!canSave || saving) return;
    setSaving(true);
    setError("");
    try {
      const payload = {
        ten: ten.trim(),
        tenviettat: tenviettat.trim(),
        trangthai: !!trangthai,
      };
      const res = isEdit
        ? await adminUpdateCategory(id, payload)
        : await adminCreateCategory(payload);

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
          <DialogTitle>{isEdit ? "Cập nhật danh mục" : "Thêm danh mục"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {error ? (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100 whitespace-pre-line">
              {error}
            </div>
          ) : null}

          <div className="grid gap-2">
            <Label>Tên danh mục</Label>
            <Input value={ten} onChange={(e) => setTen(e.target.value)} placeholder="VD: Laptop" />
          </div>

          <div className="grid gap-2">
            <Label>Slug / Tên viết tắt</Label>
            <Input
              value={tenviettat}
              onChange={(e) => setTenviettat(e.target.value)}
              placeholder="VD: laptop"
            />
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
