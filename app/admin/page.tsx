import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { DeleteEntryButton } from "./DeleteEntryButton";

export default async function AdminPage() {
  const session = await auth();
  if (session?.user.role !== "ADMIN") redirect("/dashboard");

  const [entries, users] = await Promise.all([
    prisma.entry.findMany({ orderBy: { createdAt: "desc" }, take: 100 }),
    prisma.user.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar role={session.user.role} name={session.user.name} />
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8 flex flex-col gap-10">

        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-neutral-900">Entries</h2>
              <p className="text-sm text-neutral-500 mt-0.5">{entries.length} total</p>
            </div>
            <Link href="/admin/entries/new">
              <Button size="sm"><Plus size={15} /> New Entry</Button>
            </Link>
          </div>

          <div className="bg-white rounded-2xl card-shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-100 text-left">
                  <th className="px-5 py-3.5 text-xs font-medium text-neutral-400 uppercase tracking-wide">Portfolio / Project</th>
                  <th className="px-5 py-3.5 text-xs font-medium text-neutral-400 uppercase tracking-wide hidden md:table-cell">Task</th>
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
                    <td className="px-5 py-3.5 text-neutral-700 max-w-xs truncate hidden md:table-cell">{entry.task}</td>
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

        <section className="flex flex-col gap-4">
          <h2 className="text-xl font-bold text-neutral-900">Users</h2>
          <div className="bg-white rounded-2xl card-shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-100 text-left">
                  <th className="px-5 py-3.5 text-xs font-medium text-neutral-400 uppercase tracking-wide">Email</th>
                  <th className="px-5 py-3.5 text-xs font-medium text-neutral-400 uppercase tracking-wide">Name</th>
                  <th className="px-5 py-3.5 text-xs font-medium text-neutral-400 uppercase tracking-wide">Role</th>
                  <th className="px-5 py-3.5 text-xs font-medium text-neutral-400 uppercase tracking-wide hidden md:table-cell">Joined</th>
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
                    <td className="px-5 py-3.5 text-neutral-400 text-xs hidden md:table-cell">{formatDate(user.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

      </main>
    </div>
  );
}
