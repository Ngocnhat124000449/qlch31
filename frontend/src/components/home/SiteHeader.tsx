"use client";
import styles from "../header/SiteHeader.module.scss";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePopups } from "@/components/popups/PopupProvider";
import { Button } from "@/components/ui/button";
import UserMenuDropdown from "./UserMenuDropdown";
import { cn } from "@/lib/utils";
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
      { label: "Trang chủ", href: "/", icon: HomeIcon },
      { label: "Khuyến mại", href: "/promotions", icon: Percent },
      { label: "Sản phẩm", href: "/products", icon: Boxes },
    ],
    [],
  );

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoIcon}>⌂</span>
          <span>QuantumCore</span>
        </Link>

        <nav className={styles.nav}>
          {nav.map((n) => {
            const Icon = n.icon;
            return (
              <Link key={n.label} href={n.href} className={styles.navLink}>
                <Icon />
                {n.label}
              </Link>
            );
          })}

          <div className={cn(styles.navLink, "cursor-pointer")}>
            <Grid2x2 />
            Danh mục
            <ChevronDown />
          </div>
        </nav>

        <div className={styles.searchWrap}>
          <div className={styles.searchBar} onClick={openSearch}>
            <Search />
            <input
              className={styles.searchPlaceholder}
              placeholder="Tìm kiếm sản phẩm..."
              readOnly
            />
          </div>
        </div>

        <div className={styles.actions}>
          <Button
            variant="ghost"
            size="icon"
            className="text-foreground hover:bg-card"
            aria-label="Đổi chủ đề"
          >
            <Moon className="h-5 w-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="text-foreground hover:bg-card"
            aria-label="Danh sách yêu thích"
            asChild
          >
            <Link href="/wishlist">
              <Heart className="h-5 w-5" />
            </Link>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="text-foreground hover:bg-card"
            aria-label="Giỏ hàng"
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
              Đăng nhập
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
