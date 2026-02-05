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
          <h2 className="text-4xl font-semibold text-foreground">{title}</h2>
          {subtitle ? <p className="text-muted-foreground mt-2">{subtitle}</p> : null}
        </div>

        {categoryId ? (
          <Link
            href={`/categories/${categoryId}`}
            className="rounded-xl border border-border bg-card px-4 py-2 text-sm text-foreground hover:bg-muted/50"
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
