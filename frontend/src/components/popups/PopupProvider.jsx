"use client";
import styles from "./PopupProvider.module.scss";

import React, { createContext, useContext, useMemo, useState } from "react";

/**
 * Popup state chuẩn hoá:
 * - auth: login/register dialog
 * - cart: cart dialog
 * - search: search command/dialog
 * - quickView: product quick view dialog (mang theo sanphamid)
 * - editName: sửa nhanh tên hiển thị
 * - changePassword: đổi mật khẩu
 */

const PopupContext = createContext(null);

export function PopupProvider({ children }) {
  const [popups, setPopups] = useState({
    auth: { open: false, mode: "login" }, // mode: "login" | "register"
    cart: { open: false },
    search: { open: false },
    quickView: { open: false, sanphamid: null },
    editName: { open: false },
    changePassword: { open: false },
  });

  const actions = useMemo(() => {
    // --- auth ---
    const openAuth = (arg = "login") => {
      // hỗ trợ: openAuth("login"), openAuth("register"), openAuth({ tab: "login" })...
      const mode =
        typeof arg === "string"
          ? arg
          : arg?.tab || arg?.mode || "login";
      setPopups((s) => ({ ...s, auth: { open: true, mode } }));
    };
    const closeAuth = () =>
      setPopups((s) => ({ ...s, auth: { ...s.auth, open: false } }));

    // --- cart ---
    const openCart = () => setPopups((s) => ({ ...s, cart: { open: true } }));
    const closeCart = () => setPopups((s) => ({ ...s, cart: { open: false } }));

    // --- search ---
    const openSearch = () =>
      setPopups((s) => ({ ...s, search: { open: true } }));
    const closeSearch = () =>
      setPopups((s) => ({ ...s, search: { open: false } }));

    // --- quick view ---
    const openQuickView = (sanphamid) =>
      setPopups((s) => ({
        ...s,
        quickView: { open: true, sanphamid },
      }));
    const closeQuickView = () =>
      setPopups((s) => ({
        ...s,
        quickView: { open: false, sanphamid: null },
      }));

    // --- user quick actions ---
    const openEditName = () =>
      setPopups((s) => ({ ...s, editName: { open: true } }));
    const closeEditName = () =>
      setPopups((s) => ({ ...s, editName: { open: false } }));

    const openChangePassword = () =>
      setPopups((s) => ({ ...s, changePassword: { open: true } }));
    const closeChangePassword = () =>
      setPopups((s) => ({ ...s, changePassword: { open: false } }));

    // tiện: đóng tất cả
    const closeAll = () =>
      setPopups((s) => ({
        ...s,
        auth: { ...s.auth, open: false },
        cart: { open: false },
        search: { open: false },
        quickView: { open: false, sanphamid: null },
        editName: { open: false },
        changePassword: { open: false },
      }));

    return {
      popups,
      openAuth,
      closeAuth,
      openCart,
      closeCart,
      openSearch,
      closeSearch,
      openQuickView,
      closeQuickView,
      openEditName,
      closeEditName,
      openChangePassword,
      closeChangePassword,
      closeAll,
    };
  }, [popups]);

  return (
    <PopupContext.Provider value={actions}>{children}</PopupContext.Provider>
  );
}

export function usePopups() {
  const ctx = useContext(PopupContext);
  if (!ctx) throw new Error("usePopups must be used inside <PopupProvider />");
  return ctx;
}
