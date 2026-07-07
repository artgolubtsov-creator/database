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

  const brandMatch = pathname.match(/^\/brands\/([^/]+)/)
  const activeBrandSlug = brandMatch?.[1] ?? null

  const [brandsOpen, setBrandsOpen] = useState(!!activeBrandSlug || pathname === "/brands")

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

  const hasAdminAccess = userRole
    ? ["ADMIN", "SUPER_EDITOR", "CONTENT_EDITOR", "OFFER_MANAGER", "EDITOR"].includes(userRole)
    : false

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

        <div className="h-px bg-neutral-100 my-2" />

        {/* Brand section */}
        <button
          onClick={() => setBrandsOpen((o) => !o)}
          className={cn(
            "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors w-full text-left",
            pathname === "/brands" || activeBrandSlug
              ? "text-neutral-900 font-medium"
              : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50"
          )}
        >
          {brandsOpen ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
          Brand
        </button>

        {brandsOpen && (
          <div className="pl-3 flex flex-col gap-1">
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
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: brand.accent }}
                />
                {brand.name}
              </Link>
            ))}

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

        {canUpload(demoRole) && activeBrandSlug && (
          <>
            <div className="h-px bg-neutral-100 my-2" />
            <button className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-neutral-900 text-white hover:bg-neutral-800 transition-colors">
              <Upload size={14} />
              Upload Asset
            </button>
          </>
        )}

        {hasAdminAccess && (
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
