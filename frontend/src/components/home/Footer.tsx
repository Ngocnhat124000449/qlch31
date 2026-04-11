import styles from "./Footer.module.scss";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-border/40 bg-muted/40 dark:bg-muted/30 dark:bg-slate-950/40">
      <div className="mx-auto max-w-7xl px-5 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-card border border-border">
            <span className="text-lg">▢</span>
          </span>
          <span className="font-semibold">QuantumCore</span>
        </div>

        <div className="text-muted-foreground text-sm">
          © 2024 QuantumCore. Mọi quyền được bảo lưu.
        </div>

        <div className="flex items-center gap-6 text-muted-foreground text-sm">
          <Link className="hover:text-foreground" href="/terms">
            Điều khoản Dịch vụ
          </Link>
          <Link className="hover:text-foreground" href="/privacy">
            Chính sách Bảo mật
          </Link>
        </div>
      </div>
    </footer>
  );
}
