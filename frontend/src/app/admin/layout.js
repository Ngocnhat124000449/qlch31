"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import { useMe } from "@/hooks/useMe";
import { apiFetch } from "@/lib/apiClient";

export default function AdminLayout({ children }) {
  const router = useRouter();
  const { me, status } = useMe();

  const raw = me?.isAdmin ?? me?.isadmin ?? me?.admin ?? me?.is_admin;
  const rawStr = raw == null ? "" : String(raw).toLowerCase();
  const roleStr = String(
    me?.role ?? me?.vaitro ?? me?.vaiTro ?? ""
  ).toLowerCase();
  const isAdmin =
    raw === true ||
    raw === 1 ||
    raw === "1" ||
    rawStr === "true" ||
    roleStr === "admin" ||
    roleStr === "administrator" ||
    roleStr === "role_admin";

  const [adminGate, setAdminGate] = useState("checking"); // checking | allowed | denied
  const gateReqRef = useRef(0);

  useEffect(() => {
    if (status === "loading") {
      setAdminGate("checking");
      return;
    }
    if (status === "guest") {
      setAdminGate("denied");
      return;
    }
    if (status === "auth" && isAdmin) {
      setAdminGate("allowed");
      return;
    }
    if (status === "auth" && !isAdmin) {
      const reqId = ++gateReqRef.current;
      setAdminGate("checking");
      (async () => {
        try {
          await apiFetch("/api/users/admin/users?limit=1&offset=0", {
            method: "GET",
          });
          if (gateReqRef.current !== reqId) return;
          setAdminGate("allowed");
        } catch {
          if (gateReqRef.current !== reqId) return;
          setAdminGate("denied");
        }
      })();
    }
  }, [status, isAdmin]);

  useEffect(() => {
    if (adminGate === "denied") router.replace("/");
  }, [router, adminGate]);

  const blocked = status !== "auth" || adminGate !== "allowed";

  // Luôn render một UI ổn định trong quá trình kiểm tra/redirect
  if (status === "loading" || blocked) {
    return (
      <div className="min-h-screen bg-[#060b1a] text-slate-200 grid place-items-center">
        <div className="text-sm text-slate-400">
          Đang kiểm tra quyền truy cập…
        </div>
      </div>
    );
  }

  return <AdminShell me={me}>{children}</AdminShell>;
}
