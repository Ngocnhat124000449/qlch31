"use client";

import { Bell, Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme/ThemeProvider";

export default function AdminTopbar({ me }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="sticky top-0 z-20 border-b border-border bg-background/60 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-end gap-2 px-6">
        <button
          type="button"
          onClick={toggleTheme}
          className="grid h-9 w-9 place-items-center rounded-xl bg-card ring-1 ring-border hover:bg-accent"
          aria-label="Đổi giao diện"
          title="Đổi giao diện"
        >
          {theme === "dark" ? (
            <Moon className="h-4 w-4" />
          ) : (
            <Sun className="h-4 w-4" />
          )}
        </button>

        <button
          type="button"
          className="grid h-9 w-9 place-items-center rounded-xl bg-card ring-1 ring-border hover:bg-accent"
          aria-label="Thông báo"
          title="Thông báo"
        >
          <Bell className="h-4 w-4" />
        </button>

        <div className="ml-1 flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <div className="text-sm font-medium leading-4">
              {me?.tenhienthi || me?.fullname || me?.name || "Admin"}
            </div>
            <div className="text-xs text-muted-foreground leading-4">
              Quản trị viên
            </div>
          </div>
          <div className="h-9 w-9 overflow-hidden rounded-full ring-1 ring-border bg-card" />
        </div>
      </div>
    </div>
  );
}
