import Link from "next/link";
import SiteHeader from "@/components/header/SiteHeader";
import Footer from "@/components/home/Footer";
import ProductWithVariantsCard from "@/components/products/ProductWithVariantsCard";
import {
  buildProductsPageByCategories,
  buildProductsPageBySearch,
} from "@/lib/productsPageApi";

export const dynamic = "force-dynamic";

export default async function ProductsPage({ searchParams }) {
  const sp = await searchParams; // ✅ FIX: unwrap Promise

  const q = String(sp?.search || "").trim();

  const maxCategories = Math.min(30, Number(sp?.maxCategories || 8));
  const productLimit = Math.min(60, Number(sp?.limit || 8));
  const variantLimit = Math.min(30, Number(sp?.variantLimit || 6));

  const isSearchMode = !!q;

  const data = isSearchMode
    ? await buildProductsPageBySearch(q, {
        limit: Math.max(1, productLimit * Math.max(1, maxCategories)),
        variantLimit,
      })
    : await buildProductsPageByCategories({
        maxCategories,
        productLimit,
        variantLimit,
      });

  return (
    <div className="min-h-screen bg-background dark:bg-gradient-to-b dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
      <SiteHeader />

      <main className="mx-auto max-w-7xl px-5 py-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-sm text-muted-foreground">
              <Link href="/" className="hover:text-foreground">
                Trang chủ
              </Link>{" "}
              <span className="mx-2">/</span>
              <span className="text-foreground">Sản phẩm</span>
            </div>

            <h1 className="mt-2 text-2xl font-semibold text-foreground">
              {isSearchMode ? "Kết quả tìm kiếm" : "Sản phẩm theo danh mục"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {isSearchMode
                ? `Từ khóa: “${q}”`
                : `Mỗi block là 1 danh mục · mỗi danh mục tối đa ${productLimit} sản phẩm · mỗi sản phẩm tối đa ${variantLimit} biến thể`}
            </p>
          </div>

          {isSearchMode ? (
            <Link
              href="/products"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              ← Xem theo danh mục
            </Link>
          ) : (
            <Link
              href="/categories"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Xem tất cả danh mục →
            </Link>
          )}
        </div>

        {isSearchMode ? (
          <SearchResultsGrid data={data} variantLimit={variantLimit} />
        ) : (
          <CategoriesBlocks blocks={data} variantLimit={variantLimit} />
        )}
      </main>

      <Footer />
    </div>
  );
}

function CategoriesBlocks({ blocks, variantLimit }) {
  const list = Array.isArray(blocks) ? blocks : [];

  return (
    <>
      {/* Quick jump */}
      {list.length ? (
        <div className="mt-6 flex flex-wrap gap-2">
          {list.map((b) => (
            <a
              key={String(b.id)}
              href={`#cat-${b.id}`}
              className="rounded-full border border-border bg-card px-3 py-2 text-sm text-foreground hover:bg-muted/50"
            >
              {b.title}{" "}
              <span className="text-muted-foreground">
                ({b.products?.length || 0})
              </span>
            </a>
          ))}
        </div>
      ) : (
        <div className="mt-6 text-sm text-muted-foreground">Chưa có dữ liệu.</div>
      )}

      {/* Blocks */}
      <div className="mt-8 space-y-12">
        {list.map((b) => (
          <section
            key={String(b.id)}
            id={`cat-${b.id}`}
            className="scroll-mt-24"
          >
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  {b.title}
                </h2>
                <div className="mt-1 text-sm text-muted-foreground">
                  {b.products?.length || 0} sản phẩm
                </div>
              </div>

              <Link
                href={`/categories/${encodeURIComponent(b.id)}`}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Xem thêm →
              </Link>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {(b.products || []).map((p) => (
                <ProductWithVariantsCard
                  key={String(p?.sanphamid ?? p?.id ?? JSON.stringify(p))}
                  product={p}
                  variantLimit={variantLimit}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}

function SearchResultsGrid({ data, variantLimit }) {
  const products = Array.isArray(data?.products) ? data.products : [];
  const map = data?.categoryMap || {};

  if (!products.length) {
    return (
      <div className="mt-8 text-sm text-muted-foreground">
        Không có sản phẩm phù hợp.
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="text-sm text-muted-foreground">
        Tìm thấy <b className="text-foreground">{products.length}</b> sản phẩm
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {products.map((p) => {
          const catId = p?.danhmucid ?? p?.categoryId ?? null;
          const catName = catId != null ? map[String(catId)] : null;

          return (
            <div key={String(p?.sanphamid ?? p?.id ?? JSON.stringify(p))}>
              {catName ? (
                <div className="mb-2 text-xs text-muted-foreground">
                  Danh mục: <span className="text-foreground">{catName}</span>
                </div>
              ) : null}
              <ProductWithVariantsCard
                product={p}
                variantLimit={variantLimit}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
