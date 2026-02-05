export default function SimpleLineChart() {
  // SVG chart đơn giản (không cần recharts)
  const points = [
    [10, 70],
    [60, 90],
    [110, 60],
    [160, 45],
    [210, 65],
    [260, 40],
    [310, 30],
  ];

  const d = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p[0]} ${p[1]}`)
    .join(" ");

  return (
    <div className="rounded-2xl border border-border bg-card p-4 backdrop-blur-xl">
      <div className="mb-3">
        <div className="text-base font-semibold">Tổng quan bán hàng</div>
        <div className="text-xs text-muted-foreground">Doanh thu trong 7 ngày qua.</div>
      </div>

      <svg viewBox="0 0 340 110" className="h-[260px] w-full">
        <path d="M10 100 H330" stroke="rgba(255,255,255,0.10)" />
        <path d={d} fill="none" stroke="rgba(99,102,241,0.95)" strokeWidth="2.5" />
        {points.map(([x, y], idx) => (
          <circle key={idx} cx={x} cy={y} r="3.5" fill="rgba(255,255,255,0.95)" />
        ))}
      </svg>

      <div className="mt-2 grid grid-cols-7 text-center text-[11px] text-muted-foreground">
        {["Ngày 2/7", "Ngày 3/7", "Ngày 4/7", "Ngày 5/7", "Ngày 6/7", "Ngày 7/7", ""].map(
          (t, i) => (
            <div key={i} className="truncate">
              {t}
            </div>
          )
        )}
      </div>
    </div>
  );
}
