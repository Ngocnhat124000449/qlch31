"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/apiClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import SalesLineChart from "@/components/admin/SalesLineChart";

function normalizeList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.orders)) return data.orders;
  return [];
}

function toNumber(v) {
  if (v == null) return 0;
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  const n = Number(String(v).replace(/[^0-9.-]+/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function formatMoneyVND(v) {
  try {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(toNumber(v));
  } catch {
    return `${v}`;
  }
}

function pickOrderTotal(o) {
  return (
    o?.tongthanhtoan ??
    o?.tongThanhToan ??
    o?.tongtien ??
    o?.tongTien ??
    o?.tongcong ??
    o?.tongCong ??
    o?.total ??
    o?.totalAmount ??
    o?.thanhtien ??
    o?.thanhTien ??
    0
  );
}

function pickCustomerName(o) {
  return (
    o?.khachhang_ten ||
    o?.khachhangTen ||
    o?.hoten ||
    o?.hoTen ||
    o?.ten ||
    o?.customerName ||
    o?.email ||
    (o?.userid ? `User #${o.userid}` : "(Không rõ)")
  );
}

function pickOrderCode(o) {
  return o?.madonhang || o?.maDonHang || o?.code || o?.donhangid || o?.id || "";
}

function pickStatus(o) {
  return o?.trangthai || o?.trangThai || o?.status || o?.tinhtrang || "";
}

function StatusBadge({ value }) {
  const s = String(value || "").toLowerCase();
  const variant = s.includes("completed") || s.includes("giao") || s.includes("deliv") ? "default" : "secondary";
  const label = value || "-";
  return (
    <Badge variant={variant} className="rounded-full">
      {label}
    </Badge>
  );
}

function dateKey(d) {
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "";
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const day = String(dt.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function labelFromKey(key) {
  // key: YYYY-MM-DD -> "DD/MM"
  const m = /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/.exec(key);
  if (!m) return key;
  return `${m[3]}/${m[2]}`;
}

export default function DashboardOverview() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // Backend: GET /api/orders/admin/all (admin-only)
        const res = await apiFetch("/api/orders/admin/all?page=1&limit=200", { method: "GET" });
        const list = normalizeList(res);
        if (!mounted) return;
        setOrders(list);
      } catch {
        if (!mounted) return;
        setOrders([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const stats = useMemo(() => {
    const totalOrders = orders.length;
    const revenue = orders.reduce((sum, o) => sum + toNumber(pickOrderTotal(o)), 0);
    const aov = totalOrders > 0 ? Math.round(revenue / totalOrders) : 0;
    return { totalOrders, revenue, aov };
  }, [orders]);

  const recentOrders = useMemo(() => {
    const list = [...orders];
    list.sort((a, b) => {
      const ta = new Date(a?.created_at || a?.createdAt || 0).getTime();
      const tb = new Date(b?.created_at || b?.createdAt || 0).getTime();
      return tb - ta;
    });
    return list.slice(0, 6);
  }, [orders]);

  const sales7 = useMemo(() => {
    // build last 7 days series (including today)
    const today = new Date();
    const keys = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      keys.push(dateKey(d));
    }

    const buckets = new Map(keys.map((k) => [k, 0]));
    for (const o of orders) {
      const k = dateKey(o?.created_at || o?.createdAt);
      if (!k || !buckets.has(k)) continue;
      buckets.set(k, buckets.get(k) + toNumber(pickOrderTotal(o)));
    }

    return keys.map((k) => ({ label: labelFromKey(k), value: buckets.get(k) || 0 }));
  }, [orders]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-white/5 bg-white/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-200">Tổng doanh thu</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{loading ? "…" : formatMoneyVND(stats.revenue)}</div>
            <div className="mt-1 text-xs text-slate-400">(Tạm tính từ đơn hàng)</div>
          </CardContent>
        </Card>

        <Card className="border-white/5 bg-white/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-200">Tổng đơn hàng</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{loading ? "…" : stats.totalOrders}</div>
            <div className="mt-1 text-xs text-slate-400">Đơn trong danh sách đã tải</div>
          </CardContent>
        </Card>

        <Card className="border-white/5 bg-white/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-200">Giá trị đơn trung bình</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{loading ? "…" : formatMoneyVND(stats.aov)}</div>
            <div className="mt-1 text-xs text-slate-400">Doanh thu / đơn</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="border-white/5 bg-white/5 lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-base">Tổng quan bán hàng</CardTitle>
            <div className="text-sm text-slate-400">Doanh thu trong 7 ngày qua.</div>
          </CardHeader>
          <CardContent>
            <SalesLineChart data={sales7} />
          </CardContent>
        </Card>

        <Card className="border-white/5 bg-white/5 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Đơn hàng gần đây</CardTitle>
            <div className="text-sm text-slate-400">Danh sách các đơn hàng gần đây nhất.</div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-sm text-slate-400">Đang tải…</div>
            ) : recentOrders.length === 0 ? (
              <div className="text-sm text-slate-400">Chưa có dữ liệu.</div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2 border-b border-white/5 pb-2 text-xs text-slate-400">
                  <div>Khách hàng</div>
                  <div>Trạng thái</div>
                  <div className="text-right">Tổng cộng</div>
                </div>
                {recentOrders.map((o) => {
                  const code = pickOrderCode(o);
                  return (
                    <div
                      key={String(code)}
                      className="grid grid-cols-3 items-center gap-2 border-b border-white/5 py-3 last:border-b-0"
                    >
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium text-slate-100">{pickCustomerName(o)}</div>
                        <div className="text-xs text-slate-400">#{code}</div>
                      </div>
                      <div>
                        <StatusBadge value={pickStatus(o)} />
                      </div>
                      <div className="text-right text-sm font-medium">{formatMoneyVND(toNumber(pickOrderTotal(o)))}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
