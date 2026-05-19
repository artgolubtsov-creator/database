import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { canManageContent, canManageOffers, hasAdminAccess, canManageUsers } from "@/lib/roles";

export default auth((req) => {
  const { nextUrl, auth: session } = req;
  const isLoggedIn = !!session?.user;
  const role = session?.user?.role;
  const path = nextUrl.pathname;

  // Public share links — no auth required
  if (path.startsWith("/share/")) return NextResponse.next();

  // Unauthenticated → login
  if (!isLoggedIn && !path.startsWith("/login") && !path.startsWith("/api/auth")) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  // Logged in on login page → dashboard
  if (isLoggedIn && path === "/login") {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  // Root → dashboard or login
  if (path === "/") {
    return NextResponse.redirect(new URL(isLoggedIn ? "/dashboard" : "/login", nextUrl));
  }

  // User management — ADMIN only
  if (path.startsWith("/admin/users") && !canManageUsers(role)) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  // Admin panel root + brand materials management — content editors and above
  if (path === "/admin" || path.startsWith("/admin/brand-materials")) {
    if (!canManageContent(role) && !canManageOffers(role)) {
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }
  }

  // Entry management in admin — content managers only
  if (path.startsWith("/admin/entries") && !canManageContent(role)) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  // Offer management in admin — offer managers only
  if (path.startsWith("/admin/offers") && !canManageOffers(role)) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  // Brand materials management outside admin — content managers only
  const isBrandMgmt =
    path === "/brand-materials/new" ||
    /^\/brand-materials\/[^/]+\/edit/.test(path);
  if (isBrandMgmt && !canManageContent(role)) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }
});

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
