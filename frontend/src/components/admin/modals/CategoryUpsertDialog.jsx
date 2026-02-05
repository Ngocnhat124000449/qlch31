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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  adminAttachCategoryAttribute,
  adminCreateAttribute,
  adminCreateCategory,
  adminDetachCategoryAttribute,
  adminListAttributes,
  adminListCategoryAttributes,
  adminUpdateCategory,
  adminUpdateCategoryAttribute,
  formatApiError,
} from "@/lib/adminApi";

const ATTRIBUTE_TYPES = ["STRING", "TEXT", "INTEGER", "NUMBER", "BOOLEAN"];

function pickCategoryId(c) {
  return c?.danhmucid ?? c?.id ?? null;
}

function pickAttrId(a) {
  const id = a?.thuoctinhid ?? a?.id;
  return id == null ? null : Number(id);
}

function safeStr(v) {
  return v == null ? "" : String(v);
}

function flattenMappingRow(r) {
  const a = r?.attribute ?? r;
  return {
    thuoctinhid: pickAttrId(r),
    tenthuoctinh: a?.tenthuoctinh ?? a?.ten ?? a?.name ?? "",
    donvitinh: a?.donvitinh ?? null,
    kieudulieu: (a?.kieudulieu ?? "STRING").toUpperCase(),
    mota: a?.mota ?? null,
    batbuoc: !!r?.batbuoc,
    thutuhienthi: Number.isFinite(Number(r?.thutuhienthi)) ? Number(r.thutuhienthi) : 0,
  };
}

export default function CategoryUpsertDialog({ open, onOpenChange, initial, onSaved }) {
  const id = useMemo(() => pickCategoryId(initial), [initial]);
  const isEdit = id != null;

  const [ten, setTen] = useState("");
  const [tenviettat, setTenviettat] = useState("");
  const [trangthai, setTrangthai] = useState(true);

  const [loadingAttrs, setLoadingAttrs] = useState(false);
  const [attributes, setAttributes] = useState([]);
  const [selectedAttrs, setSelectedAttrs] = useState([]);
  const originalMapRef = useRef(new Map());

  const [pickExistingId, setPickExistingId] = useState("");

  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState("STRING");
  const [newUnit, setNewUnit] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newRequired, setNewRequired] = useState(false);
  const [creatingAttr, setCreatingAttr] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const availableExisting = useMemo(() => {
    const picked = new Set(selectedAttrs.map((x) => String(x.thuoctinhid)));
    return (attributes || []).filter((a) => !picked.has(String(pickAttrId(a))));
  }, [attributes, selectedAttrs]);

  const canSave =
    ten.trim().length > 0 && tenviettat.trim().length > 0 && selectedAttrs.length > 0;

  useEffect(() => {
    if (!open) return;
    setError("");
    setSaving(false);
    setTen(initial?.ten ?? "");
    setTenviettat(initial?.tenviettat ?? initial?.slug ?? "");
    setTrangthai(initial?.trangthai ?? true);
    setPickExistingId("");
    setNewName("");
    setNewType("STRING");
    setNewUnit("");
    setNewDesc("");
    setNewRequired(false);

    let cancelled = false;
    async function load() {
      setLoadingAttrs(true);
      try {
        const promises = [adminListAttributes()];
        if (isEdit) promises.push(adminListCategoryAttributes(id));
        const [aRes, mRes] = await Promise.all(promises);
        if (cancelled) return;

        const attrs = Array.isArray(aRes?.attributes) ? aRes.attributes : [];
        setAttributes(attrs);

        const mappings = Array.isArray(mRes?.mappings) ? mRes.mappings : [];
        const flattened = mappings.map(flattenMappingRow).filter((x) => x.thuoctinhid != null);
        flattened.sort((p, q) => (p.thutuhienthi ?? 0) - (q.thutuhienthi ?? 0));
        setSelectedAttrs(flattened);

        const om = new Map();
        for (const it of flattened) {
          om.set(String(it.thuoctinhid), {
            batbuoc: !!it.batbuoc,
            thutuhienthi: Number(it.thutuhienthi) || 0,
          });
        }
        originalMapRef.current = om;
      } catch (e) {
        if (!cancelled) setError(formatApiError(e));
      } finally {
        if (!cancelled) setLoadingAttrs(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isEdit, id]);

  function addExisting() {
    const tid = pickExistingId ? Number(pickExistingId) : null;
    if (!tid) return;
    const existed = selectedAttrs.some((x) => Number(x.thuoctinhid) === tid);
    if (existed) return;
    const found = (attributes || []).find((a) => Number(pickAttrId(a)) === tid);
    if (!found) return;

    const next = {
      thuoctinhid: tid,
      tenthuoctinh: found?.tenthuoctinh ?? "",
      donvitinh: found?.donvitinh ?? null,
      kieudulieu: (found?.kieudulieu ?? "STRING").toUpperCase(),
      mota: found?.mota ?? null,
      batbuoc: false,
      thutuhienthi: selectedAttrs.length,
    };
    setSelectedAttrs((prev) => [...prev, next]);
    setPickExistingId("");
  }

  async function createAndAddNewAttribute() {
    if (creatingAttr) return;
    const name = newName.trim();
    const type = String(newType || "").toUpperCase();
    if (!name || !ATTRIBUTE_TYPES.includes(type)) {
      setError("Vui lòng nhập tên thuộc tính và chọn kiểu dữ liệu hợp lệ.");
      return;
    }
    setCreatingAttr(true);
    setError("");
    try {
      const created = await adminCreateAttribute({
        tenthuoctinh: name,
        kieudulieu: type,
        donvitinh: newUnit.trim() ? newUnit.trim() : null,
        mota: newDesc.trim() ? newDesc.trim() : null,
      });
      const tid = pickAttrId(created);
      if (!tid) throw new Error("Tạo thuộc tính thất bại (thiếu thuoctinhid)");

      setAttributes((prev) => [created, ...(Array.isArray(prev) ? prev : [])]);
      setSelectedAttrs((prev) => {
        if (prev.some((x) => Number(x.thuoctinhid) === Number(tid))) return prev;
        return [
          ...prev,
          {
            thuoctinhid: Number(tid),
            tenthuoctinh: created?.tenthuoctinh ?? name,
            donvitinh: created?.donvitinh ?? null,
            kieudulieu: (created?.kieudulieu ?? type).toUpperCase(),
            mota: created?.mota ?? null,
            batbuoc: !!newRequired,
            thutuhienthi: prev.length,
          },
        ];
      });

      setNewName("");
      setNewType("STRING");
      setNewUnit("");
      setNewDesc("");
      setNewRequired(false);
    } catch (e) {
      setError(formatApiError(e));
    } finally {
      setCreatingAttr(false);
    }
  }

  function updateSelectedAttr(thuoctinhid, patch) {
    setSelectedAttrs((prev) =>
      (prev || []).map((x) =>
        Number(x.thuoctinhid) === Number(thuoctinhid) ? { ...x, ...patch } : x
      )
    );
  }

  function removeSelectedAttr(thuoctinhid) {
    setSelectedAttrs((prev) => (prev || []).filter((x) => Number(x.thuoctinhid) !== Number(thuoctinhid)));
  }

  async function syncCategoryAttributes(categoryId) {
    const desired = [...selectedAttrs]
      .filter((x) => x?.thuoctinhid != null)
      .map((x, idx) => ({
        thuoctinhid: Number(x.thuoctinhid),
        batbuoc: !!x.batbuoc,
        thutuhienthi: Number.isFinite(Number(x.thutuhienthi)) ? Number(x.thutuhienthi) : idx,
      }));
    desired.sort((a, b) => (a.thutuhienthi ?? 0) - (b.thutuhienthi ?? 0));

    const original = originalMapRef.current || new Map();
    const desiredIds = new Set(desired.map((x) => String(x.thuoctinhid)));

    // Detach removed
    const detachTasks = [];
    for (const [k] of original.entries()) {
      if (!desiredIds.has(k)) detachTasks.push(adminDetachCategoryAttribute(categoryId, k));
    }

    // Attach / update existing
    const upsertTasks = desired.map((x) => {
      const key = String(x.thuoctinhid);
      if (!original.has(key)) {
        return adminAttachCategoryAttribute(categoryId, x);
      }
      const old = original.get(key);
      const changed = !!old && (old.batbuoc !== x.batbuoc || Number(old.thutuhienthi) !== Number(x.thutuhienthi));
      if (!changed) return null;
      return adminUpdateCategoryAttribute(categoryId, x.thuoctinhid, {
        batbuoc: x.batbuoc,
        thutuhienthi: x.thutuhienthi,
      });
    });

    const tasks = [...detachTasks, ...upsertTasks.filter(Boolean)];
    if (tasks.length) await Promise.all(tasks);

    // refresh originalMapRef
    const nextMap = new Map();
    for (const x of desired) {
      nextMap.set(String(x.thuoctinhid), { batbuoc: x.batbuoc, thutuhienthi: x.thutuhienthi });
    }
    originalMapRef.current = nextMap;
  }

  async function handleSave() {
    if (!canSave || saving) return;
    setSaving(true);
    setError("");
    try {
      const payload = {
        ten: ten.trim(),
        tenviettat: tenviettat.trim(),
        trangthai: !!trangthai,
      };

      const res = isEdit ? await adminUpdateCategory(id, payload) : await adminCreateCategory(payload);
      const categoryId = pickCategoryId(res) ?? id;
      if (!categoryId) throw new Error("Không xác định được ID danh mục");

      await syncCategoryAttributes(categoryId);

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
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Cập nhật danh mục" : "Thêm danh mục"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {error ? (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100 whitespace-pre-line">
              {error}
            </div>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label>Tên danh mục</Label>
              <Input value={ten} onChange={(e) => setTen(e.target.value)} placeholder="VD: Laptop" />
            </div>

            <div className="grid gap-2">
              <Label>Slug / Tên viết tắt</Label>
              <Input
                value={tenviettat}
                onChange={(e) => setTenviettat(e.target.value)}
                placeholder="VD: laptop"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-border"
              checked={!!trangthai}
              onChange={(e) => setTrangthai(e.target.checked)}
            />
            Hoạt động
          </label>

          <div className="rounded-2xl border border-border bg-muted/20 p-4 space-y-4">
            <div className="space-y-1">
              <div className="text-sm font-semibold">Thuộc tính của danh mục</div>
              <div className="text-xs text-muted-foreground">
                Khi tạo/cập nhật danh mục, bạn cần chọn <b>ít nhất 1</b> thuộc tính (có thể chọn sẵn hoặc tạo mới).
              </div>
            </div>

            {loadingAttrs ? (
              <div className="text-sm text-muted-foreground">Đang tải thuộc tính…</div>
            ) : null}

            {selectedAttrs.length === 0 ? (
              <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                Chưa chọn thuộc tính nào.
              </div>
            ) : (
              <div className="space-y-2">
                {selectedAttrs
                  .slice()
                  .sort((a, b) => (Number(a.thutuhienthi) || 0) - (Number(b.thutuhienthi) || 0))
                  .map((it) => (
                    <div
                      key={String(it.thuoctinhid)}
                      className="flex flex-col gap-3 rounded-xl border border-border bg-background/40 p-3 md:flex-row md:items-center"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium">{it.tenthuoctinh}</div>
                        <div className="text-xs text-muted-foreground">
                          {safeStr(it.kieudulieu)}
                          {it.donvitinh ? ` • ${it.donvitinh}` : ""}
                        </div>
                      </div>

                      <label className="flex items-center gap-2 text-xs text-muted-foreground">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-border"
                          checked={!!it.batbuoc}
                          onChange={(e) =>
                            updateSelectedAttr(it.thuoctinhid, { batbuoc: e.target.checked })
                          }
                        />
                        Bắt buộc
                      </label>

                      <div className="flex items-center gap-2">
                        <Label className="text-xs text-muted-foreground">Thứ tự</Label>
                        <Input
                          type="number"
                          className="h-9 w-24"
                          value={Number.isFinite(Number(it.thutuhienthi)) ? String(it.thutuhienthi) : "0"}
                          onChange={(e) =>
                            updateSelectedAttr(it.thuoctinhid, {
                              thutuhienthi: Number.isFinite(Number(e.target.value))
                                ? Number(e.target.value)
                                : 0,
                            })
                          }
                        />
                      </div>

                      <Button
                        type="button"
                        variant="outline"
                        className="border-border"
                        onClick={() => removeSelectedAttr(it.thuoctinhid)}
                      >
                        Xóa
                      </Button>
                    </div>
                  ))}
              </div>
            )}

            <div className="grid gap-3 md:grid-cols-3 md:items-end">
              <div className="grid gap-2 md:col-span-2">
                <Label>Chọn thuộc tính có sẵn</Label>
                <Select value={pickExistingId} onValueChange={setPickExistingId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={loadingAttrs ? "Đang tải…" : "Chọn thuộc tính"} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableExisting.length === 0 ? (
                      <SelectItem value="__empty" disabled>
                        Không còn thuộc tính để chọn
                      </SelectItem>
                    ) : (
                      availableExisting.map((a) => {
                        const tid = pickAttrId(a);
                        return (
                          <SelectItem key={String(tid)} value={String(tid)}>
                            {a?.tenthuoctinh ?? `#${tid}`}
                          </SelectItem>
                        );
                      })
                    )}
                  </SelectContent>
                </Select>
              </div>
              <Button
                type="button"
                onClick={addExisting}
                disabled={!pickExistingId || pickExistingId === "__empty"}
              >
                Thêm
              </Button>
            </div>

            <div className="h-px bg-border" />

            <div className="space-y-1">
              <div className="text-sm font-semibold">Thêm thuộc tính mới</div>
              <div className="text-xs text-muted-foreground">
                Tạo thuộc tính mới và gắn ngay vào danh mục.
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label>Tên thuộc tính</Label>
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="VD: RAM"
                />
              </div>

              <div className="grid gap-2">
                <Label>Kiểu dữ liệu</Label>
                <Select value={newType} onValueChange={setNewType}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn kiểu dữ liệu" />
                  </SelectTrigger>
                  <SelectContent>
                    {ATTRIBUTE_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Đơn vị tính (tuỳ chọn)</Label>
                <Input
                  value={newUnit}
                  onChange={(e) => setNewUnit(e.target.value)}
                  placeholder="VD: GB, inch, Hz..."
                />
              </div>

              <label className="flex items-center gap-2 text-sm text-muted-foreground md:mt-7">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-border"
                  checked={!!newRequired}
                  onChange={(e) => setNewRequired(e.target.checked)}
                />
                Bắt buộc
              </label>

              <div className="grid gap-2 md:col-span-2">
                <Label>Mô tả (tuỳ chọn)</Label>
                <Textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="VD: Dung lượng RAM của sản phẩm"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="button" onClick={createAndAddNewAttribute} disabled={creatingAttr}>
                {creatingAttr ? "Đang tạo…" : "Tạo & thêm"}
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            className="border-border"
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
