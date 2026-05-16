"use client";
import { useRouter, usePathname } from "next/navigation";
import { useCallback, useTransition, useState } from "react";
import { Select } from "@/components/ui/Select";
import { Search, SlidersHorizontal, ChevronUp, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface Entry {
  id: string;
  titleName: string;
  arabicTitle: string | null;
  contentType: string | null;
  titleId: string | null;
  kpId: string | null;
  year: number | null;
  countries: string | null;
  genres: string | null;
  portfolio: string;
  mainPosterStatus: string | null;
  characterPostersStatus: string | null;
  trailerStatus: string | null;
  teaserStatus: string | null;
  episodesStatus: string | null;
  figmaLink: string | null;
  sourceLink: string | null;
  folderLink: string | null;
  adminPanelLink: string | null;
  performanceCopiesLink: string | null;
  digitalCopiesLink: string | null;
  copyDeckLink: string | null;
}

interface Props {
  entries: Entry[];
  total: number;
  page: number;
  pageSize: number;
  initialQ: string;
  initialContentType: string;
  initialCountry: string;
  initialGenre: string;
  initialDateFrom: string;
  initialDateTo: string;
}

const CONTENT_TYPE_OPTIONS = [
  { value: "EXCLUSIVE", label: "Exclusive" },
  { value: "MOVIES", label: "Movies" },
  { value: "SERIES", label: "Series" },
  { value: "ORIGINAL", label: "Original" },
];

const TYPE_BADGE: Record<string, string> = {
  EXCLUSIVE: "bg-purple-100 text-purple-700",
  MOVIES: "bg-blue-100 text-blue-700",
  SERIES: "bg-emerald-100 text-emerald-700",
  ORIGINAL: "bg-amber-100 text-amber-700",
};

const HIGHLIGHT_INDICATORS: { label: string; key: keyof Entry }[] = [
  { label: "Poster",     key: "mainPosterStatus" },
  { label: "Chars",      key: "characterPostersStatus" },
  { label: "Trailer",    key: "trailerStatus" },
  { label: "Teaser",     key: "teaserStatus" },
  { label: "Episodes",   key: "episodesStatus" },
];

const LINK_INDICATORS: { label: string; key: keyof Entry }[] = [
  { label: "Figma",     key: "figmaLink" },
  { label: "Source",    key: "sourceLink" },
  { label: "Folder",    key: "folderLink" },
  { label: "Admin",     key: "adminPanelLink" },
  { label: "Perf",      key: "performanceCopiesLink" },
  { label: "Digital",   key: "digitalCopiesLink" },
  { label: "Deck",      key: "copyDeckLink" },
  { label: "Portfolio", key: "portfolio" },
];

const STATUS_COLORS: Record<string, string> = {
  ADDED:            "text-emerald-500",
  NOT_RECEIVED_YET: "text-amber-500",
  NOT_REQUIRED:     "text-neutral-400",
  REQUEST_FROM_OTT: "text-blue-500",
};

const STATUS_SHORT: Record<string, string> = {
  ADDED:            "Added",
  NOT_RECEIVED_YET: "Pending",
  NOT_REQUIRED:     "N/A",
  REQUEST_FROM_OTT: "OTT",
};

function StatusCell({ entry }: { entry: Entry }) {
  return (
    <div className="flex flex-col gap-2.5 min-w-[200px]">
      {/* Highlight material statuses */}
      <div className="grid grid-cols-5 gap-x-2 gap-y-1">
        {HIGHLIGHT_INDICATORS.map(({ label, key }) => {
          const val = entry[key] as string | null;
          return (
            <div key={label} className="flex flex-col items-center gap-0.5">
              <span className="text-[9px] text-neutral-400 leading-none">{label}</span>
              <span className={`text-[10px] font-semibold leading-none ${val ? (STATUS_COLORS[val] ?? "text-neutral-500") : "text-neutral-300"}`}>
                {val ? (STATUS_SHORT[val] ?? val) : "—"}
              </span>
            </div>
          );
        })}
      </div>

      {/* Link availability */}
      <div className="border-t border-neutral-100 pt-2 grid grid-cols-4 gap-x-2 gap-y-1">
        {LINK_INDICATORS.map(({ label, key }) => {
          const val = entry[key];
          const has = key === "portfolio" ? (!!val && val !== "-") : !!val;
          return (
            <div key={label} className="flex flex-col items-center gap-0.5">
              <span className="text-[9px] text-neutral-400 leading-none">{label}</span>
              <span className={`text-[10px] font-semibold leading-none ${has ? "text-emerald-500" : "text-red-400"}`}>
                {has ? "Yes" : "No"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function DashboardClient({
  entries, total, page, pageSize,
  initialQ, initialContentType, initialCountry, initialGenre, initialDateFrom, initialDateTo,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();
  const [showAdvanced, setShowAdvanced] = useState(
    !!(initialCountry || initialGenre || initialDateFrom || initialDateTo)
  );

  const updateParams = useCallback((updates: Record<string, string>) => {
    const params = new URLSearchParams(window.location.search);
    for (const [key, value] of Object.entries(updates)) {
      if (value) params.set(key, value); else params.delete(key);
    }
    if (!("page" in updates)) params.delete("page");
    startTransition(() => router.replace(`${pathname}?${params.toString()}`));
  }, [router, pathname]);

  const totalPages = Math.ceil(total / pageSize);
  const inputClass = "w-full px-3.5 py-2.5 text-sm rounded-xl border border-neutral-200 bg-white focus:border-neutral-400 focus:ring-2 focus:ring-neutral-100 outline-none transition-all";

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Content Hub</h1>
          <p className="text-sm text-neutral-500 mt-0.5">{total.toLocaleString()} {total === 1 ? "entry" : "entries"}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
            <input
              defaultValue={initialQ}
              onChange={(e) => updateParams({ q: e.target.value })}
              placeholder="Search by title, ID..."
              className={`pl-9 pr-4 ${inputClass}`}
            />
          </div>
          <Select
            options={CONTENT_TYPE_OPTIONS}
            placeholder="All types"
            defaultValue={initialContentType}
            onChange={(e) => updateParams({ type: e.target.value })}
            className="sm:w-40"
          />
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`inline-flex items-center gap-2 px-3.5 py-2.5 text-sm rounded-xl border transition-all ${
              showAdvanced
                ? "border-neutral-400 bg-neutral-100 text-neutral-700"
                : "border-neutral-200 bg-white text-neutral-500 hover:text-neutral-700 hover:border-neutral-300"
            }`}
          >
            {showAdvanced ? <ChevronUp size={15} /> : <SlidersHorizontal size={15} />}
            <span className="hidden sm:inline">Filters</span>
          </button>
        </div>
        <AnimatePresence>
          {showAdvanced && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                <input defaultValue={initialCountry} onChange={(e) => updateParams({ country: e.target.value })} placeholder="Country" className={inputClass} />
                <input defaultValue={initialGenre} onChange={(e) => updateParams({ genre: e.target.value })} placeholder="Genre" className={inputClass} />
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-neutral-400 px-1">From</label>
                  <input type="date" defaultValue={initialDateFrom} onChange={(e) => updateParams({ dateFrom: e.target.value })} className={inputClass} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-neutral-400 px-1">To</label>
                  <input type="date" defaultValue={initialDateTo} onChange={(e) => updateParams({ dateTo: e.target.value })} className={inputClass} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl card-shadow overflow-hidden">
        {entries.length === 0 ? (
          <div className="py-20 text-center text-sm text-neutral-400">No entries found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-100 text-left">
                  <th className="px-5 py-3.5 text-xs font-medium text-neutral-400 uppercase tracking-wide">Type</th>
                  <th className="px-5 py-3.5 text-xs font-medium text-neutral-400 uppercase tracking-wide">Title (EN)</th>
                  <th className="px-5 py-3.5 text-xs font-medium text-neutral-400 uppercase tracking-wide hidden md:table-cell">Title (AR)</th>
                  <th className="px-5 py-3.5 text-xs font-medium text-neutral-400 uppercase tracking-wide hidden lg:table-cell">Entity ID</th>
                  <th className="px-5 py-3.5 text-xs font-medium text-neutral-400 uppercase tracking-wide hidden lg:table-cell">Year</th>
                  <th className="px-5 py-3.5 text-xs font-medium text-neutral-400 uppercase tracking-wide hidden xl:table-cell">Countries</th>
                  <th className="px-5 py-3.5 text-xs font-medium text-neutral-400 uppercase tracking-wide">Materials</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr key={entry.id} className="border-b border-neutral-50 hover:bg-neutral-50 transition-colors cursor-pointer">
                    <td className="px-5 py-3 w-28">
                      {entry.contentType ? (
                        <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium ${TYPE_BADGE[entry.contentType] ?? "bg-neutral-100 text-neutral-600"}`}>
                          {entry.contentType.charAt(0) + entry.contentType.slice(1).toLowerCase()}
                        </span>
                      ) : (
                        <span className="text-neutral-300 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3 max-w-[240px]">
                      <Link href={`/entries/${entry.id}`} className="font-medium text-neutral-900 hover:text-neutral-600 truncate block transition-colors">
                        {entry.titleName}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-neutral-500 max-w-[200px] truncate hidden md:table-cell" dir="rtl">
                      {entry.arabicTitle ?? <span className="text-neutral-300" dir="ltr">—</span>}
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-neutral-400 hidden lg:table-cell">
                      {entry.titleId ?? entry.kpId ?? "—"}
                    </td>
                    <td className="px-5 py-3 text-neutral-500 hidden lg:table-cell">{entry.year ?? "—"}</td>
                    <td className="px-5 py-3 text-neutral-500 text-xs max-w-[140px] truncate hidden xl:table-cell">{entry.countries ?? "—"}</td>
                    <td className="px-5 py-4">
                      <StatusCell entry={entry} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-neutral-400">
            Page {page} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => updateParams({ page: String(page - 1) })}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-neutral-200 text-neutral-600 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft size={14} /> Prev
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => updateParams({ page: String(page + 1) })}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-neutral-200 text-neutral-600 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
