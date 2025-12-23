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

export default function ChangePasswordDialog({ open, onOpenChange }) {
  const [form, setForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirm: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) setForm({ oldPassword: "", newPassword: "", confirm: "" });
  }, [open]);

  async function save() {
    if (form.newPassword !== form.confirm) {
      alert("Mật khẩu mới không khớp.");
      return;
    }

    setLoading(true);
    try {
      await apiFetch("/api/users/me/password", {
        method: "PUT",
        auth: true,
        body: { oldPassword: form.oldPassword, newPassword: form.newPassword },
      });
      onOpenChange(false);
      alert("Đổi mật khẩu thành công.");
    } catch (e) {
      // backend sẽ trả 401 nếu oldPassword sai
      alert(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Đổi mật khẩu</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <Input
            type="password"
            placeholder="Mật khẩu hiện tại"
            value={form.oldPassword}
            onChange={(e) =>
              setForm((s) => ({ ...s, oldPassword: e.target.value }))
            }
          />
          <Input
            type="password"
            placeholder="Mật khẩu mới"
            value={form.newPassword}
            onChange={(e) =>
              setForm((s) => ({ ...s, newPassword: e.target.value }))
            }
          />
          <Input
            type="password"
            placeholder="Nhập lại mật khẩu mới"
            value={form.confirm}
            onChange={(e) =>
              setForm((s) => ({ ...s, confirm: e.target.value }))
            }
          />
          <Button
            className="w-full"
            disabled={loading || !form.oldPassword || !form.newPassword}
            onClick={save}
          >
            {loading ? "..." : "Xác nhận"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
