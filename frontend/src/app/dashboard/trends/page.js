"use client";

import { useEffect, useMemo, useState } from "react";
import PageHeader from "@/components/admin/PageHeader";
import {
  adminGetOrderDetail,
  adminListOrders,
  formatMoneyVND,
  toNumber,
} from "@/lib/adminApi";

function mapLimit(list, limit, worker) {
  const arr = Array.isArray(list) ? list : [];
  const n = Math.max(1, Number(limit) || 1);
  const results = new Array(arr.length);
  let i = 0;
  let active = 0;

  return new Promise((resolve) => {
    const next = () => {
      if (i >= arr.length && active === 0) return resolve(results);
      while (active < n && i < arr.length) {
        const idx = i++;
        active += 1;
        Promise.resolve(worker(arr[idx], idx))
          .then((val) => {
            results[idx] = val;
          })
          .catch(() => {
            results[idx] = null;
          })
          .finally(() => {
            active -= 1;
            next();
          });
      }
    };
    next();
  });
}

function pickOrderId(o) {
  return o?.donhangid ?? o?.id ?? null;
}

function pickOrderStatus(o) {
  return (o?.trangthai ?? o?.status ?? "").toString().toUpperCase();
}

function pickItemProductId(it) {
  return it?.sanpham?.sanphamid ?? it?.sanphamid ?? it?.productId ?? null;
}

function pickItemProductName(it) {
  return it?.sanpham?.ten ?? it?.sanpham?.tensanpham ?? it?.tensanpham ?? it?.ten ?? "—";
}

function pickItemVariantId(it) {
  return it?.bentheid ?? it?.variantId ?? null;
}

export default function TrendsPage() {
  const [limit, setLimit] = useState(30);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [meta, setMeta] = useState({
    scannedOrders: 0,
    scannedItems: 0,
    revenue: 0,
  });

  const [topProductsByQty, setTopProductsByQty] = useState([]);
  const [topProductsByRevenue, setTopProductsByRevenue] = useState([]);
  const [topVariantsByQty, setTopVariantsByQty] = useState([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const { orders } = await adminListOrders({ page: 1, limit: Math.min(50, Math.max(1, Number(limit) || 30)) });
        const orderList = Array.isArray(orders) ? orders : [];

        const ids = orderList
          .map((o) => pickOrderId(o))
          .filter((v) => v != null);

        const details = await mapLimit(ids, 8, (id) => adminGetOrderDetail(id));

        const prod = new Map();
        const variant = new Map();

        let scannedOrders = 0;
        let scannedItems = 0;
        let revenue = 0;

        for (let idx = 0; idx < details.length; idx += 1) {
          const d = details[idx];
          if (!d) continue;
          scannedOrders += 1;

          const status = pickOrderStatus(d);
          if (status === "CANCELLED") continue; // xu hướng theo đơn thành công/đang xử lý

          const items = Array.isArray(d?.items) ? d.items : [];
          for (const it of items) {
            const pid = pickItemProductId(it);
            const pname = pickItemProductName(it);
            const vid = pickItemVariantId(it);

            const qty = toNumber(it?.soluong);
            const line = toNumber(it?.dongia) * qty;

            scannedItems += 1;
            revenue += line;

            if (pid != null) {
              const key = String(pid);
              if (!prod.has(key)) prod.set(key, { id: pid, name: pname, qty: 0, revenue: 0 });
              const p = prod.get(key);
              p.qty += qty;
              p.revenue += line;
            }

            if (vid != null) {
              const key = String(vid);
              if (!variant.has(key)) variant.set(key, { id: vid, name: `${pname} · ${it?.sku || `#${vid}`}`, qty: 0, revenue: 0 });
              const v = variant.get(key);
              v.qty += qty;
              v.revenue += line;
            }
          }
        }

        const prodArr = Array.from(prod.values());
        const varArr = Array.from(variant.values());

        prodArr.sort((a, b) => b.qty - a.qty);
        const byQty = prodArr.slice(0, 10);

        const byRevenue = [...prodArr].sort((a, b) => b.revenue - a.revenue).slice(0, 10);
        const varByQty = varArr.sort((a, b) => b.qty - a.qty).slice(0, 10);

        if (!mounted) return;
        setMeta({ scannedOrders, scannedItems, revenue });
        setTopProductsByQty(byQty);
        setTopProductsByRevenue(byRevenue);
        setTopVariantsByQty(varByQty);
      } catch (e) {
        if (!mounted) return;
        setError(e?.message || "Không thể phân tích xu hướng");
        setMeta({ scannedOrders: 0, scannedItems: 0, revenue: 0 });
        setTopProductsByQty([]);
        setTopProductsByRevenue([]);
        setTopVariantsByQty([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [limit]);

  const subtitle = useMemo(() => {
    return `Tổng hợp từ ${Math.min(50, Math.max(1, Number(limit) || 30))} đơn gần nhất (loại CANCELLED). Dữ liệu lấy từ /api/orders/admin/all + /api/orders/:donhangid.`;
  }, [limit]);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Xu hướng"
        subtitle={subtitle}
        actionLabel=""
        onAction={() => {}}
      />

      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
        <div className="flex flex-wrap items-center gap-3">
          <div className="text-sm text-white/60">Số đơn phân tích</div>
          <input
            type="number"
            min={1}
            max={50}
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
            className="w-28 rounded-xl bg-white/5 px-3 py-2 text-sm outline-none ring-1 ring-white/10 focus:ring-indigo-400/30"
          />

          <div className="ml-auto text-sm text-white/55">
            Doanh thu mẫu: <span className="font-medium text-white">{formatMoneyVND(meta.revenue || 0)}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
          <div className="px-5 py-4">
            <div className="text-sm font-semibold">Top sản phẩm theo số lượng</div>
            <div className="mt-1 text-xs text-white/55">Tổng số lượng bán (mẫu)</div>
          </div>
          <div className="divide-y divide-white/10">
            {loading ? (
              <div className="px-5 py-6 text-sm text-white/60">Đang tải…</div>
            ) : topProductsByQty.length === 0 ? (
              <div className="px-5 py-6 text-sm text-white/60">{error || "Chưa có dữ liệu."}</div>
            ) : (
              topProductsByQty.map((p, i) => (
                <div key={String(p.id)} className="flex items-center justify-between gap-3 px-5 py-3">
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{i + 1}. {p.name}</div>
                    <div className="text-xs text-white/45">SP#{p.id}</div>
                  </div>
                  <div className="text-sm">{p.qty}</div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
          <div className="px-5 py-4">
            <div className="text-sm font-semibold">Top sản phẩm theo doanh thu</div>
            <div className="mt-1 text-xs text-white/55">Tổng doanh thu (mẫu)</div>
          </div>
          <div className="divide-y divide-white/10">
            {loading ? (
              <div className="px-5 py-6 text-sm text-white/60">Đang tải…</div>
            ) : topProductsByRevenue.length === 0 ? (
              <div className="px-5 py-6 text-sm text-white/60">{error || "Chưa có dữ liệu."}</div>
            ) : (
              topProductsByRevenue.map((p, i) => (
                <div key={String(p.id)} className="flex items-center justify-between gap-3 px-5 py-3">
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{i + 1}. {p.name}</div>
                    <div className="text-xs text-white/45">SP#{p.id}</div>
                  </div>
                  <div className="text-sm">{formatMoneyVND(p.revenue)}</div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
          <div className="px-5 py-4">
            <div className="text-sm font-semibold">Top biến thể theo số lượng</div>
            <div className="mt-1 text-xs text-white/55">Theo bentheid</div>
          </div>
          <div className="divide-y divide-white/10">
            {loading ? (
              <div className="px-5 py-6 text-sm text-white/60">Đang tải…</div>
            ) : topVariantsByQty.length === 0 ? (
              <div className="px-5 py-6 text-sm text-white/60">{error || "Chưa có dữ liệu."}</div>
            ) : (
              topVariantsByQty.map((v, i) => (
                <div key={String(v.id)} className="flex items-center justify-between gap-3 px-5 py-3">
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{i + 1}. {v.name}</div>
                    <div className="text-xs text-white/45">BT#{v.id}</div>
                  </div>
                  <div className="text-sm">{v.qty}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
