"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import { useMe } from "@/hooks/useMe";
import { apiFetch } from "@/lib/apiClient";

function resolveIsAdmin(me) {
  if (!me) return false;

  // Hỗ trợ nhiều backend format (role, isAdmin, isadmin...)
  const role = (me.role || me.vaitro || me.vaiTro || "")
    .toString()
    .toLowerCase();
  const raw = me.isAdmin ?? me.isadmin ?? me.admin ?? me.is_admin;
  const rawStr = raw == null ? "" : String(raw).toLowerCase();
  const isAdminFlag =
    raw === true ||
    raw === 1 ||
    raw === "1" ||
    rawStr === "true" ||
    me?.permissions?.includes?.("admin");

  return isAdminFlag || role === "admin" || role === "administrator";
}

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const { me, status } = useMe();

  const isAdmin = useMemo(() => resolveIsAdmin(me), [me]);

  // Fallback kiểm tra admin bằng cách ping 1 endpoint admin-only.
  // Trường hợp backend /me chưa trả role/isAdmin (chỉ trả profile) thì vẫn xác thực được.
  const [adminGate, setAdminGate] = useState("checking"); // checking | allowed | denied
  const gateReqRef = useRef(0);

  useEffect(() => {
    // reset gate theo trạng thái auth
    if (status === "loading") {
      setAdminGate("checking");
      return;
    }

    if (status === "guest") {
      setAdminGate("denied");
      return;
    }

    // đã có đủ thông tin admin từ /me
    if (status === "auth" && isAdmin) {
      setAdminGate("allowed");
      return;
    }

    // status auth nhưng chưa xác định được admin => ping admin endpoint 1 lần
    if (status === "auth" && !isAdmin) {
      const reqId = ++gateReqRef.current;
      setAdminGate("checking");
      (async () => {
        try {
          // Endpoint này yêu cầu admin; nếu 200 => admin, 403 => không phải admin
          await apiFetch("/api/users/admin/users?limit=1&offset=0", {
            method: "GET",
          });
          if (gateReqRef.current !== reqId) return;
          setAdminGate("allowed");
        } catch (e) {
          if (gateReqRef.current !== reqId) return;
          setAdminGate("denied");
        }
      })();
    }
  }, [status, isAdmin]);

  useEffect(() => {
    // Dashboard chỉ dành cho admin
    if (adminGate === "denied") router.replace("/");
  }, [router, adminGate]);

  const blocked = status !== "auth" || adminGate !== "allowed";

  // Luôn render một UI ổn định trong quá trình kiểm tra/redirect
  if (status === "loading" || blocked) {
    return (
      <div className="min-h-screen text-white bg-[#070B16] grid place-items-center">
        <div className="text-sm text-white/60">
          Đang kiểm tra quyền truy cập dashboard…
        </div>
      </div>
    );
  }

  return <AdminShell me={me}>{children}</AdminShell>;
}
