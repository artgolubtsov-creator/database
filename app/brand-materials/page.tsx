import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/Navbar";
import { ExternalLink } from "lucide-react";

const CATEGORY_LABEL: Record<string, string> = {
  GUIDE: "Guides",
  LOGO: "Logos",
  PRESENTATION: "Presentations",
  ACTIVE_OFFER: "Active Offer",
};

const CATEGORY_ORDER = ["ACTIVE_OFFER", "GUIDE", "PRESENTATION", "LOGO"];

export default async function BrandMaterialsPage() {
  const session = await auth();

  const materials = await prisma.brandMaterial.findMany({
    where: { isPublic: true },
    orderBy: [{ category: "asc" }, { createdAt: "desc" }],
  });

  const grouped = CATEGORY_ORDER.reduce<Record<string, typeof materials>>((acc, cat) => {
    acc[cat] = materials.filter((m) => m.category === cat);
    return acc;
  }, {});

  const activeOffer = grouped["ACTIVE_OFFER"]?.[0];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar role={session!.user.role} name={session!.user.name} />
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-8 flex flex-col gap-10">

        {activeOffer && (
          <section className="bg-neutral-900 rounded-2xl p-8 text-white flex flex-col gap-4">
            <div className="text-xs font-semibold uppercase tracking-widest text-neutral-400">Current Active Offer</div>
            <h2 className="text-2xl font-bold">{activeOffer.title}</h2>
            {activeOffer.description && (
              <p className="text-neutral-300 text-sm leading-relaxed max-w-2xl">{activeOffer.description}</p>
            )}
            <div className="flex items-center gap-4 mt-2">
              {activeOffer.owner && (
                <span className="text-sm text-neutral-400">Owner: <span className="text-neutral-200">{activeOffer.owner}</span></span>
              )}
              {activeOffer.link && (
                <a
                  href={activeOffer.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-white bg-neutral-700 hover:bg-neutral-600 px-4 py-2 rounded-xl transition-colors"
                >
                  <ExternalLink size={14} /> Open
                </a>
              )}
            </div>
          </section>
        )}

        {CATEGORY_ORDER.filter((cat) => cat !== "ACTIVE_OFFER" && grouped[cat]?.length > 0).map((cat) => (
          <section key={cat} className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold text-neutral-900">{CATEGORY_LABEL[cat]}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {grouped[cat].map((m) => (
                <div key={m.id} className="bg-white rounded-2xl card-shadow p-5 flex flex-col gap-3">
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold text-neutral-900 text-sm">{m.title}</span>
                    {m.owner && <span className="text-xs text-neutral-400">{m.owner}</span>}
                  </div>
                  {m.description && (
                    <p className="text-sm text-neutral-500 leading-relaxed">{m.description}</p>
                  )}
                  {m.link && (
                    <a
                      href={m.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium mt-auto"
                    >
                      <ExternalLink size={13} /> Open
                    </a>
                  )}
                </div>
              ))}
            </div>
          </section>
        ))}

        {materials.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
            <p className="text-sm font-medium text-neutral-700">No brand materials yet</p>
            <p className="text-sm text-neutral-400">Check back later</p>
          </div>
        )}
      </main>
    </div>
  );
}
