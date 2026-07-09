"use client"
import { CollectionCard } from "@/components/CollectionCard"
import type { MockCollection } from "@/types/mock"

interface Props {
  collections: MockCollection[]
  brand: string
}

export function CollectionsClient({ collections, brand }: Props) {
  const external = collections.filter((c) => c.access === "EXTERNAL")
  const internal = collections.filter((c) => c.access === "INTERNAL")

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">Collections</h1>
          <p className="text-sm text-neutral-500 mt-1">Team-only sets and partner-ready portal collections</p>
        </div>
      </div>

      {external.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-3">Partner-ready</h2>
          <div className="grid grid-cols-3 gap-4">
            {external.map((col) => (
              <CollectionCard key={col.id} collection={col} href={`/brands/${brand}/collections/${col.id}`} />
            ))}
          </div>
        </section>
      )}

      {internal.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-3">Team only</h2>
          <div className="grid grid-cols-3 gap-4">
            {internal.map((col) => (
              <CollectionCard key={col.id} collection={col} href={`/brands/${brand}/collections/${col.id}`} />
            ))}
          </div>
        </section>
      )}

      {collections.length === 0 && (
        <div className="rounded-xl border border-dashed border-neutral-200 bg-white py-16 text-center">
          <p className="text-sm font-medium text-neutral-700">No collections yet</p>
          <p className="mt-1 text-sm text-neutral-400">Create team-only or partner-ready sets after real assets are added.</p>
        </div>
      )}
    </div>
  )
}
