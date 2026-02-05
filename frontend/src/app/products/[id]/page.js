import { notFound } from "next/navigation";

import SiteHeader from "@/components/header/SiteHeader";
import Footer from "@/components/home/Footer";
import { publicFetchJson } from "@/lib/publicApi";

import ProductDetailClient from "./ProductDetailClient";

export const dynamic = "force-dynamic";

function pickProduct(data) {
  return (
    data?.product ??
    data?.data?.product ??
    data?.sanpham ??
    data?.item ??
    data ??
    null
  );
}

export default async function ProductDetailPage({ params }) {
  const id = params?.id;

  let product = null;
  try {
    const data = await publicFetchJson(
      `/api/catalog/products/${encodeURIComponent(id)}`
    );
    product = pickProduct(data);
  } catch {
    product = null;
  }

  if (!product) return notFound();

  return (
    <div className="min-h-screen bg-background dark:bg-gradient-to-b dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
      <SiteHeader />
      <ProductDetailClient initialProduct={product} />
      <Footer />
    </div>
  );
}
