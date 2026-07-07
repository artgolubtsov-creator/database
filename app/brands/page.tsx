import Link from "next/link"
import { BRANDS } from "@/lib/brands"
import { getAssetsByBrand } from "@/lib/mock-data"

export default function BrandsPage() {
  return (
    <div className="px-8 py-8">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-neutral-900">Brands</h1>
        <p className="text-sm text-neutral-500 mt-1">Select a brand to browse and manage assets</p>
      </div>
      <div className="grid grid-cols-2 gap-5 max-w-3xl">
        {BRANDS.map((brand) => {
          const assets = getAssetsByBrand(brand.slug)
          const approvedCount = assets.filter((a) => a.status === "APPROVED").length
          return (
            <Link
              key={brand.slug}
              href={`/brands/${brand.slug}`}
              className="group bg-white rounded-2xl card-shadow hover:card-shadow-hover transition-all overflow-hidden border border-neutral-100"
            >
              <div className="h-2 w-full" style={{ backgroundColor: brand.accent }} />
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                    style={{ backgroundColor: brand.accent + "18" }}
                  >
                    {brand.emoji}
                  </div>
                  <span className="text-xs font-medium text-neutral-400 bg-neutral-100 px-2 py-1 rounded-full">
                    {assets.length} assets
                  </span>
                </div>
                <h2 className="text-lg font-bold text-neutral-900 mb-1 group-hover:text-neutral-700 transition-colors">
                  {brand.name}
                </h2>
                <p className="text-sm text-neutral-500 mb-4">{brand.description}</p>
                <div className="flex items-center gap-4 text-xs text-neutral-400">
                  <span>{approvedCount} approved</span>
                  <span>{assets.filter((a) => a.status === "REVIEW").length} in review</span>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
