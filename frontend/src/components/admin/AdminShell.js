"use client";

import AdminSidebar from "./AdminSidebar";
import AdminTopbar from "./AdminTopbar";

export default function AdminShell({ children, me }) {
  // NOTE: Auth/Admin gating is handled in /app/dashboard/layout.js (and /app/admin/layout.js).
  // AdminShell should be a presentational wrapper only.

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Decorative background - only show strong glow in dark mode */}
      <div className="pointer-events-none fixed inset-0 -z-10 hidden dark:block bg-[radial-gradient(ellipse_at_top,_rgba(99,102,241,0.22),transparent_55%),radial-gradient(ellipse_at_bottom,_rgba(168,85,247,0.16),transparent_50%)]" />
      <div className="pointer-events-none fixed inset-0 -z-10 dark:hidden bg-[radial-gradient(ellipse_at_top,_rgba(99,102,241,0.10),transparent_55%),radial-gradient(ellipse_at_bottom,_rgba(168,85,247,0.08),transparent_50%)]" />

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
