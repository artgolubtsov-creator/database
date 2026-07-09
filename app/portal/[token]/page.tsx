import { notFound } from "next/navigation"
import { getCollectionByToken, getAssetsByCollection } from "@/lib/mock-data"
import { getBrand } from "@/lib/brands"
import { Download, FileText, Video, Image, FileCode } from "lucide-react"
import type { AssetFormat } from "@/types/mock"

const FORMAT_ICONS: Record<AssetFormat, React.FC<{ size?: number; className?: string }>> = {
  IMAGE: Image,
  VIDEO: Video,
  PDF: FileText,
  TEMPLATE: FileCode,
}

export default async function PortalPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const collection = getCollectionByToken(token)
  if (!collection || collection.access !== "EXTERNAL") notFound()

  const brand = getBrand(collection.brandSlug)
  const assets = getAssetsByCollection(collection.id).filter((a) => a.status === "APPROVED")

  return (
    <div className="max-w-[1100px] mx-auto px-8 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <div
          className="inline-flex items-center justify-center w-12 h-12 rounded-2xl text-white font-bold text-lg mb-4"
          style={{ backgroundColor: brand?.accent }}
        >
          {brand?.name?.[0] ?? "?"}
        </div>
        <h1 className="text-2xl font-bold text-neutral-900">{brand?.name}</h1>
        <p className="text-neutral-500 mt-1">{collection.name}</p>
        <p className="text-sm text-neutral-400 mt-1 max-w-md mx-auto">{collection.description}</p>
      </div>

      {/* Asset grid */}
      {assets.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-200 bg-white py-16 text-center">
          <p className="text-sm font-medium text-neutral-700">No files are available yet.</p>
          <p className="mt-1 text-sm text-neutral-400">Ask your Yango contact for access to approved materials.</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-5">
          {assets.map((asset) => {
            const Icon = FORMAT_ICONS[asset.format]
            return (
              <div key={asset.id} className="bg-white rounded-2xl border border-neutral-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className="aspect-[4/3] bg-neutral-50 flex items-center justify-center">
                  <Icon size={32} className="text-neutral-200" />
                </div>
                <div className="p-4">
                  <p className="text-sm font-medium text-neutral-900 truncate mb-1">{asset.name}</p>
                  <p className="text-xs text-neutral-400 mb-4">{asset.size} · {asset.format}</p>
                  <button
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium border border-neutral-200 text-neutral-700 hover:bg-neutral-50 transition-colors"
                    style={{ borderColor: brand?.accent + "40" }}
                  >
                    <Download size={14} /> Download
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Footer */}
      <div className="text-center mt-12 pt-8 border-t border-neutral-100">
        <p className="text-xs text-neutral-400">
          Partner Portal · {assets.length} approved assets · Contact your Yango owner for support
        </p>
      </div>
    </div>
  )
}
