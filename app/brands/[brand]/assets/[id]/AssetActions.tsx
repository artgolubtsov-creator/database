"use client"
import { Download, CheckCircle } from "lucide-react"
import { useDemoRole, canApprove } from "@/lib/demo-role-context"
import { useState } from "react"

export function AssetActions({ status }: { status: string }) {
  const { demoRole } = useDemoRole()
  const [approved, setApproved] = useState(status === "APPROVED")

  return (
    <div className="flex flex-col gap-3">
      {canApprove(demoRole) && !approved && (
        <button
          onClick={() => setApproved(true)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-emerald-500 text-emerald-600 text-sm font-medium hover:bg-emerald-50 transition-colors"
        >
          <CheckCircle size={15} /> Approve
        </button>
      )}
      {approved && canApprove(demoRole) && (
        <div className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-50 text-emerald-600 text-sm font-medium">
          <CheckCircle size={15} /> Approved
        </div>
      )}
      <button className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-800 transition-colors">
        <Download size={15} /> Download Original
      </button>
    </div>
  )
}
