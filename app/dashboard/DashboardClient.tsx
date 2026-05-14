"use client";
import { useRouter, usePathname } from "next/navigation";
import { useCallback, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EntryCard } from "@/components/EntryCard";
import { Select } from "@/components/ui/Select";
import { Search, Inbox } from "lucide-react";

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
}

const CONTENT_TYPE_OPTIONS = [
  { value: "EXCLUSIVE", label: "Exclusive" },
  { value: "MOVIES", label: "Movies" },
  { value: "SERIES", label: "Series" },
  { value: "ORIGINAL", label: "Original" },
];

export function DashboardClient({ entries, initialQ, initialContentType }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const updateParams = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(window.location.search);
    if (value) params.set(key, value); else params.delete(key);
    startTransition(() => router.replace(`${pathname}?${params.toString()}`));
  }, [router, pathname]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-neutral-900">Content Hub</h1>
        <p className="text-sm text-neutral-500">{entries.length} {entries.length === 1 ? "entry" : "entries"}</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
          <input
            defaultValue={initialQ}
            onChange={(e) => updateParams("q", e.target.value)}
            placeholder="Search by title, ID, KP ID..."
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-neutral-200 bg-white focus:border-neutral-400 focus:ring-2 focus:ring-neutral-100 outline-none transition-all"
          />
        </div>
        <Select
          options={CONTENT_TYPE_OPTIONS}
          placeholder="All types"
          defaultValue={initialContentType}
          onChange={(e) => updateParams("type", e.target.value)}
          className="sm:w-44"
        />
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
