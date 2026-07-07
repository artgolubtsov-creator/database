import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { Plus, Pencil, ExternalLink } from "lucide-react";
import { DeleteBrandMaterialButton } from "./DeleteBrandMaterialButton";
import { canManageContent } from "@/lib/roles";

const CATEGORY_LABEL: Record<string, string> = {
  GUIDE: "Guide",
  LOGO: "Logo",
  PRESENTATION: "Presentation",
  ACTIVE_OFFER: "Active Offer",
};

export default async function AdminBrandMaterialsPage() {
  const session = await auth();
  const role = session?.user.role;
  if (!canManageContent(role)) redirect("/dashboard");

  const materials = await prisma.brandMaterial.findMany({
    orderBy: [{ category: "asc" }, { createdAt: "desc" }],
  });

  return (
    <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-8">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-neutral-900">Brand Materials</h1>
              <p className="text-sm text-neutral-500 mt-0.5">{materials.length} items</p>
            </div>
            <Link href="/admin/brand-materials/new">
              <Button size="sm"><Plus size={15} /> New Material</Button>
            </Link>
          </div>

          <div className="bg-white rounded-2xl card-shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-100 text-left">
                  <th className="px-5 py-3.5 text-xs font-medium text-neutral-400 uppercase tracking-wide">Title</th>
                  <th className="px-5 py-3.5 text-xs font-medium text-neutral-400 uppercase tracking-wide">Category</th>
                  <th className="px-5 py-3.5 text-xs font-medium text-neutral-400 uppercase tracking-wide hidden md:table-cell">Owner</th>
                  <th className="px-5 py-3.5 text-xs font-medium text-neutral-400 uppercase tracking-wide hidden lg:table-cell">Created</th>
                  <th className="px-5 py-3.5 w-24"></th>
                </tr>
              </thead>
              <tbody>
                {materials.map((m) => (
                  <tr key={m.id} className="border-b border-neutral-50 hover:bg-neutral-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium text-neutral-900">{m.title}</span>
                        {m.link && (
                          <a href={m.link} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline flex items-center gap-1">
                            <ExternalLink size={10} /> Link
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge variant={m.category === "ACTIVE_OFFER" ? "blue" : "default"}>
                        {CATEGORY_LABEL[m.category] ?? m.category}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-neutral-500 hidden md:table-cell">{m.owner ?? "—"}</td>
                    <td className="px-5 py-3.5 text-neutral-400 text-xs hidden lg:table-cell">{formatDate(m.createdAt)}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5 justify-end">
                        <Link href={`/admin/brand-materials/${m.id}/edit`}>
                          <Button variant="ghost" size="sm"><Pencil size={13} /></Button>
                        </Link>
                        <DeleteBrandMaterialButton id={m.id} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {materials.length === 0 && (
              <div className="py-16 text-center text-sm text-neutral-400">No brand materials yet</div>
            )}
          </div>
        </div>
      </main>
  );
}
