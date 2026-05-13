import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { EntryForm } from "@/components/EntryForm";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function EditEntryPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (session?.user.role !== "ADMIN") redirect("/dashboard");

  const { id } = await params;
  const entry = await prisma.entry.findUnique({ where: { id } });
  if (!entry) notFound();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar role={session.user.role} name={session.user.name} />
      <main className="flex-1 max-w-2xl mx-auto w-full px-6 py-8">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <Link href="/admin">
              <Button variant="ghost" size="sm"><ArrowLeft size={15} /> Back</Button>
            </Link>
          </div>
          <div>
            <h1 className="text-xl font-bold text-neutral-900">Edit Entry</h1>
            <p className="text-sm text-neutral-500 mt-0.5 truncate">{entry.task}</p>
          </div>
          <div className="bg-white rounded-2xl card-shadow p-7">
            <EntryForm
              mode="edit"
              entryId={entry.id}
              initialValues={{
                portfolio: entry.portfolio,
                project: entry.project,
                task: entry.task,
                folderLink: entry.folderLink ?? "",
                adminPanelLink: entry.adminPanelLink ?? "",
                titleId: entry.titleId ?? "",
                kpId: entry.kpId ?? "",
                figmaLink: entry.figmaLink ?? "",
                sourceLink: entry.sourceLink ?? "",
                description: entry.description ?? "",
              }}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
