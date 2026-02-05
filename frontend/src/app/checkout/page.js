"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import SiteHeader from "@/components/header/SiteHeader";
import Footer from "@/components/home/Footer";
import SmartImage from "@/components/ui/SmartImage";

import { usePopups } from "@/components/popups/PopupProvider";
import { cartApi, orderApi, paymentApi } from "@/lib/api";
import { getAccessToken } from "@/lib/tokens";
import { formatVND } from "@/lib/format";
import {
  clearCheckoutItems,
  loadCheckoutItems,
  saveCheckoutItems,
} from "@/lib/checkoutSelection";
import { getMyAddresses } from "@/services/addresses";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import AddressUpsertDialog from "@/components/account/AddressUpsertDialog";

function normalizeCart(data) {
  return data?.cart || data || null;
}
function normalizeItems(cart) {
  const c = cart || {};
  return Array.isArray(c.items)
    ? c.items
    : Array.isArray(c.chitiet)
      ? c.chitiet
      : [];
}

export default function CheckoutPage() {
  const router = useRouter();
  const { openAuth } = usePopups();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [cart, setCart] = useState(null);
  const [picked, setPicked] = useState([]); // [{bentheid, soluong}]

  const [paymentMethods, setPaymentMethods] = useState([]);
  const [addresses, setAddresses] = useState([]);

  const [phuongthucid, setPhuongthucid] = useState("");
  const [diachiuserid, setDiachiuserid] = useState("");
  const [phivanchuyen, setPhivanchuyen] = useState(0);
  const [ghichu, setGhichu] = useState("");

  const [addrOpen, setAddrOpen] = useState(false);

  const items = useMemo(() => normalizeItems(cart), [cart]);
  const cartMap = useMemo(() => {
    const m = new Map();
    items.forEach((it) => {
      if (it?.bentheid == null) return;
      m.set(Number(it.bentheid), it);
    });
    return m;
  }, [items]);

  // Merge picked with cart detail + clamp qty
  const pickedDetailed = useMemo(() => {
    const next = [];
    for (const p of picked) {
      const bentheid = Number(p?.bentheid);
      const qty = Number(p?.soluong);
      const it = cartMap.get(bentheid);
      if (!it) continue;
      const inCart = Number(it?.soluong || 0);
      const clamped = Math.max(0, Math.min(qty, inCart));
      if (clamped <= 0) continue;
      next.push({
        bentheid,
        soluong: clamped,
        inCart,
        giaban: Number(it?.giaban || 0),
        sku: it?.sku || "",
        name: it?.sanpham?.ten || it?.tensanpham || "Sản phẩm",
        img:
          it?.variant_hinhanhurl ||
          it?.sanpham?.hinhanhurl ||
          it?.sanpham?.imageUrl ||
          it?.sanpham?.hinhanh ||
          null,
      });
    }
    return next;
  }, [picked, cartMap]);

  const subtotal = useMemo(() => {
    return pickedDetailed.reduce(
      (sum, it) => sum + Number(it.giaban || 0) * Number(it.soluong || 0),
      0
    );
  }, [pickedDetailed]);

  const total = useMemo(() => subtotal + Number(phivanchuyen || 0), [subtotal, phivanchuyen]);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      setLoading(false);
      openAuth("login");
      return;
    }

    const initial = loadCheckoutItems();
    setPicked(Array.isArray(initial) ? initial : []);

    let alive = true;
    setLoading(true);
    Promise.all([
      cartApi.get(),
      getMyAddresses(),
      paymentApi.list(),
    ])
      .then(([cartRes, addrRes, pmRes]) => {
        if (!alive) return;
        const c = normalizeCart(cartRes);
        setCart(c);

        const addrs = Array.isArray(addrRes?.addresses) ? addrRes.addresses : [];
        setAddresses(addrs);
        const defaultAddr = addrs.find((a) => a?.macdinh === true) || addrs[0];
        if (defaultAddr) setDiachiuserid(String(defaultAddr.diachiuserid));

        const pms = Array.isArray(pmRes?.paymentMethods) ? pmRes.paymentMethods : [];
        setPaymentMethods(pms);
        if (pms[0]) setPhuongthucid(String(pms[0].phuongthucid));
      })
      .finally(() => alive && setLoading(false));

    return () => {
      alive = false;
    };
  }, [openAuth]);

  // Keep session storage in sync with clamped selection
  useEffect(() => {
    if (!cart) return;
    saveCheckoutItems(pickedDetailed.map(({ bentheid, soluong }) => ({ bentheid, soluong })));
  }, [cart, pickedDetailed]);

  function changeQty(bentheid, delta) {
    setPicked((prev) => {
      const next = prev.map((p) => ({ ...p }));
      const idx = next.findIndex((p) => Number(p.bentheid) === Number(bentheid));
      const inCart = Number(cartMap.get(Number(bentheid))?.soluong || 0);
      if (idx === -1) return prev;
      const cur = Number(next[idx].soluong || 0);
      const updated = Math.max(0, Math.min(cur + delta, inCart));
      if (updated <= 0) {
        next.splice(idx, 1);
      } else {
        next[idx].soluong = updated;
      }
      return next;
    });
  }

  async function reloadAddresses() {
    const addrRes = await getMyAddresses();
    const addrs = Array.isArray(addrRes?.addresses) ? addrRes.addresses : [];
    setAddresses(addrs);
    const defaultAddr = addrs.find((a) => a?.macdinh === true) || addrs[0];
    if (defaultAddr) setDiachiuserid(String(defaultAddr.diachiuserid));
  }

  async function submit() {
    if (!pickedDetailed.length) return;
    if (!phuongthucid || !diachiuserid) return;

    setSubmitting(true);
    try {
      const payload = {
        phuongthucid: Number(phuongthucid),
        diachiuserid: Number(diachiuserid),
        phivanchuyen: Number(phivanchuyen || 0),
        ghichu: ghichu?.trim() || null,
        items: pickedDetailed.map(({ bentheid, soluong }) => ({ bentheid, soluong })),
      };

      const res = await orderApi.create(payload);
      const order = res?.order;
      clearCheckoutItems();

      if (order?.donhangid != null) {
        router.push(`/orders/${encodeURIComponent(order.donhangid)}`);
      } else {
        router.push("/orders");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background dark:bg-gradient-to-b dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
      <SiteHeader />

      <main className="mx-auto max-w-7xl px-5 py-8">
        <div className="text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            Trang chủ
          </Link>{" "}
          <span className="mx-2">/</span>
          <span className="text-foreground">Thanh toán</span>
        </div>

        <h1 className="mt-2 text-2xl font-semibold text-foreground">Thanh toán</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Bạn có thể chọn một phần sản phẩm từ giỏ hàng để thanh toán.
        </p>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-foreground">Sản phẩm đã chọn</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="py-10 text-center text-sm text-muted-foreground">Loading...</div>
                ) : !pickedDetailed.length ? (
                  <div className="py-10 text-center text-sm text-muted-foreground">
                    Bạn chưa chọn sản phẩm nào từ giỏ hàng.
                    <div className="mt-3">
                      <Link href="/products" className="text-foreground underline">
                        Xem sản phẩm
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pickedDetailed.map((it) => (
                      <div
                        key={String(it.bentheid)}
                        className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl border border-border bg-card p-3"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div className="h-16 w-16 overflow-hidden rounded-lg border border-border bg-card">
                            <SmartImage
                              src={it.img}
                              alt={it.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div>
                            <div className="font-medium text-foreground">{it.name}</div>
                            {it.sku ? (
                              <div className="text-xs text-muted-foreground">SKU: {it.sku}</div>
                            ) : null}
                            <div className="mt-1 text-sm text-foreground font-semibold">
                              {formatVND(it.giaban)}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => changeQty(it.bentheid, -1)}
                          >
                            -
                          </Button>
                          <div className="w-10 text-center text-sm text-foreground">
                            {it.soluong}
                          </div>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => changeQty(it.bentheid, 1)}
                            disabled={it.soluong >= it.inCart}
                          >
                            +
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle className="text-foreground">Địa chỉ giao hàng</CardTitle>
                <Button variant="secondary" onClick={() => setAddrOpen(true)}>
                  Thêm địa chỉ
                </Button>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="py-6 text-sm text-muted-foreground">Loading...</div>
                ) : !addresses.length ? (
                  <div className="py-6 text-sm text-muted-foreground">
                    Bạn chưa có địa chỉ. Hãy thêm địa chỉ để tiếp tục.
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Chọn địa chỉ</Label>
                    <Select value={diachiuserid} onValueChange={setDiachiuserid}>
                      <SelectTrigger className="border-border bg-card text-foreground">
                        <SelectValue placeholder="Chọn địa chỉ" />
                      </SelectTrigger>
                      <SelectContent>
                        {addresses.map((a) => (
                          <SelectItem key={String(a.diachiuserid)} value={String(a.diachiuserid)}>
                            {a.tennguoinhan} · {a.sdtnguoinhan} · {a.diachichitiet}, {a.phuongxa}, {a.quanhuyen}, {a.tinhthanh}
                            {a.macdinh ? " (Mặc định)" : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-foreground">Thanh toán</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Phương thức thanh toán</Label>
                  <Select value={phuongthucid} onValueChange={setPhuongthucid}>
                    <SelectTrigger className="border-border bg-card text-foreground">
                      <SelectValue placeholder="Chọn phương thức" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.map((pm) => (
                        <SelectItem key={String(pm.phuongthucid)} value={String(pm.phuongthucid)}>
                          {pm.tenphuongthuc || pm.ten || `PTTT #${pm.phuongthucid}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Phí vận chuyển</Label>
                    <Input
                      type="number"
                      min={0}
                      value={phivanchuyen}
                      onChange={(e) => setPhivanchuyen(Number(e.target.value || 0))}
                      className="border-border bg-card text-foreground"
                    />
                    <div className="text-xs text-muted-foreground">Bạn có thể để 0 nếu chưa tính phí.</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-muted-foreground">Ghi chú</Label>
                  <Textarea
                    value={ghichu}
                    onChange={(e) => setGhichu(e.target.value)}
                    placeholder="Ví dụ: giao giờ hành chính..."
                    className="border-border bg-card text-foreground"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-foreground">Tóm tắt</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center justify-between">
                    <span>Tạm tính</span>
                    <span className="text-foreground font-semibold">{formatVND(subtotal)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Phí vận chuyển</span>
                    <span className="text-foreground font-semibold">{formatVND(Number(phivanchuyen || 0))}</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex items-center justify-between">
                    <span className="text-foreground font-semibold">Tổng thanh toán</span>
                    <span className="text-foreground font-semibold">{formatVND(total)}</span>
                  </div>
                </div>

                <Button
                  className="mt-4 w-full"
                  disabled={
                    loading ||
                    submitting ||
                    !pickedDetailed.length ||
                    !phuongthucid ||
                    !diachiuserid
                  }
                  onClick={submit}
                >
                  {submitting ? "Đang tạo đơn..." : "Đặt hàng"}
                </Button>

                <div className="mt-3 text-xs text-muted-foreground">
                  Sau khi đặt hàng, các sản phẩm đã chọn sẽ được trừ khỏi giỏ hàng (phần còn lại vẫn giữ nguyên).
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />

      <AddressUpsertDialog
        open={addrOpen}
        onOpenChange={setAddrOpen}
        onSaved={reloadAddresses}
      />
    </div>
  );
}
