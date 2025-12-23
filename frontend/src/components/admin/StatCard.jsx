export default function StatCard({ title, value, hint, icon }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs text-white/55">{title}</div>
          <div className="mt-2 text-2xl font-semibold">{value}</div>
          {hint ? <div className="mt-1 text-xs text-white/45">{hint}</div> : null}
        </div>
        {icon ? (
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-white/5 ring-1 ring-white/10">
            {icon}
          </div>
        ) : null}
      </div>
    </div>
  );
}
