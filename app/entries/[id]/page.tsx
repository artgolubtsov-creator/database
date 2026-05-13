import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDate, isValidUrl } from "@/lib/utils";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Frame, Folder, Monitor, Pencil } from "lucide-react";

interface LinkRowProps { label: string; href: string | null | undefined; icon: React.ReactNode }

function LinkRow({ label, href, icon }: LinkRowProps) {
  if (!isValidUrl(href)) return null;
  return (
    <a href={href!} target="_blank" rel="noopener noreferrer"
      className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors">
      {icon}
      <span>{label}</span>
      <ExternalLink size={12} className="text-neutral-400" />
    </a>
  );
}

function FieldRow({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-neutral-400 font-medium uppercase tracking-wide">{label}</span>
      <span className="text-sm text-neutral-900 font-mono">{value}</span>
    </div>
  );
}

export default async function EntryPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const { id } = await params;
  const entry = await prisma.entry.findUnique({ where: { id } });
  if (!entry) notFound();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar role={session!.user.role} name={session!.user.name} />
      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-8">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft size={15} /> Back
              </Button>
            </Link>
            {session!.user.role === "ADMIN" && (
              <Link href={`/admin/entries/${entry.id}/edit`}>
                <Button variant="secondary" size="sm">
                  <Pencil size={13} /> Edit
                </Button>
              </Link>
            )}
          </div>

          <div className="bg-white rounded-2xl card-shadow p-7 flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-2">
                <Badge variant="blue">{entry.portfolio}</Badge>
                <Badge>{entry.project}</Badge>
              </div>
              <h1 className="text-xl font-bold text-neutral-900 leading-snug">{entry.task}</h1>
            </div>

            {(entry.titleId || entry.kpId) && (
              <div className="grid grid-cols-2 gap-4 p-4 bg-neutral-50 rounded-xl">
                <FieldRow label="Title ID" value={entry.titleId} />
                <FieldRow label="KP ID" value={entry.kpId} />
              </div>
            )}

            {entry.description && (
              <div className="flex flex-col gap-1.5">
                <span className="text-xs text-neutral-400 font-medium uppercase tracking-wide">Description</span>
                <p className="text-sm text-neutral-700 leading-relaxed whitespace-pre-wrap">{entry.description}</p>
              </div>
            )}

            <div className="flex flex-col gap-2.5 pt-2 border-t border-neutral-100">
              <span className="text-xs text-neutral-400 font-medium uppercase tracking-wide">Links</span>
              <div className="flex flex-col gap-2">
                <LinkRow label="Figma" href={entry.figmaLink} icon={<Frame size={15} className="text-violet-500" />} />
                <LinkRow label="Source" href={entry.sourceLink} icon={<ExternalLink size={15} className="text-blue-500" />} />
                <LinkRow label="Folder" href={entry.folderLink} icon={<Folder size={15} className="text-amber-500" />} />
                <LinkRow label="Admin Panel" href={entry.adminPanelLink} icon={<Monitor size={15} className="text-emerald-500" />} />
              </div>
            </div>

            <div className="flex gap-6 text-xs text-neutral-400 pt-2 border-t border-neutral-100">
              <span>Created {formatDate(entry.createdAt)}</span>
              <span>Updated {formatDate(entry.updatedAt)}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
