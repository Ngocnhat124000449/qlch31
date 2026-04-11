"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import SmartImage from "@/components/ui/SmartImage";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";

import { apiFetch } from "@/lib/apiClient";
import { formatVND } from "@/lib/format";
import { getAccessToken } from "@/lib/tokens";
import { usePopups } from "@/components/popups/PopupProvider";
import { getVariantDisplayName } from "@/lib/variantLabel";

import ReviewSection from "./ReviewSection";

function pickProductId(p) {
  return p?.sanphamid ?? p?.id ?? p?._id ?? null;
}

function pickProductName(p) {
  return p?.tensanpham || p?.ten || p?.name || "Sản phẩm";
}

function pickProductImage(p) {
  return p?.hinhanhurl || p?.imageUrl || p?.hinhanh || p?.anh || null;
}

function pickSupplierName(p) {
  return (
    p?.nhacungcap_ten ||
    p?.nhacungcapTen ||
    p?.nhacungcap?.ten ||
    p?.supplier?.ten ||
    p?.brand?.ten ||
    null
  );
}

function normalizeVariants(product) {
  const v = product?.variants;
  if (Array.isArray(v)) return v;
  if (Array.isArray(product?.bienthe)) return product.bienthe;
  return [];
}

function pickVariantId(v) {
  return v?.bentheid ?? v?.id ?? v?._id ?? null;
}

function pickVariantSku(v) {
  return getVariantDisplayName(v);
}

function pickVariantPrice(v) {
  return v?.giaban ?? v?.gia ?? v?.price ?? null;
}

function pickVariantStock(v) {
  const s = v?.tonkho ?? v?.stock;
  return s == null ? null : Number(s);
}

export default function ProductDetailClient({ initialProduct }) {
  const { openAuth } = usePopups();

  const product = initialProduct;
  const pid = pickProductId(product);
  const name = pickProductName(product);
  const supplier = pickSupplierName(product);
  const imageUrl = pickProductImage(product);
  const desc = product?.motangan || product?.mota || product?.tomtat || "";

  const [variants, setVariants] = useState(() => normalizeVariants(product));
  const [variantId, setVariantId] = useState(() => {
    const list = normalizeVariants(product);
    const active = list.find((v) => v?.trangthai !== false) || list[0] || null;
    return pickVariantId(active);
  });

  const selectedVariant = useMemo(() => {
    return variants.find((v) => String(pickVariantId(v)) === String(variantId)) || null;
  }, [variants, variantId]);

  const [attrs, setAttrs] = useState([]);
  const [attrErr, setAttrErr] = useState("");

  const [qty, setQty] = useState(1);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  // Load variants from API (đảm bảo luôn đúng data backend)
  useEffect(() => {
    let alive = true;
    async function run() {
      if (!pid) return;
      try {
        const data = await apiFetch(
          `/api/catalog/products/${encodeURIComponent(pid)}/variants`,
          { method: "GET", auth: false }
        );
        const list = Array.isArray(data?.variants)
          ? data.variants
          : Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
          ? data.data
          : [];
        if (!alive) return;
        setVariants(list);

        // keep selection valid
        const current = list.find((v) => String(pickVariantId(v)) === String(variantId));
        if (!current) {
          const active = list.find((v) => v?.trangthai !== false) || list[0] || null;
          setVariantId(pickVariantId(active));
        }
      } catch {
        // fallback: keep initial
      }
    }
    run();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pid]);

  // Load variant attributes
  useEffect(() => {
    let alive = true;
    async function run() {
      if (!variantId) {
        setAttrs([]);
        return;
      }
      setAttrErr("");
      try {
        const data = await apiFetch(
          `/api/variants/${encodeURIComponent(variantId)}/attributes`,
          { method: "GET", auth: false }
        );
        const list = Array.isArray(data?.attributes)
          ? data.attributes
          : Array.isArray(data)
          ? data
          : [];
        if (!alive) return;
        setAttrs(list);
      } catch (e) {
        if (!alive) return;
        setAttrs([]);
        setAttrErr(e?.message || "Không thể tải thuộc tính biến thể.");
      }
    }
    run();
    return () => {
      alive = false;
    };
  }, [variantId]);

  function clampQty(v) {
    const n = Math.max(1, Number(v || 1));
    const stock = pickVariantStock(selectedVariant);
    if (stock != null) return Math.min(stock, n);
    return n;
  }

  async function addToCart() {
    setErr("");
    setMsg("");
    if (!variantId) {
      setErr("Vui lòng chọn biến thể.");
      return;
    }

    // require login
    if (!getAccessToken()) {
      openAuth("login");
      return;
    }

    setBusy(true);
    try {
      await apiFetch("/api/cart/items", {
        method: "POST",
        body: { bentheid: Number(variantId), soluong: clampQty(qty) },
      });
      setMsg("Đã thêm vào giỏ.");
    } catch (e) {
      setErr(e?.message || "Không thể thêm vào giỏ.");
    } finally {
      setBusy(false);
    }
  }

  async function addToWishlist() {
    setErr("");
    setMsg("");
    if (!variantId) {
      setErr("Vui lòng chọn biến thể.");
      return;
    }
    if (!getAccessToken()) {
      openAuth("login");
      return;
    }
    setBusy(true);
    try {
      await apiFetch("/api/wishlist/items", {
        method: "POST",
        body: { bentheid: Number(variantId) },
      });
      setMsg("Đã thêm vào wishlist.");
    } catch (e) {
      setErr(e?.message || "Không thể thêm vào wishlist.");
    } finally {
      setBusy(false);
    }
  }

  const price = pickVariantPrice(selectedVariant);
  const stock = pickVariantStock(selectedVariant);

  return (
    <main className="mx-auto max-w-6xl px-5 py-8">
      <div className="text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          Trang chủ
        </Link>{" "}
        <span className="mx-2">/</span>
        <Link href="/products" className="hover:text-foreground">
          Sản phẩm
        </Link>{" "}
        <span className="mx-2">/</span>
        <span className="text-foreground">{name}</span>
      </div>

      <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="relative aspect-[4/3]">
            <SmartImage src={imageUrl} alt={name} className="h-full w-full object-cover" />
          </div>
          <div className="p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <h1 className="text-2xl font-semibold text-foreground">{name}</h1>
                {supplier ? (
                  <div className="mt-1 text-sm text-muted-foreground">{supplier}</div>
                ) : null}
              </div>
              {pid != null ? (
                <Badge className="bg-muted/50 text-foreground border border-border">
                  SP#{pid}
                </Badge>
              ) : null}
            </div>

            {desc ? (
              <p className="mt-3 text-sm text-muted-foreground whitespace-pre-line">{desc}</p>
            ) : null}
          </div>
        </div>

        <div className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Chọn biến thể</CardTitle>
            </CardHeader>
            <CardContent>
              {variants.length === 0 ? (
                <div className="text-sm text-muted-foreground">Sản phẩm chưa có biến thể.</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {variants.map((v) => {
                    const vid = pickVariantId(v);
                    const active = v?.trangthai !== false;
                    const isSel = String(vid) === String(variantId);
                    const vPrice = pickVariantPrice(v);
                    const vStock = pickVariantStock(v);
                    return (
                      <button
                        key={String(vid)}
                        type="button"
                        onClick={() => setVariantId(vid)}
                        className={[
                          "rounded-xl border px-3 py-3 text-left transition",
                          isSel
                            ? "border-indigo-400/60 bg-indigo-500/10"
                            : "border-border bg-muted/30 dark:bg-muted/30 dark:bg-slate-950/30 hover:bg-muted/50 dark:hover:bg-slate-950/45",
                          !active ? "opacity-60" : "",
                        ].join(" ")}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-foreground truncate">
                              {pickVariantSku(v)}
                            </div>
                            <div className="mt-1 text-xs text-muted-foreground">
                              Bentheid: {vid ?? "-"}
                              {vStock != null ? <span className="ml-2">· Tồn: {vStock}</span> : null}
                              {!active ? <span className="ml-2">· Tạm tắt</span> : null}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-bold text-primary">
                              {vPrice != null ? formatVND(vPrice) : "-"}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              <Separator className="my-4 bg-muted/50" />

              <div className="flex flex-col sm:flex-row sm:items-end gap-3">
                <div className="flex-1">
                  <div className="text-sm text-muted-foreground">Giá</div>
                  <div className="mt-1 text-xl font-semibold text-primary">
                    {price != null ? formatVND(price) : "-"}
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {stock == null ? "" : stock > 0 ? `Còn ${stock}` : "Hết hàng"}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-28">
                    <Input
                      type="number"
                      value={qty}
                      min={1}
                      onChange={(e) => setQty(clampQty(e.target.value))}
                    />
                  </div>
                  <Button
                    onClick={addToCart}
                    disabled={busy || !variantId || (stock != null && stock <= 0)}
                  >
                    Thêm giỏ
                  </Button>
                  <Button
                    variant="secondary"
                    className="bg-muted/50 text-foreground hover:bg-muted border border-border"
                    onClick={addToWishlist}
                    disabled={busy || !variantId}
                  >
                    Wishlist
                  </Button>
                </div>
              </div>

              {msg ? (
                <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                  {msg}
                </div>
              ) : null}
              {err ? (
                <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {err}
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Thông số biến thể</CardTitle>
            </CardHeader>
            <CardContent>
              {attrErr ? (
                <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {attrErr}
                </div>
              ) : null}

              {attrs.length === 0 ? (
                <div className="text-sm text-muted-foreground">Chưa có thuộc tính.</div>
              ) : (
                <div className="space-y-2">
                  {attrs.map((a, idx) => {
                    const label = a?.ten || a?.tenthuoctinh || a?.name || `Thuộc tính ${idx + 1}`;
                    const value = a?.giatri || a?.value || a?.noidung || "-";
                    return (
                      <div
                        key={String(a?.thuoctinhid ?? a?.id ?? idx)}
                        className="flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/30 dark:bg-slate-950/30 px-3 py-2"
                      >
                        <div className="text-sm text-foreground">{label}</div>
                        <div className="text-sm font-medium text-foreground">{String(value)}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-8">
        <ReviewSection bentheid={variantId} />
      </div>
    </main>
  );
}
