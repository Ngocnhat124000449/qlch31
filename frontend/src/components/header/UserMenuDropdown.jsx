// src/components/header/UserMenuDropdown.jsx
"use client";

import Link from "next/link";
import { User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { clearTokens, getRefreshToken } from "@/lib/tokens";
import { apiFetch } from "@/lib/apiClient";
import { usePopups } from "@/components/popups/PopupProvider";

export default function UserMenuDropdown({ me }) {
  const { openEditName, openChangePassword } = usePopups();

  async function signOut() {
    try {
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        // backend có thể yêu cầu key này
        await apiFetch("/api/auth/logout", {
          method: "POST",
          body: { refreshToken },
          auth: false,
        });
      }
    } catch {
      // không chặn logout phía FE
    } finally {
      clearTokens();
    }
  }

  const role = String(me?.role || me?.vaitro || me?.vaiTro || "").toLowerCase();
  const showDashboard =
    !!me &&
    (me?.isAdmin === true ||
      me?.isadmin === true ||
      me?.admin === true ||
      role === "admin" ||
      role === "administrator" ||
      me?.permissions?.includes?.("admin"));

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-slate-200 hover:bg-white/5"
        >
          <User className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-44 bg-slate-950/95 border-white/10 text-slate-100"
      >
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="cursor-pointer">
            My Account
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-56 bg-slate-950/95 border-white/10 text-slate-100">
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href="/me">Thông tin của tôi</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuItem className="cursor-pointer" onClick={openEditName}>
              Sửa tên hiển thị
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={openChangePassword}
            >
              Đổi mật khẩu
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuItem asChild className="cursor-pointer">
          <Link href="/orders">My Orders</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link href="/wishlist">Wishlist</Link>
        </DropdownMenuItem>

        {showDashboard && (
          <DropdownMenuItem asChild className="cursor-pointer">
            <Link href="/dashboard">Dashboard</Link>
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator className="bg-white/10" />
        <DropdownMenuItem className="cursor-pointer" onClick={signOut}>
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
