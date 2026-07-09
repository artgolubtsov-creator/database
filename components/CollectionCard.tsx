import Link from "next/link"
import type { MockCollection } from "@/types/mock"
import { Lock, Globe, FolderOpen } from "lucide-react"

interface CollectionCardProps {
  collection: MockCollection
  href: string
}

export function CollectionCard({ collection, href }: CollectionCardProps) {
  const isPartnerReady = collection.access === "EXTERNAL"

  return (
    <Link
      href={href}
      className="group bg-white rounded-xl border border-neutral-200 p-4 hover:border-neutral-300 hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-9 h-9 rounded-lg bg-neutral-100 flex items-center justify-center">
          <FolderOpen size={16} className="text-neutral-400" />
        </div>
        <div className={`flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-full ${
          isPartnerReady
            ? "bg-green-50 text-green-700"
            : "bg-neutral-100 text-neutral-500"
        }`}>
          {isPartnerReady ? <Globe size={10} /> : <Lock size={10} />}
          {isPartnerReady ? "Partner portal" : "Team only"}
        </div>
      </div>
      <p className="text-sm font-semibold text-neutral-900 mb-1">{collection.name}</p>
      <p className="text-xs text-neutral-500 mb-3 line-clamp-2">{collection.description}</p>
      <p className="text-xs text-neutral-400">{collection.assetIds.length} assets</p>
    </Link>
  )
}
