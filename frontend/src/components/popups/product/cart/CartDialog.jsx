"use client";

import SmartImage from "@/components/ui/SmartImage";
import { useEffect, useMemo, useState } from "react";

import { usePopups } from "@/components/popups/PopupProvider";
import { cartApi } from "@/lib/api";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

function normalizeCart(data) {
  // API doc: { cart: { items: [...] } }
  return data?.cart || data || null;
}

function normalizeItems(cart) {
  const c = cart || {};
  return Array.isArray(c.items) ? c.items : Array.isArray(c.chitiet) ? c.chitiet : [];
}

export default function CartDialog({ open, onOpenChange }) {
  const { closeCart, openAuth } = usePopups();

  const [loading, setLoading] = useState(false);
  const [cart, setCart] = useState(null);
  const [selected, setSelected] = useState({}); // { bentheid: true }

  const items = useMemo(() => normalizeItems(cart), [cart]);
  const allSelected =
    items.length > 0 && items.every((it) => selected[String(it.bentheid)]);

  const selectedTotal = useMemo(() => {
    return items.reduce((sum, it) => {
      if (!selected[String(it.bentheid)]) return sum;
      const price = Number(it.giaban || 0);
      const qty = Number(it.soluong || 0);
      return sum + price * qty;
    }, 0);
  }, [items, selected]);

  useEffect(() => {
    if (!open) return;

    const token = getAccessToken();
    if (!token) {
      closeCart();
      openAuth("login");
      return;
    }

    let alive = true;
    setLoading(true);

    cartApi
      .get()
      .then((data) => {
        if (!alive) return;
        const c = normalizeCart(data);
        setCart(c);

        const next = {};
        normalizeItems(c).forEach((it) => {
          if (it?.bentheid != null) next[String(it.bentheid)] = false;
        });
        setSelected(next);
      })
      .catch(() => {
        if (!alive) return;
        setCart(null);
      })
      .finally(() => alive && setLoading(false));

    return () => {
      alive = false;
    };
  }, [open, closeCart, openAuth]);

  function toggleSelectAll(val) {
    const next = {};
    items.forEach((it) => {
      if (it?.bentheid == null) return;
      next[String(it.bentheid)] = !!val;
    });
    setSelected(next);
  }

  async function refresh() {
    const data = await cartApi.get();
    setCart(normalizeCart(data));
  }

  async function inc(it) {
    const bentheid = it?.bentheid;
    if (bentheid == null) return;
    await cartApi.updateItem(bentheid, Number(it.soluong || 0) + 1);
    await refresh();
  }

  async function dec(it) {
    const bentheid = it?.bentheid;
    if (bentheid == null) return;
    const nextQty = Math.max(1, Number(it.soluong || 0) - 1);
    await cartApi.updateItem(bentheid, nextQty);
    await refresh();
  }

  async function remove(it) {
    const bentheid = it?.bentheid;
    if (bentheid == null) return;
    await cartApi.removeItem(bentheid);
    await refresh();
  }

  async function clear() {
    await cartApi.clear();
    await refresh();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Giỏ hàng</DialogTitle>
        </DialogHeader>

        <div className="flex items-center gap-3">
          <Checkbox checked={allSelected} onCheckedChange={(v) => toggleSelectAll(!!v)} />
          <div className="text-sm text-slate-200">
            Chọn tất cả <span className="text-slate-400">({items.length})</span>
          </div>

          <div className="ml-auto">
            <Button variant="secondary" onClick={clear} disabled={items.length === 0}>
              Xóa tất cả
            </Button>
          </div>
        </div>

        <Separator className="my-3" />

        <ScrollArea className="h-[50vh] pr-2">
          {loading ? (
            <div className="py-10 text-center text-sm text-slate-400">Loading...</div>
          ) : items.length === 0 ? (
            <div className="py-10 text-center text-sm text-slate-400">Giỏ hàng trống</div>
          ) : (
            <div className="space-y-4">
              {items.map((it) => {
                const key = String(it?.bentheid ?? Math.random());
                const name = it?.sanpham?.ten || it?.tensanpham || "—";
                const sku = it?.sku || it?.sanpham?.sku || "";
                const img =
                  it?.variant_hinhanhurl ||
                  it?.sanpham?.hinhanhurl ||
                  it?.sanpham?.imageUrl ||
                  it?.sanpham?.hinhanh ||
                  null;
                return (
                  <div key={key} className="flex gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
                    <Checkbox
                      checked={!!selected[String(it.bentheid)]}
                      onCheckedChange={(v) =>
                        setSelected((s) => ({
                          ...s,
                          [String(it.bentheid)]: !!v,
                        }))
                      }
                    />

                    <div className="h-16 w-16 overflow-hidden rounded-lg border border-white/10 bg-white/5">
                      <SmartImage src={img} alt={name} className="h-full w-full object-cover" />
                    </div>

                    <div className="flex-1">
                      <div className="font-medium text-slate-100">{name}</div>
                      {sku ? (
                        <div className="text-xs text-slate-400">SKU: {sku}</div>
                      ) : null}

                      <div className="mt-1 text-sm text-slate-200 font-semibold">
                        {formatVND(it.giaban)}
                      </div>

                      <div className="mt-2 flex items-center gap-2">
                        <Button variant="secondary" size="sm" onClick={() => dec(it)}>
                          -
                        </Button>
                        <div className="w-10 text-center text-sm text-slate-200">{it.soluong}</div>
                        <Button variant="secondary" size="sm" onClick={() => inc(it)}>
                          +
                        </Button>

                        <Button
                          className="ml-auto"
                          variant="destructive"
                          size="sm"
                          onClick={() => remove(it)}
                        >
                          Xóa
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

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-slate-300">
            Tổng (đã chọn): <span className="font-semibold text-slate-100">{formatVND(selectedTotal)}</span>
          </div>

          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => (onOpenChange ? onOpenChange(false) : closeCart())}>
              Đóng
            </Button>
            <Button disabled={selectedTotal <= 0}>Thanh toán</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
