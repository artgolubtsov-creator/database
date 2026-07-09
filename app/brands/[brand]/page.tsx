import { notFound } from "next/navigation"
import Link from "next/link"
import { getBrand } from "@/lib/brands"
import { getAssetsByBrand, getCollectionsByBrand } from "@/lib/mock-data"
import { AssetCard } from "@/components/AssetCard"
import { CollectionCard } from "@/components/CollectionCard"
import { ArrowRight } from "lucide-react"

export default async function BrandOverviewPage({
  params,
}: {
  params: Promise<{ brand: string }>
}) {
  const { brand } = await params
  const config = getBrand(brand)
  if (!config) notFound()

  const assets = getAssetsByBrand(config.slug)
  const collections = getCollectionsByBrand(config.slug)
  const recent = assets.filter((a) => a.status !== "ARCHIVED").slice(0, 6)

  const stats = {
    total: assets.length,
    approved: assets.filter((a) => a.status === "APPROVED").length,
    review: assets.filter((a) => a.status === "REVIEW").length,
    collections: collections.length,
  }

  return (
    <div className="px-8 py-8 flex flex-col gap-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">{config.name}</h1>
        <p className="text-sm text-neutral-500 mt-1">{config.description}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total assets", value: stats.total },
          { label: "Approved", value: stats.approved },
          { label: "Needs review", value: stats.review },
          { label: "Collections", value: stats.collections },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-xl border border-neutral-200 px-5 py-4">
            <p className="text-2xl font-bold text-neutral-900">{value}</p>
            <p className="text-xs text-neutral-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Recent Assets */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-neutral-900">Recent assets</h2>
          <Link
            href={`/brands/${brand}/assets`}
            className="flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-900 transition-colors"
          >
            View all <ArrowRight size={12} />
          </Link>
        </div>
        {recent.length === 0 ? (
          <div className="rounded-xl border border-dashed border-neutral-200 bg-white py-12 text-center">
            <p className="text-sm font-medium text-neutral-700">No assets yet</p>
            <p className="mt-1 text-sm text-neutral-400">This brand is ready for real asset metadata.</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {recent.map((asset) => (
              <AssetCard
                key={asset.id}
                asset={asset}
                href={`/brands/${brand}/assets/${asset.id}`}
              />
            ))}
          </div>
        )}
      </section>

      {/* Collections */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-neutral-900">Collections</h2>
          <Link
            href={`/brands/${brand}/collections`}
            className="flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-900 transition-colors"
          >
            View all <ArrowRight size={12} />
          </Link>
        </div>
        {collections.length === 0 ? (
          <div className="rounded-xl border border-dashed border-neutral-200 bg-white py-12 text-center">
            <p className="text-sm font-medium text-neutral-700">No collections yet</p>
            <p className="mt-1 text-sm text-neutral-400">Team-only and partner-ready sets will appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {collections.map((col) => (
              <CollectionCard
                key={col.id}
                collection={col}
                href={`/brands/${brand}/collections/${col.id}`}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
