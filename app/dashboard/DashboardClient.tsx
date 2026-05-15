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
  sourceLink: string | null;
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
    // Reset to page 1 on filter change (unless explicitly setting page)
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
                  <th className="px-5 py-3.5 text-xs font-medium text-neutral-400 uppercase tracking-wide text-center">Source</th>
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
                    <td className="px-5 py-3 text-center">
                      {entry.sourceLink
                        ? <span className="text-xs font-medium text-emerald-600">Yes</span>
                        : <span className="text-xs font-medium text-red-400">No</span>}
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
