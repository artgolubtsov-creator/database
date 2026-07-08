"use client"
import { CollectionCard } from "@/components/CollectionCard"
import type { MockCollection } from "@/types/mock"
import { useDemoRole, isExternalOnly, canCreateCollection } from "@/lib/demo-role-context"
import { Plus, Globe, FolderOpen, Copy, Check } from "lucide-react"
import { useState } from "react"

interface Props {
  collections: MockCollection[]
  brand: string
}

function ExternalPortalCard({ collection }: { collection: MockCollection }) {
  const [copied, setCopied] = useState(false)
  const portalUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/portal/${collection.token}`

  function copy() {
    navigator.clipboard.writeText(portalUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-white rounded-xl border border-green-200 p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center">
          <FolderOpen size={16} className="text-green-600" />
        </div>
        <div className="flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-full bg-green-50 text-green-700">
          <Globe size={10} /> External access
        </div>
      </div>
      <p className="text-sm font-semibold text-neutral-900 mb-1">{collection.name}</p>
      <p className="text-xs text-neutral-500 mb-3 line-clamp-2">{collection.description}</p>
      <p className="text-xs text-neutral-400 mb-3">{collection.assetIds.length} assets</p>
      <div className="flex items-center gap-2 bg-neutral-50 rounded-lg px-3 py-2 border border-neutral-200">
        <span className="text-[11px] text-neutral-500 font-mono truncate flex-1">/portal/{collection.token}</span>
        <button
          onClick={copy}
          className="shrink-0 text-neutral-400 hover:text-neutral-700 transition-colors"
          title="Copy link"
        >
          {copied ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
        </button>
      </div>
    </div>
  )
}

export function CollectionsClient({ collections, brand }: Props) {
  const { demoRole } = useDemoRole()
  const isExternal = isExternalOnly(demoRole)

  const external = collections.filter((c) => c.access === "EXTERNAL")
  const internal = collections.filter((c) => c.access === "INTERNAL")

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">Collections</h1>
          <p className="text-sm text-neutral-500 mt-1">
            {isExternal ? "Collections available to you via external access" : "Curated asset sets for sharing and internal use"}
          </p>
        </div>
        {canCreateCollection(demoRole) && (
          <button className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-800 transition-colors">
            <Plus size={14} /> New Collection
          </button>
        )}
      </div>

      {external.length > 0 && (
        <section className="mb-8">
          {!isExternal && (
            <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-3">External</h2>
          )}
          <div className="grid grid-cols-3 gap-4">
            {external.map((col) =>
              isExternal
                ? <ExternalPortalCard key={col.id} collection={col} />
                : <CollectionCard key={col.id} collection={col} href={`/brands/${brand}/collections/${col.id}`} />
            )}
          </div>
        </section>
      )}

      {!isExternal && internal.length > 0 && (
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
