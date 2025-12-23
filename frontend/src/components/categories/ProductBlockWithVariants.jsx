import SmartImage from "@/components/ui/SmartImage";

import { formatVND } from "@/lib/format";

function getProductId(p) {
  return p?.sanphamid ?? p?.id ?? p?._id ?? null;
}

function getProductName(p) {
  return p?.ten ?? p?.tensanpham ?? p?.name ?? "Sản phẩm";
}

function getProductImage(p) {
  return (
    p?.hinhanhurl ||
    p?.imageUrl ||
    p?.hinhanh ||
    p?.anh ||
    null
  );
}

function pickSupplierName(p) {
  return (
    p?.nhacungcap_ten ||
    p?.nhacungcapTen ||
    p?.nhacungcap?.ten ||
    p?.supplier?.ten ||
    p?.brand?.ten ||
    null
  );
}

function normalizeVariants(product) {
  const v = product?.variants;
  if (Array.isArray(v)) return v;
  if (Array.isArray(product?.bienthe)) return product.bienthe;
  return [];
}

export default function ProductBlockWithVariants({ product }) {
  const id = getProductId(product);
  const name = getProductName(product);
  const imageUrl = getProductImage(product);
  const supplierName = pickSupplierName(product);
  const shortDesc = product?.motangan || product?.tomtat || null;
  const variants = normalizeVariants(product);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
      <div className="relative h-44">
        <SmartImage src={imageUrl} alt={name} className="h-full w-full object-cover" />

        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent p-3">
          <div className="text-slate-100 font-semibold line-clamp-1">
            {name}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-300">
            {supplierName ? (
              <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5">
                {supplierName}
              </span>
            ) : null}
            {id != null ? (
              <span className="text-slate-400">#{String(id)}</span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="p-4">
        {shortDesc ? (
          <p className="text-sm text-slate-400 line-clamp-2">{shortDesc}</p>
        ) : null}

        <div className="mt-4">
          <div className="text-sm font-semibold text-slate-100">
            Biến thể
          </div>

          {variants.length ? (
            <div className="mt-2 space-y-2">
              {variants.map((v) => {
                const bentheid = v?.bentheid ?? v?.id ?? null;
                const sku = v?.sku || (bentheid != null ? `#${bentheid}` : "-");
                const price = v?.giaban ?? v?.gia ?? v?.price ?? null;
                const stock = v?.tonkho ?? v?.stock ?? null;
                const active = v?.trangthai ?? true;

                return (
                  <div
                    key={String(bentheid ?? sku)}
                    className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-slate-950/30 px-3 py-2"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-slate-100 truncate">
                        {sku}
                      </div>
                      <div className="mt-0.5 text-xs text-slate-400">
                        {stock != null ? `Tồn kho: ${stock}` : ""}
                        {!active ? " · Tạm tắt" : ""}
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <div className="text-sm font-semibold text-pink-300">
                        {price != null ? formatVND(price) : "-"}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="mt-2 text-sm text-slate-400">
              Sản phẩm chưa có biến thể.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
