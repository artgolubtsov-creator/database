"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/Button";
import { LogOut, LayoutDashboard, Settings, Palette, Plus, Tag } from "lucide-react";
import { canManageContent, hasAdminAccess } from "@/lib/roles";

interface NavbarProps {
  role: string;
  name?: string | null;
}

export function Navbar({ role, name }: NavbarProps) {
  const pathname = usePathname();

  const links = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/brand-materials", label: "Brand", icon: Palette },
    { href: "/offers", label: "Offers", icon: Tag },
    ...(hasAdminAccess(role) ? [{ href: "/admin", label: "Admin", icon: Settings }] : []),
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-neutral-900 flex items-center justify-center">
              <span className="text-white text-xs font-bold">YP</span>
            </div>
            <span className="text-sm font-semibold text-neutral-900 hidden sm:block">
              Content Hub
            </span>
          </Link>
          <nav className="flex items-center gap-1">
            {links.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors",
                  pathname === href || (href !== "/dashboard" && href !== "/brand-materials" && href !== "/offers" && pathname.startsWith(href))
                    ? "bg-neutral-100 text-neutral-900 font-medium"
                    : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50"
                )}
              >
                <Icon size={15} />
                {label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          {canManageContent(role) && (
            <Link href="/admin/entries/new">
              <Button size="sm" variant="ghost">
                <Plus size={15} />
                <span className="hidden sm:block">New Entry</span>
              </Button>
            </Link>
          )}
          {name && <span className="text-sm text-neutral-500 hidden sm:block">{name}</span>}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            <LogOut size={15} />
            <span className="hidden sm:block">Sign out</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
