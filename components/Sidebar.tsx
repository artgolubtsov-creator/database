"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { cn } from "@/lib/utils"
import { useDemoRole, canUpload } from "@/lib/demo-role-context"
import { getBrand } from "@/lib/brands"
import {
  LayoutGrid, Images, FolderOpen, BookOpen, Settings,
  LogOut, ChevronLeft, Upload
} from "lucide-react"

interface SidebarProps {
  brandSlug: string
  userName?: string | null
}

export function Sidebar({ brandSlug, userName }: SidebarProps) {
  const pathname = usePathname()
  const { demoRole } = useDemoRole()
  const brand = getBrand(brandSlug)

  const navLinks = [
    { href: `/brands/${brandSlug}`, label: "Overview", icon: LayoutGrid, exact: true },
    { href: `/brands/${brandSlug}/assets`, label: "Assets", icon: Images },
    { href: `/brands/${brandSlug}/collections`, label: "Collections", icon: FolderOpen },
    { href: `/brands/${brandSlug}/guidelines`, label: "Guidelines", icon: BookOpen },
  ]

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href)

  return (
    <aside className="w-[220px] shrink-0 h-screen sticky top-0 flex flex-col border-r border-neutral-200 bg-white">
      {/* Brand header */}
      <div
        className="px-4 py-4 border-b border-neutral-200"
        style={{ backgroundColor: brand?.accent, color: brand?.accentForeground }}
      >
        <Link href="/" className="flex items-center gap-2 mb-3 opacity-70 hover:opacity-100 transition-opacity">
          <ChevronLeft size={14} />
          <span className="text-xs">All Brands</span>
        </Link>
        <p className="text-xs opacity-60 font-medium uppercase tracking-wider">update</p>
        <p className="text-sm font-bold mt-0.5">{brand?.name ?? brandSlug}</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {navLinks.map(({ href, label, icon: Icon, exact }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors",
              isActive(href, exact)
                ? "bg-neutral-100 text-neutral-900 font-medium"
                : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50"
            )}
          >
            <Icon size={15} />
            {label}
          </Link>
        ))}
      </nav>

      {/* Upload CTA */}
      {canUpload(demoRole) && (
        <div className="px-3 pb-3">
          <button className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-neutral-900 text-white hover:bg-neutral-800 transition-colors">
            <Upload size={14} />
            Upload Asset
          </button>
        </div>
      )}

      {/* Admin link */}
      {demoRole === "Admin" && (
        <div className="px-3 pb-2">
          <Link
            href="/admin"
            className={cn(
              "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors",
              pathname.startsWith("/admin")
                ? "bg-neutral-100 text-neutral-900 font-medium"
                : "text-neutral-400 hover:text-neutral-900 hover:bg-neutral-50"
            )}
          >
            <Settings size={15} />
            Admin
          </Link>
        </div>
      )}

      {/* User footer */}
      <div className="border-t border-neutral-200 px-4 py-3 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-neutral-900 truncate max-w-[120px]">{userName ?? "User"}</p>
          <p className="text-[10px] text-neutral-400">{demoRole}</p>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="text-neutral-400 hover:text-neutral-700 transition-colors"
          title="Sign out"
        >
          <LogOut size={14} />
        </button>
      </div>
    </aside>
  )
}
