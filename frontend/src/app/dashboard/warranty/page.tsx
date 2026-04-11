"use client";

import { useEffect, useMemo, useState } from "react";
import PageHeader from "@/components/admin/PageHeader";
import {
  adminGetOrderDetail,
  adminListOrders,
  adminListProducts,
  adminListVariantsByProduct,
  publicGetReviewsByVariant,
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

function pickProductId(p) {
  return p?.sanphamid ?? p?.id ?? null;
}

function pickProductName(p) {
  return p?.ten ?? p?.tensanpham ?? p?.name ?? "—";
}

function pickVariantId(v) {
  return v?.bentheid ?? v?.id ?? null;
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function computeRisk({ avgRating, cancelRate }) {
  const a = avgRating != null ? Number(avgRating) : null;
  const r = cancelRate != null ? Number(cancelRate) : 0;

  // rating 5 => 0 điểm rủi ro, rating 1 => ~60 điểm
  const ratingRisk = a == null ? 25 : ((5 - clamp(a, 1, 5)) / 4) * 60;
  // cancelRate 0..1 => 0..40 điểm
  const cancelRisk = clamp(r, 0, 1) * 40;

  return clamp(Math.round(ratingRisk + cancelRisk), 0, 100);
}

function computeConfidence({ reviewCount, ordersCount }) {
  const rc = Math.max(0, Number(reviewCount) || 0);
  const oc = Math.max(0, Number(ordersCount) || 0);
  // càng nhiều review + đơn trong mẫu => càng tin
  const score = rc * 3 + oc * 2;
  return clamp(Math.round((score / 100) * 100), 0, 100);
}

export default function WarrantyPage() {
  const [q, setQ] = useState("");
  const [productOptions, setProductOptions] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState(null);

  // Search products (derive từ /api/catalog/products)
  useEffect(() => {
    let mounted = true;
    const t = setTimeout(async () => {
      setLoadingProducts(true);
      try {
        const { products } = await adminListProducts({ all: true, page: 1, limit: 20, q: q.trim() || undefined });
        if (!mounted) return;
        setProductOptions(Array.isArray(products) ? products : []);
      } catch {
        if (!mounted) return;
        setProductOptions([]);
      } finally {
        if (mounted) setLoadingProducts(false);
      }
    }, 300);

    return () => {
      mounted = false;
      clearTimeout(t);
    };
  }, [q]);

  async function runAnalysis() {
    setError("");
    setRows([]);
    setSummary(null);

    const pid = pickProductId(selectedProduct);
    if (!pid) {
      setError("Vui lòng chọn sản phẩm.");
      return;
    }

    setLoading(true);
    try {
      // 1) Variants
      const { variants } = await adminListVariantsByProduct(pid, { all: true });
      const vList = Array.isArray(variants) ? variants : [];

      // 2) Reviews summary (theo bentheid)
      const variantIds = vList.map((v) => pickVariantId(v)).filter((v) => v != null);
      const reviewRes = await mapLimit(variantIds, 8, (vid) => publicGetReviewsByVariant(vid, { limit: 1, offset: 0 }));
      const summaryByVariant = new Map();
      for (let i = 0; i < variantIds.length; i += 1) {
        const vid = String(variantIds[i]);
        const s = reviewRes[i]?.summary || null;
        summaryByVariant.set(vid, s);
      }

      // 3) Orders sample (50 đơn gần nhất)
      const { orders } = await adminListOrders({ page: 1, limit: 50 });
      const orderList = Array.isArray(orders) ? orders : [];
      const orderIds = orderList.map((o) => o?.donhangid ?? o?.id).filter((v) => v != null);
      const orderDetails = await mapLimit(orderIds, 8, (id) => adminGetOrderDetail(id));

      const stats = new Map();
      // init
      for (const v of vList) {
        const vid = pickVariantId(v);
        if (vid == null) continue;
        stats.set(String(vid), {
          orders: new Set(),
          cancelOrders: new Set(),
          qty: 0,
        });
      }

      for (const o of orderDetails) {
        if (!o) continue;
        const oid = String(o?.donhangid ?? o?.id);
        const status = (o?.trangthai ?? o?.status ?? "").toString().toUpperCase();
        const items = Array.isArray(o?.items) ? o.items : [];
        for (const it of items) {
          const itemPid = it?.sanpham?.sanphamid ?? it?.sanphamid ?? null;
          if (String(itemPid) !== String(pid)) continue;
          const vid = it?.bentheid ?? it?.variantId ?? null;
          if (vid == null) continue;
          const key = String(vid);
          if (!stats.has(key)) stats.set(key, { orders: new Set(), cancelOrders: new Set(), qty: 0 });
          const st = stats.get(key);
          st.orders.add(oid);
          if (status === "CANCELLED") st.cancelOrders.add(oid);
          st.qty += toNumber(it?.soluong);
        }
      }

      const out = vList.map((v) => {
        const vid = pickVariantId(v);
        const key = String(vid);
        const st = stats.get(key) || { orders: new Set(), cancelOrders: new Set(), qty: 0 };
        const rev = summaryByVariant.get(key) || null;
        const reviewCount = toNumber(rev?.count);
        const avgRating = rev?.avg != null ? Number(rev.avg) : null;
        const ordersCount = st.orders.size;
        const cancelRate = ordersCount ? st.cancelOrders.size / ordersCount : 0;
        const risk = computeRisk({ avgRating, cancelRate });
        const confidence = computeConfidence({ reviewCount, ordersCount });

        return {
          ...v,
          __bentheid: vid,
          __orders: ordersCount,
          __cancelOrders: st.cancelOrders.size,
          __cancelRate: cancelRate,
          __qty: st.qty,
          __reviewCount: reviewCount,
          __avg: avgRating,
          __risk: risk,
          __confidence: confidence,
        };
      });

      out.sort((a, b) => (b.__risk || 0) - (a.__risk || 0));

      // Product-level summary (weight theo số đơn, nếu không có thì theo review)
      let wSum = 0;
      let riskSum = 0;
      let avgSum = 0;
      let avgW = 0;
      let ordersSum = 0;
      let cancelSum = 0;
      let reviewSum = 0;

      for (const r of out) {
        const w = Math.max(1, r.__orders || 0);
        wSum += w;
        riskSum += (r.__risk || 0) * w;
        if (r.__avg != null) {
          avgSum += r.__avg * (r.__reviewCount || 1);
          avgW += Math.max(1, r.__reviewCount || 1);
        }
        ordersSum += r.__orders || 0;
        cancelSum += r.__cancelOrders || 0;
        reviewSum += r.__reviewCount || 0;
      }

      const productRisk = wSum ? Math.round(riskSum / wSum) : null;
      const productAvg = avgW ? avgSum / avgW : null;
      const productCancelRate = ordersSum ? cancelSum / ordersSum : 0;
      const productConfidence = computeConfidence({ reviewCount: reviewSum, ordersCount: ordersSum });

      setRows(out);
      setSummary({
        risk: productRisk,
        avg: productAvg,
        cancelRate: productCancelRate,
        orders: ordersSum,
        reviews: reviewSum,
        confidence: productConfidence,
      });
    } catch (e) {
      setError(e?.message || "Không thể phân tích bảo hành");
      setRows([]);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }

  const selectedId = pickProductId(selectedProduct);
  const selectedName = pickProductName(selectedProduct);

  const subtitle = useMemo(() => {
    return "Derive từ Orders + Reviews: /api/orders/admin/all + /api/orders/:donhangid + /api/reviews/variant/:bentheid.";
  }, []);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Dự đoán yêu cầu bảo hành"
        subtitle={subtitle}
        actionLabel=""
        onAction={() => {}}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6 backdrop-blur-xl">
          <div className="text-sm text-muted-foreground">Chọn sản phẩm để phân tích</div>

          <div className="mt-3">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tìm sản phẩm theo tên..."
              className="w-full rounded-xl bg-card px-4 py-3 text-sm outline-none ring-1 ring-border focus:ring-indigo-400/30"
            />
            <div className="mt-2 text-xs text-muted-foreground">
              {loadingProducts ? "Đang tìm..." : `Gợi ý: ${productOptions.length} sản phẩm`}
            </div>

            <div className="mt-3">
              <select
                value={selectedId != null ? String(selectedId) : ""}
                onChange={(e) => {
                  const val = e.target.value;
                  const p = productOptions.find((x) => String(pickProductId(x)) === String(val)) || null;
                  setSelectedProduct(p);
                }}
                className="w-full rounded-xl bg-card px-4 py-3 text-sm outline-none ring-1 ring-border focus:ring-indigo-400/30"
              >
                <option value="">-- Chọn sản phẩm --</option>
                {productOptions.map((p) => (
                  <option key={String(pickProductId(p))} value={String(pickProductId(p))}>
                    {pickProductName(p)} (#{pickProductId(p)})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={runAnalysis}
              disabled={!selectedId || loading}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-500/25 px-4 py-2 text-sm ring-1 ring-indigo-400/30 hover:bg-indigo-500/30 disabled:opacity-50"
            >
              ✦ Phân tích nguy cơ
            </button>

            {selectedId ? (
              <div className="mt-3 text-xs text-muted-foreground">
                Đang chọn: <span className="font-medium text-foreground">{selectedName}</span> <span className="text-muted-foreground">(SP#{selectedId})</span>
              </div>
            ) : null}

            {error ? <div className="mt-3 text-sm text-rose-300">{error}</div> : null}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 backdrop-blur-xl">
          {!summary ? (
            <div className="grid h-full place-items-center text-sm text-muted-foreground">
              {loading ? "Đang phân tích..." : "Kết quả sẽ hiển thị sau khi bạn chọn sản phẩm và bấm Phân tích."}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-border bg-muted/30 dark:bg-slate-950/30 p-4">
                  <div className="text-xs text-muted-foreground">Điểm rủi ro</div>
                  <div className="mt-2 text-3xl font-semibold">{summary.risk ?? "—"}/100</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Từ rating + tỉ lệ huỷ đơn (mẫu)
                  </div>
                </div>
                <div className="rounded-2xl border border-border bg-muted/30 dark:bg-slate-950/30 p-4">
                  <div className="text-xs text-muted-foreground">Độ tin cậy</div>
                  <div className="mt-2 text-3xl font-semibold">{summary.confidence ?? 0}%</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Reviews: {summary.reviews} · Orders: {summary.orders}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-muted/30 dark:bg-slate-950/30 p-4">
                <div className="text-sm font-semibold">Tóm tắt</div>
                <div className="mt-2 grid grid-cols-2 gap-3 text-sm text-muted-foreground">
                  <div>Rating TB: <span className="font-medium text-foreground">{summary.avg != null ? summary.avg.toFixed(2) : "—"}</span></div>
                  <div>Tỉ lệ huỷ: <span className="font-medium text-foreground">{(summary.cancelRate * 100).toFixed(1)}%</span></div>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  * Đây là phân tích thống kê từ dữ liệu hiện có, không phải quyết định tự động.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card backdrop-blur-xl">
        <div className="grid grid-cols-8 gap-3 px-5 py-3 text-xs text-muted-foreground">
          <div className="col-span-2">Biến thể</div>
          <div className="text-center">Tồn kho</div>
          <div className="text-center">Orders (mẫu)</div>
          <div className="text-center">Huỷ</div>
          <div className="text-center">Rating</div>
          <div className="text-center">Reviews</div>
          <div className="text-right">Rủi ro</div>
        </div>

        <div className="divide-y divide-border">
          {loading ? (
            <div className="px-5 py-6 text-sm text-muted-foreground">Đang tải…</div>
          ) : rows.length === 0 ? (
            <div className="px-5 py-6 text-sm text-muted-foreground">{selectedId ? "Chưa có dữ liệu biến thể hoặc chưa đủ dữ liệu mẫu." : "Chưa chọn sản phẩm."}</div>
          ) : (
            rows.map((r) => {
              const vid = pickVariantId(r);
              const sku = r?.sku || r?.tenbienthe || `#${vid}`;
              const stock = r?.tonkho ?? r?.stock ?? "-";
              const avg = r.__avg != null ? Number(r.__avg).toFixed(2) : "—";
              const risk = r.__risk ?? 0;
              return (
                <div key={String(vid)} className="grid grid-cols-8 items-center gap-3 px-5 py-4">
                  <div className="col-span-2 min-w-0">
                    <div className="truncate text-sm font-medium">{sku}</div>
                    <div className="truncate text-xs text-muted-foreground">BT#{vid}</div>
                  </div>
                  <div className="text-center text-sm text-muted-foreground">{stock}</div>
                  <div className="text-center text-sm">{r.__orders ?? 0}</div>
                  <div className="text-center text-sm">{r.__cancelOrders ?? 0}</div>
                  <div className="text-center text-sm">{avg}</div>
                  <div className="text-center text-sm">{r.__reviewCount ?? 0}</div>
                  <div className="text-right">
                    <span className="inline-flex items-center rounded-full bg-indigo-500/25 px-3 py-1 text-xs ring-1 ring-indigo-400/30">
                      {risk}/100
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
