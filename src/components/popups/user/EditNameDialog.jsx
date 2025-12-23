"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/apiClient";

export default function EditNameDialog({ open, onOpenChange }) {
  const [hoten, setHoten] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) setHoten("");
  }, [open]);

  async function save() {
    setLoading(true);
    try {
      await apiFetch("/api/users/me", {
        method: "PUT",
        auth: true,
        body: { hoten },
      });
      window.dispatchEvent(new Event("auth:changed")); // để header refresh me
      onOpenChange(false);
    } catch (e) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa tên hiển thị</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <Input
            placeholder="Nhập tên hiển thị mới"
            value={hoten}
            onChange={(e) => setHoten(e.target.value)}
          />
          <Button
            className="w-full"
            disabled={loading || !hoten.trim()}
            onClick={save}
          >
            {loading ? "..." : "Lưu"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
