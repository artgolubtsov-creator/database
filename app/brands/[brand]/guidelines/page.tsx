import { notFound } from "next/navigation"
import { getBrand } from "@/lib/brands"
import { MOCK_GUIDELINES } from "@/lib/mock-data"
import { Download, CheckCircle2, XCircle } from "lucide-react"

export default async function GuidelinesPage({ params }: { params: Promise<{ brand: string }> }) {
  const { brand } = await params
  const config = getBrand(brand)
  if (!config) notFound()

  const guide = MOCK_GUIDELINES[config.slug]

  return (
    <div className="px-8 py-8 flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-bold text-neutral-900">Brand Guidelines</h1>
        <p className="text-sm text-neutral-500 mt-1">{config.name} — official brand standards</p>
      </div>

      {/* Colors */}
      <section>
        <h2 className="text-base font-semibold text-neutral-900 mb-4">Colors</h2>
        <div className="flex gap-4 flex-wrap">
          {guide.colors.map((color) => (
            <div key={color.hex} className="flex flex-col items-center gap-2">
              <div
                className="w-20 h-20 rounded-xl border border-neutral-200 shadow-sm"
                style={{ backgroundColor: color.hex }}
              />
              <p className="text-xs font-medium text-neutral-900">{color.name}</p>
              <p className="text-[10px] text-neutral-400 font-mono">{color.hex}</p>
              {color.pantone && <p className="text-[10px] text-neutral-400">{color.pantone}</p>}
            </div>
          ))}
        </div>
      </section>

      {/* Typography */}
      <section>
        <h2 className="text-base font-semibold text-neutral-900 mb-4">Typography</h2>
        <div className="flex flex-col gap-4">
          {guide.fonts.map((font) => (
            <div key={font.name} className="bg-white rounded-xl border border-neutral-200 p-5">
              <div className="flex items-center gap-3 mb-3">
                <p className="text-sm font-semibold text-neutral-900">{font.name}</p>
                <div className="flex gap-1">
                  {font.variants.map((v) => (
                    <span key={v} className="text-[10px] bg-neutral-100 text-neutral-500 px-2 py-0.5 rounded">{v}</span>
                  ))}
                </div>
              </div>
              <p className="text-2xl font-medium text-neutral-900">{font.specimen}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Logos */}
      <section>
        <h2 className="text-base font-semibold text-neutral-900 mb-4">Logo Variants</h2>
        <div className="grid grid-cols-4 gap-4">
          {guide.logoVariants.map((logo) => (
            <div key={logo.name} className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
              <div className={`h-24 flex items-center justify-center ${logo.background === 'dark' ? 'bg-neutral-900' : 'bg-neutral-50'}`}>
                <span className={`text-xs font-bold ${logo.background === 'dark' ? 'text-white' : 'text-neutral-900'}`}>
                  {config.name}
                </span>
              </div>
              <div className="p-3 flex items-center justify-between">
                <p className="text-[11px] text-neutral-600">{logo.name}</p>
                <button className="text-neutral-400 hover:text-neutral-700 transition-colors">
                  <Download size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Do / Don't */}
      <section>
        <h2 className="text-base font-semibold text-neutral-900 mb-4">Usage Rules</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-green-50 rounded-xl p-5">
            <p className="text-sm font-semibold text-green-800 mb-3">Do</p>
            <ul className="flex flex-col gap-2">
              {guide.doList.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-green-700">
                  <CheckCircle2 size={14} className="shrink-0 mt-0.5" /> {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-red-50 rounded-xl p-5">
            <p className="text-sm font-semibold text-red-800 mb-3">Don&apos;t</p>
            <ul className="flex flex-col gap-2">
              {guide.dontList.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-red-700">
                  <XCircle size={14} className="shrink-0 mt-0.5" /> {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  )
}
