import styles from "./ProductWithVariantsCard.module.scss";
import Link from "next/link";
import SmartImage from "@/components/ui/SmartImage";
import { Badge } from "@/components/ui/badge";
import { formatVND } from "@/lib/format";

function pickProductId(p) {
  return p?.sanphamid ?? p?.id ?? p?._id ?? null;
}

function pickProductName(p) {
  return p?.tensanpham || p?.ten || p?.name || "Sản phẩm";
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

function pickProductImage(p) {
  return (
    p?.hinhanhurl ||
    p?.imageUrl ||
    p?.hinhanh ||
    p?.anh ||
    null
  );
}

function pickVariantId(v) {
  return v?.bentheid ?? v?.id ?? v?._id ?? null;
}

function pickVariantSku(v) {
  return v?.sku || v?.tenbienthe || null;
}

function pickVariantPrice(v) {
  return v?.giaban ?? v?.gia ?? v?.price ?? 0;
}

export default function ProductWithVariantsCard({ product, variantLimit = 6 }) {
  const id = pickProductId(product);
  const name = pickProductName(product);
  const supplier = pickSupplierName(product);
  const imageUrl = pickProductImage(product);
  const variants = Array.isArray(product?.variants) ? product.variants : [];
  const show = variants.slice(0, Math.max(0, Number(variantLimit) || 0) || 6);

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <Link
        href={id != null ? `/products/${encodeURIComponent(id)}` : "#"}
        className="block"
        aria-label={id != null ? `Xem chi tiết ${name}` : "Sản phẩm"}
      >
        <div className="relative h-44">
          <SmartImage
            src={imageUrl}
            alt={name}
            className="h-full w-full object-cover"
          />
        </div>
      </Link>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link
              href={id != null ? `/products/${encodeURIComponent(id)}` : "#"}
              className="text-foreground font-semibold line-clamp-2 hover:underline"
            >
              {name}
            </Link>
            {supplier ? (
              <div className="mt-1 text-xs text-muted-foreground line-clamp-1">
                {supplier}
              </div>
            ) : null}
          </div>

          <Badge className="bg-muted/50 text-foreground border border-border">
            {variants.length} biến thể
          </Badge>
        </div>

        <div className="mt-3 space-y-2">
          {show.length === 0 ? (
            <div className="text-sm text-muted-foreground">Chưa có biến thể.</div>
          ) : (
            show.map((v) => {
              const vid = pickVariantId(v) ?? Math.random();
              const sku = pickVariantSku(v) || `Variant #${vid}`;
              const price = pickVariantPrice(v);
              const stock = Number(v?.tonkho ?? v?.stock ?? 0);

              return (
                <div
                  key={String(vid)}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/30 dark:bg-slate-950/30 px-3 py-2"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-medium text-foreground line-clamp-1">
                      {sku}
                    </div>
                    <div className="text-[11px] text-muted-foreground">ID: {vid}</div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-semibold text-primary">
                      {formatVND(price)}
                    </div>
                    <div
                      className={[
                        "text-[11px]",
                        stock > 0 ? "text-emerald-600 dark:text-emerald-300" : "text-muted-foreground",
                      ].join(" ")}
                    >
                      {stock > 0 ? `Còn ${stock}` : "Hết hàng"}
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {variants.length > show.length ? (
            <div className="text-xs text-muted-foreground">
              +{variants.length - show.length} biến thể khác
            </div>
          ) : null}
        </div>

        {/* Hint: id để debug/link sau này */}
        {id ? (
          <div className="mt-3 text-[11px] text-muted-foreground">SP#{id}</div>
        ) : null}
      </div>
    </div>
  );
}
