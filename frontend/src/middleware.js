import { NextResponse } from "next/server";

export function middleware(req) {
  const { pathname } = req.nextUrl;

  // Giữ tương thích route cũ: /admin -> /dashboard
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    const url = req.nextUrl.clone();
    url.pathname = pathname.replace(/^\/admin/, "/dashboard") || "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
