import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { UserForm } from "@/components/UserForm";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function NewUserPage() {
  const session = await auth();
  if (session?.user.role !== "ADMIN") redirect("/dashboard");

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
            <h1 className="text-xl font-bold text-neutral-900">New User</h1>
            <p className="text-sm text-neutral-500 mt-0.5">Create a new account</p>
          </div>
          <div className="bg-white rounded-2xl card-shadow p-7">
            <UserForm mode="create" />
          </div>
        </div>
      </main>
    </div>
  );
}
