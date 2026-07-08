"use client"
import { CollectionCard } from "@/components/CollectionCard"
import type { MockCollection } from "@/types/mock"
import { useDemoRole, canCreateCollection } from "@/lib/demo-role-context"
import { Plus } from "lucide-react"

interface Props {
  collections: MockCollection[]
  brand: string
}

export function CollectionsClient({ collections, brand }: Props) {
  const { demoRole } = useDemoRole()

  const external = collections.filter((c) => c.access === "EXTERNAL")
  const internal = collections.filter((c) => c.access === "INTERNAL")

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">Collections</h1>
          <p className="text-sm text-neutral-500 mt-1">Curated asset sets for sharing and internal use</p>
        </div>
        {canCreateCollection(demoRole) && (
          <button className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-800 transition-colors">
            <Plus size={14} /> New Collection
          </button>
        )}
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
