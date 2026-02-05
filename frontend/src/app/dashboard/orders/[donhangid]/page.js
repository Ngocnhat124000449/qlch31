"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";

import {
  adminGetOrderDetail,
  adminUpdateOrderStatus,
  formatApiError,
  formatMoneyVND,
} from "@/lib/adminApi";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const STATUS_OPTIONS = ["PENDING", "PAID", "SHIPPED", "COMPLETED", "CANCELLED"];

function formatDateTime(v) {
  if (!v) return "-";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return String(v);
  return d.toLocaleString("vi-VN");
}

function statusBadgeVariant(status) {
  switch (String(status || "").toUpperCase()) {
    case "PENDING":
      return "secondary";
    case "PAID":
      return "default";
    case "SHIPPED":
      return "outline";
    case "COMPLETED":
      return "default";
    case "CANCELLED":
      return "destructive";
    default:
      return "secondary";
  }
}

export default function AdminOrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const donhangid = params?.donhangid;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState("PENDING");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const o = await adminGetOrderDetail(donhangid);
      setOrder(o);
      setStatus(String(o?.trangthai || "PENDING").toUpperCase());
    } catch (e) {
      setError(formatApiError(e));
      setOrder(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (donhangid == null) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [donhangid]);

  const canSave = useMemo(() => {
    if (!order) return false;
    const cur = String(order?.trangthai || "").toUpperCase();
    return STATUS_OPTIONS.includes(status) && status !== cur;
  }, [order, status]);

  async function save() {
    if (!donhangid || !canSave || saving) return;
    setSaving(true);
    setError("");
    try {
      const updated = await adminUpdateOrderStatus(donhangid, status);
      // backend trả {message, order}
      const next = updated?.order ?? updated;
      setOrder(next);
      setStatus(String(next?.trangthai || status).toUpperCase());
    } catch (e) {
      setError(formatApiError(e));
    } finally {
      setSaving(false);
    }
  }

  const items = Array.isArray(order?.items) ? order.items : [];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
          <div>
            <div className="text-xl font-semibold">Đơn hàng #{donhangid}</div>
            <div className="text-sm text-muted-foreground">
              Trạng thái hiện tại: {order ? (
                <Badge variant={statusBadgeVariant(order?.trangthai)}>{order?.trangthai}</Badge>
              ) : (
                <span>-</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={save} disabled={!canSave || saving || loading}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Đang lưu..." : "Cập nhật"}
          </Button>
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Sản phẩm</CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            <div className="grid grid-cols-12 gap-3 px-6 py-3 text-xs text-muted-foreground border-b">
              <div className="col-span-6">Sản phẩm</div>
              <div className="col-span-2">Biến thể</div>
              <div className="col-span-2 text-right">Đơn giá</div>
              <div className="col-span-2 text-right">Số lượng</div>
            </div>

            {loading ? (
              <div className="px-6 py-8 text-sm text-muted-foreground">Đang tải…</div>
            ) : items.length === 0 ? (
              <div className="px-6 py-8 text-sm text-muted-foreground">Không có dòng sản phẩm.</div>
            ) : (
              <div className="divide-y">
                {items.map((it) => (
                  <div key={String(it?.bentheid)} className="grid grid-cols-12 items-center gap-3 px-6 py-4">
                    <div className="col-span-6 min-w-0">
                      <div className="truncate font-medium">
                        {it?.sanpham?.ten || "Sản phẩm"}
                      </div>
                      {it?.sanpham?.sanphamid != null ? (
                        <div className="text-xs text-muted-foreground">SP#{it.sanpham.sanphamid}</div>
                      ) : null}
                    </div>
                    <div className="col-span-2 text-sm text-muted-foreground">
                      {it?.sku || `#${it?.bentheid}`}
                    </div>
                    <div className="col-span-2 text-right text-sm">
                      {formatMoneyVND(it?.dongia)}
                    </div>
                    <div className="col-span-2 text-right text-sm">{it?.soluong}</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tóm tắt</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Row label="User" value={order?.userid != null ? String(order.userid) : "-"} />
            <Row label="Thanh toán" value={order?.phuongthucid != null ? String(order.phuongthucid) : "-"} />
            <Row label="Địa chỉ" value={order?.diachiuserid != null ? String(order.diachiuserid) : "-"} />
            <Row label="Tạo lúc" value={formatDateTime(order?.created_at)} />

            <div className="h-px bg-border my-2" />

            <Row label="Tổng tiền" value={formatMoneyVND(order?.tongtien)} />
            <Row label="Phí vận chuyển" value={formatMoneyVND(order?.phivanchuyen)} />
            <Row label="Tổng thanh toán" value={formatMoneyVND(order?.tongthanhtoan)} strong />

            {order?.ghichu ? (
              <div className="pt-2">
                <div className="text-sm font-medium">Ghi chú</div>
                <div className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">{String(order.ghichu)}</div>
              </div>
            ) : null}

            <div className="pt-2 text-xs text-muted-foreground">
              Lưu ý: Dashboard không hỗ trợ xóa đơn để đảm bảo lịch sử.
            </div>

            <div className="pt-2">
              <Link href="/dashboard/orders" className="text-sm text-primary hover:underline">
                ← Về danh sách đơn hàng
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Row({ label, value, strong }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className={strong ? "text-sm font-semibold" : "text-sm"}>{value}</div>
    </div>
  );
}
