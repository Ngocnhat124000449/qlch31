"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Heart, Moon, Search, ShoppingCart, Sun, User2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { usePopups } from "@/components/popups/PopupProvider";
import UserMenuDropdown from "@/components/header/UserMenuDropdown";
import CategoriesDropdown from "@/components/header/CategoriesDropdown";

import { useMe } from "@/hooks/useMe";

function NavLink({ href, label, active }) {
  return (
    <Link
      href={href}
      className={[
        "text-sm font-medium transition-colors",
        active ? "text-slate-100" : "text-slate-300 hover:text-slate-100",
      ].join(" ")}
    >
      {label}
    </Link>
  );
}

function ThemeToggleButton() {
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("qc_theme");
    const preferDark = saved
      ? saved === "dark"
      : document.documentElement.classList.contains("dark");

    setIsDark(preferDark);
    document.documentElement.classList.toggle("dark", preferDark);
  }, []);

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="text-slate-200 hover:bg-white/5"
      />
    );
  }

  const toggle = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("qc_theme", next ? "dark" : "light");
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      className="text-slate-200 hover:bg-white/5"
      aria-label="Toggle theme"
      title="Toggle theme"
    >
      {isDark ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
    </Button>
  );
}

export default function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const popups = usePopups();

  // Prevent SSR-initial "guest" flash:
  // - This component is pre-rendered on the server, where localStorage is
  //   unavailable.
  // - We render a stable placeholder until the client mounts and auth is
  //   resolved.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Auth state
  // (hook returns object: { me, status, loading })
  // keep a small fallback in case older code returns different shape.
  const meState = useMe();
  const me = meState?.me ?? meState?.[0] ?? null;
  const status = meState?.status ?? meState?.[1]?.status;
  const meLoading =
    // preferred
    meState?.loading ??
    // fallback by status
    status === "loading" ??
    // last resort
    meState?.[1]?.loading ??
    false;

  const { openAuth, openCart, openSearch } = popups || {};
  const [q, setQ] = useState("");

  const openLogin = () => {
    if (typeof openAuth === "function") openAuth({ tab: "login" });
  };
  const openRegister = () => {
    if (typeof openAuth === "function") openAuth({ tab: "register" });
  };

  const onSubmitSearch = (e) => {
    e.preventDefault();
    const keyword = q.trim();
    if (!keyword) {
      if (typeof openSearch === "function") openSearch();
      return;
    }
    router.push(`/products?search=${encodeURIComponent(keyword)}`);
  };

  const isActive = (href) =>
    href === "/" ? pathname === "/" : pathname?.startsWith(href);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/60 backdrop-blur">
      <div className="mx-auto max-w-[1200px] px-4">
        <div className="flex h-16 items-center gap-3">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2 text-slate-100">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5">
              <span className="h-3.5 w-3.5 rounded-sm border border-white/30" />
            </span>
            <span className="text-base font-semibold tracking-tight">
              QuantumCore
            </span>
          </Link>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-6 ml-4">
            <NavLink href="/" label="Home" active={isActive("/")} />
            <NavLink
              href="/promotions"
              label="Promotions"
              active={isActive("/promotions")}
            />
            <NavLink
              href="/products"
              label="Products"
              active={isActive("/products")}
            />

            {/* Categories dropdown (tự fetch + normalize) */}
            <CategoriesDropdown active={isActive("/categories")} />
          </nav>

          {/* Search */}
          <div className="flex-1 hidden lg:block">
            <form
              onSubmit={onSubmitSearch}
              className="relative mx-auto max-w-[520px]"
            >
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search products..."
                className="h-10 pl-10 bg-white/5 border-white/10 text-slate-100 placeholder:text-slate-500 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </form>
          </div>

          {/* Actions */}
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggleButton />

            {/* Wishlist */}
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-200 hover:bg-white/5"
              aria-label="Wishlist"
              title="Wishlist"
              onClick={() => {
                // During SSR/hydration or while resolving /me, we don't yet
                // know if the user is authenticated. Avoid flashing the login
                // dialog in that window.
                if (!mounted || meLoading) return;
                if (!me) return openLogin();
                router.push("/wishlist");
              }}
            >
              <Heart className="h-5 w-5" />
            </Button>

            {/* Cart */}
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-200 hover:bg-white/5"
              aria-label="Cart"
              title="Cart"
              onClick={() => {
                if (typeof openCart === "function") openCart();
              }}
            >
              <ShoppingCart className="h-5 w-5" />
            </Button>

            {/* Auth / User */}
            {!mounted || meLoading ? (
              <Button
                variant="ghost"
                size="icon"
                className="text-slate-200 hover:bg-white/5"
              >
                <User2 className="h-5 w-5 opacity-60" />
              </Button>
            ) : me ? (
              <UserMenuDropdown me={me} />
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  className="h-9 bg-white/10 text-slate-100 hover:bg-white/15 border border-white/10"
                  onClick={openRegister}
                >
                  Đăng ký
                </Button>
                <Button className="h-9" onClick={openLogin}>
                  Đăng nhập
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Search mobile */}
        <div className="pb-3 lg:hidden">
          <form onSubmit={onSubmitSearch} className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search products..."
              className="h-10 pl-10 bg-white/5 border-white/10 text-slate-100 placeholder:text-slate-500 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </form>
        </div>
      </div>
    </header>
  );
}
