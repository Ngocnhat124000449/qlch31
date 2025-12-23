"use client";

import { Bell, Moon } from "lucide-react";

export default function AdminTopbar({ me }) {
  return (
    <div className="sticky top-0 z-20 border-b border-white/10 bg-black/10 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-end gap-2 px-6">
        <button className="grid h-9 w-9 place-items-center rounded-xl bg-white/5 ring-1 ring-white/10 hover:bg-white/10">
          <Moon className="h-4 w-4 text-white/80" />
        </button>
        <button className="grid h-9 w-9 place-items-center rounded-xl bg-white/5 ring-1 ring-white/10 hover:bg-white/10">
          <Bell className="h-4 w-4 text-white/80" />
        </button>

        <div className="ml-1 flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <div className="text-sm font-medium leading-4">
              {me?.tenhienthi || me?.fullname || me?.name || "Admin"}
            </div>
            <div className="text-xs text-white/50 leading-4">Quản trị viên</div>
          </div>
          <div className="h-9 w-9 overflow-hidden rounded-full ring-1 ring-white/10 bg-white/5" />
        </div>
      </div>
    </div>
  );
}
