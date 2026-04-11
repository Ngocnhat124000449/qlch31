import Link from "next/link";

import SiteHeader from "@/components/header/SiteHeader";
import Footer from "@/components/home/Footer";
import { publicFetchJson } from "@/lib/publicApi";

function normalizeList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.categories)) return data.categories;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

function getCatId(cat) {
  return cat?.danhmucid ?? cat?.id ?? cat?._id ?? null;
}

function getCatName(cat) {
  return cat?.ten ?? cat?.tendanhmuc ?? cat?.name ?? "Danh mục";
}

export default async function CategoriesPage() {
  const res = await publicFetchJson("/api/catalog/categories").catch(() => null);
  const categories = normalizeList(res);

  return (
    <div className="min-h-screen bg-background dark:bg-gradient-to-b dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
      <SiteHeader />

      <main className="mx-auto max-w-7xl px-5 py-8">
        <div className="text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            Trang chủ
          </Link>{" "}
          <span className="mx-2">/</span>
          <span className="text-foreground">Danh mục</span>
        </div>

        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Danh mục</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Chọn một danh mục để xem các sản phẩm và biến thể.
            </p>
          </div>
        </div>

        {categories.length ? (
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {categories.map((c) => {
              const id = getCatId(c);
              const name = getCatName(c);
              const slug = c?.tenviettat || c?.slug || null;

              return (
                <Link
                  key={String(id ?? name)}
                  href={id ? `/categories/${id}` : "/categories"}
                  className="group rounded-2xl border border-border bg-card p-5 hover:bg-muted/50 transition-colors"
                >
                  <div className="text-foreground font-semibold text-lg line-clamp-1">
                    {name}
                  </div>
                  {slug ? (
                    <div className="mt-1 text-sm text-muted-foreground">/{slug}</div>
                  ) : null}
                  <div className="mt-4 text-sm text-muted-foreground group-hover:text-foreground">
                    Xem sản phẩm →
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="mt-8 text-sm text-muted-foreground">Chưa có danh mục.</div>
        )}
      </main>

      <Footer />
    </div>
  );
}
