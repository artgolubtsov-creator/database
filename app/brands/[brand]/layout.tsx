import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/Sidebar"
import { RoleSwitcher } from "@/components/RoleSwitcher"
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

  if (!BRAND_SLUGS.includes(brand as never)) {
    redirect("/")
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar brandSlug={brand} userName={session.user?.name} />
      <main className="flex-1 min-w-0 bg-[#fafafa]">
        {children}
      </main>
      <RoleSwitcher />
    </div>
  )
}
