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
import { Textarea } from "@/components/ui/textarea";
import SmartImage from "@/components/ui/SmartImage";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  adminCreateProduct,
  adminGetProductDetail,
  adminListCategories,
  adminListSuppliers,
  adminListVariantsByProduct,
  adminUpdateProduct,
  formatApiError,
} from "@/lib/adminApi";
import VariantUpsertDialog from "@/components/admin/modals/VariantUpsertDialog";
import ConfirmDialog from "@/components/admin/modals/ConfirmDialog";

function pickId(p) {
  return p?.sanphamid ?? p?.id ?? null;
}

function pickVariantId(v) {
  return v?.bentheid ?? v?.id ?? null;
}

export default function ProductUpsertDialog({ open, onOpenChange, initial, onSaved }) {
  const initialId = useMemo(() => pickId(initial), [initial]);
  const [productId, setProductId] = useState(initialId);
  const isEdit = productId != null;

  const [tab, setTab] = useState("info");

  // options
  const [cats, setCats] = useState([]);
  const [sups, setSups] = useState([]);
  const [loadingOpt, setLoadingOpt] = useState(false);

  // fields
  const [ten, setTen] = useState("");
  const [tenviettat, setTenviettat] = useState("");
  const [danhmucid, setDanhmucid] = useState("");
  const [nhacungcapid, setNhacungcapid] = useState("");
  const [motangan, setMotangan] = useState("");
  const [motachitiet, setMotachitiet] = useState("");
  const [image, setImage] = useState(null);
  const fileRef = useRef(null);
  const [imagePreview, setImagePreview] = useState("");
  const [trangthai, setTrangthai] = useState(true);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [hint, setHint] = useState("");

  // variants
  const [variants, setVariants] = useState([]);
  const [loadingVariants, setLoadingVariants] = useState(false);
  const [variantModalOpen, setVariantModalOpen] = useState(false);
  const [variantEditing, setVariantEditing] = useState(null);

  const [disableConfirm, setDisableConfirm] = useState(false);
  const [disableLoading, setDisableLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setError("");
    setHint("");
    setSaving(false);
    setTab("info");
    setProductId(initialId);
    setImage(null);

    setTen(initial?.ten ?? "");
    setTenviettat(initial?.tenviettat ?? "");
    setDanhmucid(initial?.danhmucid != null ? String(initial.danhmucid) : "");
    setNhacungcapid(initial?.nhacungcapid != null ? String(initial.nhacungcapid) : "");
    setMotangan(initial?.motangan ?? "");
    setMotachitiet(initial?.motachitiet ?? "");
    setTrangthai(initial?.trangthai ?? true);
  }, [open, initial, initialId]);

// preview local image when admin selects file
useEffect(() => {
  if (!image) {
    setImagePreview("");
    return;
  }
  const u = URL.createObjectURL(image);
  setImagePreview(u);
  return () => URL.revokeObjectURL(u);
}, [image]);

  // load options when open
  useEffect(() => {
    if (!open) return;
    let mounted = true;
    (async () => {
      setLoadingOpt(true);
      try {
        const [{ categories }, { suppliers }] = await Promise.all([
          adminListCategories({ all: true }),
          adminListSuppliers({ all: true }),
        ]);
        if (!mounted) return;
        setCats(Array.isArray(categories) ? categories : []);
        setSups(Array.isArray(suppliers) ? suppliers : []);
      } catch {
        if (!mounted) return;
        setCats([]);
        setSups([]);
      } finally {
        if (mounted) setLoadingOpt(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [open]);

  async function loadVariants(pid) {
    if (!pid) return;
    setLoadingVariants(true);
    try {
      const { variants: v1 } = await adminListVariantsByProduct(pid, { all: true });
      setVariants(Array.isArray(v1) ? v1 : []);
    } catch {
      setVariants([]);
    } finally {
      setLoadingVariants(false);
    }
  }

  // when switching to variants tab, ensure variants loaded
  useEffect(() => {
    if (!open) return;
    if (tab !== "variants") return;
    if (!productId) return;
    loadVariants(productId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, open, productId]);

  const canSave = ten.trim().length > 0 && !!danhmucid && !!nhacungcapid && (productId ? true : !!image);

  async function handleSaveInfo() {
    if (!canSave || saving) return;
    setSaving(true);
    setError("");
    setHint("");
    try {
      const payload = {
        ten: ten.trim(),
        tenviettat: tenviettat.trim() || undefined,
        danhmucid: danhmucid ? Number(danhmucid) : undefined,
        nhacungcapid: nhacungcapid ? Number(nhacungcapid) : undefined,
        motangan: motangan.trim() || undefined,
        motachitiet: motachitiet.trim() || undefined,
        image,
        trangthai: !!trangthai,
      };

      let res;
      if (productId) res = await adminUpdateProduct(productId, payload);
      else res = await adminCreateProduct(payload);

      const nextId = pickId(res) || productId;
      if (nextId && !productId) {
        setProductId(nextId);
        setHint("Đã tạo sản phẩm. Bạn có thể thêm biến thể ngay ở tab ‘Biến thể’. ");
        setTab("variants");
      }

      onSaved?.(res);
      // giữ dialog mở để admin thêm biến thể
    } catch (e) {
      setError(formatApiError(e));
    } finally {
      setSaving(false);
    }
  }

  async function handleReloadProduct() {
    if (!productId) return;
    try {
      const p = await adminGetProductDetail(productId);
      setTen(p?.ten ?? ten);
      setTenviettat(p?.tenviettat ?? tenviettat);
      setDanhmucid(p?.danhmucid != null ? String(p.danhmucid) : danhmucid);
      setNhacungcapid(p?.nhacungcapid != null ? String(p.nhacungcapid) : nhacungcapid);
      setMotangan(p?.motangan ?? motangan);
      setMotachitiet(p?.motachitiet ?? motachitiet);
      setTrangthai(p?.trangthai ?? trangthai);
    } catch {
      // ignore
    }
  }

  async function handleDisableProduct() {
    if (!productId || disableLoading) return;
    setDisableLoading(true);
    try {
      const res = await adminUpdateProduct(productId, { trangthai: false });
      onSaved?.(res);
      setTrangthai(false);
      setDisableConfirm(false);
    } catch (e) {
      setError(formatApiError(e));
    } finally {
      setDisableLoading(false);
    }
  }

  const variantList = Array.isArray(variants) ? variants : [];

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(v) => {
          if (!v) onOpenChange?.(false);
          else onOpenChange?.(true);
        }}
      >
        <DialogContent className="max-w-3xl border-border bg-background dark:bg-[#0b1020] text-foreground">
          <DialogHeader>
            <DialogTitle>{productId ? "Cập nhật sản phẩm" : "Thêm sản phẩm"}</DialogTitle>
          </DialogHeader>

          <Tabs value={tab} onValueChange={setTab} className="gap-4">
            <TabsList className="bg-card text-muted-foreground ring-1 ring-border">
              <TabsTrigger value="info" className="data-[state=active]:bg-muted/50 data-[state=active]:text-foreground">
                Thông tin
              </TabsTrigger>
              <TabsTrigger
                value="variants"
                disabled={!productId}
                title={!productId ? "Hãy lưu sản phẩm trước để thêm biến thể" : undefined}
                className="data-[state=active]:bg-muted/50 data-[state=active]:text-foreground"
              >
                Biến thể
              </TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="space-y-4">
              {error ? (
                <div className="whitespace-pre-line rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                  {error}
                </div>
              ) : null}

              {hint ? (
                <div className="rounded-xl border border-indigo-400/20 bg-indigo-500/10 px-4 py-3 text-sm text-foreground">
                  {hint}
                </div>
              ) : null}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label>Tên sản phẩm</Label>
                  <Input value={ten} onChange={(e) => setTen(e.target.value)} placeholder="VD: Laptop Dell XPS" />
                </div>

                <div className="grid gap-2">
                  <Label>Slug / Tên viết tắt</Label>
                  <Input value={tenviettat} onChange={(e) => setTenviettat(e.target.value)} placeholder="VD: dell-xps" />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label>Danh mục</Label>
                  <Select value={danhmucid} onValueChange={setDanhmucid} disabled={loadingOpt}>
                    <SelectTrigger className="w-full border-white/15 bg-card">
                      <SelectValue placeholder="Chọn danh mục" />
                    </SelectTrigger>
                    <SelectContent className="border-border bg-background dark:bg-[#0b1020] text-foreground">
                      {cats.map((c) => {
                        const cid = c?.danhmucid ?? c?.id;
                        return (
                          <SelectItem key={String(cid)} value={String(cid)}>
                            {c?.ten ?? "-"}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label>Nhà cung cấp</Label>
                  <Select value={nhacungcapid} onValueChange={setNhacungcapid} disabled={loadingOpt}>
                    <SelectTrigger className="w-full border-white/15 bg-card">
                      <SelectValue placeholder="Chọn nhà cung cấp" />
                    </SelectTrigger>
                    <SelectContent className="border-border bg-background dark:bg-[#0b1020] text-foreground">
                      {sups.map((s) => {
                        const sid = s?.nhacungcapid ?? s?.id;
                        return (
                          <SelectItem key={String(sid)} value={String(sid)}>
                            {s?.ten ?? "-"}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Mô tả ngắn</Label>
                <Textarea value={motangan} onChange={(e) => setMotangan(e.target.value)} placeholder="VD: CPU i7, 16GB RAM..." />
              </div>

              <div className="grid gap-2">
                <Label>Mô tả chi tiết</Label>
                <Textarea value={motachitiet} onChange={(e) => setMotachitiet(e.target.value)} placeholder="Thông tin chi tiết sản phẩm..." />
              </div>

              <div className="grid gap-2">
  <Label>Hình ảnh sản phẩm {productId ? "(tùy chọn)" : "(bắt buộc)"}</Label>

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
      <SmartImage
        src={imagePreview || initial?.hinhanhurl}
        alt={ten ? `Ảnh ${ten}` : "Ảnh sản phẩm"}
        className="mt-2 h-36 w-full rounded-md object-cover"
      />
    </div>
  ) : null}
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

              <DialogFooter className="gap-2">
                {productId ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="border-rose-400/20 bg-rose-500/10 text-rose-100 hover:bg-rose-500/20"
                    onClick={() => setDisableConfirm(true)}
                    disabled={saving}
                  >
                    Tắt sản phẩm
                  </Button>
                ) : null}

                <div className="flex-1" />

                <Button
                  type="button"
                  variant="outline"
                  className="border-white/15 bg-card text-foreground hover:bg-muted/50"
                  onClick={() => onOpenChange?.(false)}
                  disabled={saving}
                >
                  Đóng
                </Button>
                <Button type="button" onClick={handleSaveInfo} disabled={!canSave || saving}>
                  {saving ? "Đang lưu…" : "Lưu"}
                </Button>
              </DialogFooter>
            </TabsContent>

            <TabsContent value="variants" className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">Biến thể sản phẩm</div>
                  <div className="text-xs text-muted-foreground">Quản lý SKU, giá bán, tồn kho.</div>
                </div>
                <Button
                  type="button"
                  onClick={() => {
                    if (!productId) {
                      setHint("Hãy lưu sản phẩm trước, sau đó mới tạo biến thể theo sản phẩm.");
                      setTab("info");
                      return;
                    }
                    setVariantEditing(null);
                    setVariantModalOpen(true);
                  }}
                  disabled={!productId}
                >
                  ＋ Thêm biến thể
                </Button>
              </div>

              <div className="rounded-2xl border border-border bg-card">
                <div className="grid grid-cols-7 gap-3 px-4 py-3 text-xs text-muted-foreground">
                  <div className="col-span-2">SKU</div>
                  <div>Giá</div>
                  <div className="text-center">Tồn kho</div>
                  <div className="text-center">Trạng thái</div>
                  <div className="text-right">Hành động</div>
                </div>
                <div className="divide-y divide-border">
                  {loadingVariants ? (
                    <div className="px-4 py-5 text-sm text-muted-foreground">Đang tải…</div>
                  ) : variantList.length === 0 ? (
                    <div className="px-4 py-5 text-sm text-muted-foreground">Chưa có biến thể.</div>
                  ) : (
                    variantList.map((v) => {
                      const vid = pickVariantId(v);
                      return (
                        <div key={String(vid)} className="grid grid-cols-7 items-center gap-3 px-4 py-3">
                          <div className="col-span-2 min-w-0">
                            <div className="truncate text-sm font-medium">{v?.sku ?? "-"}</div>
                            <div className="truncate text-xs text-muted-foreground">#{vid}</div>
                          </div>
                          <div className="text-sm">{v?.giaban ?? "-"}</div>
                          <div className="text-center text-sm">{v?.tonkho ?? 0}</div>
                          <div className="flex justify-center">
                            <span className="rounded-full bg-indigo-500/25 px-4 py-1 text-xs ring-1 ring-indigo-400/30">
                              {v?.trangthai ? "Active" : "Inactive"}
                            </span>
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="border-white/15 bg-card text-foreground hover:bg-muted/50"
                              onClick={() => {
                                setVariantEditing(v);
                                setVariantModalOpen(true);
                              }}
                            >
                              Sửa
                            </Button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="border-white/15 bg-card text-foreground hover:bg-muted/50"
                  onClick={handleReloadProduct}
                >
                  Làm mới sản phẩm
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="border-white/15 bg-card text-foreground hover:bg-muted/50"
                  onClick={() => loadVariants(productId)}
                >
                  Làm mới biến thể
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <VariantUpsertDialog
        open={variantModalOpen}
        onOpenChange={setVariantModalOpen}
        sanphamid={productId}
        initial={variantEditing}
        onSaved={() => loadVariants(productId)}
      />

      <ConfirmDialog
        open={disableConfirm}
        onOpenChange={setDisableConfirm}
        title="Tắt sản phẩm?"
        description="Sản phẩm sẽ được chuyển sang trạng thái ‘Không hoạt động’."
        confirmLabel="Tắt"
        destructive
        loading={disableLoading}
        onConfirm={handleDisableProduct}
      />
    </>
  );
}
