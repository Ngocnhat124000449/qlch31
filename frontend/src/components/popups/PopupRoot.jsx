"use client";

import { usePopups } from "@/components/popups/PopupProvider";

import AuthDialog from "@/components/popups/auth/AuthDialog";
import SearchDialog from "@/components/popups/search/SearchDialog";
import EditNameDialog from "@/components/popups/user/EditNameDialog";
import ChangePasswordDialog from "@/components/popups/user/ChangePasswordDialog";

import CartDialog from "@/components/popups/product/cart/CartDialog";
import ProductQuickViewDialog from "@/components/popups/product/ProductQuickViewDialog";

// nếu bạn đã có:
// import CartDialog from "@/components/popups/product/cart/CartDialog";
// import ProductQuickViewDialog from "@/components/popups/product/ProductQuickViewDialog";

export default function PopupRoot() {
  const {
    popups,
    closeAuth,
    closeSearch,
    closeEditName,
    closeChangePassword,
    closeCart,
    closeQuickView,
  } = usePopups();

  return (
    <>
      <AuthDialog
        open={popups.auth.open}
        defaultTab={popups.auth.mode}
        onOpenChange={(v) => !v && closeAuth()}
      />

      <SearchDialog
        open={popups.search.open}
        onOpenChange={(v) => !v && closeSearch()}
      />

      <EditNameDialog
        open={popups.editName.open}
        onOpenChange={(v) => !v && closeEditName()}
      />

      <ChangePasswordDialog
        open={popups.changePassword.open}
        onOpenChange={(v) => !v && closeChangePassword()}
      />

      <CartDialog
        open={popups.cart.open}
        onOpenChange={(v) => !v && closeCart()}
      />

      <ProductQuickViewDialog
        open={popups.quickView.open}
        sanphamid={popups.quickView.sanphamid}
        onOpenChange={(v) => !v && closeQuickView()}
      />
    </>
  );
}
