import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { Plus, Pencil, Trash2, ExternalLink, Upload } from "lucide-react";
import { DeleteEntryButton } from "./DeleteEntryButton";

const CATEGORY_LABEL: Record<string, string> = {
  GUIDE: "Guide",
  LOGO: "Logo",
  PRESENTATION: "Presentation",
  ACTIVE_OFFER: "Active Offer",
};

export default async function AdminPage() {
  const session = await auth();
  if (session?.user.role !== "ADMIN") redirect("/dashboard");

  const [entries, users, brandMaterials] = await Promise.all([
    prisma.entry.findMany({ orderBy: { createdAt: "desc" }, take: 100 }),
    prisma.user.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.brandMaterial.findMany({ orderBy: [{ category: "asc" }, { createdAt: "desc" }], take: 50 }),
  ]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar role={session.user.role} name={session.user.name} />
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8 flex flex-col gap-10">

        {/* Entries */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-neutral-900">Entries</h2>
              <p className="text-sm text-neutral-500 mt-0.5">{entries.length} total</p>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/admin/entries/import">
                <Button size="sm" variant="ghost"><Upload size={15} /> Import</Button>
              </Link>
              <Link href="/admin/entries/new">
                <Button size="sm"><Plus size={15} /> New Entry</Button>
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-2xl card-shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-100 text-left">
                  <th className="px-5 py-3.5 text-xs font-medium text-neutral-400 uppercase tracking-wide">Portfolio / Project</th>
                  <th className="px-5 py-3.5 text-xs font-medium text-neutral-400 uppercase tracking-wide hidden md:table-cell">Title Name</th>
                  <th className="px-5 py-3.5 text-xs font-medium text-neutral-400 uppercase tracking-wide hidden lg:table-cell">IDs</th>
                  <th className="px-5 py-3.5 text-xs font-medium text-neutral-400 uppercase tracking-wide hidden lg:table-cell">Created</th>
                  <th className="px-5 py-3.5 w-24"></th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr key={entry.id} className="border-b border-neutral-50 hover:bg-neutral-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex flex-col gap-1">
                        <Badge variant="blue" className="w-fit">{entry.portfolio}</Badge>
                        <span className="text-neutral-600 text-xs">{entry.project}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-neutral-700 max-w-xs truncate hidden md:table-cell">{entry.titleName}</td>
                    <td className="px-5 py-3.5 hidden lg:table-cell">
                      <div className="flex flex-col gap-0.5 text-xs font-mono text-neutral-500">
                        {entry.titleId && <span>{entry.titleId}</span>}
                        {entry.kpId && <span>{entry.kpId}</span>}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-neutral-400 text-xs hidden lg:table-cell">{formatDate(entry.createdAt)}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5 justify-end">
                        <Link href={`/admin/entries/${entry.id}/edit`}>
                          <Button variant="ghost" size="sm"><Pencil size={13} /></Button>
                        </Link>
                        <DeleteEntryButton id={entry.id} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {entries.length === 0 && (
              <div className="py-16 text-center text-sm text-neutral-400">No entries yet</div>
            )}
          </div>
        </section>

        {/* Users */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-neutral-900">Users</h2>
              <p className="text-sm text-neutral-500 mt-0.5">{users.length} accounts</p>
            </div>
            <Link href="/admin/users/new">
              <Button size="sm"><Plus size={15} /> New User</Button>
            </Link>
          </div>
          <div className="bg-white rounded-2xl card-shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-100 text-left">
                  <th className="px-5 py-3.5 text-xs font-medium text-neutral-400 uppercase tracking-wide">Email</th>
                  <th className="px-5 py-3.5 text-xs font-medium text-neutral-400 uppercase tracking-wide">Name</th>
                  <th className="px-5 py-3.5 text-xs font-medium text-neutral-400 uppercase tracking-wide">Role</th>
                  <th className="px-5 py-3.5 text-xs font-medium text-neutral-400 uppercase tracking-wide">Status</th>
                  <th className="px-5 py-3.5 text-xs font-medium text-neutral-400 uppercase tracking-wide hidden md:table-cell">Joined</th>
                  <th className="px-5 py-3.5 w-16"></th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-neutral-50 hover:bg-neutral-50 transition-colors">
                    <td className="px-5 py-3.5 text-neutral-900">{user.email}</td>
                    <td className="px-5 py-3.5 text-neutral-600">{user.name ?? "—"}</td>
                    <td className="px-5 py-3.5">
                      <Badge variant={user.role === "ADMIN" ? "blue" : "default"}>{user.role}</Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${user.isActive ? "text-emerald-600" : "text-neutral-400"}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${user.isActive ? "bg-emerald-500" : "bg-neutral-300"}`} />
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-neutral-400 text-xs hidden md:table-cell">{formatDate(user.createdAt)}</td>
                    <td className="px-5 py-3.5">
                      <Link href={`/admin/users/${user.id}/edit`}>
                        <Button variant="ghost" size="sm"><Pencil size={13} /></Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Brand Materials */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-neutral-900">Brand Materials</h2>
              <p className="text-sm text-neutral-500 mt-0.5">{brandMaterials.length} items</p>
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
                  <th className="px-5 py-3.5 w-24"></th>
                </tr>
              </thead>
              <tbody>
                {brandMaterials.map((m) => (
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
                    <td className="px-5 py-3.5">
                      <Link href={`/admin/brand-materials/${m.id}/edit`}>
                        <Button variant="ghost" size="sm"><Pencil size={13} /></Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {brandMaterials.length === 0 && (
              <div className="py-10 text-center text-sm text-neutral-400">No brand materials yet</div>
            )}
          </div>
        </section>

      </main>
    </div>
  );
}
