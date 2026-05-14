"use client";
import { useRouter, usePathname } from "next/navigation";
import { useCallback, useTransition, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EntryCard } from "@/components/EntryCard";
import { Select } from "@/components/ui/Select";
import { Search, Inbox, SlidersHorizontal, ChevronUp } from "lucide-react";

interface Entry {
  id: string;
  titleName: string;
  portfolio: string;
  project: string;
  contentType: string | null;
  titleId: string | null;
  kpId: string | null;
  figmaLink: string | null;
  sourceLink: string | null;
  folderLink: string | null;
  adminPanelLink: string | null;
  description: string | null;
}

interface Props {
  entries: Entry[];
  contentTypeOptions: string[];
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

export function DashboardClient({
  entries,
  initialQ,
  initialContentType,
  initialCountry,
  initialGenre,
  initialDateFrom,
  initialDateTo,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [showAdvanced, setShowAdvanced] = useState(
    !!(initialCountry || initialGenre || initialDateFrom || initialDateTo)
  );

  const updateParams = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(window.location.search);
    if (value) params.set(key, value); else params.delete(key);
    startTransition(() => router.replace(`${pathname}?${params.toString()}`));
  }, [router, pathname]);

  const inputClass = "w-full px-3.5 py-2.5 text-sm rounded-xl border border-neutral-200 bg-white focus:border-neutral-400 focus:ring-2 focus:ring-neutral-100 outline-none transition-all";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-neutral-900">Content Hub</h1>
        <p className="text-sm text-neutral-500">{entries.length} {entries.length === 1 ? "entry" : "entries"}</p>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
            <input
              defaultValue={initialQ}
              onChange={(e) => updateParams("q", e.target.value)}
              placeholder="Search by title, ID, KP ID..."
              className={`pl-9 pr-4 ${inputClass}`}
            />
          </div>
          <Select
            options={CONTENT_TYPE_OPTIONS}
            placeholder="All types"
            defaultValue={initialContentType}
            onChange={(e) => updateParams("type", e.target.value)}
            className="sm:w-44"
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
              transition={{ duration: 0.18 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                <input
                  defaultValue={initialCountry}
                  onChange={(e) => updateParams("country", e.target.value)}
                  placeholder="Country"
                  className={inputClass}
                />
                <input
                  defaultValue={initialGenre}
                  onChange={(e) => updateParams("genre", e.target.value)}
                  placeholder="Genre"
                  className={inputClass}
                />
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-neutral-400 px-1">From</label>
                  <input
                    type="date"
                    defaultValue={initialDateFrom}
                    onChange={(e) => updateParams("dateFrom", e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-neutral-400 px-1">To</label>
                  <input
                    type="date"
                    defaultValue={initialDateTo}
                    onChange={(e) => updateParams("dateTo", e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence mode="wait">
        {entries.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center gap-3 py-24 text-center"
          >
            <div className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center">
              <Inbox size={22} className="text-neutral-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-700">No entries found</p>
              <p className="text-sm text-neutral-400 mt-0.5">Try adjusting your search or filters</p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: isPending ? 0.5 : 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          >
            {entries.map((entry, i) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03, duration: 0.2 }}
              >
                <EntryCard entry={entry} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
