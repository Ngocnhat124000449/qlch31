"use client";

import { useEffect, useMemo, useState } from "react";
import { Star } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

import { apiFetch } from "@/lib/apiClient";
import { getAccessToken } from "@/lib/tokens";
import { usePopups } from "@/components/popups/PopupProvider";

function normalizeReviewList(data: any) {
  const r = data?.reviews ?? data?.data?.reviews ?? data;
  const list = Array.isArray(r) ? r : Array.isArray(r?.items) ? r.items : [];
  const count = Number(r?.count ?? data?.count ?? list.length ?? 0);
  const avg = Number(
    r?.avgRating ?? r?.avg ?? data?.avgRating ?? data?.avg ?? 0,
  );
  return { list, count, avg };
}

function pickReviewId(r: any): any {
  return r?.danhgiaid ?? r?.id ?? r?._id ?? null;
}

function pickUserName(r: any): string {
  return (
    r?.nguoidung?.hoten ||
    r?.nguoidung?.ten ||
    r?.user?.hoten ||
    r?.user?.name ||
    r?.hoten ||
    r?.ten ||
    "Người dùng"
  );
}

function pickCreatedAt(r: any): string | null {
  return r?.ngaytao || r?.createdAt || r?.created_at || null;
}

function fmtDate(ts: string | null): string {
  if (!ts) return "";
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

interface ReviewSectionProps {
  productId?: string | number;
}

export default function ReviewSection({
  productId,
}: ReviewSectionProps): JSX.Element {
  const { openAuth } = usePopups();

  const [reviews, setReviews] = useState<any[]>([]);
  const [count, setCount] = useState(0);
  const [avg, setAvg] = useState(0);
  const [busy, setBusy] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" });
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  // Load reviews
  useEffect(() => {
    let alive = true;
    async function run() {
      if (!productId) return;
      try {
        const data = await apiFetch(
          `/api/reviews/products/${encodeURIComponent(productId)}`,
          {
            method: "GET",
            auth: false,
          },
        );
        const { list, count: cnt, avg: a } = normalizeReviewList(data);
        if (!alive) return;
        setReviews(list);
        setCount(cnt);
        setAvg(a);
      } catch (e) {
        //
      }
    }
    run();
    return () => {
      alive = false;
    };
  }, [productId]);

  const onSubmit = async () => {
    const token = await getAccessToken();
    if (!token) {
      openAuth();
      return;
    }

    if (!newReview.comment.trim()) {
      setErr("Vui lòng nhập bình luận");
      return;
    }

    setBusy(true);
    setErr("");
    setMsg("");

    try {
      const res = await apiFetch("/api/reviews", {
        method: "POST",
        auth: true,
        body: {
          sanphamid: productId,
          sao: newReview.rating,
          noidung: newReview.comment,
        },
      });
      setMsg("Cảm ơn bạn đã đánh giá sản phẩm này!");
      setNewReview({ rating: 5, comment: "" });

      // Refetch
      try {
        const data = await apiFetch(
          `/api/reviews/products/${encodeURIComponent(productId)}`,
          {
            method: "GET",
            auth: false,
          },
        );
        const { list, count: cnt, avg: a } = normalizeReviewList(data);
        setReviews(list);
        setCount(cnt);
        setAvg(a);
      } catch {}
    } catch (e) {
      setErr(String(e));
    } finally {
      setBusy(false);
    }
  };

  const starArray = useMemo(() => {
    const full = Math.floor(avg);
    const hasHalf = avg - full >= 0.5;
    return [
      ...Array(full).fill("full"),
      ...(hasHalf ? ["half"] : []),
      ...Array(5 - full - (hasHalf ? 1 : 0)).fill("empty"),
    ];
  }, [avg]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Đánh giá sản phẩm</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Overall Rating */}
          <div className="flex items-end gap-4">
            <div>
              <p className="text-3xl font-bold">{avg.toFixed(1)}</p>
              <p className="text-sm text-gray-500">{count} đánh giá</p>
            </div>
            <div className="flex gap-1">
              {starArray.map((type, i) => (
                <Star
                  key={i}
                  size={20}
                  className={
                    type === "full"
                      ? "fill-yellow-400 text-yellow-400"
                      : type === "half"
                        ? "fill-yellow-200 text-yellow-400"
                        : "text-gray-300"
                  }
                />
              ))}
            </div>
          </div>

          <Separator />

          {/* Write Review */}
          <div>
            <h4 className="font-medium mb-3">Viết đánh giá của bạn</h4>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Đánh giá</label>
                <div className="flex gap-2 mt-2">
                  {[1, 2, 3, 4, 5].map((r) => (
                    <button
                      key={r}
                      onClick={() => setNewReview({ ...newReview, rating: r })}
                      className="text-2xl transition hover:scale-110"
                    >
                      <Star
                        size={24}
                        className={
                          r <= newReview.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Nhận xét</label>
                <Textarea
                  value={newReview.comment}
                  onChange={(e) =>
                    setNewReview({ ...newReview, comment: e.target.value })
                  }
                  placeholder="Chia sẻ kinh nghiệm của bạn với sản phẩm này..."
                  className="mt-2 resize-none"
                  rows={3}
                />
              </div>

              <Button onClick={onSubmit} disabled={busy} className="w-full">
                Gửi đánh giá
              </Button>

              {msg && <p className="text-green-600 text-sm">{msg}</p>}
              {err && <p className="text-red-600 text-sm">{err}</p>}
            </div>
          </div>

          <Separator />

          {/* Reviews List */}
          <div>
            <h4 className="font-medium mb-3">
              Tất cả đánh giá ({reviews.length})
            </h4>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {reviews.length === 0 ? (
                <p className="text-sm text-gray-500">Chưa có đánh giá nào.</p>
              ) : (
                reviews.map((r: any) => (
                  <Card key={pickReviewId(r)} className="p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-sm">{pickUserName(r)}</p>
                        <p className="text-xs text-gray-500">
                          {fmtDate(pickCreatedAt(r))}
                        </p>
                      </div>
                      <div className="flex gap-0.5">
                        {Array(5)
                          .fill(0)
                          .map((_, i) => (
                            <Star
                              key={i}
                              size={14}
                              className={
                                i < (r?.sao || r?.rating || 0)
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }
                            />
                          ))}
                      </div>
                    </div>
                    <p className="text-sm mt-2 text-gray-700">
                      {r?.noidung || r?.comment || ""}
                    </p>
                  </Card>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
