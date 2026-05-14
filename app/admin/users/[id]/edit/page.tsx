import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { UserForm } from "@/components/UserForm";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (session?.user.role !== "ADMIN") redirect("/dashboard");

  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, email: true, name: true, role: true, isActive: true },
  });
  if (!user) notFound();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar role={session.user.role} name={session.user.name} />
      <main className="flex-1 max-w-xl mx-auto w-full px-6 py-8">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <Link href="/admin/users">
              <Button variant="ghost" size="sm"><ArrowLeft size={15} /> Back</Button>
            </Link>
          </div>
          <div>
            <h1 className="text-xl font-bold text-neutral-900">Edit User</h1>
            <p className="text-sm text-neutral-500 mt-0.5 truncate">{user.email}</p>
          </div>
          <div className="bg-white rounded-2xl card-shadow p-7">
            <UserForm
              mode="edit"
              userId={user.id}
              initialValues={{
                name: user.name ?? "",
                role: user.role as "ADMIN" | "EDITOR" | "VIEWER",
                isActive: user.isActive,
              }}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
