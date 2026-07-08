"use client"
import { createContext, useContext, useEffect, useState } from "react"
import type { DemoRole } from "@/types/mock"

const STORAGE_KEY = "update_demo_role"
const DEFAULT_ROLE: DemoRole = "Админ"

interface DemoRoleContextValue {
  demoRole: DemoRole
  setDemoRole: (role: DemoRole) => void
}

const DemoRoleContext = createContext<DemoRoleContextValue>({
  demoRole: DEFAULT_ROLE,
  setDemoRole: () => {},
})

export function DemoRoleProvider({ children }: { children: React.ReactNode }) {
  const [demoRole, setDemoRoleState] = useState<DemoRole>(DEFAULT_ROLE)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as DemoRole | null
    if (stored) setDemoRoleState(stored)
  }, [])

  function setDemoRole(role: DemoRole) {
    setDemoRoleState(role)
    localStorage.setItem(STORAGE_KEY, role)
  }

  return (
    <DemoRoleContext.Provider value={{ demoRole, setDemoRole }}>
      {children}
    </DemoRoleContext.Provider>
  )
}

export function useDemoRole() {
  return useContext(DemoRoleContext)
}

export function canUpload(role: DemoRole) {
  return role === "Админ" || role === "Супер Едитор"
}
export function canApprove(role: DemoRole) {
  return role === "Админ" || role === "Супер Едитор"
}
export function canCreateCollection(role: DemoRole) {
  return role === "Админ" || role === "Супер Едитор"
}
export function canSharePortal(role: DemoRole) {
  return role === "Админ" || role === "Супер Едитор"
}
export function canAccessOffers(role: DemoRole) {
  return role === "Админ" || role === "Супер Едитор" || role === "Маркетинг"
}
export function canAccessBrands(role: DemoRole) {
  return role === "Админ" || role === "Супер Едитор" || role === "Маркетинг"
}
export function canManageUsers(role: DemoRole) {
  return role === "Админ"
}
