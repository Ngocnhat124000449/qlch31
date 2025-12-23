"use client";

import { useMemo } from "react";

// Tiny chart used by older dashboard UI. No demo data.
// props:
// - title, subtitle
// - data: Array<{ label: string, value: number }>
export default function SimpleLineChart({
  title = "Tổng quan bán hàng",
  subtitle = "Doanh thu trong 7 ngày qua.",
  data = [],
}) {
  const normalized = Array.isArray(data) ? data.filter(Boolean) : [];

  const { points, labels } = useMemo(() => {
    if (!normalized.length) return { points: [], labels: [] };

    const w = 340;
    const h = 110;
    const padX = 10;
    const padY = 10;

    const vals = normalized.map((d) => Number(d.value) || 0);
    const max = Math.max(...vals, 1);
    const min = Math.min(...vals, 0);

    const pts = normalized.map((d, i) => {
      const x = padX + (i * (w - padX * 2)) / Math.max(normalized.length - 1, 1);
      const t = ((Number(d.value) || 0) - min) / Math.max(max - min, 1);
      // y in viewBox coordinates (0..110)
      const y = padY + (1 - t) * (h - padY * 2);
      return [x, y];
    });

    return { points: pts, labels: normalized.map((d) => String(d.label ?? "")) };
  }, [normalized]);

  const d = useMemo(() => {
    if (!points.length) return "";
    return points.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0]} ${p[1]}`).join(" ");
  }, [points]);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
      <div className="mb-3">
        <div className="text-base font-semibold">{title}</div>
        <div className="text-xs text-white/55">{subtitle}</div>
      </div>

      {normalized.length === 0 ? (
        <div className="grid h-[260px] place-items-center text-sm text-white/50">
          Chưa có dữ liệu.
        </div>
      ) : (
        <>
          <svg viewBox="0 0 340 110" className="h-[260px] w-full">
            <path d="M10 100 H330" stroke="rgba(255,255,255,0.10)" />
            <path d={d} fill="none" stroke="rgba(99,102,241,0.95)" strokeWidth="2.5" />
            {points.map(([x, y], idx) => (
              <circle key={idx} cx={x} cy={y} r="3.5" fill="rgba(255,255,255,0.95)" />
            ))}
          </svg>

          <div
            className="mt-2 grid text-center text-[11px] text-white/45"
            style={{ gridTemplateColumns: `repeat(${Math.max(labels.length, 1)}, minmax(0,1fr))` }}
          >
            {labels.map((t, i) => (
              <div key={i} className="truncate">
                {t}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
