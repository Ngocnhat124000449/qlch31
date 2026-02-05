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
import { clearTokens } from "@/lib/tokens";
import { useMe } from "@/hooks/useMe";

export default function UserMenuDropdown() {
  const { openEditName, openChangePassword } = usePopups();
  const { me } = useMe();
  const isAdmin =
    !!me &&
    (me.isAdmin === true ||
      me.isadmin === true ||
      me.admin === true ||
      (me.role || me.vaitro || me.vaiTro || "").toString().toLowerCase() === "admin" ||
      (me.role || me.vaitro || me.vaiTro || "").toString().toLowerCase() ===
        "administrator" ||
      me?.permissions?.includes?.("admin"));

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-foreground hover:bg-card"
          aria-label="Account"
        >
          <User className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-52 border-border bg-popover text-foreground"
      >
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="cursor-pointer">
            My Account
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-56 border-border bg-popover text-foreground">
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href="/me">Thông tin của tôi</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-muted/50" />
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

        {isAdmin ? (
          <DropdownMenuItem asChild className="cursor-pointer">
            <Link href="/dashboard">Dashboard</Link>
          </DropdownMenuItem>
        ) : null}

        <DropdownMenuSeparator className="bg-muted/50" />

        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => {
            clearTokens();
            window.location.href = "/";
          }}
        >
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
