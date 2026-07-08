import { notFound } from "next/navigation"
import { getBrand } from "@/lib/brands"
import { getCollectionsByBrand } from "@/lib/mock-data"
import { CollectionsClient } from "./CollectionsClient"

export default async function CollectionsPage({ params }: { params: Promise<{ brand: string }> }) {
  const { brand } = await params
  const config = getBrand(brand)
  if (!config) notFound()

  const collections = getCollectionsByBrand(config.slug)

  return (
    <div className="px-8 py-8">
      <CollectionsClient collections={collections} brand={brand} />
    </div>
  )
}
