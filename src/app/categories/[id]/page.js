import Link from "next/link";
import SiteHeader from "@/components/header/SiteHeader";
import Footer from "@/components/home/Footer";
import ProductCard from "@/components/home/ProductCard";

const RAW_BASE = process.env.NEXT_PUBLIC_API_BASE || "";
const API_BASE = RAW_BASE.replace(/\/$/, "");

async function fetchJson(path) {
  if (!API_BASE) throw new Error("Missing NEXT_PUBLIC_API_BASE in .env.local");

  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.message || "API error");
  return data;
}

function normalizeList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.products)) return data.products;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

function pickSupplierName(p) {
  return (
    p?.nhacungcap_ten ||
    p?.nhacungcapTen ||
    p?.nhacungcap?.ten ||
    p?.nhacungcap?.name ||
    p?.supplier?.ten ||
    p?.supplier?.name ||
    null
  );
}

export default async function CategoryDetailPage({ params, searchParams }) {
  const danhmucid = params?.id;

  // Giới hạn (bạn có thể chỉnh default ở đây)
  const fetchLimit = Math.min(100, Number(searchParams?.limit || 60)); // tổng products fetch
  const supplierLimit = Number(searchParams?.suppliers || 8); // số NCC tối đa
  const perSupplier = Number(searchParams?.perSupplier || 6); // số SP tối đa mỗi NCC

  const [catRes, prodRes] = await Promise.all([
    fetchJson(`/api/catalog/categories/${encodeURIComponent(danhmucid)}`).catch(
      () => null
    ),
    fetchJson(
      `/api/catalog/products?danhmucid=${encodeURIComponent(
        danhmucid
      )}&limit=${fetchLimit}`
    ).catch(() => ({ products: [] })),
  ]);

  const category = catRes?.category || catRes || null;
  const products = normalizeList(prodRes);

  // group theo NCC
  const map = new Map();
  for (const p of products) {
    const sid = p?.nhacungcapid ?? p?.supplierId ?? 0;
    const sname =
      pickSupplierName(p) || (sid ? `Nhà cung cấp #${sid}` : "Khác");

    const key = String(sid || sname);
    if (!map.has(key)) {
      map.set(key, { supplierId: sid, supplierName: sname, products: [] });
    }
    map.get(key).products.push(p);
  }

  const groups = Array.from(map.values())
    .sort((a, b) => b.products.length - a.products.length)
    .slice(0, supplierLimit);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900">
      <SiteHeader />

      <main className="mx-auto max-w-7xl px-5 py-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-sm text-slate-400">
              <Link href="/" className="hover:text-slate-200">
                Trang chủ
              </Link>{" "}
              <span className="mx-2">/</span>
              <Link href="/categories" className="hover:text-slate-200">
                Danh mục
              </Link>{" "}
              <span className="mx-2">/</span>
              <span className="text-slate-200">
                {category?.ten || `Danh mục #${danhmucid}`}
              </span>
            </div>

            <h1 className="mt-2 text-2xl font-semibold text-slate-100">
              {category?.ten || `Danh mục #${danhmucid}`}
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Hiển thị tối đa <b>{supplierLimit}</b> nhà cung cấp, mỗi nhà cung
              cấp tối đa <b>{perSupplier}</b> sản phẩm.
            </p>
          </div>

          <Link
            href="/categories"
            className="text-sm text-slate-300 hover:text-slate-100"
          >
            ← Tất cả danh mục
          </Link>
        </div>

        {/* NCC quick jump */}
        {groups.length ? (
          <div className="mt-6 flex flex-wrap gap-2">
            {groups.map((g) => (
              <a
                key={String(g.supplierId || g.supplierName)}
                href={`#supplier-${g.supplierId || g.supplierName}`}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 hover:bg-white/10"
              >
                {g.supplierName}{" "}
                <span className="text-slate-400">({g.products.length})</span>
              </a>
            ))}
          </div>
        ) : (
          <div className="mt-6 text-sm text-slate-400">
            Chưa có sản phẩm trong danh mục này.
          </div>
        )}

        {/* Groups */}
        <div className="mt-8 space-y-10">
          {groups.map((g) => (
            <section
              key={String(g.supplierId || g.supplierName)}
              id={`supplier-${g.supplierId || g.supplierName}`}
              className="scroll-mt-24"
            >
              <div className="flex items-end justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-100">
                    {g.supplierName}
                  </h2>
                  <div className="mt-1 text-sm text-slate-400">
                    {g.products.length} sản phẩm (đang hiển thị{" "}
                    {Math.min(perSupplier, g.products.length)})
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {g.products.slice(0, perSupplier).map((p) => (
                  <ProductCard
                    key={String(p?.sanphamid ?? p?.id ?? JSON.stringify(p))}
                    product={p}
                    showBadges={false}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
