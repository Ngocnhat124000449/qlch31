"use client";

import Link from "next/link";
import { usePopups } from "@/components/popups/PopupProvider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User } from "lucide-react";

function signOutLocal() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  window.dispatchEvent(new Event("auth:changed"));
}

export default function UserMenuDropdown() {
  const { openEditName, openChangePassword } = usePopups();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-slate-200 hover:bg-white/5"
          aria-label="Account"
        >
          <User className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-52 border-white/10 bg-[#070c1a]/95 text-slate-100"
      >
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="cursor-pointer">
            My Account
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-56 border-white/10 bg-[#070c1a]/95 text-slate-100">
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

        <DropdownMenuItem asChild className="cursor-pointer">
          <Link href="/admin">Dashboard</Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-white/10" />

        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => {
            signOutLocal();
            window.location.href = "/";
          }}
        >
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
