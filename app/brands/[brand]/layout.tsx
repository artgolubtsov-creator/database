import { auth } from "@/auth"
import { redirect } from "next/navigation"
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
  if (!BRAND_SLUGS.includes(brand as never)) redirect("/brands")

  return <>{children}</>
}
