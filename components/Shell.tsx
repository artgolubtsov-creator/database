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
