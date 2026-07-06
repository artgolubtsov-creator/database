"use client"
import { useDemoRole, canSharePortal } from "@/lib/demo-role-context"
import Link from "next/link"
import { Share2 } from "lucide-react"

export function ShareButton({ token }: { token: string }) {
  const { demoRole } = useDemoRole()
  if (!canSharePortal(demoRole)) return null

  return (
    <Link
      href={`/portal/${token}`}
      target="_blank"
      className="flex items-center gap-1.5 text-sm font-medium bg-neutral-900 text-white px-3 py-2 rounded-lg hover:bg-neutral-800 transition-colors"
    >
      <Share2 size={13} /> Share Link
    </Link>
  )
}
