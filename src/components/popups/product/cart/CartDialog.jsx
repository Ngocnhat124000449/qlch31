"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { cartApi } from "@/lib/api";
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

function pickCart(data) {
  return data?.cart || data;
}

function asNumber(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export default function CartDialog({ open, onOpenChange }) {
  const { openAuth } = usePopups();

  const [loading, setLoading] = useState(false);
  const [cart, setCart] = useState(null);
  const [error, setError] = useState("");

  const items = useMemo(() => {
    const c = pickCart(cart);
    return c?.items || [];
  }, [cart]);

  async function refreshCart() {
    const c = await cartApi.get();
    setCart(pickCart(c));
  }

  useEffect(() => {
    if (!open) return;

    const token = getAccessToken();
    if (!token) {
      onOpenChange?.(false);
      openAuth("login");
      return;
    }

    let alive = true;
    setLoading(true);
    setError("");

    cartApi
      .get()
      .then((c) => {
        if (!alive) return;
        setCart(pickCart(c));
      })
      .catch((e) => {
        if (!alive) return;
        setError(e?.message || "Không tải được giỏ hàng.");
      })
      .finally(() => alive && setLoading(false));

    return () => {
      alive = false;
    };
  }, [open, onOpenChange, openAuth]);

  async function inc(it) {
    await cartApi.updateItem(it.bentheid, asNumber(it.soluong) + 1);
    await refreshCart();
  }

  async function dec(it) {
    const nextQty = Math.max(1, asNumber(it.soluong) - 1);
    await cartApi.updateItem(it.bentheid, nextQty);
    await refreshCart();
  }

  async function remove(it) {
    await cartApi.removeItem(it.bentheid);
    await refreshCart();
  }

  async function clear() {
    await cartApi.clear();
    await refreshCart();
  }

  const subtotal = asNumber(cart?.subtotal);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Giỏ hàng</DialogTitle>
        </DialogHeader>

        {error ? (
          <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {items.length} sản phẩm
          </div>
          <Button
            variant="secondary"
            onClick={clear}
            disabled={items.length === 0}
          >
            Xoá tất cả
          </Button>
        </div>

        <Separator className="my-3" />

        <ScrollArea className="h-[50vh] pr-2">
          {loading ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              Loading...
            </div>
          ) : items.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              Giỏ hàng trống
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((it) => {
                const title = it?.sanpham?.ten || "Sản phẩm";
                const img =
                  it.variant_hinhanhurl ||
                  it?.sanpham?.hinhanhurl ||
                  "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1200&q=80&auto=format&fit=crop";
                const price = asNumber(it.giaban);
                const qty = asNumber(it.soluong);

                return (
                  <div
                    key={it.bentheid}
                    className="flex gap-3 rounded-xl border p-3"
                  >
                    <div className="relative h-16 w-16 overflow-hidden rounded-lg bg-muted">
                      <Image
                        src={img}
                        alt={title}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="flex-1">
                      <div className="font-medium line-clamp-1">{title}</div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        SKU: {it.sku || "—"}
                      </div>

                      <div className="mt-2 text-sm font-semibold">
                        {price.toLocaleString("vi-VN")} đ
                      </div>

                      <div className="mt-2 flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => dec(it)}
                        >
                          -
                        </Button>
                        <div className="w-8 text-center text-sm">{qty}</div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => inc(it)}
                        >
                          +
                        </Button>

                        <Button
                          className="ml-auto"
                          variant="destructive"
                          size="sm"
                          onClick={() => remove(it)}
                        >
                          Xoá
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        <Separator className="my-3" />

        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">Tạm tính</div>
          <div className="text-lg font-semibold">
            {subtotal.toLocaleString("vi-VN")} đ
          </div>
        </div>

        <div className="mt-3 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => onOpenChange?.(false)}>
            Đóng
          </Button>
          <Button disabled={items.length === 0}>Thanh toán</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
