import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/Navbar";
import { ExternalLink, Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

const CATEGORY_LABEL: Record<string, string> = {
  GUIDE: "Guides",
  LOGO: "Logos",
  PRESENTATION: "Presentations",
  ACTIVE_OFFER: "Active Offer",
};

const CATEGORY_ORDER = ["ACTIVE_OFFER", "GUIDE", "PRESENTATION", "LOGO"];

function formatUpdatedAt(date: Date): string {
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export default async function BrandMaterialsPage() {
  const session = await auth();
  const role = session!.user.role;
  const canEdit = role === "ADMIN" || role === "EDITOR";

  const materials = await prisma.brandMaterial.findMany({
    where: { isPublic: true },
    orderBy: [{ category: "asc" }, { updatedAt: "desc" }],
  });

  const grouped = CATEGORY_ORDER.reduce<Record<string, typeof materials>>((acc, cat) => {
    acc[cat] = materials.filter((m) => m.category === cat);
    return acc;
  }, {});

  const activeOffers = grouped["ACTIVE_OFFER"] ?? [];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar role={role} name={session!.user.name} />
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-8 flex flex-col gap-10">

        {/* Active Offer — table */}
        {activeOffers.length > 0 && (
          <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-neutral-900">Active Offer</h2>
              {canEdit && (
                <Link href="/brand-materials/new">
                  <Button size="sm"><Plus size={14} /> Add</Button>
                </Link>
              )}
            </div>
            <div className="bg-white rounded-2xl card-shadow overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-100 text-left">
                    <th className="px-5 py-3.5 text-xs font-medium text-neutral-400 uppercase tracking-wide">Title</th>
                    <th className="px-5 py-3.5 text-xs font-medium text-neutral-400 uppercase tracking-wide hidden md:table-cell">Territory</th>
                    <th className="px-5 py-3.5 text-xs font-medium text-neutral-400 uppercase tracking-wide hidden lg:table-cell">Description</th>
                    <th className="px-5 py-3.5 text-xs font-medium text-neutral-400 uppercase tracking-wide">Updated</th>
                    <th className="px-5 py-3.5 w-20"></th>
                  </tr>
                </thead>
                <tbody>
                  {activeOffers.map((m) => (
                    <tr key={m.id} className="border-b border-neutral-50 hover:bg-neutral-50 transition-colors">
                      <td className="px-5 py-3.5 font-medium text-neutral-900">{m.title}</td>
                      <td className="px-5 py-3.5 text-neutral-500 hidden md:table-cell">{m.owner ?? "—"}</td>
                      <td className="px-5 py-3.5 text-neutral-500 max-w-xs truncate hidden lg:table-cell">{m.description ?? "—"}</td>
                      <td className="px-5 py-3.5 text-xs text-neutral-400 whitespace-nowrap">{formatUpdatedAt(m.updatedAt)}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1 justify-end">
                          {m.link && (
                            <a href={m.link} target="_blank" rel="noopener noreferrer"
                              className="inline-flex items-center p-1.5 text-neutral-400 hover:text-blue-500 transition-colors">
                              <ExternalLink size={13} />
                            </a>
                          )}
                          {canEdit && (
                            <Link href={`/brand-materials/${m.id}/edit`}>
                              <button className="p-1.5 text-neutral-400 hover:text-neutral-700 transition-colors">
                                <Pencil size={13} />
                              </button>
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activeOffers.length === 0 && canEdit && (
          <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-neutral-900">Active Offer</h2>
              <Link href="/brand-materials/new">
                <Button size="sm"><Plus size={14} /> Add</Button>
              </Link>
            </div>
            <div className="bg-white rounded-2xl card-shadow py-10 text-center text-sm text-neutral-400">No active offer yet</div>
          </section>
        )}

        {/* Other categories */}
        {CATEGORY_ORDER.filter((cat) => cat !== "ACTIVE_OFFER" && grouped[cat]?.length > 0).map((cat) => (
          <section key={cat} className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-neutral-900">{CATEGORY_LABEL[cat]}</h2>
              {canEdit && (
                <Link href="/brand-materials/new">
                  <Button size="sm" variant="ghost"><Plus size={14} /> Add</Button>
                </Link>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {grouped[cat].map((m) => (
                <div key={m.id} className="bg-white rounded-2xl card-shadow p-5 flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-col gap-1 min-w-0">
                      <span className="font-semibold text-neutral-900 text-sm">{m.title}</span>
                      <div className="flex items-center gap-2">
                        {m.owner && <span className="text-xs text-neutral-400">{m.owner}</span>}
                        <span className="text-xs text-neutral-300">· {formatUpdatedAt(m.updatedAt)}</span>
                      </div>
                    </div>
                    {canEdit && (
                      <Link href={`/brand-materials/${m.id}/edit`} className="shrink-0 text-neutral-300 hover:text-neutral-500 transition-colors">
                        <Pencil size={13} />
                      </Link>
                    )}
                  </div>
                  {m.description && <p className="text-sm text-neutral-500 leading-relaxed">{m.description}</p>}
                  {m.link && (
                    <a href={m.link} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium mt-auto">
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
            {canEdit && (
              <Link href="/brand-materials/new">
                <Button size="sm"><Plus size={14} /> Add first material</Button>
              </Link>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
