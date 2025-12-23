"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Home,
  BarChart3,
  Users,
  Truck,
  TrendingUp,
  ShieldCheck,
  Boxes,
  Grid2X2,
  Tags,
  Warehouse,
  Percent,
  ChevronDown,
  Box as Cube,
} from "lucide-react";

function NavItem({ href, icon: Icon, label }) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(href + "/");

  return (
    <Link
      href={href}
      className={[
        "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition",
        active
          ? "bg-violet-500/25 text-white"
          : "text-white/70 hover:bg-white/5 hover:text-white",
      ].join(" ")}
    >
      <Icon className="h-4 w-4 opacity-90" />
      <span className="truncate">{label}</span>
    </Link>
  );
}

function NavGroup({ icon: Icon, label, defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm text-white/80 hover:bg-white/5"
      >
        <span className="flex items-center gap-3">
          <Icon className="h-4 w-4 opacity-90" />
          <span className="truncate">{label}</span>
        </span>
        <ChevronDown
          className={[
            "h-4 w-4 transition",
            open ? "rotate-180 opacity-90" : "opacity-60",
          ].join(" ")}
        />
      </button>

      {open ? <div className="ml-2 space-y-1 pl-2">{children}</div> : null}
    </div>
  );
}

export default function AdminSidebar() {
  const [year, setYear] = useState("");
  useEffect(() => {
    setYear(String(new Date().getFullYear()));
  }, []);

  return (
    <aside className="sticky top-0 h-screen w-[280px] shrink-0 border-r border-white/10 bg-black/10 backdrop-blur-xl">
      <div className="flex h-full flex-col p-4">
        <div className="flex items-center gap-2 px-2 py-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/5 ring-1 ring-white/10">
            <Cube className="h-5 w-5 text-violet-300" />
          </span>
          <div className="leading-tight">
            <div className="text-sm font-semibold">Insights</div>
            <div className="text-xs text-white/50">Admin Dashboard</div>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <NavItem href="/dashboard" icon={Home} label="Tổng quan" />

          <NavGroup icon={BarChart3} label="Phân tích" defaultOpen>
            <NavItem
              href="/dashboard/customers"
              icon={Users}
              label="Khách hàng"
            />
            <NavItem
              href="/dashboard/suppliers"
              icon={Truck}
              label="Nhà cung cấp"
            />
            <NavItem
              href="/dashboard/trends"
              icon={TrendingUp}
              label="Xu hướng"
            />
            <NavItem
              href="/dashboard/warranty"
              icon={ShieldCheck}
              label="Bảo hành"
            />
          </NavGroup>

          <NavGroup icon={Cube} label="Quản lý" defaultOpen>
            <NavItem href="/dashboard/products" icon={Boxes} label="Sản phẩm" />
            <NavItem
              href="/dashboard/categories"
              icon={Grid2X2}
              label="Danh mục"
            />
            <NavItem href="/dashboard/brands" icon={Tags} label="Thương hiệu" />
            <NavItem
              href="/dashboard/inventory"
              icon={Warehouse}
              label="Tồn kho"
            />
            <NavItem
              href="/dashboard/promotions"
              icon={Percent}
              label="Khuyến mãi"
            />
          </NavGroup>
        </div>

        <div className="mt-auto pt-4 text-xs text-white/40 px-2">
          <span suppressHydrationWarning>© {year || ""} Insights</span>
        </div>
      </div>
    </aside>
  );
}
