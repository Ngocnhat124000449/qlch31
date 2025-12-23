import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-white/5 bg-slate-950/40">
      <div className="mx-auto max-w-7xl px-5 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-slate-300">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 border border-white/10">
            <span className="text-lg">▢</span>
          </span>
          <span className="font-semibold">QuantumCore</span>
        </div>

        <div className="text-slate-500 text-sm">
          © 2024 QuantumCore. Mọi quyền được bảo lưu.
        </div>

        <div className="flex items-center gap-6 text-slate-300 text-sm">
          <Link className="hover:text-white" href="/terms">
            Điều khoản Dịch vụ
          </Link>
          <Link className="hover:text-white" href="/privacy">
            Chính sách Bảo mật
          </Link>
        </div>
      </div>
    </footer>
  );
}
