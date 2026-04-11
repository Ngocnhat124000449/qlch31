"use client";

import styles from "./AuthDialog.module.scss";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { apiFetch } from "@/lib/apiClient";
import { setTokens } from "@/lib/tokens";

function pickTokens(data) {
  if (!data || typeof data !== "object")
    return { accessToken: null, refreshToken: null };

  const accessToken =
    data.accessToken ||
    data.access_token ||
    data.token ||
    data.access ||
    (data.data &&
      (data.data.accessToken || data.data.access_token || data.data.token)) ||
    null;

  const refreshToken =
    data.refreshToken ||
    data.refresh_token ||
    data.refresh ||
    (data.data && (data.data.refreshToken || data.data.refresh_token)) ||
    null;

  return { accessToken, refreshToken };
}

export default function AuthDialog({
  open,
  onOpenChange,
  defaultTab = "login",
}) {
  const [tab, setTab] = useState(defaultTab);

  // login
  const [identifier, setIdentifier] = useState("");
  const [matkhau, setMatkhau] = useState("");

  // register
  const [tendangnhap, setTendangnhap] = useState("");
  const [email, setEmail] = useState("");
  const [sdt, setSdt] = useState("");
  const [hoten, setHoten] = useState("");
  const [regMatkhau, setRegMatkhau] = useState("");

  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  // reset tab when opened with new default
  useEffect(() => {
    if (open) setTab(defaultTab);
  }, [open, defaultTab]);

  async function handleLogin(e) {
    e.preventDefault();
    setErrMsg("");
    setLoading(true);
    try {
      const data = await apiFetch("/api/auth/login", {
        method: "POST",
        body: {
          identifier: identifier.trim(), // tendangnhap/email/sdt
          matkhau,
        },
        auth: false,
      });

      const { accessToken, refreshToken } = pickTokens(data);
      if (!accessToken)
        throw new Error("Không nhận được access token từ server.");

      setTokens(accessToken, refreshToken);
      onOpenChange(false);
    } catch (err) {
      setErrMsg(err?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    setErrMsg("");
    setLoading(true);

    try {
      // 1) register
      const reg = await apiFetch("/api/auth/register", {
        method: "POST",
        body: {
          tendangnhap: tendangnhap.trim(),
          email: email.trim(),
          sdt: sdt.trim(),
          hoten: hoten.trim(),
          matkhau: regMatkhau,
        },
        auth: false,
      });

      // 2) nếu register có token => lưu
      let { accessToken, refreshToken } = pickTokens(reg);

      // 3) nếu không có token => auto-login để lấy token
      if (!accessToken) {
        const login = await apiFetch("/api/auth/login", {
          method: "POST",
          body: {
            identifier: email.trim() || tendangnhap.trim() || sdt.trim(),
            matkhau: regMatkhau,
          },
          auth: false,
        });
        ({ accessToken, refreshToken } = pickTokens(login));
      }

      if (!accessToken)
        throw new Error("Đăng ký thành công nhưng không nhận được token.");

      setTokens(accessToken, refreshToken);
      onOpenChange(false);
    } catch (err) {
      setErrMsg(err?.message || "Register failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[720px]">
        <DialogHeader>
          <DialogTitle>{tab === "login" ? "Đăng nhập" : "Đăng ký"}</DialogTitle>
        </DialogHeader>

        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="grid w-[260px] grid-cols-2">
            <TabsTrigger value="login">Đăng nhập</TabsTrigger>
            <TabsTrigger value="register">Đăng ký</TabsTrigger>
          </TabsList>

          {errMsg ? (
            <div className="mt-3 text-sm text-red-500">{errMsg}</div>
          ) : null}

          <TabsContent value="login" className="mt-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label>Email / Username / SĐT</Label>
                <Input
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="tendangnhap / email / sdt"
                  autoComplete="username"
                />
              </div>

              <div className="space-y-2">
                <Label>Mật khẩu</Label>
                <Input
                  type="password"
                  value={matkhau}
                  onChange={(e) => setMatkhau(e.target.value)}
                  autoComplete="current-password"
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "..." : "Đăng nhập"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="register" className="mt-4">
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label>Username (tendangnhap)</Label>
                <Input
                  value={tendangnhap}
                  onChange={(e) => setTendangnhap(e.target.value)}
                  autoComplete="username"
                />
              </div>

              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2">
                <Label>Số điện thoại (sdt)</Label>
                <Input value={sdt} onChange={(e) => setSdt(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label>Họ tên (hoten)</Label>
                <Input
                  value={hoten}
                  onChange={(e) => setHoten(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Mật khẩu (matkhau)</Label>
                <Input
                  type="password"
                  value={regMatkhau}
                  onChange={(e) => setRegMatkhau(e.target.value)}
                  autoComplete="new-password"
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "..." : "Đăng ký"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
