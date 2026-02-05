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
import { useTheme } from "@/components/theme/ThemeProvider";

function NavLink({ href, label, active }) {
  return (
    <Link
      href={href}
      className={[
        "text-sm font-medium transition-colors",
        active
          ? "text-foreground"
          : "text-muted-foreground hover:text-foreground",
      ].join(" ")}
    >
      {label}
    </Link>
  );
}

function ThemeToggleButton() {
  const { theme, toggleTheme, mounted } = useTheme();
  const isDark = theme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      title="Toggle theme"
      disabled={!mounted}
    >
      {mounted ? (
        isDark ? (
          <Moon className="h-5 w-5" />
        ) : (
          <Sun className="h-5 w-5" />
        )
      ) : null}
    </Button>
  );
}

export default function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const popups = usePopups();

  // Prevent SSR-initial "guest" flash.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Auth state
  const meState = useMe();
  const me = meState?.me ?? meState?.[0] ?? null;
  const status = meState?.status ?? meState?.[1]?.status;
  const meLoading = meState?.loading ?? (status === "loading") ?? false;

  const { openAuth, openCart, openSearch } = popups || {};
  const [q, setQ] = useState("");

  const openLogin = () => {
    if (typeof openAuth === "function") openAuth("login");
  };
  const openRegister = () => {
    if (typeof openAuth === "function") openAuth("register");
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
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto max-w-[1200px] px-4">
        <div className="flex h-16 items-center gap-3">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card">
              <span className="h-3.5 w-3.5 rounded-sm border border-border" />
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

            <CategoriesDropdown active={isActive("/categories")} />
          </nav>

          {/* Search */}
          <div className="flex-1 hidden lg:block">
            <form
              onSubmit={onSubmitSearch}
              className="relative mx-auto max-w-[520px]"
            >
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search products..."
                className="h-10 pl-10 bg-muted/40 border-input focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </form>
          </div>

          {/* Actions */}
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggleButton />

            <Button
              variant="ghost"
              size="icon"
              aria-label="Wishlist"
              title="Wishlist"
              onClick={() => {
                if (!mounted || meLoading) return;
                if (!me) return openLogin();
                router.push("/wishlist");
              }}
            >
              <Heart className="h-5 w-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              aria-label="Cart"
              title="Cart"
              onClick={() => {
                if (typeof openCart === "function") openCart();
              }}
            >
              <ShoppingCart className="h-5 w-5" />
            </Button>

            {!mounted || meLoading ? (
              <Button variant="ghost" size="icon">
                <User2 className="h-5 w-5 opacity-60" />
              </Button>
            ) : me ? (
              <UserMenuDropdown me={me} />
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  className="h-9"
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
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search products..."
              className="h-10 pl-10 bg-muted/40 border-input focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </form>
        </div>
      </div>
    </header>
  );
}
