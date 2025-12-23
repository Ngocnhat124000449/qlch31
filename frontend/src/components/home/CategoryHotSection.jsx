import Link from "next/link";
import ProductCard from "@/components/home/ProductCard";

export default function CategoryHotSection({
  title,
  subtitle,
  products,
  cols = 4, // 4 (phone), 3 (laptop), 2 (pc)
  categoryId,
}) {
  const grid =
    cols === 2
      ? "grid-cols-1 md:grid-cols-2"
      : cols === 3
      ? "grid-cols-1 md:grid-cols-3"
      : "grid-cols-1 md:grid-cols-4";

  return (
    <section className="mt-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-4xl font-semibold text-white">{title}</h2>
          {subtitle ? <p className="text-slate-400 mt-2">{subtitle}</p> : null}
        </div>

        {categoryId ? (
          <Link
            href={`/categories/${categoryId}`}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 hover:bg-white/10"
          >
            Xem thêm
          </Link>
        ) : null}
      </div>

      <div className={`mt-10 grid ${grid} gap-6`}>
        {(products || []).map((p) => (
          <ProductCard
            key={p.sanphamid || p.id}
            product={p}
            showBadges={false}
          />
        ))}
      </div>
    </section>
  );
}
