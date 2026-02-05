"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import SiteHeader from "@/components/header/SiteHeader";
import Footer from "@/components/home/Footer";
import SmartImage from "@/components/ui/SmartImage";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import { useMe } from "@/hooks/useMe";
import { usePopups } from "@/components/popups/PopupProvider";
import { apiFetch } from "@/lib/apiClient";
import { formatVND } from "@/lib/format";

function normalizeWishlist(data) {
  // Backend thường trả: { wishlist: { items: [], count } }
  // hoặc { items: [] }
  const w = data?.wishlist ?? data?.data?.wishlist ?? data;
  const items = Array.isArray(w?.items) ? w.items : Array.isArray(w) ? w : [];
  const count = Number(w?.count ?? items.length ?? 0);
  return { items, count };
}

function pickProductIdFromWishlistItem(it) {
  return (
    it?.sanpham?.sanphamid ??
    it?.sanpham?.id ??
    it?.sanphamid ??
    it?.productId ??
    null
  );
}

function pickProductNameFromWishlistItem(it) {
  return it?.sanpham?.ten || it?.sanpham?.tensanpham || it?.ten || "Sản phẩm";
}

function pickProductImageFromWishlistItem(it) {
  return (
    it?.sanpham?.hinhanhurl ||
    it?.sanpham?.imageUrl ||
    it?.sanpham?.hinhanh ||
    it?.hinhanhurl ||
    it?.imageUrl ||
    null
  );
}

function pickVariantIdFromWishlistItem(it) {
  return it?.bentheid ?? it?.variantId ?? it?.id ?? null;
}

function pickVariantSkuFromWishlistItem(it) {
  return it?.sku || it?.tenbienthe || it?.variantSku || null;
}

function pickVariantPriceFromWishlistItem(it) {
  return it?.giaban ?? it?.gia ?? it?.price ?? null;
}

function pickVariantStockFromWishlistItem(it) {
  const v = it?.bienthe ?? it?.variant ?? it;
  const stock = v?.tonkho ?? v?.stock;
  return stock == null ? null : Number(stock);
}

export const dynamic = "force-dynamic";

export default function WishlistPage() {
  const { me, loading } = useMe();
  const { openAuth } = usePopups();

  const [items, setItems] = useState([]);
  const [count, setCount] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const canLoad = !loading && !!me;

  async function load() {
    setError("");
    try {
      const data = await apiFetch("/api/wishlist", { method: "GET" });
      const w = normalizeWishlist(data);
      setItems(w.items);
      setCount(w.count);
    } catch (e) {
      setError(e?.message || "Không thể tải wishlist.");
    }
  }

  useEffect(() => {
    if (canLoad) load();
    if (!loading && !me) {
      // nếu chưa đăng nhập thì không auto bật modal (tránh UX khó chịu)
      setItems([]);
      setCount(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canLoad]);

  const byProduct = useMemo(() => {
    const map = new Map();
    for (const it of items) {
      const pid = pickProductIdFromWishlistItem(it);
      if (pid == null) continue;
      if (!map.has(pid)) map.set(pid, []);
      map.get(pid).push(it);
    }
    return map;
  }, [items]);

  async function removeItem(bentheid) {
    if (bentheid == null) return;
    setBusy(true);
    setError("");
    try {
      await apiFetch(`/api/wishlist/items/${encodeURIComponent(bentheid)}`, {
        method: "DELETE",
      });
      await load();
    } catch (e) {
      setError(e?.message || "Không thể xoá khỏi wishlist.");
    } finally {
      setBusy(false);
    }
  }

  async function clearAll() {
    setBusy(true);
    setError("");
    try {
      await apiFetch("/api/wishlist/clear", { method: "DELETE" });
      await load();
    } catch (e) {
      setError(e?.message || "Không thể xoá wishlist.");
    } finally {
      setBusy(false);
    }
  }

  async function addToCart(bentheid) {
    if (bentheid == null) return;
    setBusy(true);
    setError("");
    try {
      await apiFetch("/api/cart/items", {
        method: "POST",
        body: { bentheid: Number(bentheid), soluong: 1 },
      });
      // giữ nguyên wishlist, chỉ thông báo nhẹ
    } catch (e) {
      setError(e?.message || "Không thể thêm vào giỏ.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-background dark:bg-gradient-to-b dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
      <SiteHeader />

      <main className="mx-auto max-w-6xl px-5 py-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-sm text-muted-foreground">
              <Link href="/" className="hover:text-foreground">
                Trang chủ
              </Link>{" "}
              <span className="mx-2">/</span>
              <span className="text-foreground">Wishlist</span>
            </div>

            <h1 className="mt-2 text-2xl font-semibold text-foreground">
              Wishlist
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {loading ? "Đang tải..." : me ? `${count} mục` : "Bạn chưa đăng nhập"}
            </p>
          </div>

          {me ? (
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                className="bg-muted/50 text-foreground hover:bg-muted border border-border"
                onClick={load}
                disabled={busy}
              >
                Tải lại
              </Button>
              <Button
                variant="destructive"
                className="bg-red-600 hover:bg-red-500"
                onClick={clearAll}
                disabled={busy || items.length === 0}
              >
                Xoá tất cả
              </Button>
            </div>
          ) : (
            <Button onClick={() => openAuth("login")}>Đăng nhập</Button>
          )}
        </div>

        {error ? (
          <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        {!me && !loading ? (
          <div className="mt-8 rounded-2xl border border-border bg-card p-6 text-foreground">
            <div className="text-lg font-semibold">Bạn chưa đăng nhập</div>
            <div className="mt-2 text-sm text-muted-foreground">
              Hãy đăng nhập để xem wishlist của bạn.
            </div>
            <div className="mt-4">
              <Button onClick={() => openAuth("login")}>Mở đăng nhập</Button>
            </div>
          </div>
        ) : null}

        {me && items.length === 0 && !loading ? (
          <div className="mt-8 rounded-2xl border border-border bg-card p-6 text-foreground">
            Wishlist của bạn đang trống.
            <div className="mt-3">
              <Link
                href="/products"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Đi mua sắm →
              </Link>
            </div>
          </div>
        ) : null}

        {me && items.length > 0 ? (
          <div className="mt-6 space-y-6">
            {Array.from(byProduct.entries()).map(([pid, list]) => {
              const name = pickProductNameFromWishlistItem(list[0]);
              const imageUrl = pickProductImageFromWishlistItem(list[0]);

              return (
                <div
                  key={String(pid)}
                  className="rounded-2xl border border-border bg-card overflow-hidden"
                >
                  <div className="flex flex-col sm:flex-row gap-4 p-4">
                    <Link
                      href={`/products/${encodeURIComponent(pid)}`}
                      className="block shrink-0"
                    >
                      <div className="h-24 w-36 overflow-hidden rounded-xl border border-border bg-muted/40 dark:bg-muted/40 dark:bg-slate-950/40">
                        <SmartImage
                          src={imageUrl}
                          alt={name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </Link>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <Link
                            href={`/products/${encodeURIComponent(pid)}`}
                            className="text-foreground font-semibold hover:underline"
                          >
                            {name}
                          </Link>
                          <div className="mt-1 text-xs text-muted-foreground">
                            {list.length} biến thể trong wishlist
                          </div>
                        </div>

                        <Badge className="bg-muted/50 text-foreground border border-border">
                          SP#{pid}
                        </Badge>
                      </div>

                      <Separator className="my-3 bg-muted/50" />

                      <div className="space-y-2">
                        {list.map((it) => {
                          const bentheid = pickVariantIdFromWishlistItem(it);
                          const sku =
                            pickVariantSkuFromWishlistItem(it) ||
                            (bentheid != null ? `#${bentheid}` : "-");
                          const price = pickVariantPriceFromWishlistItem(it);
                          const stock = pickVariantStockFromWishlistItem(it);

                          return (
                            <div
                              key={String(bentheid ?? sku)}
                              className="flex flex-col md:flex-row md:items-center justify-between gap-3 rounded-xl border border-border bg-muted/30 dark:bg-muted/30 dark:bg-slate-950/30 px-3 py-3"
                            >
                              <div className="min-w-0">
                                <div className="text-sm font-medium text-foreground truncate">
                                  {sku}
                                </div>
                                <div className="mt-0.5 text-xs text-muted-foreground">
                                  Bentheid: {bentheid ?? "-"}
                                  {stock != null ? (
                                    <span className="ml-2">· Tồn: {stock}</span>
                                  ) : null}
                                </div>
                              </div>

                              <div className="flex flex-wrap items-center gap-2 md:justify-end">
                                <div className="mr-auto md:mr-0 text-sm font-semibold text-pink-300">
                                  {price != null ? formatVND(price) : "-"}
                                </div>

                                <Button
                                  variant="secondary"
                                  className="bg-muted/50 text-foreground hover:bg-muted border border-border"
                                  onClick={() => addToCart(bentheid)}
                                  disabled={busy || bentheid == null}
                                >
                                  Thêm vào giỏ
                                </Button>

                                <Button
                                  variant="destructive"
                                  className="bg-red-600 hover:bg-red-500"
                                  onClick={() => removeItem(bentheid)}
                                  disabled={busy || bentheid == null}
                                >
                                  Xoá
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}
      </main>

      <Footer />
    </div>
  );
}
