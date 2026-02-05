"use client";

import { usePopups } from "@/components/popups/PopupProvider";

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

  // Không có route /products/[id] trong project hiện tại.
  // Thay vì link sang 404, click sẽ mở Quick View.
  const { openQuickView } = usePopups();

  return (
    <div
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className={[
        "absolute left-[280px] inset-y-0 z-40 w-[920px] rounded-2xl",
        "border border-border bg-popover backdrop-blur",
        "shadow-2xl",
      ].join(" ")}
    >
      <div className="grid grid-cols-12 gap-6 p-6">
        {/* Vendors */}
        <div className="col-span-5">
          <div className="mb-3 text-sm font-semibold text-foreground">
            Hãng / Nhà cung cấp
          </div>

          {loading ? (
            <div className="text-sm text-muted-foreground">Đang tải...</div>
          ) : error ? (
            <div className="text-sm text-rose-300">Không tải được dữ liệu</div>
          ) : vendors?.length ? (
            <div className="flex flex-wrap gap-2">
              {vendors.map((v) => (
                <span
                  key={String(v)}
                  className={[
                    "rounded-lg px-3 py-2 text-sm",
                    "border border-border bg-card",
                    "text-foreground",
                  ].join(" ")}
                >
                  {v}
                </span>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">Chưa có hãng</div>
          )}
        </div>

        {/* HOT */}
        <div className="col-span-3">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
            HOT <span className="text-amber-400">⚡</span>
          </div>
          <div className="space-y-2">
            {(hotProducts || []).slice(0, 10).map((p) => {
              const id = getProductId(p);
              const name = getProductName(p);
              return (
                <button
                  type="button"
                  key={String(id ?? name)}
                  onClick={() => id != null && openQuickView(id)}
                  disabled={id == null}
                  className={[
                    "block rounded-lg px-3 py-2 text-sm",
                    "border border-border bg-card",
                    "text-foreground hover:bg-muted/50 hover:text-foreground",
                    "transition-colors",
                  ].join(" ")}
                >
                  {name}
                </button>
              );
            })}
          </div>
        </div>

        {/* NEW */}
        <div className="col-span-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
            Mới <span className="text-emerald-400">●</span>
          </div>
          <div className="space-y-2">
            {(newProducts || []).slice(0, 10).map((p) => {
              const id = getProductId(p);
              const name = getProductName(p);
              return (
                <button
                  type="button"
                  key={String(id ?? name)}
                  onClick={() => id != null && openQuickView(id)}
                  disabled={id == null}
                  className={[
                    "block rounded-lg px-3 py-2 text-sm",
                    "border border-border bg-card",
                    "text-foreground hover:bg-muted/50 hover:text-foreground",
                    "transition-colors",
                  ].join(" ")}
                >
                  {name}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
