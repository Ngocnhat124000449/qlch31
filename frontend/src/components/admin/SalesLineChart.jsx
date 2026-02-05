"use client";

import { useMemo } from "react";

// Simple SVG line chart (no external deps)
// data: Array<{ label: string, value: number }>
export default function SalesLineChart({ data }) {
  const normalized = Array.isArray(data) ? data.filter(Boolean) : [];

  const points = useMemo(() => {
    const d = normalized;
    if (!d.length) return [];

    const max = Math.max(...d.map((x) => Number(x.value) || 0), 1);
    const min = Math.min(...d.map((x) => Number(x.value) || 0), 0);
    const w = 860;
    const h = 260;
    const padX = 30;
    const padY = 20;

    return d.map((p, i) => {
      const x = padX + (i * (w - padX * 2)) / Math.max(d.length - 1, 1);
      const t = ((Number(p.value) || 0) - min) / Math.max(max - min, 1);
      const y = padY + (1 - t) * (h - padY * 2);
      return { ...p, x, y };
    });
  }, [normalized]);

  const path = useMemo(() => {
    if (!points.length) return "";
    return points
      .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
      .join(" ");
  }, [points]);

  if (!normalized.length) {
    return (
      <div className="grid h-[260px] w-full place-items-center rounded-2xl border border-border/40 bg-card dark:bg-[#050915]">
        <div className="text-sm text-muted-foreground">Chưa có dữ liệu doanh thu 7 ngày.</div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="relative overflow-hidden rounded-2xl border border-border/40 bg-card dark:bg-[#050915] p-4 text-indigo-400">
        <svg viewBox="0 0 860 260" className="h-[260px] w-full">
          {/* grid */}
          {Array.from({ length: 5 }).map((_, i) => {
            const y = 20 + (i * (260 - 40)) / 4;
            return (
              <line
                key={i}
                x1="30"
                x2="830"
                y1={y}
                y2={y}
                stroke="currentColor"
                opacity="0.08"
              />
            );
          })}

          {/* line */}
          <path d={path} fill="none" stroke="currentColor" strokeWidth="2" opacity="0.9" />
          {/* points */}
          {points.map((p) => (
            <circle key={String(p.label)} cx={p.x} cy={p.y} r="4" fill="currentColor" opacity="0.95" />
          ))}
        </svg>

        <div className={`mt-4 grid gap-2 text-center text-xs text-muted-foreground`} style={{ gridTemplateColumns: `repeat(${Math.max(points.length, 1)}, minmax(0, 1fr))` }}>
          {points.map((p) => (
            <div key={String(p.label)} className="truncate">
              {p.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
