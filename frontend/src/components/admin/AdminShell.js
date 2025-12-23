"use client";

import AdminSidebar from "./AdminSidebar";
import AdminTopbar from "./AdminTopbar";

export default function AdminShell({ children, me }) {
  // NOTE: Auth/Admin gating is handled in /app/dashboard/layout.js (and /app/admin/layout.js).
  // AdminShell should be a presentational wrapper only.

  return (
    <div className="min-h-screen text-white bg-[#070B16]">
      {/* nền giống ảnh */}
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_rgba(99,102,241,0.22),transparent_55%),radial-gradient(ellipse_at_bottom,_rgba(168,85,247,0.16),transparent_50%)]" />

      <div className="flex">
        <AdminSidebar />

        <div className="min-w-0 flex-1">
          <AdminTopbar me={me} />
          <main className="mx-auto w-full max-w-6xl px-6 py-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
