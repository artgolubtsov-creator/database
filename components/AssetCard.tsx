import Link from "next/link"
import type { MockAsset } from "@/types/mock"
import { FileText, Video, Image, FileCode } from "lucide-react"

const FORMAT_ICONS = {
  IMAGE: Image,
  VIDEO: Video,
  PDF: FileText,
  TEMPLATE: FileCode,
}

const FORMAT_CLASS = {
  IMAGE: "format-image",
  VIDEO: "format-video",
  PDF: "format-pdf",
  TEMPLATE: "format-template",
}

const STATUS_CLASS = {
  APPROVED: "status-approved",
  REVIEW: "status-review",
  DRAFT: "status-draft",
  ARCHIVED: "status-archived",
}

interface AssetCardProps {
  asset: MockAsset
  href: string
}

export function AssetCard({ asset, href }: AssetCardProps) {
  const Icon = FORMAT_ICONS[asset.format]

  return (
    <Link
      href={href}
      className="group bg-white rounded-xl border border-neutral-200 overflow-hidden hover:border-neutral-300 hover:shadow-md transition-all"
    >
      {/* Thumbnail */}
      <div className="aspect-[4/3] bg-neutral-100 flex items-center justify-center relative">
        <Icon size={28} className="text-neutral-300" />
        {asset.versions > 1 && (
          <span className="absolute top-2 right-2 text-[10px] bg-white/90 text-neutral-500 px-1.5 py-0.5 rounded font-medium">
            v{asset.versions}
          </span>
        )}
      </div>
      {/* Info */}
      <div className="p-3">
        <p className="text-sm font-medium text-neutral-900 truncate mb-2">{asset.name}</p>
        <div className="flex items-center justify-between gap-2">
          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${FORMAT_CLASS[asset.format]}`}>
            {asset.format}
          </span>
          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${STATUS_CLASS[asset.status]}`}>
            {asset.status}
          </span>
        </div>
        <p className="text-[10px] text-neutral-400 mt-2">{asset.updatedAt}</p>
      </div>
    </Link>
  )
}
