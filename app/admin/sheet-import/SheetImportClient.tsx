"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { ArrowLeft, RefreshCw, CheckCircle2, AlertCircle, FileSpreadsheet } from "lucide-react";

type ParsedRow = {
  country: string;
  buttonTextEn: string;
  buttonTextAr: string;
  disclaimerEn: string;
  disclaimerAr: string;
};

type PreviewData = {
  dateFrom: string;
  dateTo: string;
  platform: string;
  rows: ParsedRow[];
};

const TARIFFS   = ["Basic", "Premium", "Crunchyroll"] as const;
const PLATFORMS = ["iOS", "Android", "Native"] as const;
const TYPES     = ["current", "future", "old"] as const;

export function SheetImportClient() {
  const [tabs, setTabs]               = useState<string[]>([]);
  const [tabsLoading, setTabsLoading] = useState(true);
  const [tabsError, setTabsError]     = useState<string | null>(null);

  const [selectedTab, setSelectedTab]     = useState("");
  const [preview, setPreview]             = useState<PreviewData | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError]   = useState<string | null>(null);

  // Import form state
  const [offerName, setOfferName]   = useState("");
  const [type, setType]             = useState<typeof TYPES[number]>("current");
  const [tariff, setTariff]         = useState<typeof TARIFFS[number]>("Basic");
  const [platforms, setPlatforms]   = useState<string[]>(["iOS", "Android", "Native"]);
  const [dateFrom, setDateFrom]     = useState("");
  const [dateTo, setDateTo]         = useState("");

  const [importing, setImporting]         = useState(false);
  const [importResult, setImportResult]   = useState<{ created: number } | null>(null);
  const [importError, setImportError]     = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/sheet-import")
      .then(r => r.json())
      .then(d => {
        if (d.error) throw new Error(d.error);
        setTabs(d.tabs);
      })
      .catch(e => setTabsError(e.message))
      .finally(() => setTabsLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedTab) { setPreview(null); return; }
    setPreviewLoading(true);
    setPreviewError(null);
    setPreview(null);
    setImportResult(null);
    setImportError(null);

    fetch(`/api/admin/sheet-import?tab=${encodeURIComponent(selectedTab)}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) throw new Error(d.error);
        setPreview(d);
        setDateFrom(d.dateFrom ?? "");
        setDateTo(d.dateTo ?? "");
        setOfferName(selectedTab);
      })
      .catch(e => setPreviewError(e.message))
      .finally(() => setPreviewLoading(false));
  }, [selectedTab]);

  function togglePlatform(p: string) {
    setPlatforms(prev =>
      prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]
    );
  }

  async function handleImport() {
    if (!preview || platforms.length === 0) return;
    setImporting(true);
    setImportResult(null);
    setImportError(null);

    try {
      const res = await fetch("/api/admin/sheet-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rows:      preview.rows,
          offerName: offerName.trim(),
          type,
          tariff,
          platforms,
          dateFrom:  dateFrom || null,
          dateTo:    dateTo || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Import failed");
      setImportResult(data);
    } catch (e: unknown) {
      setImportError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setImporting(false);
    }
  }

  return (
    <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-8 flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Link href="/admin#offers">
          <Button variant="ghost" size="sm"><ArrowLeft size={15} /> Back</Button>
        </Link>
      </div>

      <div>
        <h1 className="text-xl font-bold text-neutral-900">Import from Google Sheet</h1>
        <p className="text-sm text-neutral-500 mt-0.5">
          Select a tab, preview its contents, configure import settings, then save as offer records.
        </p>
      </div>

      {/* Tab selector */}
      <div className="bg-white rounded-2xl card-shadow p-6 flex flex-col gap-4">
        <div className="flex items-center gap-2 text-sm font-medium text-neutral-700">
          <FileSpreadsheet size={16} className="text-neutral-400" />
          Sheet tab
        </div>
        {tabsLoading ? (
          <div className="flex items-center gap-2 text-sm text-neutral-400">
            <RefreshCw size={14} className="animate-spin" /> Loading tabs…
          </div>
        ) : tabsError ? (
          <div className="text-sm text-red-600 flex items-center gap-2">
            <AlertCircle size={14} /> {tabsError}
          </div>
        ) : (
          <select
            value={selectedTab}
            onChange={e => setSelectedTab(e.target.value)}
            className="w-full max-w-sm border border-neutral-200 rounded-lg px-3 py-2 text-sm text-neutral-900 bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
          >
            <option value="">— Select a tab —</option>
            {tabs.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        )}
      </div>

      {/* Preview loading */}
      {previewLoading && (
        <div className="flex items-center gap-2 text-sm text-neutral-400 py-4">
          <RefreshCw size={14} className="animate-spin" /> Fetching tab from Google Sheet…
        </div>
      )}

      {previewError && (
        <div className="bg-red-50 rounded-xl px-5 py-3 text-sm text-red-700 flex items-center gap-2">
          <AlertCircle size={14} /> {previewError}
        </div>
      )}

      {preview && !previewLoading && (
        <>
          {/* Sheet meta */}
          <div className="flex flex-wrap gap-3 text-sm">
            <span className="inline-flex items-center gap-1.5 bg-neutral-100 rounded-full px-3 py-1 text-neutral-700 font-medium">
              From: <span className="text-neutral-500 font-normal">{preview.dateFrom || "—"}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 bg-neutral-100 rounded-full px-3 py-1 text-neutral-700 font-medium">
              To: <span className="text-neutral-500 font-normal">{preview.dateTo || "—"}</span>
            </span>
            {preview.platform && (
              <span className="inline-flex items-center gap-1.5 bg-neutral-100 rounded-full px-3 py-1 text-neutral-700 font-medium">
                Platform note: <span className="text-neutral-500 font-normal truncate max-w-xs">{preview.platform}</span>
              </span>
            )}
          </div>

          {/* Preview table */}
          <div className="bg-white rounded-2xl card-shadow overflow-hidden">
            <div className="px-5 py-3 border-b border-neutral-100 flex items-center justify-between">
              <span className="text-sm font-medium text-neutral-700">Preview</span>
              <span className="text-xs text-neutral-400">{preview.rows.length} countries</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-neutral-100 text-left bg-neutral-50">
                    <th className="px-4 py-2.5 text-neutral-500 font-medium w-24">Country</th>
                    <th className="px-4 py-2.5 text-neutral-500 font-medium">Button EN</th>
                    <th className="px-4 py-2.5 text-neutral-500 font-medium">Disclaimer EN</th>
                    <th className="px-4 py-2.5 text-neutral-500 font-medium">Button AR</th>
                    <th className="px-4 py-2.5 text-neutral-500 font-medium">Disclaimer AR</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.rows.map((row, i) => (
                    <tr key={i} className="border-b border-neutral-50 hover:bg-neutral-50">
                      <td className="px-4 py-2.5 font-medium text-neutral-900">{row.country}</td>
                      <td className="px-4 py-2.5 text-neutral-700 max-w-[200px]">
                        <div className="line-clamp-2">{row.buttonTextEn || <span className="text-neutral-300">—</span>}</div>
                      </td>
                      <td className="px-4 py-2.5 text-neutral-500 max-w-[200px]">
                        <div className="line-clamp-2">{row.disclaimerEn || <span className="text-neutral-300">—</span>}</div>
                      </td>
                      <td className="px-4 py-2.5 text-neutral-700 max-w-[200px]" dir="rtl">
                        <div className="line-clamp-2">{row.buttonTextAr || <span className="text-neutral-300">—</span>}</div>
                      </td>
                      <td className="px-4 py-2.5 text-neutral-500 max-w-[200px]" dir="rtl">
                        <div className="line-clamp-2">{row.disclaimerAr || <span className="text-neutral-300">—</span>}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {preview.rows.length === 0 && (
                <div className="py-10 text-center text-sm text-neutral-400">
                  No country rows found in this tab. Check the tab structure.
                </div>
              )}
            </div>
          </div>

          {/* Import config */}
          {preview.rows.length > 0 && (
            <div className="bg-white rounded-2xl card-shadow p-6 flex flex-col gap-5">
              <div className="text-sm font-medium text-neutral-700">Import settings</div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-neutral-500">Offer name</label>
                  <input
                    type="text"
                    value={offerName}
                    onChange={e => setOfferName(e.target.value)}
                    placeholder="e.g. Eid Offer May 2026"
                    className="border border-neutral-200 rounded-lg px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-neutral-500">Offer type</label>
                  <select
                    value={type}
                    onChange={e => setType(e.target.value as typeof TYPES[number])}
                    className="border border-neutral-200 rounded-lg px-3 py-2 text-sm text-neutral-900 bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
                  >
                    {TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-neutral-500">Tariff</label>
                  <select
                    value={tariff}
                    onChange={e => setTariff(e.target.value as typeof TARIFFS[number])}
                    className="border border-neutral-200 rounded-lg px-3 py-2 text-sm text-neutral-900 bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
                  >
                    {TARIFFS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-neutral-500">Platforms</label>
                  <div className="flex items-center gap-3">
                    {PLATFORMS.map(p => (
                      <label key={p} className="flex items-center gap-1.5 text-sm text-neutral-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={platforms.includes(p)}
                          onChange={() => togglePlatform(p)}
                          className="rounded"
                        />
                        {p}
                      </label>
                    ))}
                  </div>
                  {platforms.length === 0 && (
                    <p className="text-xs text-red-500">Select at least one platform</p>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-neutral-500">Date from</label>
                  <input
                    type="text"
                    value={dateFrom}
                    onChange={e => setDateFrom(e.target.value)}
                    placeholder="e.g. 21.05.2026"
                    className="border border-neutral-200 rounded-lg px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-neutral-500">Date to</label>
                  <input
                    type="text"
                    value={dateTo}
                    onChange={e => setDateTo(e.target.value)}
                    placeholder="e.g. 28.05.2026"
                    className="border border-neutral-200 rounded-lg px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
                  />
                </div>
              </div>

              <div className="text-xs text-neutral-400">
                Will create <strong className="text-neutral-600">{preview.rows.length * platforms.length}</strong> offer records
                ({preview.rows.length} countries × {platforms.length} platform{platforms.length !== 1 ? "s" : ""}).
                All records will be tagged as <strong className="text-neutral-600">Main product</strong>.
              </div>

              {importResult && (
                <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 rounded-xl px-4 py-3">
                  <CheckCircle2 size={15} />
                  Imported {importResult.created} records successfully.{" "}
                  <Link href="/admin#offers" className="underline hover:no-underline">View in Admin</Link>
                </div>
              )}

              {importError && (
                <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 rounded-xl px-4 py-3">
                  <AlertCircle size={15} /> {importError}
                </div>
              )}

              <div className="flex items-center gap-3">
                <Button
                  onClick={handleImport}
                  disabled={importing || !offerName.trim() || platforms.length === 0}
                >
                  {importing ? (
                    <><RefreshCw size={14} className="animate-spin" /> Importing…</>
                  ) : (
                    `Import ${preview.rows.length * platforms.length} records`
                  )}
                </Button>
                {importResult && (
                  <Link href="/admin#offers">
                    <Button variant="ghost">Back to Admin</Button>
                  </Link>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </main>
  );
}
