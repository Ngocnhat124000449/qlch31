"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePopups } from "@/components/popups/PopupProvider";
import { Button } from "@/components/ui/button";
import UserMenuDropdown from "./UserMenuDropdown";
import {
  Home as HomeIcon,
  Percent,
  Boxes,
  Grid2x2,
  ChevronDown,
  Search,
  Heart,
  ShoppingCart,
  Moon,
} from "lucide-react";
import { hasTokens, onAuthChanged } from "@/lib/tokens";

export default function SiteHeader() {
  const { openAuth, openCart, openSearch } = usePopups();
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    const sync = () => setAuthed(hasTokens());
    sync();
    const off = onAuthChanged(sync);
    return () => off?.();
  }, []);

  const nav = useMemo(
    () => [
      { label: "Home", href: "/", icon: HomeIcon },
      { label: "Promotions", href: "/promotions", icon: Percent },
      { label: "Products", href: "/products", icon: Boxes },
    ],
    []
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#070c1a]/70 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center gap-6 px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5">
            ⌂
          </span>
          <span>QuantumCore</span>
        </Link>

        <nav className="hidden items-center gap-5 md:flex">
          {nav.map((n) => {
            const Icon = n.icon;
            return (
              <Link
                key={n.label}
                href={n.href}
                className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white"
              >
                <Icon className="h-4 w-4" />
                {n.label}
              </Link>
            );
          })}

          <div className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white cursor-pointer">
            <Grid2x2 className="h-4 w-4" />
            Categories
            <ChevronDown className="h-4 w-4 opacity-70" />
          </div>
        </nav>

        <div className="ml-auto hidden w-[420px] items-center md:flex">
          <div
            className="flex w-full items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-slate-300"
            onClick={openSearch}
          >
            <Search className="h-4 w-4 opacity-70" />
            <input
              className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
              placeholder="Search products..."
              readOnly
            />
          </div>
        </div>

        <div className="ml-auto flex items-center gap-3 md:ml-0">
          <Button
            variant="ghost"
            size="icon"
            className="text-slate-200 hover:bg-white/5"
            aria-label="Theme"
          >
            <Moon className="h-5 w-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="text-slate-200 hover:bg-white/5"
            aria-label="Wishlist"
            asChild
          >
            <Link href="/wishlist">
              <Heart className="h-5 w-5" />
            </Link>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="text-slate-200 hover:bg-white/5"
            aria-label="Cart"
            onClick={openCart}
          >
            <ShoppingCart className="h-5 w-5" />
          </Button>

          {authed ? (
            <UserMenuDropdown />
          ) : (
            <Button
              className="bg-indigo-600 hover:bg-indigo-500"
              onClick={() => openAuth("login")}
            >
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
