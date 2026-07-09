import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { ROLE_LABELS } from "@/lib/roles";
import { Plus, Pencil } from "lucide-react";
import { DeactivateUserToggle } from "./DeactivateUserToggle";

export default async function UsersPage() {
  const session = await auth();
  if (session?.user.role !== "ADMIN") redirect("/dashboard");

  const users = await prisma.user.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-8">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-neutral-900">Users</h1>
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
                  <th className="px-5 py-3.5 text-xs font-medium text-neutral-400 uppercase tracking-wide">Active</th>
                  <th className="px-5 py-3.5 w-16"></th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-neutral-50 hover:bg-neutral-50 transition-colors">
                    <td className="px-5 py-3.5 text-neutral-900">{user.email}</td>
                    <td className="px-5 py-3.5 text-neutral-600">{user.name ?? "—"}</td>
                    <td className="px-5 py-3.5">
                      <Badge variant={user.role === "ADMIN" ? "blue" : "default"}>
                        {ROLE_LABELS[user.role] ?? user.role}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${user.isActive ? "text-emerald-600" : "text-neutral-400"}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${user.isActive ? "bg-emerald-500" : "bg-neutral-300"}`} />
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-neutral-400 text-xs hidden md:table-cell">{formatDate(user.createdAt)}</td>
                    <td className="px-5 py-3.5">
                      <DeactivateUserToggle userId={user.id} isActive={user.isActive} />
                    </td>
                    <td className="px-5 py-3.5">
                      <Link href={`/admin/users/${user.id}/edit`}>
                        <Button variant="ghost" size="sm"><Pencil size={13} /></Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && (
              <div className="py-16 text-center text-sm text-neutral-400">No users found</div>
            )}
          </div>
        </div>
      </main>
  );
}
