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

function normalizeReviewList(data) {
  const r = data?.reviews ?? data?.data?.reviews ?? data;
  const list = Array.isArray(r) ? r : Array.isArray(r?.items) ? r.items : [];
  const count = Number(r?.count ?? data?.count ?? list.length ?? 0);
  const avg = Number(r?.avgRating ?? r?.avg ?? data?.avgRating ?? data?.avg ?? 0);
  return { list, count, avg };
}

function pickReviewId(r) {
  return r?.danhgiaid ?? r?.id ?? r?._id ?? null;
}

function pickUserName(r) {
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

function pickCreatedAt(r) {
  return r?.ngaytao || r?.createdAt || r?.created_at || null;
}

function fmtDate(ts) {
  if (!ts) return "";
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("vi-VN", { year: "numeric", month: "2-digit", day: "2-digit" });
}

function Stars({ value = 0 }) {
  const n = Math.max(0, Math.min(5, Number(value) || 0));
  return (
    <div className="flex items-center gap-1" aria-label={`${n} sao`}>
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i < n;
        return (
          <Star
            key={i}
            className={
              "h-4 w-4 " +
              (filled ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground")
            }
          />
        );
      })}
    </div>
  );
}

function StarPicker({ value, onChange }) {
  const n = Math.max(1, Math.min(5, Number(value) || 5));
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => {
        const v = i + 1;
        const filled = v <= n;
        return (
          <button
            key={v}
            type="button"
            onClick={() => onChange?.(v)}
            className="p-1"
            aria-label={`${v} sao`}
          >
            <Star
              className={
                "h-5 w-5 " +
                (filled ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground")
              }
            />
          </button>
        );
      })}
    </div>
  );
}

export default function ReviewSection({ bentheid }) {
  const { openAuth } = usePopups();

  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const [reviews, setReviews] = useState([]);
  const [count, setCount] = useState(0);
  const [avg, setAvg] = useState(0);

  const [myReview, setMyReview] = useState(null);
  const myReviewId = pickReviewId(myReview);

  // form state
  const [sosao, setSoSao] = useState(5);
  const [tieude, setTieuDe] = useState("");
  const [noidung, setNoiDung] = useState("");

  const isAuthed = !!getAccessToken();

  const canInteract = isAuthed && bentheid != null;

  async function loadReviews() {
    if (!bentheid) {
      setReviews([]);
      setCount(0);
      setAvg(0);
      return;
    }
    setLoading(true);
    setErr("");
    try {
      const data = await apiFetch(
        `/api/reviews/variant/${encodeURIComponent(bentheid)}?limit=20&offset=0`,
        { method: "GET", auth: false }
      );
      const n = normalizeReviewList(data);
      setReviews(n.list);
      setCount(n.count);
      setAvg(n.avg);
    } catch (e) {
      setErr(e?.message || "Không thể tải đánh giá.");
    } finally {
      setLoading(false);
    }
  }

  async function loadMyReview() {
    if (!isAuthed || !bentheid) {
      setMyReview(null);
      return;
    }
    try {
      const data = await apiFetch(`/api/reviews/my?limit=100&offset=0`, {
        method: "GET",
      });
      const list = Array.isArray(data?.reviews)
        ? data.reviews
        : Array.isArray(data)
        ? data
        : Array.isArray(data?.items)
        ? data.items
        : [];
      const found =
        list.find((r) => String(r?.bentheid) === String(bentheid)) || null;
      setMyReview(found);
      if (found) {
        setSoSao(Number(found?.sosao ?? found?.rating ?? 5) || 5);
        setTieuDe(found?.tieude ?? found?.title ?? "");
        setNoiDung(found?.noidung ?? found?.content ?? "");
      } else {
        setSoSao(5);
        setTieuDe("");
        setNoiDung("");
      }
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    loadReviews();
    loadMyReview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bentheid]);

  const canSubmit = useMemo(() => {
    return (
      canInteract &&
      Number(sosao) >= 1 &&
      Number(sosao) <= 5 &&
      String(tieude).trim().length > 0 &&
      String(noidung).trim().length > 0
    );
  }, [canInteract, sosao, tieude, noidung]);

  async function submit() {
    if (!bentheid) return;
    if (!isAuthed) {
      openAuth("login");
      return;
    }
    if (!canSubmit) {
      setErr("Vui lòng nhập đủ tiêu đề và nội dung.");
      return;
    }

    setBusy(true);
    setErr("");
    try {
      if (myReviewId) {
        await apiFetch(`/api/reviews/${encodeURIComponent(myReviewId)}`, {
          method: "PUT",
          body: { sosao: Number(sosao), tieude: tieude.trim(), noidung: noidung.trim() },
        });
      } else {
        await apiFetch(`/api/reviews`, {
          method: "POST",
          body: {
            bentheid: Number(bentheid),
            sosao: Number(sosao),
            tieude: tieude.trim(),
            noidung: noidung.trim(),
          },
        });
      }
      await Promise.all([loadReviews(), loadMyReview()]);
    } catch (e) {
      setErr(e?.message || "Không thể gửi đánh giá.");
    } finally {
      setBusy(false);
    }
  }

  async function removeMine() {
    if (!myReviewId) return;
    if (!confirm("Xoá đánh giá của bạn?")) return;
    setBusy(true);
    setErr("");
    try {
      await apiFetch(`/api/reviews/${encodeURIComponent(myReviewId)}`, {
        method: "DELETE",
      });
      await Promise.all([loadReviews(), loadMyReview()]);
    } catch (e) {
      setErr(e?.message || "Không thể xoá đánh giá.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="text-foreground">Đánh giá</CardTitle>
            <div className="mt-1 text-sm text-muted-foreground">
              {bentheid ? (
                <>
                  Bentheid: <span className="text-foreground">{bentheid}</span>
                </>
              ) : (
                "Chọn biến thể để xem đánh giá"
              )}
            </div>
          </div>

          <div className="text-right">
            <div className="flex items-center justify-end gap-2">
              <Stars value={Math.round(avg)} />
              <div className="text-sm font-semibold text-foreground">
                {count}
              </div>
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              Trung bình: {Number.isFinite(avg) ? avg.toFixed(2) : "0.00"}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {err ? (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {err}
          </div>
        ) : null}

        {/* My review form */}
        <div className="rounded-2xl border border-border bg-muted/30 dark:bg-muted/30 dark:bg-slate-950/30 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm font-semibold text-foreground">
              {myReviewId ? "Đánh giá của bạn" : "Viết đánh giá"}
            </div>
            {!isAuthed ? (
              <Button size="sm" onClick={() => openAuth("login")}>
                Đăng nhập
              </Button>
            ) : myReviewId ? (
              <Button
                size="sm"
                variant="destructive"
                className="bg-red-600 hover:bg-red-500"
                onClick={removeMine}
                disabled={busy}
              >
                Xoá
              </Button>
            ) : null}
          </div>

          <div className="mt-3">
            <StarPicker value={sosao} onChange={setSoSao} />
          </div>

          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground">Tiêu đề</div>
              <Input value={tieude} onChange={(e) => setTieuDe(e.target.value)} placeholder="Ví dụ: Rất đáng tiền" />
            </div>
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground">Số sao</div>
              <Input type="number" min={1} max={5} value={sosao} onChange={(e) => setSoSao(Number(e.target.value))} />
            </div>
            <div className="md:col-span-2 space-y-2">
              <div className="text-xs text-muted-foreground">Nội dung</div>
              <Textarea value={noidung} onChange={(e) => setNoiDung(e.target.value)} rows={3} placeholder="Chia sẻ trải nghiệm của bạn..." />
            </div>
          </div>

          <div className="mt-3 flex justify-end">
            <Button onClick={submit} disabled={!canSubmit || busy}>
              {busy ? "..." : myReviewId ? "Cập nhật" : "Gửi đánh giá"}
            </Button>
          </div>
        </div>

        <Separator className="my-4 bg-muted/50" />

        {/* List */}
        {loading ? (
          <div className="text-sm text-muted-foreground">Đang tải đánh giá...</div>
        ) : reviews.length === 0 ? (
          <div className="text-sm text-muted-foreground">Chưa có đánh giá nào.</div>
        ) : (
          <div className="space-y-3">
            {reviews.map((r, idx) => {
              const rid = pickReviewId(r) ?? idx;
              const rating = Number(r?.sosao ?? r?.rating ?? 0) || 0;
              const title = r?.tieude ?? r?.title ?? "";
              const content = r?.noidung ?? r?.content ?? "";
              return (
                <div
                  key={String(rid)}
                  className="rounded-2xl border border-border bg-muted/30 dark:bg-muted/30 dark:bg-slate-950/30 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-foreground">
                        {pickUserName(r)}
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {fmtDate(pickCreatedAt(r))}
                      </div>
                    </div>
                    <Stars value={rating} />
                  </div>

                  {title ? (
                    <div className="mt-3 text-sm font-semibold text-foreground">
                      {title}
                    </div>
                  ) : null}
                  {content ? (
                    <div className="mt-1 text-sm text-muted-foreground whitespace-pre-line">
                      {content}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
