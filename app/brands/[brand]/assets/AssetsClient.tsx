"use client"
import { useState } from "react"
import { AssetCard } from "@/components/AssetCard"
import type { MockAsset, AssetFormat, AssetStatus } from "@/types/mock"
import { Search } from "lucide-react"

const ALL_FORMATS: AssetFormat[] = ["IMAGE", "VIDEO", "PDF", "TEMPLATE"]
const ALL_STATUSES: AssetStatus[] = ["APPROVED", "REVIEW", "DRAFT", "ARCHIVED"]

export function AssetsClient({ assets, brandSlug }: { assets: MockAsset[]; brandSlug: string }) {
  const [search, setSearch] = useState("")
  const [format, setFormat] = useState<AssetFormat | "ALL">("ALL")
  const [status, setStatus] = useState<AssetStatus | "ALL">("ALL")

  const filtered = assets.filter((a) => {
    const matchSearch = a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
    const matchFormat = format === "ALL" || a.format === format
    const matchStatus = status === "ALL" || a.status === status
    return matchSearch && matchFormat && matchStatus
  })

  return (
    <div>
      {/* Filters */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search assets..."
            className="pl-8 pr-3 py-2 text-sm border border-neutral-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900 w-52"
          />
        </div>
        <select
          value={format}
          onChange={(e) => setFormat(e.target.value as AssetFormat | "ALL")}
          className="px-3 py-2 text-sm border border-neutral-200 rounded-lg bg-white focus:outline-none"
        >
          <option value="ALL">All Formats</option>
          {ALL_FORMATS.map((f) => <option key={f} value={f}>{f}</option>)}
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as AssetStatus | "ALL")}
          className="px-3 py-2 text-sm border border-neutral-200 rounded-lg bg-white focus:outline-none"
        >
          <option value="ALL">All Statuses</option>
          {ALL_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <span className="text-xs text-neutral-400 ml-auto">{filtered.length} assets</span>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-200 bg-white py-16 text-center">
          <p className="text-sm font-medium text-neutral-700">
            {assets.length === 0 ? "No assets yet" : "No matching assets"}
          </p>
          <p className="mt-1 text-sm text-neutral-400">
            {assets.length === 0
              ? "This brand is ready for real asset metadata."
              : "Clear search or filters to see more assets."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {filtered.map((asset) => (
            <AssetCard
              key={asset.id}
              asset={asset}
              href={`/brands/${brandSlug}/assets/${asset.id}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
