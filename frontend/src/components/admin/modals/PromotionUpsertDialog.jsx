"use client";

import { useEffect, useMemo, useState } from "react";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  adminAttachPromotionProduct,
  adminCreatePromotion,
  adminDetachPromotionProduct,
  adminListProducts,
  adminUpdatePromotion,
  formatApiError,
  publicGetPromotionDetail,
} from "@/lib/adminApi";
import ConfirmDialog from "@/components/admin/modals/ConfirmDialog";

function pickId(p) {
  return p?.khuyenmaiid ?? p?.id ?? null;
}

export default function PromotionUpsertDialog({ open, onOpenChange, initial, onSaved }) {
  const id = useMemo(() => pickId(initial), [initial]);
  const isEdit = id != null;

  const [tenkhuyenmai, setTen] = useState("");
  const [mota, setMota] = useState("");
  const [loaigiamgia, setLoai] = useState("PERCENT");
  const [tylegiam, setTyle] = useState("10");
  const [giatrigiamcodinh, setFixed] = useState("");
  const [thoigianbatdau, setStart] = useState("");
  const [thoigianketthuc, setEnd] = useState("");
  const [trangthai, setTrangthai] = useState(true);
  const [cothecongdon, setCongdon] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [hint, setHint] = useState("");

  // attach products
  const [q, setQ] = useState("");
  const [productResults, setProductResults] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // current attached products (public endpoint only returns active promotions)
  const [attached, setAttached] = useState([]);
  const [loadingAttached, setLoadingAttached] = useState(false);

  const [disableConfirm, setDisableConfirm] = useState(false);
  const [disableLoading, setDisableLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setError("");
    setHint("");
    setSaving(false);
    setQ("");
    setProductResults([]);
    setAttached([]);

    setTen(initial?.tenkhuyenmai ?? "");
    setMota(initial?.mota ?? "");
    setLoai(String(initial?.loaigiamgia || "PERCENT").toUpperCase());
    setTyle(initial?.tylegiam != null ? String(initial.tylegiam) : "10");
    setFixed(initial?.giatrigiamcodinh != null ? String(initial.giatrigiamcodinh) : "");
    setStart(initial?.thoigianbatdau ? String(initial.thoigianbatdau).slice(0, 10) : "");
    setEnd(initial?.thoigianketthuc ? String(initial.thoigianketthuc).slice(0, 10) : "");
    setTrangthai(initial?.trangthai ?? true);
    setCongdon(initial?.cothecongdon ?? false);
  }, [open, initial]);

  useEffect(() => {
    if (!open) return;
    if (!id) return;
    let mounted = true;
    (async () => {
      setLoadingAttached(true);
      try {
        const promo = await publicGetPromotionDetail(id);
        if (!mounted) return;
        setAttached(Array.isArray(promo?.products) ? promo.products : []);
      } catch {
        if (!mounted) return;
        setAttached([]);
      } finally {
        if (mounted) setLoadingAttached(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [open, id]);

  const canSave = tenkhuyenmai.trim().length > 0;

  async function handleSave() {
    if (!canSave || saving) return;
    setSaving(true);
    setError("");
    setHint("");
    try {
      const body = {
        tenkhuyenmai: tenkhuyenmai.trim(),
        mota: mota.trim() || undefined,
        loaigiamgia,
        tylegiam: loaigiamgia === "PERCENT" ? Number(tylegiam || 0) : undefined,
        giatrigiamcodinh: loaigiamgia === "FIXED" ? Number(giatrigiamcodinh || 0) : undefined,
        thoigianbatdau: thoigianbatdau || undefined,
        thoigianketthuc: thoigianketthuc || undefined,
        trangthai: !!trangthai,
        cothecongdon: !!cothecongdon,
      };

      const res = isEdit ? await adminUpdatePromotion(id, body) : await adminCreatePromotion(body);
      onSaved?.(res);
      if (!isEdit) {
        setHint("Đã tạo khuyến mãi. Bạn có thể gắn sản phẩm ngay bên dưới.");
      } else {
        setHint("Đã cập nhật khuyến mãi.");
      }
    } catch (e) {
      setError(formatApiError(e));
    } finally {
      setSaving(false);
    }
  }

  async function handleSearchProducts() {
    if (!q.trim()) return;
    setLoadingProducts(true);
    try {
      const { products } = await adminListProducts({ all: true, page: 1, limit: 50, q: q.trim() });
      setProductResults(Array.isArray(products) ? products : []);
    } catch {
      setProductResults([]);
    } finally {
      setLoadingProducts(false);
    }
  }

  async function handleAttach(p) {
    if (!id) return;
    const pid = p?.sanphamid ?? p?.id;
    if (pid == null) return;
    setHint("");
    setError("");
    try {
      await adminAttachPromotionProduct(id, pid);
      setHint("Đã gắn sản phẩm vào khuyến mãi.");
      // refresh attached (may fail if promo not active)
      try {
        const promo = await publicGetPromotionDetail(id);
        setAttached(Array.isArray(promo?.products) ? promo.products : attached);
      } catch {
        // ignore
      }
    } catch (e) {
      setError(formatApiError(e));
    }
  }

  async function handleDetach(pid) {
    if (!id) return;
    setHint("");
    setError("");
    try {
      await adminDetachPromotionProduct(id, pid);
      setHint("Đã gỡ sản phẩm khỏi khuyến mãi.");
      setAttached((s) => (Array.isArray(s) ? s.filter((x) => (x?.sanphamid ?? x?.id) !== pid) : s));
    } catch (e) {
      setError(formatApiError(e));
    }
  }

  async function handleDisable() {
    if (!id || disableLoading) return;
    setDisableLoading(true);
    try {
      const res = await adminUpdatePromotion(id, { trangthai: false });
      onSaved?.(res);
      setTrangthai(false);
      setDisableConfirm(false);
      setHint("Đã tắt khuyến mãi.");
    } catch (e) {
      setError(formatApiError(e));
    } finally {
      setDisableLoading(false);
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl border-border bg-background dark:bg-[#0b1020] text-foreground">
          <DialogHeader>
            <DialogTitle>{isEdit ? "Cập nhật khuyến mãi" : "Tạo khuyến mãi"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
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
                <Label>Tên khuyến mãi</Label>
                <Input value={tenkhuyenmai} onChange={(e) => setTen(e.target.value)} placeholder="VD: Sale 12.12" />
              </div>
              <div className="grid gap-2">
                <Label>Loại giảm giá</Label>
                <Select value={loaigiamgia} onValueChange={setLoai}>
                  <SelectTrigger className="w-full border-white/15 bg-card">
                    <SelectValue placeholder="Chọn loại" />
                  </SelectTrigger>
                  <SelectContent className="border-border bg-background dark:bg-[#0b1020] text-foreground">
                    <SelectItem value="PERCENT">PERCENT (%)</SelectItem>
                    <SelectItem value="FIXED">FIXED (VND)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {loaigiamgia === "PERCENT" ? (
                <div className="grid gap-2">
                  <Label>Tỷ lệ giảm (%)</Label>
                  <Input value={tylegiam} onChange={(e) => setTyle(e.target.value)} inputMode="numeric" placeholder="10" />
                </div>
              ) : (
                <div className="grid gap-2">
                  <Label>Giá trị giảm cố định (VND)</Label>
                  <Input value={giatrigiamcodinh} onChange={(e) => setFixed(e.target.value)} inputMode="numeric" placeholder="50000" />
                </div>
              )}

              <div className="grid gap-2">
                <Label>Mô tả</Label>
                <Textarea value={mota} onChange={(e) => setMota(e.target.value)} placeholder="(tùy chọn)" />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label>Bắt đầu</Label>
                <Input type="date" value={thoigianbatdau} onChange={(e) => setStart(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label>Kết thúc</Label>
                <Input type="date" value={thoigianketthuc} onChange={(e) => setEnd(e.target.value)} />
              </div>
            </div>

            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2 text-sm text-foreground">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-border"
                  checked={!!trangthai}
                  onChange={(e) => setTrangthai(e.target.checked)}
                />
                Active
              </label>
              <label className="flex items-center gap-2 text-sm text-foreground">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-border"
                  checked={!!cothecongdon}
                  onChange={(e) => setCongdon(e.target.checked)}
                />
                Có thể cộng dồn
              </label>
            </div>

            {/* Attached products (best-effort) */}
            {id ? (
              <div className="rounded-2xl border border-border bg-card p-4">
                <div className="text-sm font-medium">Sản phẩm đang áp dụng (best-effort)</div>
                <div className="text-xs text-muted-foreground">
                  Mục này đọc từ endpoint public /api/promotions/:id nên chỉ chắc chắn hiển thị khi khuyến mãi đang active.
                </div>

                <div className="mt-3 space-y-2">
                  {loadingAttached ? (
                    <div className="text-sm text-muted-foreground">Đang tải…</div>
                  ) : attached.length === 0 ? (
                    <div className="text-sm text-muted-foreground">Chưa có dữ liệu sản phẩm áp dụng.</div>
                  ) : (
                    attached.map((p) => {
                      const pid = p?.sanphamid ?? p?.id;
                      return (
                        <div key={String(pid)} className="flex items-center justify-between rounded-xl bg-card px-3 py-2 ring-1 ring-border">
                          <div className="min-w-0">
                            <div className="truncate text-sm">{p?.ten ?? "-"}</div>
                            <div className="truncate text-xs text-muted-foreground">#{pid}</div>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="border-rose-400/20 bg-rose-500/10 text-rose-100 hover:bg-rose-500/20"
                            onClick={() => handleDetach(pid)}
                          >
                            Gỡ
                          </Button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            ) : null}

            {/* Attach products */}
            {id ? (
              <div className="rounded-2xl border border-border bg-card p-4">
                <div className="text-sm font-medium">Gắn sản phẩm vào khuyến mãi</div>
                <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
                  <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm sản phẩm theo tên/slug..." />
                  <Button type="button" onClick={handleSearchProducts} disabled={loadingProducts}>
                    {loadingProducts ? "Đang tìm…" : "Tìm"}
                  </Button>
                </div>

                <div className="mt-3 space-y-2">
                  {productResults.length === 0 ? (
                    <div className="text-sm text-muted-foreground">Nhập từ khóa và bấm ‘Tìm’.</div>
                  ) : (
                    productResults.map((p) => {
                      const pid = p?.sanphamid ?? p?.id;
                      return (
                        <div key={String(pid)} className="flex items-center justify-between rounded-xl bg-card px-3 py-2 ring-1 ring-border">
                          <div className="min-w-0">
                            <div className="truncate text-sm">{p?.ten ?? "-"}</div>
                            <div className="truncate text-xs text-muted-foreground">#{pid}</div>
                          </div>
                          <Button type="button" size="sm" onClick={() => handleAttach(p)}>
                            Gắn
                          </Button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            ) : null}
          </div>

          <DialogFooter>
            {id ? (
              <Button
                type="button"
                variant="outline"
                className="border-rose-400/20 bg-rose-500/10 text-rose-100 hover:bg-rose-500/20"
                onClick={() => setDisableConfirm(true)}
                disabled={saving}
              >
                Tắt khuyến mãi
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
            <Button type="button" onClick={handleSave} disabled={!canSave || saving}>
              {saving ? "Đang lưu…" : "Lưu"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={disableConfirm}
        onOpenChange={setDisableConfirm}
        title="Tắt khuyến mãi?"
        description="Khuyến mãi sẽ được chuyển sang trạng thái Inactive."
        confirmLabel="Tắt"
        destructive
        loading={disableLoading}
        onConfirm={handleDisable}
      />
    </>
  );
}
