import SiteHeader from "@/components/header/SiteHeader";
import Footer from "@/components/home/Footer";
import ScrollTopButton from "@/components/home/ScrollTopButton";
import PromotionProductCard from "@/components/promotions/PromotionProductCard";

import { getPromotionPageProducts } from "@/lib/promotionsApi";

import { Sparkles } from "lucide-react";

export default async function PromotionsPage() {
  const products = await getPromotionPageProducts({ limit: 12 }).catch(
    () => []
  );

  return (
    <div className="min-h-screen bg-background dark:bg-gradient-to-b dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
      <SiteHeader />

      <main className="mx-auto max-w-7xl px-5 py-10">
        {/* Hero */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-border bg-card">
            <Sparkles className="h-6 w-6 text-foreground" />
          </div>
          <h1 className="text-3xl md:text-4xl font-semibold text-foreground">
            Sản phẩm khuyến mãi
          </h1>
          <p className="mt-3 text-muted-foreground">
            Đừng bỏ lỡ cơ hội sở hữu những sản phẩm công nghệ đỉnh cao với mức
            giá cực kỳ ưu đãi.
          </p>
        </div>

        {/* Grid */}
        {products.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">
            Hiện chưa có sản phẩm khuyến mãi.
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((p) => (
              <PromotionProductCard
                key={String(p?.sanphamid ?? p?.id ?? JSON.stringify(p))}
                product={p}
              />
            ))}
          </div>
        )}
      </main>

      <Footer />
      <ScrollTopButton />
    </div>
  );
}
