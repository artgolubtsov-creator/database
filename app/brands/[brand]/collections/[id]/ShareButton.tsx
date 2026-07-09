"use client"
import { useDemoRole, canSharePortal } from "@/lib/demo-role-context"
import { useState } from "react"
import { Check, Link2 } from "lucide-react"

export function ShareButton({ token }: { token: string }) {
  const { demoRole } = useDemoRole()
  const [copied, setCopied] = useState(false)

  if (!canSharePortal(demoRole)) return null

  const copy = async () => {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin
    await navigator.clipboard.writeText(`${baseUrl}/portal/${token}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="flex items-center gap-1.5 text-sm font-medium bg-neutral-900 text-white px-3 py-2 rounded-lg hover:bg-neutral-800 transition-colors"
    >
      {copied ? <Check size={13} /> : <Link2 size={13} />}
      {copied ? "Copied!" : "Copy partner link"}
    </button>
  )
}
