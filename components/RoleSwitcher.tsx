"use client"
import { useDemoRole } from "@/lib/demo-role-context"
import type { DemoRole } from "@/types/mock"

const ROLES: DemoRole[] = ["Admin", "Brand Manager", "Internal Viewer", "External Agency"]

const ROLE_COLORS: Record<DemoRole, string> = {
  "Admin": "bg-neutral-900 text-white",
  "Brand Manager": "bg-violet-600 text-white",
  "Internal Viewer": "bg-sky-600 text-white",
  "External Agency": "bg-amber-500 text-white",
}

export function RoleSwitcher() {
  const { demoRole, setDemoRole } = useDemoRole()

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      <div className="flex flex-col gap-1 bg-white rounded-2xl shadow-lg border border-neutral-200 p-2 w-44">
        <p className="text-[10px] font-medium text-neutral-400 uppercase tracking-wider px-2 py-1">Demo Role</p>
        {ROLES.map((role) => (
          <button
            key={role}
            onClick={() => setDemoRole(role)}
            className={`text-xs font-medium px-3 py-2 rounded-lg text-left transition-all ${
              demoRole === role
                ? ROLE_COLORS[role]
                : "text-neutral-600 hover:bg-neutral-100"
            }`}
          >
            {role}
          </button>
        ))}
      </div>
      <div className={`text-xs font-semibold px-3 py-1.5 rounded-full ${ROLE_COLORS[demoRole]}`}>
        {demoRole}
      </div>
    </div>
  )
}
