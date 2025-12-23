"use client";

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function ConfirmDialog({
  open,
  onOpenChange,
  title = "Xác nhận",
  description,
  confirmLabel = "Xác nhận",
  cancelLabel = "Hủy",
  destructive = false,
  loading = false,
  onConfirm,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-white/10 bg-[#0b1020] text-white">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {description ? <div className="text-sm text-white/70">{description}</div> : null}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            className="border-white/15 bg-white/5 text-white hover:bg-white/10"
            onClick={() => onOpenChange?.(false)}
            disabled={loading}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={destructive ? "destructive" : "default"}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Đang xử lý…" : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
