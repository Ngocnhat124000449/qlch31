"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import SiteHeader from "@/components/header/SiteHeader";
import Footer from "@/components/home/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { useMe } from "@/hooks/useMe";
import { usePopups } from "@/components/popups/PopupProvider";
import { apiFetch } from "@/lib/apiClient";
import { notifyAuthChanged } from "@/lib/tokens";

export const dynamic = "force-dynamic";

function normalizeAddressList(data) {
  const a = data?.addresses ?? data?.data?.addresses ?? data;
  return Array.isArray(a) ? a : Array.isArray(a?.items) ? a.items : [];
}

function pickUserEmail(me) {
  return me?.email || me?.taikhoan?.email || "";
}

function pickUserPhone(me) {
  return me?.sdt || me?.sodienthoai || me?.phone || "";
}

function pickUserName(me) {
  return me?.hoten || me?.ten || me?.name || "";
}

function pickAvatarUrl(me) {
  return me?.avatarurl || me?.avatarUrl || me?.avatar || "";
}

function normalizeLoaiDiachi(v) {
  const s = String(v || "").toLowerCase();
  if (s.includes("cong") || s.includes("công") || s.includes("office")) return "office";
  if (s.includes("khac") || s.includes("khác") || s.includes("other")) return "other";
  return "home";
}

function loaiDiachiToLabel(loai) {
  if (loai === "office") return "Công ty";
  if (loai === "other") return "Khác";
  return "Nhà";
}

function AddressDialog({ mode, initial, onSaved, children }) {
  const isEdit = mode === "edit";

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [tennguoinhan, setTenNguoiNhan] = useState("");
  const [sodienthoai, setSoDienThoai] = useState("");
  const [diachi, setDiaChi] = useState("");
  const [phuongxa, setPhuongXa] = useState("");
  const [quanhuyen, setQuanHuyen] = useState("");
  const [tinhthanh, setTinhThanh] = useState("");
  const [loai, setLoai] = useState("home");
  const [macdinh, setMacDinh] = useState(false);

  useEffect(() => {
    if (!open) return;
    setErr("");
    setTenNguoiNhan(initial?.tennguoinhan || "");
    setSoDienThoai(initial?.sdtnguoinhan || initial?.sodienthoai || "");
    setDiaChi(initial?.diachichitiet || initial?.diachi || "");
    setPhuongXa(initial?.phuongxa || "");
    setQuanHuyen(initial?.quanhuyen || "");
    setTinhThanh(initial?.tinhthanh || "");
    setLoai(normalizeLoaiDiachi(initial?.loaidiachi || initial?.loai));
    setMacDinh(!!initial?.macdinh);
  }, [open, initial]);

  async function save() {
    setErr("");
    const payload = {
      tennguoinhan: tennguoinhan.trim(),
      sdtnguoinhan: sodienthoai.trim(),
      diachichitiet: diachi.trim(),
      phuongxa: phuongxa.trim(),
      quanhuyen: quanhuyen.trim(),
      tinhthanh: tinhthanh.trim(),
      loaidiachi: loaiDiachiToLabel(loai),
      macdinh,
    };

    // basic validation
    if (!payload.tennguoinhan || !payload.sdtnguoinhan || !payload.diachichitiet) {
      setErr("Vui lòng nhập Tên người nhận, SĐT và Địa chỉ chi tiết.");
      return;
    }

    setLoading(true);
    try {
      if (isEdit) {
        const id = initial?.diachiuserid ?? initial?.id;
        await apiFetch(`/api/addresses/${encodeURIComponent(id)}`, {
          method: "PUT",
          body: payload,
        });
      } else {
        await apiFetch("/api/addresses", {
          method: "POST",
          body: payload,
        });
      }

      setOpen(false);
      onSaved?.();
    } catch (e) {
      setErr(e?.message || "Không thể lưu địa chỉ.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-[720px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Cập nhật địa chỉ" : "Thêm địa chỉ mới"}
          </DialogTitle>
        </DialogHeader>

        {err ? (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {err}
          </div>
        ) : null}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Tên người nhận</Label>
            <Input value={tennguoinhan} onChange={(e) => setTenNguoiNhan(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Số điện thoại</Label>
            <Input value={sodienthoai} onChange={(e) => setSoDienThoai(e.target.value)} />
          </div>

          <div className="md:col-span-2 space-y-2">
            <Label>Địa chỉ</Label>
            <Textarea value={diachi} onChange={(e) => setDiaChi(e.target.value)} rows={2} />
          </div>

          <div className="space-y-2">
            <Label>Phường/Xã</Label>
            <Input value={phuongxa} onChange={(e) => setPhuongXa(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Quận/Huyện</Label>
            <Input value={quanhuyen} onChange={(e) => setQuanHuyen(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Tỉnh/Thành</Label>
            <Input value={tinhthanh} onChange={(e) => setTinhThanh(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Loại</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={loai === "home" ? "default" : "secondary"}
                className={loai === "home" ? "" : "bg-muted/50 text-foreground hover:bg-muted border border-border"}
                onClick={() => setLoai("home")}
              >
                Home
              </Button>
              <Button
                type="button"
                variant={loai === "office" ? "default" : "secondary"}
                className={loai === "office" ? "" : "bg-muted/50 text-foreground hover:bg-muted border border-border"}
                onClick={() => setLoai("office")}
              >
                Office
              </Button>
              <Button
                type="button"
                variant={loai === "other" ? "default" : "secondary"}
                className={loai === "other" ? "" : "bg-muted/50 text-foreground hover:bg-muted border border-border"}
                onClick={() => setLoai("other")}
              >
                Other
              </Button>
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={macdinh}
                onChange={(e) => setMacDinh(e.target.checked)}
              />
              Đặt làm địa chỉ mặc định
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            className="bg-muted/50 text-foreground hover:bg-muted border border-border"
            onClick={() => setOpen(false)}
          >
            Huỷ
          </Button>
          <Button type="button" onClick={save} disabled={loading}>
            {loading ? "..." : "Lưu"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function MePage() {
  const { me, loading, refresh } = useMe();
  const { openAuth } = usePopups();

  const [savingProfile, setSavingProfile] = useState(false);
  const [profileErr, setProfileErr] = useState("");
  const [profileOk, setProfileOk] = useState("");

  const [hoten, setHoten] = useState("");
  const [email, setEmail] = useState("");
  const [sodienthoai, setSoDienThoai] = useState("");
  const [avatarurl, setAvatarUrl] = useState("");

  const [pwOld, setPwOld] = useState("");
  const [pwNew, setPwNew] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMsg, setPwMsg] = useState("");
  const [pwErr, setPwErr] = useState("");

  const [addresses, setAddresses] = useState([]);
  const [addrLoading, setAddrLoading] = useState(false);
  const [addrErr, setAddrErr] = useState("");

  const canLoad = !loading && !!me;

  useEffect(() => {
    if (!me) return;
    setHoten(pickUserName(me));
    setEmail(pickUserEmail(me));
    setSoDienThoai(pickUserPhone(me));
    setAvatarUrl(pickAvatarUrl(me));
  }, [me]);

  async function loadAddresses() {
    if (!me) return;
    setAddrErr("");
    setAddrLoading(true);
    try {
      const data = await apiFetch("/api/addresses", { method: "GET" });
      setAddresses(normalizeAddressList(data));
    } catch (e) {
      setAddrErr(e?.message || "Không thể tải địa chỉ.");
    } finally {
      setAddrLoading(false);
    }
  }

  useEffect(() => {
    if (canLoad) loadAddresses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canLoad]);

  const addressDefault = useMemo(
    () => addresses.find((a) => a?.macdinh) || null,
    [addresses]
  );

  async function saveProfile() {
    if (!me) return;
    setProfileErr("");
    setProfileOk("");

    const payload = {};
    const nextName = hoten.trim();
    const nextEmail = email.trim();
    const nextPhone = sodienthoai.trim();
    const nextAvatar = avatarurl.trim();

    if (nextName && nextName !== pickUserName(me)) payload.hoten = nextName;
    if (nextEmail && nextEmail !== pickUserEmail(me)) payload.email = nextEmail;
    if (nextPhone && nextPhone !== pickUserPhone(me)) payload.sdt = nextPhone;
    if (nextAvatar !== pickAvatarUrl(me)) payload.avatarurl = nextAvatar;

    if (Object.keys(payload).length === 0) {
      setProfileOk("Không có thay đổi để lưu.");
      return;
    }

    setSavingProfile(true);
    try {
      await apiFetch("/api/users/me", {
        method: "PUT",
        body: payload,
      });
      notifyAuthChanged();
      await refresh();
      setProfileOk("Đã cập nhật thông tin.");
    } catch (e) {
      setProfileErr(e?.message || "Không thể cập nhật thông tin.");
    } finally {
      setSavingProfile(false);
    }
  }

  async function changePassword() {
    setPwErr("");
    setPwMsg("");
    const oldPassword = pwOld;
    const newPassword = pwNew;
    if (!oldPassword || !newPassword) {
      setPwErr("Vui lòng nhập mật khẩu cũ và mật khẩu mới.");
      return;
    }
    setPwLoading(true);
    try {
      await apiFetch("/api/users/me/password", {
        method: "PUT",
        body: { oldPassword, newPassword },
      });
      setPwOld("");
      setPwNew("");
      setPwMsg("Đổi mật khẩu thành công.");
    } catch (e) {
      setPwErr(e?.message || "Không thể đổi mật khẩu.");
    } finally {
      setPwLoading(false);
    }
  }

  async function deleteAddress(addr) {
    const id = addr?.diachiuserid ?? addr?.id;
    if (id == null) return;
    if (!confirm("Xoá địa chỉ này?")) return;
    setAddrErr("");
    try {
      await apiFetch(`/api/addresses/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      await loadAddresses();
    } catch (e) {
      setAddrErr(e?.message || "Không thể xoá địa chỉ.");
    }
  }

  async function setDefault(addr) {
    const id = addr?.diachiuserid ?? addr?.id;
    if (id == null) return;
    setAddrErr("");
    try {
      await apiFetch(`/api/addresses/${encodeURIComponent(id)}`, {
        method: "PUT",
        body: { macdinh: true },
      });
      await loadAddresses();
    } catch (e) {
      setAddrErr(e?.message || "Không thể đặt mặc định.");
    }
  }

  return (
    <div className="min-h-screen bg-background dark:bg-gradient-to-b dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
      <SiteHeader />

      <main className="mx-auto max-w-6xl px-5 py-8">
        <div>
          <div className="text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">
              Trang chủ
            </Link>{" "}
            <span className="mx-2">/</span>
            <span className="text-foreground">My Account</span>
          </div>
          <h1 className="mt-2 text-2xl font-semibold text-foreground">
            Thông tin của tôi
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {loading ? "Đang tải..." : me ? "Quản lý tài khoản & địa chỉ" : "Bạn chưa đăng nhập"}
          </p>
        </div>

        {!me && !loading ? (
          <div className="mt-8 rounded-2xl border border-border bg-card p-6 text-foreground">
            <div className="text-lg font-semibold">Bạn chưa đăng nhập</div>
            <div className="mt-2 text-sm text-muted-foreground">
              Hãy đăng nhập để xem và cập nhật thông tin tài khoản.
            </div>
            <div className="mt-4">
              <Button onClick={() => openAuth("login")}>Mở đăng nhập</Button>
            </div>
          </div>
        ) : null}

        {me ? (
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">Thông tin tài khoản</CardTitle>
                </CardHeader>
                <CardContent>
                  {profileErr ? (
                    <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                      {profileErr}
                    </div>
                  ) : null}
                  {profileOk ? (
                    <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                      {profileOk}
                    </div>
                  ) : null}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Họ tên</Label>
                      <Input value={hoten} onChange={(e) => setHoten(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Số điện thoại</Label>
                      <Input value={sodienthoai} onChange={(e) => setSoDienThoai(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Avatar URL</Label>
                      <Input value={avatarurl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="https://..." />
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <Button onClick={saveProfile} disabled={savingProfile}>
                      {savingProfile ? "..." : "Lưu thay đổi"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">Đổi mật khẩu</CardTitle>
                </CardHeader>
                <CardContent>
                  {pwErr ? (
                    <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                      {pwErr}
                    </div>
                  ) : null}
                  {pwMsg ? (
                    <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                      {pwMsg}
                    </div>
                  ) : null}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Mật khẩu cũ</Label>
                      <Input type="password" value={pwOld} onChange={(e) => setPwOld(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Mật khẩu mới</Label>
                      <Input type="password" value={pwNew} onChange={(e) => setPwNew(e.target.value)} />
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Button onClick={changePassword} disabled={pwLoading}>
                      {pwLoading ? "..." : "Đổi mật khẩu"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <div className="flex items-center justify-between gap-3">
                    <CardTitle className="text-foreground">Địa chỉ</CardTitle>
                    <AddressDialog mode="create" initial={null} onSaved={loadAddresses}>
                      <Button size="sm">Thêm</Button>
                    </AddressDialog>
                  </div>
                </CardHeader>
                <CardContent>
                  {addrErr ? (
                    <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                      {addrErr}
                    </div>
                  ) : null}

                  {addrLoading ? (
                    <div className="text-sm text-muted-foreground">Đang tải địa chỉ...</div>
                  ) : addresses.length === 0 ? (
                    <div className="text-sm text-muted-foreground">Chưa có địa chỉ nào.</div>
                  ) : (
                    <div className="space-y-3">
                      {addresses.map((a) => {
                        const id = a?.diachiuserid ?? a?.id;
                        const isDefault = !!a?.macdinh;
                        const loaiLabel = a?.loaidiachi || a?.loai;
                        return (
                          <div
                            key={String(id)}
                            className="rounded-xl border border-border bg-muted/30 dark:bg-slate-950/30 p-3"
                          >
                            <div className="flex flex-wrap items-start justify-between gap-2">
                              <div className="min-w-0">
                                <div className="text-sm font-semibold text-foreground">
                                  {a?.tennguoinhan || "Người nhận"}
                                  {isDefault ? (
                                    <Badge className="ml-2 bg-emerald-500/20 text-emerald-200 border border-emerald-500/30">
                                      Mặc định
                                    </Badge>
                                  ) : null}
                                </div>
                                <div className="mt-1 text-xs text-muted-foreground">
                                  {a?.sdtnguoinhan || a?.sodienthoai || ""}
                                </div>
                              </div>

                              <div className="flex flex-wrap gap-2">
                                {!isDefault ? (
                                  <Button
                                    size="sm"
                                    variant="secondary"
                                    className="bg-muted/50 text-foreground hover:bg-muted border border-border"
                                    onClick={() => setDefault(a)}
                                  >
                                    Đặt mặc định
                                  </Button>
                                ) : null}

                                <AddressDialog mode="edit" initial={a} onSaved={loadAddresses}>
                                  <Button
                                    size="sm"
                                    variant="secondary"
                                    className="bg-muted/50 text-foreground hover:bg-muted border border-border"
                                  >
                                    Sửa
                                  </Button>
                                </AddressDialog>

                                <Button
                                  size="sm"
                                  variant="destructive"
                                  className="bg-red-600 hover:bg-red-500"
                                  onClick={() => deleteAddress(a)}
                                >
                                  Xoá
                                </Button>
                              </div>
                            </div>

                            <Separator className="my-2 bg-muted/50" />

                            <div className="text-sm text-foreground">
                              {a?.diachichitiet || a?.diachi || ""}
                            </div>
                            <div className="mt-1 text-xs text-muted-foreground">
                              {(a?.phuongxa ? `${a.phuongxa}, ` : "") +
                                (a?.quanhuyen ? `${a.quanhuyen}, ` : "") +
                                (a?.tinhthanh || "")}
                              {loaiLabel ? ` · ${loaiLabel}` : ""}
                            </div>
                          </div>
                        );
                      })}

                      {addressDefault ? (
                        <div className="pt-1 text-xs text-muted-foreground">
                          Địa chỉ mặc định: <span className="text-foreground">{addressDefault?.diachichitiet || addressDefault?.diachi || ""}</span>
                        </div>
                      ) : null}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        ) : null}
      </main>

      <Footer />
    </div>
  );
}
