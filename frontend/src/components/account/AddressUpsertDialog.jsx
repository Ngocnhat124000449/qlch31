"use client";

import { useEffect, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";

import { createAddress, updateAddress } from "@/services/addresses";

const DEFAULT = {
  tennguoinhan: "",
  sdtnguoinhan: "",
  tinhthanh: "",
  quanhuyen: "",
  phuongxa: "",
  diachichitiet: "",
  loaidiachi: "Nhà",
  macdinh: false,
};

export default function AddressUpsertDialog({
  open,
  onOpenChange,
  initial,
  onSaved,
}) {
  const [form, setForm] = useState(DEFAULT);
  const [saving, setSaving] = useState(false);
  const isEdit = Boolean(initial?.diachiuserid);

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setForm({
        tennguoinhan: initial.tennguoinhan || "",
        sdtnguoinhan: initial.sdtnguoinhan || "",
        tinhthanh: initial.tinhthanh || "",
        quanhuyen: initial.quanhuyen || "",
        phuongxa: initial.phuongxa || "",
        diachichitiet: initial.diachichitiet || "",
        loaidiachi: initial.loaidiachi || "Nhà",
        macdinh: Boolean(initial.macdinh),
      });
    } else {
      setForm(DEFAULT);
    }
  }, [open, initial]);

  function setField(k, v) {
    setForm((s) => ({ ...s, [k]: v }));
  }

  async function save() {
    // Basic client-side validation (server also validates)
    const required = [
      "tennguoinhan",
      "sdtnguoinhan",
      "tinhthanh",
      "quanhuyen",
      "phuongxa",
      "diachichitiet",
      "loaidiachi",
    ];
    for (const k of required) {
      if (!String(form[k] || "").trim()) return;
    }

    setSaving(true);
    try {
      if (isEdit) {
        await updateAddress(initial.diachiuserid, {
          ...form,
          macdinh: Boolean(form.macdinh),
        });
      } else {
        await createAddress({
          ...form,
          macdinh: Boolean(form.macdinh),
        });
      }

      onOpenChange?.(false);
      onSaved?.();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Sửa địa chỉ" : "Thêm địa chỉ"}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Họ tên người nhận</Label>
            <Input
              value={form.tennguoinhan}
              onChange={(e) => setField("tennguoinhan", e.target.value)}
              placeholder="Nguyễn Văn A"
            />
          </div>

          <div className="space-y-2">
            <Label>Số điện thoại</Label>
            <Input
              value={form.sdtnguoinhan}
              onChange={(e) => setField("sdtnguoinhan", e.target.value)}
              placeholder="0xxxxxxxxx"
            />
          </div>

          <div className="space-y-2">
            <Label>Tỉnh/Thành</Label>
            <Input
              value={form.tinhthanh}
              onChange={(e) => setField("tinhthanh", e.target.value)}
              placeholder="TP. Hồ Chí Minh"
            />
          </div>

          <div className="space-y-2">
            <Label>Quận/Huyện</Label>
            <Input
              value={form.quanhuyen}
              onChange={(e) => setField("quanhuyen", e.target.value)}
              placeholder="Quận 1"
            />
          </div>

          <div className="space-y-2">
            <Label>Phường/Xã</Label>
            <Input
              value={form.phuongxa}
              onChange={(e) => setField("phuongxa", e.target.value)}
              placeholder="Phường Bến Nghé"
            />
          </div>

          <div className="space-y-2">
            <Label>Loại địa chỉ</Label>
            <Input
              value={form.loaidiachi}
              onChange={(e) => setField("loaidiachi", e.target.value)}
              placeholder="Nhà / Công ty"
            />
          </div>

          <div className="sm:col-span-2 space-y-2">
            <Label>Địa chỉ chi tiết</Label>
            <Textarea
              value={form.diachichitiet}
              onChange={(e) => setField("diachichitiet", e.target.value)}
              placeholder="Số nhà, tên đường..."
            />
          </div>

          <div className="sm:col-span-2 flex items-center gap-2">
            <Checkbox
              checked={Boolean(form.macdinh)}
              onCheckedChange={(v) => setField("macdinh", Boolean(v))}
            />
            <span className="text-sm text-muted-foreground">
              Đặt làm mặc định
            </span>
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => onOpenChange?.(false)}>
            Hủy
          </Button>
          <Button onClick={save} disabled={saving}>
            {saving ? "Đang lưu..." : "Lưu"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
