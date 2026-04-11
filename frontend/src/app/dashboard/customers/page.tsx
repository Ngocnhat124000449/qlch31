"use client";

import { useEffect, useMemo, useState } from "react";
import PageHeader from "@/components/admin/PageHeader";
import { adminListOrders, adminListUsers, formatMoneyVND, toNumber } from "@/lib/adminApi";

function pickUserName(u) {
  return (
    u?.hoten ||
    u?.hoTen ||
    u?.ten ||
    u?.name ||
    u?.username ||
    u?.email ||
    (u?.userid ? `User #${u.userid}` : "(Không rõ)")
  );
}

function pickRole(u) {
  return u?.role || u?.vaitro || u?.vaiTro || (u?.isAdmin ? "admin" : "user") || "-";
}

function pickOrderTotal(o) {
  return o?.tongthanhtoan ?? o?.tongThanhToan ?? o?.tongtien ?? o?.tongTien ?? o?.total ?? 0;
}

export default function CustomersPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(new Map());

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const [{ users: userList }, { orders }] = await Promise.all([
          adminListUsers({ limit: 100, offset: 0 }),
          adminListOrders({ page: 1, limit: 200 }),
        ]);

        const uList = Array.isArray(userList) ? userList : [];
        const oList = Array.isArray(orders) ? orders : [];

        const m = new Map();
        for (const o of oList) {
          const uid = o?.userid ?? o?.userId;
          if (uid == null) continue;
          const key = String(uid);
          if (!m.has(key)) m.set(key, { orders: 0, spend: 0, last: 0 });
          const st = m.get(key);
          st.orders += 1;
          st.spend += toNumber(pickOrderTotal(o));
          const t = new Date(o?.created_at || o?.createdAt || 0).getTime();
          if (Number.isFinite(t) && t > st.last) st.last = t;
        }

        if (!mounted) return;
        setUsers(uList);
        setStats(m);
      } catch (e) {
        if (!mounted) return;
        setError(e?.message || "Không thể tải khách hàng");
        setUsers([]);
        setStats(new Map());
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const enriched = useMemo(() => {
    return (users || []).map((u) => {
      const uid = String(u?.userid ?? u?.id ?? "");
      const st = stats.get(uid) || { orders: 0, spend: 0, last: 0 };
      return { ...u, __orders: st.orders, __spend: st.spend, __last: st.last };
    });
  }, [users, stats]);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Khách hàng"
        subtitle="Danh sách user lấy từ API /api/users/admin/users. Chi tiêu & số đơn tổng hợp từ 200 đơn gần nhất."
        actionLabel=""
        onAction={undefined}
      />

      <div className="rounded-2xl border border-border bg-card backdrop-blur-xl">
        <div className="grid grid-cols-7 gap-3 px-5 py-3 text-xs text-muted-foreground">
          <div className="col-span-2">Khách hàng</div>
          <div>Email</div>
          <div className="text-center">Vai trò</div>
          <div className="text-center">Số đơn</div>
          <div className="text-right">Đã chi</div>
          <div className="text-right">Lần mua gần nhất</div>
        </div>

        <div className="divide-y divide-border">
          {loading ? (
            <div className="px-5 py-6 text-sm text-muted-foreground">Đang tải…</div>
          ) : enriched.length === 0 ? (
            <div className="px-5 py-6 text-sm text-muted-foreground">{error || "Chưa có dữ liệu."}</div>
          ) : (
            enriched.map((u) => {
              const id = u?.userid ?? u?.id;
              return (
                <div key={String(id)} className="grid grid-cols-7 items-center gap-3 px-5 py-4">
                  <div className="col-span-2 min-w-0">
                    <div className="truncate text-sm font-medium">{pickUserName(u)}</div>
                    <div className="truncate text-xs text-muted-foreground">#{id}</div>
                  </div>
                  <div className="truncate text-sm text-muted-foreground">{u?.email ?? "-"}</div>
                  <div className="flex justify-center">
                    <span className="rounded-full bg-indigo-500/25 px-4 py-1 text-xs ring-1 ring-indigo-400/30">
                      {String(pickRole(u)).toLowerCase()}
                    </span>
                  </div>
                  <div className="text-center text-sm">{u.__orders ?? 0}</div>
                  <div className="text-right text-sm">{formatMoneyVND(u.__spend || 0)}</div>
                  <div className="text-right text-sm text-muted-foreground">
                    {u.__last ? new Date(u.__last).toLocaleDateString("vi-VN") : "-"}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
