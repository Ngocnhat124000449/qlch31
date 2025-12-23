"use client";

import SmartImage from "@/components/ui/SmartImage";
import { useEffect, useMemo, useState } from "react";

import { usePopups } from "@/components/popups/PopupProvider";
import { catalogApi, variantApi, reviewApi, cartApi } from "@/lib/api";
import { getAccessToken } from "@/lib/tokens";
import { formatVND } from "@/lib/format";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

function normalizeProduct(res) {
  return res?.product || res || null;
}

function normalizeAttributes(res) {
  // API doc: { variant: {...}, attributes: [...] }
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.attributes)) return res.attributes;
  if (Array.isArray(res?.items)) return res.items;
  return [];
}

function normalizeReviews(res) {
  // API doc: { summary: {...}, reviews: [...] }
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.reviews)) return res.reviews;
  if (Array.isArray(res?.items)) return res.items;
  return [];
}

function pickBestVariant(variants) {
  const vs = Array.isArray(variants) ? variants : [];
  return (
    vs.find((v) => v?.trangthai === true) ||
    vs.find((v) => Number(v?.tonkho || 0) > 0) ||
    vs[0] ||
    null
  );
}

export default function ProductQuickViewDialog({ open, sanphamid, onOpenChange }) {
  const { closeQuickView, openAuth, openCart } = usePopups();

  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [selectedVariantId, setSelectedVariantId] = useState(null);

  const [attrs, setAttrs] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [qty, setQty] = useState(1);

  const selectedVariant = useMemo(() => {
    return (
      variants.find((v) => String(v.bentheid) === String(selectedVariantId)) ||
      null
    );
  }, [variants, selectedVariantId]);

  useEffect(() => {
    if (!open || !sanphamid) return;

    let alive = true;
    setLoading(true);
    setProduct(null);
    setVariants([]);
    setSelectedVariantId(null);
    setAttrs([]);
    setReviews([]);
    setQty(1);

    catalogApi
      .product(sanphamid)
      .then((res) => {
        if (!alive) return;
        const p = normalizeProduct(res);
        setProduct(p);

        const vs = Array.isArray(p?.variants) ? p.variants : [];
        setVariants(vs);

        const best = pickBestVariant(vs);
        if (best?.bentheid != null) setSelectedVariantId(best.bentheid);
      })
      .finally(() => alive && setLoading(false));

    return () => {
      alive = false;
    };
  }, [open, sanphamid]);

  useEffect(() => {
    if (!open || !selectedVariantId) return;

    let alive = true;
    Promise.all([
      variantApi.attributes(selectedVariantId),
      reviewApi.byVariant(selectedVariantId),
    ])
      .then(([a, r]) => {
        if (!alive) return;
        setAttrs(normalizeAttributes(a));
        setReviews(normalizeReviews(r));
      })
      .catch(() => {
        if (!alive) return;
        setAttrs([]);
        setReviews([]);
      });

    return () => {
      alive = false;
    };
  }, [open, selectedVariantId]);

  async function handleAddToCart() {
    const token = getAccessToken();
    if (!token) {
      closeQuickView();
      openAuth("login");
      return;
    }
    if (!selectedVariantId) return;

    await cartApi.addItem(selectedVariantId, qty);
    closeQuickView();
    openCart();
  }

  const name = product?.ten || product?.tensanpham || (loading ? "Loading..." : "—");
  const desc = product?.motangan || product?.mota || "";

  const heroImg =
    selectedVariant?.hinhanhurl ||
    product?.hinhanhurl ||
    product?.imageUrl ||
    product?.hinhanh ||
    null;

  const canBuy =
    !!selectedVariantId && Number(selectedVariant?.tonkho ?? 0) > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl p-0">
        <ScrollArea className="h-[80vh]">
          <div className="p-6">
            <DialogHeader>
              <DialogTitle className="text-xl text-slate-100">{name}</DialogTitle>
              {desc ? (
                <div className="text-sm text-slate-400">{desc}</div>
              ) : null}
            </DialogHeader>

            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 aspect-square">
                <SmartImage src={heroImg} alt={name} className="h-full w-full object-cover" />
              </div>

              <div>
                <div className="text-3xl font-semibold text-slate-100">
                  {selectedVariant?.giaban ? formatVND(selectedVariant.giaban) : "—"}
                </div>
                <div className="mt-2 text-sm text-slate-400">
                  {Number(selectedVariant?.tonkho ?? 0) > 0 ? "Còn hàng" : "Hết hàng"}
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                  >
                    -
                  </Button>
                  <div className="w-10 text-center text-slate-100">{qty}</div>
                  <Button variant="secondary" onClick={() => setQty((q) => q + 1)}>
                    +
                  </Button>
                </div>

                <div className="mt-5">
                  <div className="text-sm text-slate-300 mb-2">Chọn biến thể</div>
                  <div className="flex flex-wrap gap-2">
                    {variants.map((v) => (
                      <Button
                        key={v.bentheid}
                        variant={
                          String(v.bentheid) === String(selectedVariantId)
                            ? "default"
                            : "secondary"
                        }
                        onClick={() => setSelectedVariantId(v.bentheid)}
                      >
                        {v.sku || `Variant #${v.bentheid}`}
                      </Button>
                    ))}
                  </div>
                </div>

                <Button
                  className="mt-6 w-full"
                  disabled={!canBuy}
                  onClick={handleAddToCart}
                >
                  Thêm vào giỏ hàng
                </Button>

                <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-sm font-medium text-slate-100">Thông số nhanh</div>
                  <div className="mt-2 text-sm text-slate-400">
                    {attrs.length === 0 ? "—" : null}
                    {attrs.slice(0, 6).map((a, idx) => (
                      <div key={idx}>
                        {a.tenthuoctinh}: {a.giatri}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <Separator className="my-8" />

            <div>
              <div className="text-xl font-semibold text-slate-100">Đánh giá</div>
              <div className="mt-4 space-y-4">
                {reviews.length === 0 ? (
                  <div className="text-sm text-slate-400">Chưa có đánh giá.</div>
                ) : (
                  reviews.map((rv) => (
                    <div key={rv.danhgiaid || rv.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-slate-100">
                          {rv.user?.hoten || rv.hoten || "Ẩn danh"}
                        </div>
                        <div className="text-xs text-slate-400">{rv.created_at || rv.createdAt || ""}</div>
                      </div>
                      <div className="mt-2 text-sm text-slate-300">{rv.noidung}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
