"use client";

import { useEffect, useMemo, useState } from "react";
import ProductCard from "@/components/home/ProductCard";

function pad2(n) {
  return String(n).padStart(2, "0");
}

function parseEndsAt(endsAt) {
  const t = endsAt ? new Date(endsAt).getTime() : NaN;
  return Number.isFinite(t) ? t : Date.now() + 24 * 60 * 60 * 1000;
}

export default function FlashSaleSection({ endsAt, items }) {
  const target = useMemo(() => parseEndsAt(endsAt), [endsAt]);

  // ✅ chặn hydration mismatch: chỉ render countdown khi đã mount client
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    setMounted(true);
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const diff = Math.max(0, target - now);
  const totalSec = Math.floor(diff / 1000);

  const days = Math.floor(totalSec / (24 * 3600));
  const hours = Math.floor((totalSec % (24 * 3600)) / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;

  return (
    <section className="mt-10">
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-foreground font-semibold">
              Khuyến mãi chớp nhoáng
            </div>

            {/* ✅ SSR sẽ render "—", client mount xong mới render số */}
            <div className="text-muted-foreground text-sm mt-2">
              {mounted ? (
                <>
                  {days} ngày &nbsp; {pad2(hours)} giờ &nbsp; {pad2(mins)} phút
                  &nbsp; {pad2(secs)} giây
                </>
              ) : (
                "—"
              )}
            </div>
          </div>

          <div className="text-muted-foreground text-sm">Kết thúc sau</div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          {(items || []).slice(0, 4).map((p) => (
            <ProductCard key={p.sanphamid || p.id} product={p} showBadges />
          ))}
        </div>
      </div>
    </section>
  );
}
