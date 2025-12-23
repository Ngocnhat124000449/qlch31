"use client";

import Link from "next/link";

function getProductId(p) {
  return p?.sanphamid ?? p?.id ?? p?._id ?? null;
}
function getProductName(p) {
  return p?.ten ?? p?.name ?? p?.tensanpham ?? "Sản phẩm";
}

export default function CategoryMegaPanel({
  open,
  loading,
  error,
  vendors,
  hotProducts,
  newProducts,
  onEnter,
  onLeave,
}) {
  if (!open) return null;

  return (
    <div
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className={[
        "absolute left-[280px] inset-y-0 z-40 w-[920px] rounded-2xl",
        "border border-white/10 bg-slate-950/80 backdrop-blur",
        "shadow-2xl",
      ].join(" ")}
    >
      <div className="grid grid-cols-12 gap-6 p-6">
        {/* Vendors */}
        <div className="col-span-5">
          <div className="mb-3 text-sm font-semibold text-slate-100">
            Hãng / Nhà cung cấp
          </div>

          {loading ? (
            <div className="text-sm text-slate-400">Đang tải...</div>
          ) : error ? (
            <div className="text-sm text-rose-300">Không tải được dữ liệu</div>
          ) : vendors?.length ? (
            <div className="flex flex-wrap gap-2">
              {vendors.map((v) => (
                <span
                  key={String(v)}
                  className={[
                    "rounded-lg px-3 py-2 text-sm",
                    "border border-white/10 bg-white/5",
                    "text-slate-200",
                  ].join(" ")}
                >
                  {v}
                </span>
              ))}
            </div>
          ) : (
            <div className="text-sm text-slate-400">Chưa có hãng</div>
          )}
        </div>

        {/* HOT */}
        <div className="col-span-3">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-100">
            HOT <span className="text-amber-400">⚡</span>
          </div>
          <div className="space-y-2">
            {(hotProducts || []).slice(0, 10).map((p) => {
              const id = getProductId(p);
              return (
                <Link
                  key={String(id ?? getProductName(p))}
                  href={id ? `/products/${id}` : "/products"}
                  className={[
                    "block rounded-lg px-3 py-2 text-sm",
                    "border border-white/10 bg-white/5",
                    "text-slate-200 hover:bg-white/10 hover:text-slate-100",
                    "transition-colors",
                  ].join(" ")}
                >
                  {getProductName(p)}
                </Link>
              );
            })}
          </div>
        </div>

        {/* NEW */}
        <div className="col-span-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-100">
            Mới <span className="text-emerald-400">●</span>
          </div>
          <div className="space-y-2">
            {(newProducts || []).slice(0, 10).map((p) => {
              const id = getProductId(p);
              return (
                <Link
                  key={String(id ?? getProductName(p))}
                  href={id ? `/products/${id}` : "/products"}
                  className={[
                    "block rounded-lg px-3 py-2 text-sm",
                    "border border-white/10 bg-white/5",
                    "text-slate-200 hover:bg-white/10 hover:text-slate-100",
                    "transition-colors",
                  ].join(" ")}
                >
                  {getProductName(p)}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
