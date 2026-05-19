import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { EntryForm } from "@/components/EntryForm";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { canManageContent } from "@/lib/roles";

export default async function NewEntryPage() {
  const session = await auth();
  const role = session?.user.role;
  if (!canManageContent(role)) redirect("/dashboard");

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar role={session!.user.role} name={session!.user.name} />
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-8">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <Link href="/admin">
              <Button variant="ghost" size="sm"><ArrowLeft size={15} /> Back</Button>
            </Link>
          </div>
          <div>
            <h1 className="text-xl font-bold text-neutral-900">New Entry</h1>
            <p className="text-sm text-neutral-500 mt-0.5">Add a new content entry to the hub</p>
          </div>
          <div className="bg-white rounded-2xl card-shadow p-7">
            <EntryForm mode="create" />
          </div>
        </div>
      </main>
    </div>
  );
}
