"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";

import {
  adminListOrders,
  formatApiError,
  formatMoneyVND,
} from "@/lib/adminApi";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const STATUSES = [
  { value: "ALL", label: "Tất cả" },
  { value: "PENDING", label: "PENDING" },
  { value: "PAID", label: "PAID" },
  { value: "SHIPPED", label: "SHIPPED" },
  { value: "COMPLETED", label: "COMPLETED" },
  { value: "CANCELLED", label: "CANCELLED" },
];

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

function formatDateTime(v) {
  if (!v) return "-";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return String(v);
  return d.toLocaleString("vi-VN");
}

export default function AdminOrdersPage() {
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [status, setStatus] = useState("ALL");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rows, setRows] = useState([]);

  const canPrev = page > 1;
  const canNext = rows.length === limit; // heuristic

  async function load() {
    setLoading(true);
    setError("");
    try {
      const { orders } = await adminListOrders({
        page,
        limit,
        status: status === "ALL" ? undefined : status,
      });
      setRows(Array.isArray(orders) ? orders : []);
    } catch (e) {
      setError(formatApiError(e));
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, status]);

  const title = useMemo(() => {
    const s = STATUSES.find((x) => x.value === status)?.label || "Tất cả";
    return `Đơn hàng (${s})`;
  }, [status]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-xl font-semibold">{title}</div>
          <div className="text-sm text-muted-foreground">
            Dữ liệu từ API <code className="px-1 py-0.5 rounded bg-muted">/api/orders/admin/all</code>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Select value={status} onValueChange={(v) => {
            setPage(1);
            setStatus(v);
          }}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Lọc trạng thái" />
            </SelectTrigger>
            <SelectContent>
              {STATUSES.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="secondary" onClick={load} disabled={loading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Tải lại
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Danh sách</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          <div className="grid grid-cols-12 gap-3 px-6 py-3 text-xs text-muted-foreground border-b">
            <div className="col-span-2">Mã đơn</div>
            <div className="col-span-2">User</div>
            <div className="col-span-3">Thời gian</div>
            <div className="col-span-2">Trạng thái</div>
            <div className="col-span-2 text-right">Tổng thanh toán</div>
            <div className="col-span-1 text-right">Chi tiết</div>
          </div>

          {loading ? (
            <div className="px-6 py-8 text-sm text-muted-foreground">Đang tải…</div>
          ) : error ? (
            <div className="px-6 py-8 text-sm text-destructive">{error}</div>
          ) : rows.length === 0 ? (
            <div className="px-6 py-8 text-sm text-muted-foreground">Chưa có đơn hàng.</div>
          ) : (
            <div className="divide-y">
              {rows.map((o) => (
                <div
                  key={String(o?.donhangid)}
                  className="grid grid-cols-12 items-center gap-3 px-6 py-4"
                >
                  <div className="col-span-2 font-medium">#{o?.donhangid}</div>
                  <div className="col-span-2 text-sm text-muted-foreground">{o?.userid ?? "-"}</div>
                  <div className="col-span-3 text-sm text-muted-foreground">{formatDateTime(o?.created_at)}</div>
                  <div className="col-span-2">
                    <Badge variant={statusBadgeVariant(o?.trangthai)}>{o?.trangthai || "-"}</Badge>
                  </div>
                  <div className="col-span-2 text-right text-sm">
                    {formatMoneyVND(o?.tongthanhtoan)}
                  </div>
                  <div className="col-span-1 text-right">
                    <Link
                      href={`/dashboard/orders/${encodeURIComponent(o?.donhangid)}`}
                      className="text-sm text-primary hover:underline"
                    >
                      Mở
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <Button
          variant="secondary"
          disabled={!canPrev || loading}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Trang trước
        </Button>

        <div className="text-sm text-muted-foreground">Trang {page}</div>

        <Button
          variant="secondary"
          disabled={!canNext || loading}
          onClick={() => setPage((p) => p + 1)}
        >
          Trang sau
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
