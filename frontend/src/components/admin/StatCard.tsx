import styles from "./StatCard.module.scss";
export default function StatCard({ title, value, hint, icon }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 backdrop-blur-xl">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs text-muted-foreground">{title}</div>
          <div className="mt-2 text-2xl font-semibold">{value}</div>
          {hint ? <div className="mt-1 text-xs text-muted-foreground">{hint}</div> : null}
        </div>
        {icon ? (
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-card ring-1 ring-border">
            {icon}
          </div>
        ) : null}
      </div>
    </div>
  );
}
