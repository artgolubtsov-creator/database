import { notFound } from "next/navigation"
import { getBrand } from "@/lib/brands"
import { getAssetsByBrand } from "@/lib/mock-data"
import { AssetsClient } from "./AssetsClient"

export default async function AssetsPage({ params }: { params: Promise<{ brand: string }> }) {
  const { brand } = await params
  const config = getBrand(brand)
  if (!config) notFound()

  const assets = getAssetsByBrand(config.slug)

  return (
    <div className="px-8 py-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-neutral-900">Assets</h1>
        <p className="text-sm text-neutral-500 mt-1">{config.name} — all brand assets</p>
      </div>
      <AssetsClient assets={assets} brandSlug={brand} />
    </div>
  )
}
