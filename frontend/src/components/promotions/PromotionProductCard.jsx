"use client";

import SmartImage from "@/components/ui/SmartImage";
import { Button } from "@/components/ui/button";
import { formatVND } from "@/lib/format";
import { usePopups } from "@/components/popups/PopupProvider";

export default function PromotionProductCard({ product }) {
  const { openQuickView } = usePopups();

  const id = product?.sanphamid ?? product?.id;
  const name = product?.ten ?? product?.tensanpham ?? "Sản phẩm";
  const desc =
    product?.motangan ??
    product?.tomtat ??
    null;

  const imageUrl =
    product?.hinhanhurl ||
    product?.imageUrl ||
    product?.hinhanh ||
    null;

  const discount = product?.giamphantram ?? product?.discountPercent ?? null;

  const price =
    product?.giaban ?? product?.gia ?? product?.price ?? product?.minPrice;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
      <div className="relative aspect-[4/3]">
        <SmartImage src={imageUrl} alt={name} className="h-full w-full object-cover" />

        {discount != null ? (
          <div className="absolute left-3 top-3 rounded-md bg-red-500 text-white text-xs font-semibold px-2 py-1">
            Giảm {discount}%
          </div>
        ) : null}
      </div>

      <div className="p-4">
        <div className="text-slate-100 font-semibold line-clamp-1">{name}</div>
        {desc ? <div className="mt-1 text-sm text-slate-400 line-clamp-2">{desc}</div> : null}

        <div className="mt-4 text-slate-100 font-bold">{formatVND(price)}</div>

        <Button
          className="mt-4 w-full bg-indigo-600 hover:bg-indigo-500"
          onClick={() => id && openQuickView(id)}
          disabled={!id}
        >
          Xem nhanh
        </Button>
      </div>
    </div>
  );
}
