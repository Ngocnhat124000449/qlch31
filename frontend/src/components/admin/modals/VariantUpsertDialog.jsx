"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  adminCreateVariant,
  adminListProducts,
  adminUpdateVariant,
  formatApiError,
  toNumber,
} from "@/lib/adminApi";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function pickId(v) {
  return v?.bentheid ?? v?.id ?? null;
}

export default function VariantUpsertDialog({
  open,
  onOpenChange,
  sanphamid,
  initial,
  onSaved,
}) {
  const id = useMemo(() => pickId(initial), [initial]);
  const isEdit = id != null;

  const [sku, setSku] = useState("");
  const [giaban, setGiaban] = useState("");
  const [tonkho, setTonkho] = useState("");
  const [image, setImage] = useState(null);
  const fileRef = useRef(null);
  const [imagePreview, setImagePreview] = useState("");
  const [trangthai, setTrangthai] = useState(true);

  // Create variant outside Product dialog: allow selecting an existing product.
  const [productQuery, setProductQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productId, setProductId] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setError("");
    setSaving(false);
    setSku(initial?.sku ?? "");
    setGiaban(initial?.giaban != null ? String(initial.giaban) : "");
    setTonkho(initial?.tonkho != null ? String(initial.tonkho) : "");
    setImage(null);
    setImagePreview("");
    setTrangthai(initial?.trangthai ?? true);

    // Reset product selection when creating outside Product dialog
    if (!isEdit) {
      const inferred =
        sanphamid ??
        initial?.sanphamid ??
        initial?.sanpham_id ??
        initial?.productid ??
        initial?.productId ??
        "";
      setProductId(inferred ? String(inferred) : "");
      setProductQuery("");
    }
  }, [open, initial]);

  // Preview image when selecting a new file
  useEffect(() => {
    if (!open) return;
    if (!image) {
      setImagePreview("");
      return;
    }
    const url = URL.createObjectURL(image);
    setImagePreview(url);
    return () => {
      try {
        URL.revokeObjectURL(url);
      } catch {}
    };
  }, [open, image]);

  async function loadProducts(q) {
    setProductsLoading(true);
    try {
      const { products: list } = await adminListProducts({
        all: true,
        page: 1,
        limit: 50,
        q: q?.trim() ? q.trim() : undefined,
      });
      setProducts(Array.isArray(list) ? list : []);
    } catch {
      setProducts([]);
    } finally {
      setProductsLoading(false);
    }
  }

  // When creating (no sanphamid passed), fetch products to choose.
  useEffect(() => {
    if (!open) return;
    if (isEdit) return;
    if (sanphamid) return;

    const t = setTimeout(() => {
      loadProducts(productQuery);
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isEdit, sanphamid, productQuery]);

  const effectiveProductId = sanphamid ?? (productId ? Number(productId) : null);

  const canSave =
    sku.trim().length > 0 &&
    toNumber(giaban) > 0 &&
    (isEdit ? true : !!image) &&
    (isEdit ? true : !!effectiveProductId);

  async function handleSave() {
    if (!isEdit && !effectiveProductId) {
      setError("Hãy chọn một sản phẩm có sẵn để thêm biến thể.");
      return;
    }
    if (!canSave || saving) return;
    setSaving(true);
    setError("");
    try {
      const fields = {
        sku: sku.trim(),
        giaban: toNumber(giaban),
        tonkho: tonkho === "" ? undefined : toNumber(tonkho),
        image,
        trangthai: !!trangthai,
      };

      const res = isEdit
        ? await adminUpdateVariant(id, fields)
        : await adminCreateVariant(effectiveProductId, fields);

      onSaved?.(res);
      onOpenChange?.(false);
    } catch (e) {
      setError(formatApiError(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg border-border bg-background dark:bg-[#0b1020] text-foreground">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Cập nhật biến thể" : "Thêm biến thể"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {error ? (
            <div className="whitespace-pre-line rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
              {error}
            </div>
          ) : null}

          {!isEdit && !sanphamid ? (
            <div className="grid gap-2">
              <Label>Sản phẩm (chọn sản phẩm đã có)</Label>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Input
                  value={productQuery}
                  onChange={(e) => setProductQuery(e.target.value)}
                  placeholder="Tìm sản phẩm theo tên/slug…"
                  className="sm:flex-1"
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => loadProducts(productQuery)}
                  disabled={productsLoading}
                  className="shrink-0"
                >
                  {productsLoading ? "Đang tìm…" : "Tìm"}
                </Button>
              </div>

              <Select value={productId ? String(productId) : ""} onValueChange={setProductId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn sản phẩm" />
                </SelectTrigger>
                <SelectContent>
                  {(products || []).map((p) => {
                    const pid = p?.sanphamid ?? p?.id;
                    const name = p?.ten ?? p?.name ?? `#${pid}`;
                    if (pid == null) return null;
                    return (
                      <SelectItem key={String(pid)} value={String(pid)}>
                        {name} (#{pid})
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>

              <div className="text-xs text-muted-foreground">
                Bạn chỉ có thể thêm biến thể cho sản phẩm đã tồn tại trong hệ thống.
              </div>
            </div>
          ) : null}

          <div className="grid gap-2">
            <Label>SKU</Label>
            <Input value={sku} onChange={(e) => setSku(e.target.value)} placeholder="VD: LAP-001" />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>Giá bán</Label>
              <Input
                value={giaban}
                onChange={(e) => setGiaban(e.target.value)}
                inputMode="numeric"
                placeholder="VD: 19900000"
              />
            </div>

            <div className="grid gap-2">
              <Label>Tồn kho</Label>
              <Input
                value={tonkho}
                onChange={(e) => setTonkho(e.target.value)}
                inputMode="numeric"
                placeholder="VD: 10"
              />
            </div>
          </div>

          <div className="grid gap-2">
  <Label>Hình ảnh biến thể {isEdit ? "(tùy chọn)" : "(bắt buộc)"}</Label>

  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
    <input
      ref={fileRef}
      type="file"
      accept="image/*"
      className="hidden"
      onChange={(e) => setImage(e.target.files?.[0] || null)}
    />
    <Button
      type="button"
      variant="secondary"
      onClick={() => fileRef.current?.click()}
      className="w-full sm:w-auto"
    >
      Chọn ảnh từ thiết bị
    </Button>

    <div className="min-w-0 text-xs text-muted-foreground">
      {image ? (
        <span className="truncate">Đã chọn: {image.name}</span>
      ) : initial?.hinhanhurl ? (
        <span className="truncate">Đang dùng ảnh hiện tại</span>
      ) : (
        <span className="truncate">Chưa chọn ảnh</span>
      )}
    </div>

    {image ? (
      <Button type="button" variant="ghost" onClick={() => setImage(null)} className="sm:ml-auto">
        Bỏ chọn
      </Button>
    ) : null}
  </div>

  {(imagePreview || initial?.hinhanhurl) ? (
    <div className="mt-1 overflow-hidden rounded-lg border border-border bg-card p-2">
      <div className="text-[11px] text-muted-foreground">Xem trước</div>
      <img
        src={imagePreview || initial?.hinhanhurl}
        alt={sku ? `Ảnh ${sku}` : "Ảnh biến thể"}
        className="mt-2 h-28 w-full rounded-md object-cover"
      />
    </div>
  ) : null}

  <div className="text-xs text-muted-foreground">Ảnh sẽ được backend upload lên Cloudinary và lưu link vào biến thể.</div>
</div>

          <label className="flex items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-border"
              checked={!!trangthai}
              onChange={(e) => setTrangthai(e.target.checked)}
            />
            Hoạt động
          </label>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            className="border-white/15 bg-card text-foreground hover:bg-muted/50"
            onClick={() => onOpenChange?.(false)}
            disabled={saving}
          >
            Hủy
          </Button>
          <Button type="button" onClick={handleSave} disabled={!canSave || saving}>
            {saving ? "Đang lưu…" : "Lưu"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
