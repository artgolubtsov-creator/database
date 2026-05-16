import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDate, isValidUrl } from "@/lib/utils";
import Link from "next/link";
import { ExternalLink, Frame, Folder, Monitor, Pencil } from "lucide-react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CopyLinkButton } from "@/components/CopyLinkButton";

const CONTENT_TYPE_LABELS: Record<string, string> = {
  EXCLUSIVE: "Exclusive",
  MOVIES: "Movies",
  SERIES: "Series",
  ORIGINAL: "Original",
};

const MATERIAL_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  ADDED:             { label: "Added",              color: "bg-emerald-100 text-emerald-700" },
  NOT_RECEIVED_YET:  { label: "Not Received Yet",   color: "bg-amber-100 text-amber-700" },
  NOT_REQUIRED:      { label: "Not Required",        color: "bg-neutral-100 text-neutral-500" },
  REQUEST_FROM_OTT:  { label: "Request From OTT",   color: "bg-blue-100 text-blue-700" },
};

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
      <span className="text-sm text-neutral-900">{value}</span>
    </div>
  );
}

function TextRow({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs text-neutral-400 font-medium uppercase tracking-wide">{label}</span>
      <p className="text-sm text-neutral-700 leading-relaxed whitespace-pre-wrap">{value}</p>
    </div>
  );
}

function MaterialStatusBadge({ status }: { status: string | null | undefined }) {
  if (!status) return <span className="text-xs text-neutral-300">—</span>;
  const s = MATERIAL_STATUS_LABELS[status];
  if (!s) return <span className="text-xs text-neutral-500">{status}</span>;
  return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.color}`}>{s.label}</span>;
}

const HIGHLIGHT_ROWS = [
  { field: "mainPosterStatus" as const,       label: "Main Poster" },
  { field: "characterPostersStatus" as const, label: "Character Posters" },
  { field: "trailerStatus" as const,          label: "Trailer" },
  { field: "teaserStatus" as const,           label: "Teaser" },
  { field: "episodesStatus" as const,         label: "Episodes" },
];

export default async function EntryPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const { id } = await params;
  const entry = await prisma.entry.findUnique({ where: { id } });
  if (!entry) notFound();

  const hasArabic = entry.arabicTitle || entry.arabicDescription || entry.arabicShortCopy || entry.arabicMarketingCopy || entry.arabicNotes;
  const hasMeta = entry.rightholder || entry.year || entry.restrictionAge || entry.genres || entry.countries;
  const hasHighlights = HIGHLIGHT_ROWS.some(r => entry[r.field]) || entry.highlightsNotes;
  const hasLinks = [entry.figmaLink, entry.sourceLink, entry.folderLink, entry.adminPanelLink,
                    entry.performanceCopiesLink, entry.digitalCopiesLink, entry.copyDeckLink].some(isValidUrl);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar role={session!.user.role} name={session!.user.name} />
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-8">
        <div className="flex flex-col gap-6">
          {/* Top bar */}
          <div className="flex items-center justify-between">
            <Breadcrumbs items={[
              { label: "Dashboard", href: "/dashboard" },
              { label: entry.titleName },
            ]} />
            <div className="flex items-center gap-2">
              <CopyLinkButton shareToken={entry.shareToken} />
              {(session!.user.role === "ADMIN" || session!.user.role === "EDITOR") && (
                <Link href={`/admin/entries/${entry.id}/edit`}>
                  <Button variant="secondary" size="sm"><Pencil size={13} /> Edit</Button>
                </Link>
              )}
            </div>
          </div>

          {/* Two-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_272px] gap-6 items-start">

            {/* ── Left column ── */}
            <div className="flex flex-col gap-6">

              {/* Header */}
              <div className="bg-white rounded-2xl card-shadow p-7 flex flex-col gap-6">
                <div className="flex flex-col gap-3">
                  <div className="flex flex-wrap gap-2">
                    {entry.contentType && (
                      <Badge variant="blue">{CONTENT_TYPE_LABELS[entry.contentType] ?? entry.contentType}</Badge>
                    )}
                    <Badge>{entry.project}</Badge>
                  </div>
                  <h1 className="text-xl font-bold text-neutral-900 leading-snug">{entry.titleName}</h1>
                </div>

                {(entry.titleId || entry.kpId) && (
                  <div className="grid grid-cols-2 gap-4 p-4 bg-neutral-50 rounded-xl">
                    <FieldRow label="Title ID" value={entry.titleId} />
                    <FieldRow label="KP ID" value={entry.kpId} />
                  </div>
                )}

                {entry.description && <TextRow label="Description" value={entry.description} />}

                <div className="flex gap-6 text-xs text-neutral-400 pt-2 border-t border-neutral-100">
                  <span>Created {formatDate(entry.createdAt)}</span>
                  <span>Updated {formatDate(entry.updatedAt)}</span>
                </div>
              </div>

              {/* Links */}
              {hasLinks && (
                <div className="bg-white rounded-2xl card-shadow p-7 flex flex-col gap-4">
                  <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide">Links</h2>
                  <div className="flex flex-col gap-2.5">
                    <LinkRow label="Figma" href={entry.figmaLink} icon={<Frame size={15} className="text-violet-500" />} />
                    <LinkRow label="Source" href={entry.sourceLink} icon={<ExternalLink size={15} className="text-blue-500" />} />
                    <LinkRow label="Folder" href={entry.folderLink} icon={<Folder size={15} className="text-amber-500" />} />
                    <LinkRow label="Admin Panel" href={entry.adminPanelLink} icon={<Monitor size={15} className="text-emerald-500" />} />
                    <LinkRow label="Performance Copies" href={entry.performanceCopiesLink} icon={<ExternalLink size={15} className="text-rose-500" />} />
                    <LinkRow label="Digital Copies" href={entry.digitalCopiesLink} icon={<ExternalLink size={15} className="text-indigo-500" />} />
                    <LinkRow label="Copy Deck" href={entry.copyDeckLink} icon={<ExternalLink size={15} className="text-orange-500" />} />
                  </div>
                </div>
              )}

              {/* Metadata */}
              {hasMeta && (
                <div className="bg-white rounded-2xl card-shadow p-7 flex flex-col gap-4">
                  <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide">Title Metadata</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <FieldRow label="Rightholder" value={entry.rightholder} />
                    <FieldRow label="Year" value={entry.year?.toString()} />
                    <FieldRow label="Age Restriction" value={entry.restrictionAge} />
                    <FieldRow label="Genres" value={entry.genres} />
                    <FieldRow label="Countries" value={entry.countries} />
                  </div>
                </div>
              )}

              {/* Arabic Texts */}
              {hasArabic && (
                <div className="bg-white rounded-2xl card-shadow p-7 flex flex-col gap-4" dir="rtl">
                  <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide" dir="ltr">Arabic Texts</h2>
                  <FieldRow label="عنوان" value={entry.arabicTitle} />
                  <TextRow label="وصف" value={entry.arabicDescription} />
                  <TextRow label="نسخة قصيرة" value={entry.arabicShortCopy} />
                  <TextRow label="نسخة تسويقية" value={entry.arabicMarketingCopy} />
                  <TextRow label="ملاحظات" value={entry.arabicNotes} />
                </div>
              )}
            </div>

            {/* ── Right sidebar ── */}
            <div className="lg:sticky lg:top-6 flex flex-col gap-4">
              <div className="bg-white rounded-2xl card-shadow p-5 flex flex-col gap-4">
                <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">Materials</h2>

                {/* Highlight statuses */}
                <div className="flex flex-col divide-y divide-neutral-50">
                  {HIGHLIGHT_ROWS.map(({ field, label }) => (
                    <div key={field} className="flex items-center justify-between py-2.5 gap-2">
                      <span className="text-sm text-neutral-600">{label}</span>
                      <MaterialStatusBadge status={entry[field]} />
                    </div>
                  ))}
                </div>
                {entry.highlightsNotes && (
                  <p className="text-xs text-neutral-500 leading-relaxed">{entry.highlightsNotes}</p>
                )}

                {/* Link availability */}
                <div className="border-t border-neutral-100 pt-4 flex flex-col gap-2">
                  <span className="text-xs font-medium text-neutral-400 uppercase tracking-wide">Links</span>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    {([
                      { label: "Figma",     val: entry.figmaLink },
                      { label: "Source",    val: entry.sourceLink },
                      { label: "Folder",    val: entry.folderLink },
                      { label: "Admin",     val: entry.adminPanelLink },
                      { label: "Perf",      val: entry.performanceCopiesLink },
                      { label: "Digital",   val: entry.digitalCopiesLink },
                      { label: "Deck",      val: entry.copyDeckLink },
                      { label: "Portfolio", val: entry.portfolio && entry.portfolio !== "-" ? entry.portfolio : null },
                    ] as { label: string; val: string | null | undefined }[]).map(({ label, val }) => (
                      <div key={label} className="flex items-center justify-between gap-1">
                        <span className="text-xs text-neutral-400">{label}</span>
                        <span className={`text-xs font-semibold ${val ? "text-emerald-500" : "text-red-400"}`}>
                          {val ? "Yes" : "No"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
