import { notFound } from "next/navigation"
import Link from "next/link"
import { getBrand } from "@/lib/brands"
import { getCollectionById, getAssetsByCollection } from "@/lib/mock-data"
import { AssetCard } from "@/components/AssetCard"
import { ChevronLeft, Globe, Lock } from "lucide-react"
import { ShareButton } from "./ShareButton"

export default async function CollectionDetailPage({
  params,
}: {
  params: Promise<{ brand: string; id: string }>
}) {
  const { brand, id } = await params
  const config = getBrand(brand)
  const collection = getCollectionById(id)
  if (!config || !collection) notFound()

  const assets = getAssetsByCollection(id)

  return (
    <div className="px-8 py-8">
      <Link
        href={`/brands/${brand}/collections`}
        className="flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-900 transition-colors mb-6"
      >
        <ChevronLeft size={14} /> Collections
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-xl font-bold text-neutral-900">{collection.name}</h1>
            <span className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
              collection.access === "EXTERNAL"
                ? "bg-green-50 text-green-700"
                : "bg-neutral-100 text-neutral-500"
            }`}>
              {collection.access === "EXTERNAL" ? <Globe size={10} /> : <Lock size={10} />}
              {collection.access}
            </span>
          </div>
          <p className="text-sm text-neutral-500">{collection.description}</p>
        </div>
        {collection.access === "EXTERNAL" && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-neutral-100 rounded-lg px-3 py-2">
              <span className="text-xs text-neutral-500 font-mono">/portal/{collection.token}</span>
            </div>
            <ShareButton token={collection.token} />
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {assets.map((asset) => (
          <AssetCard
            key={asset.id}
            asset={asset}
            href={`/brands/${brand}/assets/${asset.id}`}
          />
        ))}
      </div>
    </div>
  )
}
