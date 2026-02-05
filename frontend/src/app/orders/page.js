"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import SiteHeader from "@/components/header/SiteHeader";
import Footer from "@/components/home/Footer";

import { usePopups } from "@/components/popups/PopupProvider";
import { orderApi } from "@/lib/api";
import { getAccessToken } from "@/lib/tokens";
import { formatVND } from "@/lib/format";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function OrdersPage() {
  const { openAuth } = usePopups();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState("ALL");

  const statusParam = useMemo(() => (status === "ALL" ? null : status), [status]);

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
      .listMine({ limit: 50, page: 1, status: statusParam })
      .then((res) => {
        if (!alive) return;
        setOrders(Array.isArray(res?.orders) ? res.orders : []);
      })
      .finally(() => alive && setLoading(false));

    return () => {
      alive = false;
    };
  }, [openAuth, statusParam]);

  return (
    <div className="min-h-screen bg-background dark:bg-gradient-to-b dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
      <SiteHeader />

      <main className="mx-auto max-w-7xl px-5 py-8">
        <div className="text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            Trang chủ
          </Link>{" "}
          <span className="mx-2">/</span>
          <span className="text-foreground">Đơn hàng</span>
        </div>

        <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
          <h1 className="text-2xl font-semibold text-foreground">Đơn hàng của tôi</h1>
          <div className="w-[220px]">
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="border-border bg-card text-foreground">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả</SelectItem>
                <SelectItem value="PENDING">PENDING</SelectItem>
                <SelectItem value="PAID">PAID</SelectItem>
                <SelectItem value="SHIPPED">SHIPPED</SelectItem>
                <SelectItem value="COMPLETED">COMPLETED</SelectItem>
                <SelectItem value="CANCELLED">CANCELLED</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-6">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">Danh sách</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="py-10 text-center text-sm text-muted-foreground">Loading...</div>
              ) : !orders.length ? (
                <div className="py-10 text-center text-sm text-muted-foreground">Chưa có đơn hàng.</div>
              ) : (
                <div className="space-y-3">
                  {orders.map((o) => (
                    <div
                      key={String(o.donhangid)}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-border bg-card p-3"
                    >
                      <div>
                        <div className="font-medium text-foreground">Đơn #{o.donhangid}</div>
                        <div className="text-xs text-muted-foreground">
                          Trạng thái: {o.trangthai} · {o.created_at ? new Date(o.created_at).toLocaleString() : ""}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-sm text-foreground font-semibold">
                          {formatVND(o.tongthanhtoan)}
                        </div>
                        <Button asChild variant="secondary">
                          <Link href={`/orders/${encodeURIComponent(o.donhangid)}`}>Xem</Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
