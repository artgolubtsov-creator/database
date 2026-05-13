"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { Badge } from "./ui/Badge";
import { ExternalLink, Frame, Folder, Monitor } from "lucide-react";
import { isValidUrl } from "@/lib/utils";

interface Entry {
  id: string;
  portfolio: string;
  project: string;
  task: string;
  titleId: string | null;
  kpId: string | null;
  figmaLink: string | null;
  sourceLink: string | null;
  folderLink: string | null;
  adminPanelLink: string | null;
  description: string | null;
}

export function EntryCard({ entry }: { entry: Entry }) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      className="group bg-white rounded-2xl card-shadow hover:card-shadow-hover transition-shadow duration-200 p-5 flex flex-col gap-4 cursor-pointer"
    >
      <Link href={`/entries/${entry.id}`} className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="blue">{entry.portfolio}</Badge>
              <Badge>{entry.project}</Badge>
            </div>
            <h3 className="text-sm font-semibold text-neutral-900 leading-snug mt-1 line-clamp-2">
              {entry.task}
            </h3>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 text-xs text-neutral-500">
          {entry.titleId && (
            <span className="flex items-center gap-1">
              <span className="text-neutral-400">Title ID:</span>
              <span className="font-mono text-neutral-700">{entry.titleId}</span>
            </span>
          )}
          {entry.kpId && (
            <span className="flex items-center gap-1">
              <span className="text-neutral-400">KP:</span>
              <span className="font-mono text-neutral-700">{entry.kpId}</span>
            </span>
          )}
        </div>

        {entry.description && (
          <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed">
            {entry.description}
          </p>
        )}
      </Link>

      <div className="flex items-center gap-2 pt-1 border-t border-neutral-100">
        {isValidUrl(entry.figmaLink) && (
          <a
            href={entry.figmaLink!}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 text-xs text-neutral-500 hover:text-violet-600 transition-colors"
          >
            <Frame size={13} /> Figma
          </a>
        )}
        {isValidUrl(entry.sourceLink) && (
          <a
            href={entry.sourceLink!}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 text-xs text-neutral-500 hover:text-blue-600 transition-colors"
          >
            <ExternalLink size={13} /> Source
          </a>
        )}
        {isValidUrl(entry.folderLink) && (
          <a
            href={entry.folderLink!}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 text-xs text-neutral-500 hover:text-amber-600 transition-colors"
          >
            <Folder size={13} /> Folder
          </a>
        )}
        {isValidUrl(entry.adminPanelLink) && (
          <a
            href={entry.adminPanelLink!}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 text-xs text-neutral-500 hover:text-emerald-600 transition-colors"
          >
            <Monitor size={13} /> Admin
          </a>
        )}
      </div>
    </motion.div>
  );
}
