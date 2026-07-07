"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { ArrowLeft, RefreshCw, CheckCircle2, AlertCircle, ExternalLink } from "lucide-react";

type PreviewRow = {
  menaId:     string;
  titleName:  string;
  figmaUrl:   string | null;
  sourceUrl:  string | null;
  dbEntryId:  string | null;
  dbName:     string | null;
  willUpdate: boolean;
};

export function FigmaSyncClient() {
  const [rows, setRows]           = useState<PreviewRow[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [syncing, setSyncing]     = useState(false);
  const [result, setResult]       = useState<{ updated: number; skipped: number } | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/figma-sync")
      .then(r => r.json())
      .then(d => {
        if (d.error) throw new Error(d.error);
        setRows(d.rows);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleSync() {
    setSyncing(true);
    setResult(null);
    setSyncError(null);
    try {
      const res = await fetch("/api/admin/figma-sync", { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error ?? "Sync failed");
      setResult({ updated: data.updated, skipped: data.skipped });
    } catch (e: unknown) {
      setSyncError(e instanceof Error ? e.message : "Error");
    } finally {
      setSyncing(false);
    }
  }

  const willUpdate = rows.filter(r => r.willUpdate);
  const noMatch    = rows.filter(r => !r.willUpdate);

  return (
    <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-8 flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Link href="/admin#entries">
          <Button variant="ghost" size="sm"><ArrowLeft size={15} /> Back</Button>
        </Link>
      </div>

      <div>
        <h1 className="text-xl font-bold text-neutral-900">Sync Figma &amp; Source</h1>
        <p className="text-sm text-neutral-500 mt-0.5">
          Reads the <strong>Graphics</strong> sheet, matches by mena_id → titleId, updates figmaLink and sourceLink.
        </p>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-sm text-neutral-400">
          <RefreshCw size={14} className="animate-spin" /> Loading data from Google Sheet…
        </div>
      )}

      {error && (
        <div className="bg-red-50 rounded-xl px-5 py-3 text-sm text-red-700 flex items-center gap-2">
          <AlertCircle size={14} /> {error}
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Will update */}
          <div className="bg-white rounded-2xl card-shadow overflow-hidden">
            <div className="px-5 py-3 border-b border-neutral-100 flex items-center justify-between">
              <span className="text-sm font-medium text-neutral-700">Will be updated</span>
              <span className="text-xs text-neutral-400">{willUpdate.length} entries matched in DB</span>
            </div>
            {willUpdate.length === 0 ? (
              <div className="py-10 text-center text-sm text-neutral-400">No new data found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-neutral-50 border-b border-neutral-100 text-left">
                      <th className="px-4 py-2.5 text-neutral-500 font-medium">mena_id</th>
                      <th className="px-4 py-2.5 text-neutral-500 font-medium">Title in sheet</th>
                      <th className="px-4 py-2.5 text-neutral-500 font-medium">Matched entry</th>
                      <th className="px-4 py-2.5 text-neutral-500 font-medium">Figma</th>
                      <th className="px-4 py-2.5 text-neutral-500 font-medium">Source</th>
                    </tr>
                  </thead>
                  <tbody>
                    {willUpdate.map((row) => (
                      <tr key={row.menaId} className="border-b border-neutral-50 hover:bg-neutral-50">
                        <td className="px-4 py-2.5 font-mono text-neutral-500">{row.menaId}</td>
                        <td className="px-4 py-2.5 text-neutral-700">{row.titleName || "—"}</td>
                        <td className="px-4 py-2.5 text-neutral-900 font-medium">{row.dbName}</td>
                        <td className="px-4 py-2.5">
                          {row.figmaUrl ? (
                            <a href={row.figmaUrl} target="_blank" rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-violet-600 hover:underline">
                              Figma <ExternalLink size={10} />
                            </a>
                          ) : <span className="text-neutral-300">—</span>}
                        </td>
                        <td className="px-4 py-2.5">
                          {row.sourceUrl ? (
                            <a href={row.sourceUrl} target="_blank" rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-blue-600 hover:underline">
                              Source <ExternalLink size={10} />
                            </a>
                          ) : <span className="text-neutral-300">—</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* No match */}
          {noMatch.length > 0 && (
            <details className="bg-white rounded-2xl card-shadow overflow-hidden">
              <summary className="px-5 py-3 text-sm font-medium text-neutral-500 cursor-pointer select-none flex items-center justify-between">
                <span>No match in DB ({noMatch.length} rows)</span>
              </summary>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-neutral-50 border-b border-neutral-100 text-left">
                      <th className="px-4 py-2.5 text-neutral-500 font-medium">mena_id</th>
                      <th className="px-4 py-2.5 text-neutral-500 font-medium">Title in sheet</th>
                      <th className="px-4 py-2.5 text-neutral-500 font-medium">Figma</th>
                      <th className="px-4 py-2.5 text-neutral-500 font-medium">Source</th>
                    </tr>
                  </thead>
                  <tbody>
                    {noMatch.map((row) => (
                      <tr key={row.menaId} className="border-b border-neutral-50">
                        <td className="px-4 py-2.5 font-mono text-neutral-400">{row.menaId}</td>
                        <td className="px-4 py-2.5 text-neutral-400">{row.titleName || "—"}</td>
                        <td className="px-4 py-2.5">
                          {row.figmaUrl ? <span className="text-neutral-400">has link</span> : <span className="text-neutral-300">—</span>}
                        </td>
                        <td className="px-4 py-2.5">
                          {row.sourceUrl ? <span className="text-neutral-400">has link</span> : <span className="text-neutral-300">—</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          )}

          {/* Result / error */}
          {result && (
            <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 rounded-xl px-4 py-3">
              <CheckCircle2 size={15} />
              Updated {result.updated} entries. Skipped {result.skipped}.{" "}
              <Link href="/admin" className="underline hover:no-underline">Back to Admin</Link>
            </div>
          )}
          {syncError && (
            <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 rounded-xl px-4 py-3">
              <AlertCircle size={15} /> {syncError}
            </div>
          )}

          {willUpdate.length > 0 && (
            <div>
              <Button onClick={handleSync} disabled={syncing || !!result}>
                {syncing
                  ? <><RefreshCw size={14} className="animate-spin" /> Syncing…</>
                  : `Update ${willUpdate.length} entries`}
              </Button>
            </div>
          )}
        </>
      )}
    </main>
  );
}
