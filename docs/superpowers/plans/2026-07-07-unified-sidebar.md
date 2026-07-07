# Unified Left Sidebar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the top Navbar with a single unified left sidebar across all authenticated pages, with a collapsible Brand section that shows a mini brand hub and per-brand submenu.

**Architecture:** A new `Shell` client component reads `usePathname()` to decide whether to show the sidebar (hidden on `/login` and `/portal/*`). The `AppSidebar` component replaces both the old `Navbar` and the old brand `Sidebar`. All 22 pages that currently render `<Navbar>` are stripped of it — the shell provides the outer layout.

**Tech Stack:** Next.js 16 App Router, React client components, Tailwind CSS v4, lucide-react, next-auth v5, `usePathname` hook.

---

## File Map

| File | Action | Purpose |
|------|--------|---------|
| `components/AppSidebar.tsx` | Create | New unified sidebar with all nav sections |
| `components/Shell.tsx` | Create | Conditional layout wrapper (sidebar + main) |
| `app/layout.tsx` | Modify | Get session server-side, pass to Shell |
| `app/brands/page.tsx` | Create | Brand hub page (4 cards), moved from app/page.tsx |
| `app/page.tsx` | Modify | Redirect to /dashboard |
| `app/brands/[brand]/layout.tsx` | Modify | Remove old Sidebar, just render children |
| All 22 Navbar pages | Modify | Remove Navbar import + wrapper div |

**Pages to strip Navbar from (all follow the same pattern):**
`app/dashboard/page.tsx`, `app/offers/page.tsx`, `app/brand-materials/page.tsx`,
`app/brand-materials/new/page.tsx`, `app/brand-materials/[id]/edit/page.tsx`,
`app/entries/[id]/page.tsx`, `app/crm-maker/page.tsx`, `app/admin/page.tsx`,
`app/admin/offers/[id]/edit/page.tsx`, `app/admin/offers/new/page.tsx`,
`app/admin/sheet-import/page.tsx`, `app/admin/entries/new/page.tsx`,
`app/admin/entries/[id]/edit/page.tsx`, `app/admin/entries/import/page.tsx`,
`app/admin/brand-materials/page.tsx`, `app/admin/brand-materials/[id]/edit/page.tsx`,
`app/admin/brand-materials/new/page.tsx`, `app/admin/figma-sync/page.tsx`,
`app/admin/users/new/page.tsx`, `app/admin/users/page.tsx`,
`app/admin/users/[id]/edit/page.tsx`, `app/instructions/page.tsx`

---

## Task 1: Create AppSidebar Component

**Files:**
- Create: `components/AppSidebar.tsx`

The sidebar has 5 sections:
1. Logo header
2. Top nav: Dashboard, Offers, CRM Maker
3. Brand section (collapsible): 4 brand cards → per-brand submenu
4. Admin link (role-gated)
5. Footer: user name, demo role, sign out

- [ ] **Step 1: Create the file**

```tsx
"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { signOut } from "next-auth/react"
import { cn } from "@/lib/utils"
import { useDemoRole, canUpload } from "@/lib/demo-role-context"
import { BRANDS, getBrand } from "@/lib/brands"
import {
  LayoutDashboard, Tag, Wand2, Settings, LogOut,
  ChevronDown, ChevronRight, LayoutGrid, Images,
  FolderOpen, BookOpen, Upload
} from "lucide-react"

interface AppSidebarProps {
  userName?: string | null
  userRole?: string | null
}

export function AppSidebar({ userName, userRole }: AppSidebarProps) {
  const pathname = usePathname()
  const { demoRole } = useDemoRole()

  // Detect active brand from URL: /brands/yango-play/assets → "yango-play"
  const brandMatch = pathname.match(/^\/brands\/([^/]+)/)
  const activeBrandSlug = brandMatch?.[1] ?? null

  // Brand section open state — auto-open if already in /brands/*
  const [brandsOpen, setBrandsOpen] = useState(!!activeBrandSlug || pathname === "/brands")

  // Keep expanded when navigating into brands
  useEffect(() => {
    if (activeBrandSlug || pathname === "/brands") setBrandsOpen(true)
  }, [pathname, activeBrandSlug])

  const topLinks = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/offers", label: "Offers", icon: Tag },
    { href: "/crm-maker", label: "CRM Maker", icon: Wand2 },
  ]

  const isActive = (href: string, exact = false) =>
    exact ? pathname === href : pathname.startsWith(href)

  const brandLinks = activeBrandSlug
    ? [
        { href: `/brands/${activeBrandSlug}`, label: "Overview", icon: LayoutGrid, exact: true },
        { href: `/brands/${activeBrandSlug}/assets`, label: "Assets", icon: Images },
        { href: `/brands/${activeBrandSlug}/collections`, label: "Collections", icon: FolderOpen },
        { href: `/brands/${activeBrandSlug}/guidelines`, label: "Guidelines", icon: BookOpen },
      ]
    : []

  const activeBrand = activeBrandSlug ? getBrand(activeBrandSlug) : null

  return (
    <aside className="w-[220px] shrink-0 h-screen sticky top-0 flex flex-col border-r border-neutral-200 bg-white">
      {/* Logo */}
      <div className="px-4 py-4 border-b border-neutral-200">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-neutral-900 flex items-center justify-center">
            <span className="text-white text-xs font-bold">YP</span>
          </div>
          <span className="text-sm font-semibold text-neutral-900">Content Hub</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
        {/* Top links */}
        {topLinks.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors",
              isActive(href)
                ? "bg-neutral-100 text-neutral-900 font-medium"
                : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50"
            )}
          >
            <Icon size={15} />
            {label}
          </Link>
        ))}

        {/* Divider */}
        <div className="h-px bg-neutral-100 my-2" />

        {/* Brand section */}
        <button
          onClick={() => setBrandsOpen((o) => !o)}
          className={cn(
            "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors w-full text-left",
            (pathname === "/brands" || activeBrandSlug)
              ? "text-neutral-900 font-medium"
              : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50"
          )}
        >
          {brandsOpen ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
          Brand
        </button>

        {brandsOpen && (
          <div className="pl-3 flex flex-col gap-1">
            {/* Brand cards */}
            <div className="flex flex-col gap-1 mb-1">
              {BRANDS.map((brand) => (
                <Link
                  key={brand.slug}
                  href={`/brands/${brand.slug}`}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-colors",
                    activeBrandSlug === brand.slug
                      ? "bg-neutral-100 text-neutral-900 font-medium"
                      : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50"
                  )}
                >
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: brand.accent }}
                  />
                  {brand.name}
                </Link>
              ))}
            </div>

            {/* Per-brand submenu */}
            {activeBrandSlug && brandLinks.length > 0 && (
              <>
                <div className="h-px bg-neutral-100 my-1" />
                {brandLinks.map(({ href, label, icon: Icon, exact }) => (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs transition-colors",
                      isActive(href, exact)
                        ? "bg-neutral-100 text-neutral-900 font-medium"
                        : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50"
                    )}
                  >
                    <Icon size={13} />
                    {label}
                  </Link>
                ))}
              </>
            )}
          </div>
        )}

        {/* Upload CTA */}
        {canUpload(demoRole) && activeBrandSlug && (
          <>
            <div className="h-px bg-neutral-100 my-2" />
            <div className="px-0">
              <button className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-neutral-900 text-white hover:bg-neutral-800 transition-colors">
                <Upload size={14} />
                Upload Asset
              </button>
            </div>
          </>
        )}

        {/* Divider before admin */}
        {userRole && ["ADMIN", "SUPER_EDITOR", "CONTENT_EDITOR", "OFFER_MANAGER", "EDITOR"].includes(userRole) && (
          <>
            <div className="h-px bg-neutral-100 my-2" />
            <Link
              href="/admin"
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors",
                isActive("/admin")
                  ? "bg-neutral-100 text-neutral-900 font-medium"
                  : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50"
              )}
            >
              <Settings size={15} />
              Admin
            </Link>
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="border-t border-neutral-200 px-4 py-3 flex items-center justify-between">
        <div className="min-w-0">
          <p className="text-xs font-medium text-neutral-900 truncate">{userName ?? "User"}</p>
          <p className="text-[10px] text-neutral-400">{demoRole}</p>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="text-neutral-400 hover:text-neutral-700 transition-colors shrink-0 ml-2"
          title="Sign out"
        >
          <LogOut size={14} />
        </button>
      </div>
    </aside>
  )
}
```

- [ ] **Step 2: Verify TypeScript**

Run: `npx tsc --noEmit 2>&1 | grep AppSidebar`
Expected: no output (no errors)

- [ ] **Step 3: Commit**

```bash
git add components/AppSidebar.tsx
git commit -m "feat: add unified AppSidebar component"
```

---

## Task 2: Create Shell Layout Component

**Files:**
- Create: `components/Shell.tsx`

Shell reads the pathname and renders either:
- Public mode (login, portal): just `{children}`
- App mode: sidebar + main content area + RoleSwitcher

- [ ] **Step 1: Create the file**

```tsx
"use client"
import { usePathname } from "next/navigation"
import { AppSidebar } from "./AppSidebar"
import { RoleSwitcher } from "./RoleSwitcher"

interface ShellProps {
  children: React.ReactNode
  userName?: string | null
  userRole?: string | null
}

const PUBLIC_PREFIXES = ["/login", "/portal"]

export function Shell({ children, userName, userRole }: ShellProps) {
  const pathname = usePathname()
  const isPublic = PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))

  if (isPublic) return <>{children}</>

  return (
    <div className="flex min-h-screen">
      <AppSidebar userName={userName} userRole={userRole} />
      <main className="flex-1 min-w-0 bg-[#fafafa]">
        {children}
      </main>
      <RoleSwitcher />
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript**

Run: `npx tsc --noEmit 2>&1 | grep Shell`
Expected: no output

- [ ] **Step 3: Commit**

```bash
git add components/Shell.tsx
git commit -m "feat: add Shell layout component"
```

---

## Task 3: Update Root Layout to Use Shell

**Files:**
- Modify: `app/layout.tsx`

Root layout becomes a server component that gets the session and passes user info to Shell.

- [ ] **Step 1: Replace app/layout.tsx**

```tsx
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { DemoRoleProvider } from "@/lib/demo-role-context"
import { Shell } from "@/components/Shell"
import { auth } from "@/auth"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

export const metadata: Metadata = {
  title: "update — Brand Content Hub",
  description: "Internal brand asset management",
  robots: { index: false, follow: false },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full">
        <DemoRoleProvider>
          <Shell userName={session?.user?.name} userRole={session?.user?.role}>
            {children}
          </Shell>
        </DemoRoleProvider>
      </body>
    </html>
  )
}
```

- [ ] **Step 2: Verify build**

Run: `npx tsc --noEmit 2>&1 | head -20`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add app/layout.tsx
git commit -m "feat: integrate Shell into root layout"
```

---

## Task 4: Create Brands Hub Page + Redirect Root

**Files:**
- Create: `app/brands/page.tsx`
- Modify: `app/page.tsx`

The brand hub (4 brand cards) moves from `/` to `/brands`. Root `/` becomes a simple redirect to `/dashboard`.

- [ ] **Step 1: Create app/brands/page.tsx**

```tsx
import Link from "next/link"
import { BRANDS } from "@/lib/brands"
import { getAssetsByBrand } from "@/lib/mock-data"

export default function BrandsPage() {
  return (
    <div className="px-8 py-8">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-neutral-900">Brands</h1>
        <p className="text-sm text-neutral-500 mt-1">Select a brand to browse and manage assets</p>
      </div>
      <div className="grid grid-cols-2 gap-5 max-w-3xl">
        {BRANDS.map((brand) => {
          const assets = getAssetsByBrand(brand.slug)
          const approvedCount = assets.filter((a) => a.status === "APPROVED").length
          return (
            <Link
              key={brand.slug}
              href={`/brands/${brand.slug}`}
              className="group bg-white rounded-2xl card-shadow hover:card-shadow-hover transition-all overflow-hidden border border-neutral-100"
            >
              <div className="h-2 w-full" style={{ backgroundColor: brand.accent }} />
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                    style={{ backgroundColor: brand.accent + "18" }}
                  >
                    {brand.emoji}
                  </div>
                  <span className="text-xs font-medium text-neutral-400 bg-neutral-100 px-2 py-1 rounded-full">
                    {assets.length} assets
                  </span>
                </div>
                <h2 className="text-lg font-bold text-neutral-900 mb-1 group-hover:text-neutral-700 transition-colors">
                  {brand.name}
                </h2>
                <p className="text-sm text-neutral-500 mb-4">{brand.description}</p>
                <div className="flex items-center gap-4 text-xs text-neutral-400">
                  <span>{approvedCount} approved</span>
                  <span>{assets.filter((a) => a.status === "REVIEW").length} in review</span>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Replace app/page.tsx with redirect**

```tsx
import { redirect } from "next/navigation"

export default function RootPage() {
  redirect("/dashboard")
}
```

- [ ] **Step 3: Verify TypeScript**

Run: `npx tsc --noEmit 2>&1 | head -20`
Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add app/brands/page.tsx app/page.tsx
git commit -m "feat: add brands hub page, redirect root to dashboard"
```

---

## Task 5: Simplify Brands Layout

**Files:**
- Modify: `app/brands/[brand]/layout.tsx`

Remove the old `<Sidebar>` and `<RoleSwitcher>` — Shell handles both now. Keep auth check and brand slug validation.

- [ ] **Step 1: Replace the file**

```tsx
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { BRAND_SLUGS } from "@/lib/brands"

export default async function BrandLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ brand: string }>
}) {
  const session = await auth()
  if (!session) redirect("/login")

  const { brand } = await params
  if (!BRAND_SLUGS.includes(brand as never)) redirect("/brands")

  return <>{children}</>
}
```

- [ ] **Step 2: Verify TypeScript**

Run: `npx tsc --noEmit 2>&1 | grep "brands"` 
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add app/brands/[brand]/layout.tsx
git commit -m "feat: simplify brands layout, sidebar moved to Shell"
```

---

## Task 6: Remove Navbar from All Pages

**Files:**  
Modify all 22 pages listed in the file map above.

Every page follows the same pattern. Before:
```tsx
import { Navbar } from "@/components/Navbar"
// ...
const session = await auth()
return (
  <div className="min-h-screen flex flex-col">
    <Navbar role={session!.user.role} name={session!.user.name} />
    <main className="...">
      {content}
    </main>
  </div>
)
```

After (remove Navbar import, wrapper div, and Navbar element; keep main or just return content directly):
```tsx
// No Navbar import
// ...
return (
  <main className="...">
    {content}
  </main>
)
```

**Exception — CRM Maker** uses `h-screen` for iframe. After removing Navbar, change to full-height:
```tsx
// Before:
<div className="flex flex-col h-screen">
  <Navbar ... />
  <iframe className="flex-1" ... />
</div>

// After:
<iframe className="w-full h-full" src="/crm-maker/index.html" ... />
```

- [ ] **Step 1: Strip Navbar from simple pages (offers, brand-materials, instructions)**

Edit `app/offers/page.tsx`:
```tsx
import { auth } from "@/auth";
import { OffersClient } from "./OffersClient";

export default async function OffersPage() {
  const session = await auth();
  return (
    <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
      <OffersClient />
    </main>
  );
}
```

Edit `app/brand-materials/page.tsx` — remove `import { Navbar }` line and `<Navbar .../>` line; remove outer `<div className="min-h-screen...">` wrapper, keeping `<main>` as root element.

Edit `app/instructions/page.tsx` — same pattern.

- [ ] **Step 2: Strip Navbar from brand-materials sub-pages**

Edit `app/brand-materials/new/page.tsx` — remove Navbar import, Navbar element, outer div wrapper.

Edit `app/brand-materials/[id]/edit/page.tsx` — same.

- [ ] **Step 3: Strip Navbar from entries**

Edit `app/entries/[id]/page.tsx` — remove Navbar import, element, outer div.

- [ ] **Step 4: Strip Navbar from CRM Maker (special case)**

Edit `app/crm-maker/page.tsx`:
```tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const metadata = { title: "CRM Maker — Content Hub" };

export default async function CrmMakerPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <iframe
      src="/crm-maker/index.html"
      className="w-full h-full border-0"
      title="CRM Maker"
    />
  );
}
```

- [ ] **Step 5: Strip Navbar from dashboard**

Edit `app/dashboard/page.tsx` — remove `import { Navbar }`, remove `<Navbar .../>` line, remove outer `<div className="min-h-screen flex flex-col">` wrapper (keep inner structure).

- [ ] **Step 6: Strip Navbar from all admin pages**

Edit each of the 11 admin pages — remove Navbar import and element, remove outer div wrapper:
- `app/admin/page.tsx`
- `app/admin/offers/[id]/edit/page.tsx`
- `app/admin/offers/new/page.tsx`
- `app/admin/sheet-import/page.tsx`
- `app/admin/entries/new/page.tsx`
- `app/admin/entries/[id]/edit/page.tsx`
- `app/admin/entries/import/page.tsx`
- `app/admin/brand-materials/page.tsx`
- `app/admin/brand-materials/[id]/edit/page.tsx`
- `app/admin/brand-materials/new/page.tsx`
- `app/admin/figma-sync/page.tsx`
- `app/admin/users/new/page.tsx`
- `app/admin/users/page.tsx`
- `app/admin/users/[id]/edit/page.tsx`

- [ ] **Step 7: Verify build**

Run: `npm run build 2>&1 | tail -20`
Expected: Build completes, all routes listed, zero TypeScript errors

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: remove Navbar from all pages, Shell provides layout"
```

---

## Task 7: Smoke Test

- [ ] **Step 1: Start dev server**

```bash
npm run dev
```

- [ ] **Step 2: Verify sidebar appears on all authenticated pages**

Visit: `http://localhost:3000/dashboard` → sidebar visible, Dashboard highlighted  
Visit: `http://localhost:3000/offers` → sidebar visible, Offers highlighted  
Visit: `http://localhost:3000/brands` → sidebar visible, Brand section expanded, 4 brand cards shown  
Visit: `http://localhost:3000/brands/yango-play` → sidebar shows Yango Play submenu (Overview/Assets/Collections/Guidelines)  
Visit: `http://localhost:3000/brands/yango-play/assets` → Assets highlighted in submenu  

- [ ] **Step 3: Verify public pages have no sidebar**

Visit: `http://localhost:3000/login` → no sidebar  
Visit: `http://localhost:3000/portal/ext-yp-brand` → no sidebar  

- [ ] **Step 4: Verify brand switching**

In sidebar, click "Yasmina" → navigates to `/brands/yasmina`, submenu updates to Yasmina

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "feat: unified sidebar complete — smoke test passed"
```
