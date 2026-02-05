"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import SiteHeader from "@/components/header/SiteHeader";
import Footer from "@/components/home/Footer";

import { usePopups } from "@/components/popups/PopupProvider";
import { orderApi } from "@/lib/api";
import { getAccessToken } from "@/lib/tokens";
import { formatVND } from "@/lib/format";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function OrderDetailPage({ params }) {
  const router = useRouter();
  const { openAuth } = usePopups();
  const donhangid = params?.donhangid;

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const canCancel = useMemo(() => order?.trangthai === "PENDING", [order]);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      setLoading(false);
      openAuth("login");
      return;
    }

    let alive = true;
    setLoading(true);
    orderApi
      .detail(donhangid)
      .then((res) => {
        if (!alive) return;
        setOrder(res?.order || null);
      })
      .finally(() => alive && setLoading(false));

    return () => {
      alive = false;
    };
  }, [donhangid, openAuth]);

  async function cancel() {
    if (!canCancel) return;
    setCancelling(true);
    try {
      const res = await orderApi.cancel(donhangid);
      setOrder(res?.order || order);
    } finally {
      setCancelling(false);
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
          <Link href="/orders" className="hover:text-foreground">
            Đơn hàng
          </Link>{" "}
          <span className="mx-2">/</span>
          <span className="text-foreground">#{donhangid}</span>
        </div>

        <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
          <h1 className="text-2xl font-semibold text-foreground">Chi tiết đơn #{donhangid}</h1>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => router.push("/orders")}>Quay lại</Button>
            <Button variant="destructive" disabled={!canCancel || cancelling} onClick={cancel}>
              {cancelling ? "Đang hủy..." : "Hủy đơn"}
            </Button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-foreground">Sản phẩm</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="py-10 text-center text-sm text-muted-foreground">Loading...</div>
                ) : !order ? (
                  <div className="py-10 text-center text-sm text-muted-foreground">Không tìm thấy đơn hàng.</div>
                ) : !Array.isArray(order.items) || !order.items.length ? (
                  <div className="py-10 text-center text-sm text-muted-foreground">Không có sản phẩm.</div>
                ) : (
                  <div className="space-y-3">
                    {order.items.map((it) => (
                      <div
                        key={String(it.bentheid)}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-xl border border-border bg-card p-3"
                      >
                        <div>
                          <div className="font-medium text-foreground">
                            {it?.sanpham?.ten || `Biến thể #${it.bentheid}`}
                          </div>
                          <div className="text-xs text-muted-foreground">SKU: {it.sku || ""}</div>
                        </div>
                        <div className="text-sm text-foreground">
                          {it.soluong} × {formatVND(it.dongia)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-foreground">Tóm tắt</CardTitle>
              </CardHeader>
              <CardContent>
                {!order ? (
                  <div className="text-sm text-muted-foreground">—</div>
                ) : (
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center justify-between">
                      <span>Trạng thái</span>
                      <span className="text-foreground font-semibold">{order.trangthai}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Tạm tính</span>
                      <span className="text-foreground font-semibold">{formatVND(order.tongtien)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Phí vận chuyển</span>
                      <span className="text-foreground font-semibold">{formatVND(order.phivanchuyen)}</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex items-center justify-between">
                      <span className="text-foreground font-semibold">Tổng</span>
                      <span className="text-foreground font-semibold">{formatVND(order.tongthanhtoan)}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
