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

function pickProductId(p: any): any {
  return p?.sanphamid ?? p?.id ?? p?._id ?? null;
}

function pickProductName(p: any): string {
  return p?.tensanpham || p?.ten || p?.name || "Sản phẩm";
}

function pickProductImage(p: any): string | null {
  return p?.hinhanhurl || p?.imageUrl || p?.hinhanh || p?.anh || null;
}

function pickSupplierName(p: any): string | null {
  return (
    p?.nhacungcap_ten ||
    p?.nhacungcapTen ||
    p?.nhacungcap?.ten ||
    p?.supplier?.ten ||
    p?.brand?.ten ||
    null
  );
}

function normalizeVariants(product: any): any[] {
  const v = product?.variants;
  if (Array.isArray(v)) return v;
  if (Array.isArray(product?.bienthe)) return product.bienthe;
  return [];
}

function pickVariantId(v: any): any {
  return v?.bentheid ?? v?.id ?? v?._id ?? null;
}

function pickVariantSku(v: any): string {
  return getVariantDisplayName(v);
}

function pickVariantPrice(v: any): number | null {
  return v?.giaban ?? v?.gia ?? v?.price ?? null;
}

function pickVariantStock(v: any): number | null {
  const s = v?.tonkho ?? v?.stock;
  return s == null ? null : Number(s);
}

interface ProductDetailClientProps {
  initialProduct?: any;
}

export default function ProductDetailClient({
  initialProduct,
}: ProductDetailClientProps): JSX.Element {
  const { openAuth } = usePopups();

  const product = initialProduct;
  const pid = pickProductId(product);
  const name = pickProductName(product);
  const supplier = pickSupplierName(product);
  const imageUrl = pickProductImage(product);
  const desc = product?.motangan || product?.mota || product?.tomtat || "";

  const [variants, setVariants] = useState<any[]>(() =>
    normalizeVariants(product),
  );
  const [variantId, setVariantId] = useState(() => {
    const list = normalizeVariants(product);
    const active = list.find((v) => v?.trangthai !== false) || list[0] || null;
    return pickVariantId(active);
  });

  const selectedVariant = useMemo(() => {
    return (
      variants.find((v) => String(pickVariantId(v)) === String(variantId)) ||
      null
    );
  }, [variants, variantId]);

  const [attrs, setAttrs] = useState<any[]>([]);
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
          { method: "GET", auth: false },
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
        const current = list.find(
          (v) => String(pickVariantId(v)) === String(variantId),
        );
        if (!current) {
          const active =
            list.find((v) => v?.trangthai !== false) || list[0] || null;
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
          { method: "GET", auth: false },
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
        setAttrErr(String(e));
      }
    }
    run();
    return () => {
      alive = false;
    };
  }, [variantId]);

  const onAddCart = async (toWishlist?: boolean): Promise<void> => {
    if (!selectedVariant) {
      setErr("Chọn phiên bản sản phẩm");
      return;
    }

    if (attrs.length > 0 && attrs.some((a) => !a.selected)) {
      setAttrErr("Vui lòng chọn tất cả các thuộc tính");
      return;
    }

    const token = await getAccessToken();
    if (!token) {
      openAuth();
      return;
    }

    setBusy(true);
    setErr("");
    setMsg("");

    try {
      const url = toWishlist ? `/api/wishlist/items` : `/api/cart/items`;

      const res = await apiFetch(url, {
        method: "POST",
        auth: true,
        body: {
          bentheid: pickVariantId(selectedVariant),
          soluong: toWishlist ? 1 : qty,
          attributes: attrs
            .filter((a) => a.selected !== undefined)
            .map((a) => ({
              ...a,
            })),
        },
      });

      setMsg(
        toWishlist ? "Đã thêm vào danh sách yêu thích" : "Đã thêm vào giỏ hàng",
      );
    } catch (e) {
      setErr(String(e));
    } finally {
      setBusy(false);
    }
  };

  const outOfStock = selectedVariant && pickVariantStock(selectedVariant) === 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left: Product Image */}
      <div className="lg:col-span-1 sticky top-20 h-fit">
        <Card>
          <CardContent className="p-0 overflow-hidden">
            <SmartImage
              src={imageUrl}
              alt={name}
              className="w-full h-auto aspect-square object-cover"
            />
          </CardContent>
        </Card>
      </div>

      {/* Right: Product Info & Actions */}
      <div className="lg:col-span-2 space-y-4">
        {/* Product Header */}
        <div>
          <h1 className="text-3xl font-bold">{name}</h1>
          {supplier && <p className="text-gray-500 mt-1">{supplier}</p>}
        </div>

        <Separator />

        {/* Variant Selection */}
        {variants.length > 0 && (
          <div>
            <label className="block text-sm font-medium mb-3">Phiên bản</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {variants.map((v: any) => {
                const vid = pickVariantId(v);
                const sku = pickVariantSku(v);
                const price = pickVariantPrice(v);
                const stock = pickVariantStock(v);
                const isSelected = String(vid) === String(variantId);
                const isDisabled = stock === 0;

                return (
                  <button
                    key={vid}
                    onClick={() => setVariantId(vid)}
                    disabled={isDisabled}
                    className={`p-3 border rounded text-sm transition ${
                      isSelected
                        ? "border-blue-500 bg-blue-50"
                        : isDisabled
                          ? "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
                          : "border-gray-200 hover:border-blue-300"
                    }`}
                  >
                    <div className="font-medium">{sku}</div>
                    {price !== null && (
                      <div className="text-xs">{formatVND(price)}</div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <Separator />

        {/* Attributes */}
        {attrs.length > 0 && (
          <div>
            <label className="block text-sm font-medium mb-3">Thuộc tính</label>
            <div className="space-y-3">
              {attrs.map((attr: any, idx: number) => (
                <div key={idx}>
                  <label className="text-xs font-medium text-gray-600">
                    {attr.ten || "Thuộc tính"}
                  </label>
                  <select
                    onChange={(e) => {
                      const newAttrs = [...attrs];
                      newAttrs[idx].selected = e.target.value;
                      setAttrs(newAttrs);
                      setAttrErr("");
                    }}
                    value={attr.selected || ""}
                    className="w-full mt-1 px-3 py-2 border rounded"
                  >
                    <option value="">-- chọn --</option>
                    {(attr.values || []).map((val: string, vidx: number) => (
                      <option key={vidx} value={val}>
                        {val}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
            {attrErr && <p className="text-red-500 text-sm mt-2">{attrErr}</p>}
          </div>
        )}

        <Separator />

        {/* Price & Stock */}
        {selectedVariant && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Giá</p>
                  <p className="text-2xl font-bold">
                    {formatVND(pickVariantPrice(selectedVariant))}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    Còn {pickVariantStock(selectedVariant)} sản phẩm
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quantity Selection */}
        {!outOfStock && (
          <div>
            <label className="block text-sm font-medium mb-3">Số lượng</label>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQty(Math.max(1, qty - 1))}
              >
                −
              </Button>
              <Input
                type="number"
                min="1"
                value={qty}
                onChange={(e) =>
                  setQty(Math.max(1, parseInt(e.target.value) || 1))
                }
                className="w-16 text-center"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQty(qty + 1)}
              >
                +
              </Button>
            </div>
          </div>
        )}

        <Separator />

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            className="flex-1"
            disabled={busy || outOfStock}
            onClick={() => onAddCart(false)}
          >
            {outOfStock ? "Hết hàng" : "Thêm vào giỏ hàng"}
          </Button>
          <Button
            variant="outline"
            disabled={busy || outOfStock}
            onClick={() => onAddCart(true)}
          >
            ❤ Yêu thích
          </Button>
        </div>

        {/* Messages */}
        {msg && <p className="text-green-600 text-sm">{msg}</p>}
        {err && <p className="text-red-600 text-sm">{err}</p>}

        <Separator />

        {/* Product Description */}
        {desc && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Mô tả</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {desc}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Reviews Section */}
        <ReviewSection productId={pid} />
      </div>
    </div>
  );
}
