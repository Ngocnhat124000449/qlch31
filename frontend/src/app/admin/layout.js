"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import { useMe } from "@/hooks/useMe";

export default function AdminLayout({ children }) {
  const router = useRouter();
  const { me, status } = useMe();
  const redirectedRef = useRef(false);
  const prevStatusRef = useRef(null); // Track status changes

  // Kiểm tra isAdmin: hỗ trợ nhiều dạng (boolean true, số 1, chuỗi "true"/"1")
  const isAdmin =
    me?.isAdmin === true ||
    me?.isAdmin === 1 ||
    (typeof me?.isAdmin === "string" &&
      (me.isAdmin.toLowerCase() === "true" || me.isAdmin === "1"));

  // Xác định quyền truy cập
  useEffect(() => {
    // 1. Đang load - chờ
    if (status === "loading") {
      prevStatusRef.current = status;
      return;
    }

    // 2. Đã redirect trước đó - không redirect lại
    if (redirectedRef.current) {
      prevStatusRef.current = status;
      return;
    }

    // 3. Nếu status vừa thay đổi từ loading → auth/guest
    const statusChanged = prevStatusRef.current !== status;
    prevStatusRef.current = status;

    // 4. Redirect logic: chỉ kiểm tra khi status thay đổi hoặc lần đầu
    if (status === "guest") {
      redirectedRef.current = true;
      router.replace("/");
      return;
    }

    if (status === "auth" && !isAdmin) {
      redirectedRef.current = true;
      router.replace("/");
      return;
    }

    // 5. Status = "auth" && isAdmin → cho phép render
  }, [router, status]); // Chỉ track status, không track isAdmin

  // Hiển thị loading khi đang xác thực
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background text-foreground grid place-items-center">
        <div className="text-sm text-muted-foreground">Đang tải…</div>
      </div>
    );
  }

  // Chỉ render admin shell nếu authenticated + isAdmin
  if (status === "auth" && isAdmin) {
    return <AdminShell me={me}>{children}</AdminShell>;
  }

  // Khi không đủ điều kiện - render null (sẽ redirect trong useEffect)
  return null;
}
