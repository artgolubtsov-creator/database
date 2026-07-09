import { notFound } from "next/navigation"
import Link from "next/link"
import { getBrand } from "@/lib/brands"
import { getAssetById } from "@/lib/mock-data"
import { ChevronLeft, Clock, Tag } from "lucide-react"
import { FileText, Video, Image, FileCode } from "lucide-react"
import { AssetActions } from "./AssetActions"

const FORMAT_ICONS = { IMAGE: Image, VIDEO: Video, PDF: FileText, TEMPLATE: FileCode }
const STATUS_CLASS = {
  APPROVED: "status-approved",
  REVIEW: "status-review",
  DRAFT: "status-draft",
  ARCHIVED: "status-archived",
}

export default async function AssetDetailPage({
  params,
}: {
  params: Promise<{ brand: string; id: string }>
}) {
  const { brand, id } = await params
  const config = getBrand(brand)
  const asset = getAssetById(id)
  if (!config || !asset) notFound()

  const Icon = FORMAT_ICONS[asset.format]

  return (
    <div className="px-8 py-8">
      {/* Breadcrumb */}
      <Link
        href={`/brands/${brand}/assets`}
        className="flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-900 transition-colors mb-6"
      >
        <ChevronLeft size={14} /> Assets
      </Link>

      <div className="grid grid-cols-[1fr_320px] gap-8">
        {/* Left: preview */}
        <div>
          <div className="bg-white rounded-2xl border border-neutral-200 aspect-video flex items-center justify-center mb-4">
            <Icon size={48} className="text-neutral-200" />
          </div>
          {/* Notes */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-5">
            <h3 className="text-sm font-semibold text-neutral-900 mb-2">Notes</h3>
            <p className="text-sm text-neutral-400">No production notes have been added for this asset yet.</p>
          </div>
        </div>

        {/* Right: metadata */}
        <div className="flex flex-col gap-4">
          {/* Name + status */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-5">
            <h1 className="text-lg font-bold text-neutral-900 mb-2">{asset.name}</h1>
            <span className={`text-xs font-medium px-2 py-1 rounded ${STATUS_CLASS[asset.status]}`}>
              {asset.status}
            </span>
            <div className="mt-4 flex flex-col gap-2 text-sm text-neutral-600">
              {asset.dimensions && <div className="flex justify-between"><span className="text-neutral-400">Dimensions</span> {asset.dimensions}</div>}
              <div className="flex justify-between"><span className="text-neutral-400">Size</span> {asset.size}</div>
              <div className="flex justify-between"><span className="text-neutral-400">Format</span> {asset.format}</div>
              <div className="flex justify-between"><span className="text-neutral-400">Updated</span> {asset.updatedAt}</div>
              {asset.campaign && <div className="flex justify-between"><span className="text-neutral-400">Campaign</span> {asset.campaign}</div>}
            </div>
          </div>

          {/* Tags */}
          {asset.tags.length > 0 && (
            <div className="bg-white rounded-2xl border border-neutral-200 p-5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-500 mb-3">
                <Tag size={12} /> Tags
              </div>
              <div className="flex flex-wrap gap-1.5">
                {asset.tags.map((tag) => (
                  <span key={tag} className="text-xs bg-neutral-100 text-neutral-600 px-2 py-1 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Versions */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-500 mb-3">
              <Clock size={12} /> Version History
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-neutral-900">v{asset.versions}</span>
                <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded">Current</span>
              </div>
              <p className="text-[10px] text-neutral-400">{asset.updatedAt}</p>
              <p className="text-xs text-neutral-500 mt-0.5">Version history will be available after real asset tracking is connected.</p>
            </div>
          </div>

          <AssetActions status={asset.status} />
        </div>
      </div>
    </div>
  )
}
