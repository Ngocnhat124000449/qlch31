"use client";
import styles from "./ProductCard.module.scss";

import SmartImage from "@/components/ui/SmartImage";
import { Star, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatVND } from "@/lib/format";
import { usePopups } from "@/components/popups/PopupProvider";

export default function ProductCard({ product, showBadges = true }) {
  const { openQuickView, openAuth } = usePopups();

  const id = product.sanphamid || product.id;
  const name = product.tensanpham || product.ten || "Sản phẩm";
  const imageUrl =
    product.hinhanhurl ||
    product.imageUrl ||
    product.hinhanh ||
    product.anh ||
    null;

  const price = product.gia || product.giaban || product.price;
  const oldPrice = product.giacu || product.giagoc || null;
  const rating = product.rating ?? product.avgRating ?? null;
  const ratingText = rating != null ? Number(rating).toFixed(1) : null;

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="relative h-52">
        <SmartImage src={imageUrl} alt={name} className="h-full w-full object-cover" />
        {showBadges && (
          <div className="absolute left-3 top-3 space-y-2">
            {product.giamphantram ? (
              <div className="rounded-full bg-red-500 text-foreground text-xs font-semibold px-2 py-1">
                Giảm {product.giamphantram}%
              </div>
            ) : null}
          </div>
        )}

        <button
          className="absolute right-3 bottom-3 h-9 w-9 rounded-full bg-card border border-border flex items-center justify-center hover:bg-accent"
          onClick={() => openAuth("login")}
          aria-label="wishlist"
        >
          <Heart className="h-4 w-4 text-foreground" />
        </button>
      </div>

      <div className="p-4">
        <div className="text-foreground font-semibold line-clamp-1">{name}</div>

        <div className="mt-3">
          <div className="text-pink-400 font-bold">{formatVND(price)}</div>
          {oldPrice ? (
            <div className="text-muted-foreground text-sm line-through">
              {formatVND(oldPrice)}
            </div>
          ) : null}
        </div>

        {ratingText ? (
          <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span>{ratingText}</span>
          </div>
        ) : (
          <div className="mt-3 text-sm text-muted-foreground">Chưa có đánh giá</div>
        )}

        <div className="mt-4 flex items-center justify-between">
          <button className="text-muted-foreground hover:text-foreground text-sm flex items-center gap-2">
            <Heart className="h-4 w-4" />
            Yêu thích
          </button>
        </div>

        <Button
          className="mt-4 w-full bg-indigo-600 hover:bg-indigo-500"
          onClick={() => openQuickView(id)}
        >
          Xem nhanh
        </Button>
      </div>
    </div>
  );
}
