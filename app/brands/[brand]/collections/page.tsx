import { notFound } from "next/navigation"
import { getBrand } from "@/lib/brands"
import { getCollectionsByBrand } from "@/lib/mock-data"
import { CollectionCard } from "@/components/CollectionCard"

export default async function CollectionsPage({ params }: { params: Promise<{ brand: string }> }) {
  const { brand } = await params
  const config = getBrand(brand)
  if (!config) notFound()

  const collections = getCollectionsByBrand(config.slug)
  const external = collections.filter((c) => c.access === "EXTERNAL")
  const internal = collections.filter((c) => c.access === "INTERNAL")

  return (
    <div className="px-8 py-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-neutral-900">Collections</h1>
        <p className="text-sm text-neutral-500 mt-1">Curated asset sets for sharing and internal use</p>
      </div>

      {external.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-3">External</h2>
          <div className="grid grid-cols-3 gap-4">
            {external.map((col) => (
              <CollectionCard key={col.id} collection={col} href={`/brands/${brand}/collections/${col.id}`} />
            ))}
          </div>
        </section>
      )}

      {internal.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-3">Internal</h2>
          <div className="grid grid-cols-3 gap-4">
            {internal.map((col) => (
              <CollectionCard key={col.id} collection={col} href={`/brands/${brand}/collections/${col.id}`} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
