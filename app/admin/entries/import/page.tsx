import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { ArrowLeft, Download } from "lucide-react";
import { ImportClient } from "./ImportClient";
import { canManageContent } from "@/lib/roles";

const CSV_TEMPLATE = [
  "titleName,portfolio,project,contentType,titleId,kpId,year,genres,countries,description,rightholder,restrictionAge,folderLink,arabicTitle",
  "My Movie,Yango Play,Q1 2026,MOVIES,tt123,kp456,2025,Drama,UAE,,Studio X,16+,https://drive.google.com/...,فيلمي",
].join("\n");

export default async function ImportEntriesPage() {
  const session = await auth();
  const role = session?.user?.role;
  if (!canManageContent(role)) redirect("/dashboard");

  const templateHref = `data:text/csv;charset=utf-8,${encodeURIComponent(CSV_TEMPLATE)}`;

  return (
    <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-8">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <Link href="/admin">
              <Button variant="ghost" size="sm"><ArrowLeft size={15} /> Back</Button>
            </Link>
          </div>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-bold text-neutral-900">Import Entries</h1>
              <p className="text-sm text-neutral-500 mt-0.5">Upload a CSV file to bulk-create entries</p>
            </div>
            <a href={templateHref} download="import_template.csv">
              <Button variant="ghost" size="sm"><Download size={14} /> Template</Button>
            </a>
          </div>

          <div className="bg-white rounded-2xl card-shadow p-7">
            <ImportClient />
          </div>

          <div className="bg-neutral-50 rounded-2xl p-5 text-sm text-neutral-500 flex flex-col gap-2">
            <p className="font-medium text-neutral-700">Column reference</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-1 text-xs font-mono">
              {[
                ["titleName *", "Title Name"],
                ["portfolio *", "Portfolio"],
                ["project *", "Project"],
                ["contentType", "EXCLUSIVE | MOVIES | SERIES | ORIGINAL"],
                ["titleId", "Title ID"],
                ["kpId", "KP ID"],
                ["year", "e.g. 2024"],
                ["genres", "Drama, Thriller"],
                ["countries", "UAE, KSA"],
                ["description", ""],
                ["rightholder", ""],
                ["restrictionAge", "16+"],
                ["folderLink", "https://..."],
                ["adminPanelLink", "https://..."],
                ["figmaLink", "https://..."],
                ["sourceLink", "https://..."],
                ["arabicTitle", ""],
                ["arabicDescription", ""],
                ["arabicShortCopy", ""],
                ["arabicMarketingCopy", ""],
                ["arabicNotes", ""],
              ].map(([col, hint]) => (
                <div key={col} className="flex gap-2">
                  <span className={col.endsWith("*") ? "text-neutral-700 font-semibold" : "text-neutral-500"}>{col}</span>
                  {hint && <span className="text-neutral-300 truncate">{hint}</span>}
                </div>
              ))}
            </div>
            <p className="text-xs text-neutral-400 mt-1">* required &nbsp;·&nbsp; Column headers are case-insensitive and spaces are ignored</p>
          </div>
        </div>
      </main>
  );
}
