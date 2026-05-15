import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl, auth: session } = req;
  const isLoggedIn = !!session?.user;
  const role = session?.user?.role;
  const isAdmin = role === "ADMIN";
  const isEditor = role === "EDITOR";
  const path = nextUrl.pathname;

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

  // Admin-only routes (strict)
  const adminOnlyPaths = ["/admin/users", "/admin/brand-materials"];
  const isAdminOnlyPath =
    path === "/admin" ||
    adminOnlyPaths.some((p) => path.startsWith(p));

  if (isAdminOnlyPath && !isAdmin) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  // Editor-accessible admin routes: /admin/entries/*
  if (path.startsWith("/admin/entries") && !isAdmin && !isEditor) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  // Brand materials management outside admin (ADMIN | EDITOR)
  const isBrandMgmt =
    path === "/brand-materials/new" ||
    /^\/brand-materials\/[^/]+\/edit/.test(path);
  if (isBrandMgmt && !isAdmin && !isEditor) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }
});

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
