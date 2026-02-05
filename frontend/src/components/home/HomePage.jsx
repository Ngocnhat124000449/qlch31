/**
 * HomePage (Server Component)
 * - Trang chủ của website (/).
 * - Fetch dữ liệu trang chủ và render các khối chính.
 * - Phần build section theo danh mục được tách sang lib/homeApi.js để tái sử dụng.
 */

import SiteHeader from "@/components/header/SiteHeader";
import CategorySidebar from "@/components/home/CategorySidebar";
import HeroBanner from "@/components/home/HeroBanner";
import FeaturePanel from "@/components/home/FeaturePanel";
import FlashSaleSection from "@/components/home/FlashSaleSection";
import CategoryHotSection from "@/components/home/CategoryHotSection";
import Footer from "@/components/home/Footer";
import ScrollTopButton from "@/components/home/ScrollTopButton";

import {
  buildHotNewSectionsByCategories,
  getFlashSale,
  getHomeBanners,
  getHomeCategories,
} from "@/lib/homeApi";

export default async function HomePage() {
  const [categories, banners, flashSale] = await Promise.all([
    getHomeCategories(),
    getHomeBanners(),
    getFlashSale(),
  ]);

  const sections = await buildHotNewSectionsByCategories(categories, {
    maxCategories: 6,
    limit: 8,
  });

  return (
    <div className="min-h-screen bg-background dark:bg-gradient-to-b dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
      <SiteHeader />

      <main className="mx-auto max-w-7xl px-5 py-8">
        {/* HERO */}
        <div className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)_320px] gap-6">
          <CategorySidebar categories={categories} />
          <HeroBanner banners={banners} />
          <FeaturePanel />
        </div>

        {/* FLASH SALE */}
        <FlashSaleSection
          endsAt={flashSale?.endsAt}
          items={flashSale?.items || []}
        />

        {/* CATEGORY BLOCKS */}
        {sections.map((sec) => (
          <CategoryHotSection
            key={String(sec.id)}
            categoryId={sec.id}
            title={sec.title}
            subtitle="Sản phẩm đại diện của danh mục."
            products={sec.products}
            cols={4}
          />
        ))}
      </main>

      <Footer />
      <ScrollTopButton />
    </div>
  );
}
