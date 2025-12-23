"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { catalogApi, variantApi } from "@/lib/api";
import { getAccessToken } from "@/lib/tokens";
import { usePopups } from "@/components/popups/PopupProvider";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

function pickProductName(p) {
  return p?.ten || p?.tensanpham || p?.name || "Sản phẩm";
}

function pickProductImage(p, selectedVariant) {
  return (
    selectedVariant?.hinhanhurl ||
    selectedVariant?.variant_hinhanhurl ||
    p?.hinhanhurl ||
    p?.hinhanh ||
    p?.imageUrl ||
    "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1200&q=80&auto=format&fit=crop"
  );
}

function asNumber(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export default function ProductQuickViewDialog({
  open,
  sanphamid,
  onOpenChange,
}) {
  const { openAuth, openCart } = usePopups();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [selectedBentheid, setSelectedBentheid] = useState(null);
  const [attrs, setAttrs] = useState([]);
  const [qty, setQty] = useState(1);

  const selectedVariant = useMemo(() => {
    if (!selectedBentheid) return null;
    return (
      variants.find((v) => String(v.bentheid) === String(selectedBentheid)) ||
      null
    );
  }, [variants, selectedBentheid]);

  // Load product + variants when open
  useEffect(() => {
    if (!open || !sanphamid) return;

    let alive = true;
    setLoading(true);
    setError("");
    setProduct(null);
    setVariants([]);
    setSelectedBentheid(null);
    setAttrs([]);
    setQty(1);

    (async () => {
      try {
        const pRes = await catalogApi.product(sanphamid);
        const p = pRes?.product || pRes;

        let vs = Array.isArray(p?.variants) ? p.variants : null;
        if (!vs) {
          const vsRes = await catalogApi.variantsByProduct(sanphamid);
          vs =
            vsRes?.variants ||
            vsRes?.items ||
            (Array.isArray(vsRes) ? vsRes : []);
        }

        if (!alive) return;
        setProduct(p);
        setVariants(Array.isArray(vs) ? vs : []);

        const first = (Array.isArray(vs) ? vs : [])[0];
        if (first?.bentheid) setSelectedBentheid(first.bentheid);
      } catch (e) {
        if (!alive) return;
        setError(e?.message || "Không tải được sản phẩm.");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [open, sanphamid]);

  // Load attributes for the selected variant
  useEffect(() => {
    if (!open || !selectedBentheid) return;
    let alive = true;

    (async () => {
      try {
        const aRes = await variantApi.attributes(selectedBentheid);
        const list =
          aRes?.attributes || aRes?.items || (Array.isArray(aRes) ? aRes : []);
        if (!alive) return;
        setAttrs(Array.isArray(list) ? list : []);
      } catch {
        if (!alive) return;
        setAttrs([]);
      }
    })();

    return () => {
      alive = false;
    };
  }, [open, selectedBentheid]);

  async function handleAddToCart() {
    const token = getAccessToken();
    if (!token) {
      onOpenChange?.(false);
      openAuth("login");
      return;
    }
    if (!selectedBentheid) return;

    const { cartApi } = await import("@/lib/api");
    await cartApi.addItem(selectedBentheid, qty);

    openCart();
    onOpenChange?.(false);
  }

  const name = pickProductName(product);
  const imageUrl = pickProductImage(product, selectedVariant);
  const price = asNumber(
    selectedVariant?.giaban ||
      selectedVariant?.gia ||
      product?.giaban ||
      product?.gia
  );
  const stock = asNumber(selectedVariant?.tonkho);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl p-0">
        <ScrollArea className="h-[80vh]">
          <div className="p-6">
            <DialogHeader>
              <DialogTitle className="text-xl">{name}</DialogTitle>
              <div className="text-sm text-muted-foreground">
                Xem nhanh & chọn biến thể.
              </div>
            </DialogHeader>

            {error ? (
              <div className="mt-4 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">
                {error}
              </div>
            ) : null}

            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="rounded-xl overflow-hidden border bg-card">
                <div className="relative aspect-square">
                  <Image
                    src={imageUrl}
                    alt={name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 520px"
                  />
                </div>
              </div>

              <div>
                <div className="text-3xl font-semibold">
                  {loading ? "..." : `${price.toLocaleString("vi-VN")} đ`}
                </div>

                <div className="mt-2 text-sm text-muted-foreground">
                  {selectedBentheid
                    ? stock > 0
                      ? `Còn hàng: ${stock}`
                      : "Hết hàng"
                    : "Chưa có biến thể"}
                </div>

                <div className="mt-5">
                  <div className="text-sm mb-2 font-medium">Biến thể</div>
                  {variants.length === 0 ? (
                    <div className="text-sm text-muted-foreground">—</div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {variants.map((v) => {
                        const active =
                          String(v.bentheid) === String(selectedBentheid);
                        const label = v.sku ? v.sku : `#${v.bentheid}`;
                        return (
                          <Button
                            key={v.bentheid}
                            variant={active ? "default" : "secondary"}
                            onClick={() => setSelectedBentheid(v.bentheid)}
                          >
                            {label}
                          </Button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="mt-5 rounded-xl border p-4">
                  <div className="text-sm font-medium">Thuộc tính biến thể</div>
                  <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                    {selectedBentheid && attrs.length === 0 ? (
                      <div>—</div>
                    ) : (
                      attrs.map((a) => (
                        <div key={`${a.thuoctinhid}-${a.giatri ?? ""}`}>
                          {a.tenthuoctinh}: {a.giatri ?? "—"}
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <Separator className="my-5" />

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                  >
                    -
                  </Button>
                  <div className="w-10 text-center text-sm">{qty}</div>
                  <Button
                    variant="outline"
                    onClick={() => setQty((q) => q + 1)}
                  >
                    +
                  </Button>

                  <Button
                    className="ml-auto"
                    disabled={!selectedBentheid || stock <= 0}
                    onClick={handleAddToCart}
                  >
                    Thêm vào giỏ
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
