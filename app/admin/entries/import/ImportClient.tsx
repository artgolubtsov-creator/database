"use client";
import { useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { Upload, FileText, CheckCircle, AlertCircle, X } from "lucide-react";

type Row = Record<string, string>;

// portfolio and project not required — they default to "-" on the server
const REQUIRED = ["titleName"];

// Header aliases → canonical field name
const HEADER_MAP: Record<string, string> = {
  // English names
  "title name": "titleName",
  "titlename": "titleName",
  "title": "titleName",
  // Snake-case from DB exports
  "title_en": "titleName",
  "title_ar": "arabicTitle",
  "entity_id": "titleId",
  "uuid": "kpId",
  "content_type": "contentType",
  "ott_description_en": "description",
  "ott_description_ar": "arabicDescription",
  "restriction_age": "restrictionAge",
  "ott_status": "_skip",
  "has_input_stream": "_skip",
  "active_license": "_skip",
  "startdate": "_skip",
  "currentdate": "_skip",
  "enddate": "_skip",
  "ott_thumbnail_en": "_skip",
  "ott_thumbnail_ar": "_skip",
  "ott_vertical_poster_en": "_skip",
  "ott_vertical_poster_ar": "_skip",
  "logo_en": "_skip",
  "logo_ar": "_skip",
  "mobile_thumbnail_en": "_skip",
  "mobile_thumbnail_ar": "_skip",
  "ott_horizontal_poster_en": "_skip",
  "ott_horizontal_poster_ar": "_skip",
  "trailer": "_skip",
  // Standard names
  "portfolio": "portfolio",
  "project": "project",
  "content type": "contentType",
  "contenttype": "contentType",
  "type": "contentType",
  "title id": "titleId",
  "titleid": "titleId",
  "kp id": "kpId",
  "kpid": "kpId",
  "description": "description",
  "rightholder": "rightholder",
  "year": "year",
  "genres": "genres",
  "genre": "genres",
  "countries": "countries",
  "country": "countries",
  "age restriction": "restrictionAge",
  "restrictionage": "restrictionAge",
  "restriction age": "restrictionAge",
  "folder link": "folderLink",
  "folderlink": "folderLink",
  "admin panel link": "adminPanelLink",
  "adminpanellink": "adminPanelLink",
  "figma link": "figmaLink",
  "figmalink": "figmaLink",
  "source link": "sourceLink",
  "sourcelink": "sourceLink",
  "arabic title": "arabicTitle",
  "arabictitle": "arabicTitle",
  "arabic description": "arabicDescription",
  "arabicdescription": "arabicDescription",
  "arabic short copy": "arabicShortCopy",
  "arabicshortcopy": "arabicShortCopy",
  "arabic marketing copy": "arabicMarketingCopy",
  "arabicmarketingcopy": "arabicMarketingCopy",
  "arabic notes": "arabicNotes",
  "arabicnotes": "arabicNotes",
};

function normalizeHeader(h: string): string {
  const lower = h.trim().toLowerCase();
  return HEADER_MAP[lower] ?? lower.replace(/\s+(.)/g, (_, c: string) => c.toUpperCase());
}

function parseLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (c === "," && !inQuotes) {
      result.push(current); current = "";
    } else {
      current += c;
    }
  }
  result.push(current);
  return result;
}

function parseCSV(text: string): Row[] {
  const lines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim().split("\n");
  if (lines.length < 2) return [];
  const rawHeaders = parseLine(lines[0]);
  const headers = rawHeaders.map(normalizeHeader);

  return lines
    .slice(1)
    .filter((l) => l.trim())
    .map((line) => {
      const values = parseLine(line);
      const row: Row = {};
      headers.forEach((h, i) => {
        if (h !== "_skip") row[h] = (values[i] ?? "").trim();
      });
      return row;
    });
}

const PREVIEW_COLS = ["titleName", "contentType", "year", "genres", "countries", "arabicTitle"];

type ImportResult = { created: number; errors: { row: number; message: string }[] };

export function ImportClient() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = useCallback((file: File) => {
    setFileName(file.name);
    setResult(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const parsed = parseCSV(text);
      setRows(parsed);
    };
    reader.readAsText(file, "utf-8");
  }, []);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const doImport = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/entries/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows }),
      });
      const data = await res.json();
      setResult(data);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setFileName(null);
    setRows([]);
    setResult(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const missingRequired = rows.length > 0
    ? rows.filter((r) => REQUIRED.some((k) => !r[k])).length
    : 0;

  return (
    <div className="flex flex-col gap-6">
      {!fileName && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${
            dragOver ? "border-neutral-400 bg-neutral-50" : "border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50"
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center">
            <Upload size={18} className="text-neutral-500" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-neutral-700">Drop CSV file here or click to browse</p>
            <p className="text-xs text-neutral-400 mt-1">UTF-8 CSV with header row. Required: titleName (or title_en)</p>
          </div>
          <input ref={inputRef} type="file" accept=".csv,text/csv" className="hidden" onChange={onInputChange} />
        </div>
      )}

      {fileName && !result && (
        <>
          <div className="flex items-center gap-3 bg-neutral-50 rounded-xl px-4 py-3">
            <FileText size={16} className="text-neutral-500 shrink-0" />
            <span className="text-sm text-neutral-700 font-medium flex-1 truncate">{fileName}</span>
            <span className="text-sm text-neutral-400">{rows.length} rows</span>
            <button onClick={reset} className="text-neutral-400 hover:text-neutral-600 transition-colors">
              <X size={15} />
            </button>
          </div>

          {rows.length > 0 && (
            <>
              {missingRequired > 0 && (
                <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                  <AlertCircle size={15} className="shrink-0" />
                  {missingRequired} row{missingRequired > 1 ? "s" : ""} missing titleName — they will be skipped
                </div>
              )}

              <div className="flex flex-col gap-2">
                <p className="text-xs font-medium text-neutral-400 uppercase tracking-wide">Preview (first 5 rows)</p>
                <div className="bg-white rounded-2xl card-shadow overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-neutral-100 text-left">
                        {PREVIEW_COLS.map((col) => (
                          <th key={col} className="px-4 py-3 text-neutral-400 font-medium uppercase tracking-wide whitespace-nowrap">{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rows.slice(0, 5).map((row, i) => (
                        <tr key={i} className="border-b border-neutral-50">
                          {PREVIEW_COLS.map((col) => (
                            <td key={col} className={`px-4 py-3 max-w-[200px] truncate ${
                              REQUIRED.includes(col) && !row[col] ? "text-red-400" : "text-neutral-700"
                            }`}>
                              {row[col] || <span className="text-neutral-300">—</span>}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="ghost" onClick={reset}>Cancel</Button>
                <Button onClick={doImport} disabled={loading}>
                  {loading ? "Importing…" : `Import ${rows.length} entries`}
                </Button>
              </div>
            </>
          )}

          {rows.length === 0 && (
            <p className="text-sm text-neutral-400 text-center py-6">No rows found in file</p>
          )}
        </>
      )}

      {result && (
        <div className="flex flex-col gap-4">
          <div className={`flex items-center gap-3 rounded-xl px-5 py-4 ${
            result.errors.length === 0 ? "bg-emerald-50 border border-emerald-200" : "bg-neutral-50 border border-neutral-200"
          }`}>
            <CheckCircle size={18} className="text-emerald-500 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-neutral-900">
                {result.created} {result.created === 1 ? "entry" : "entries"} imported
              </p>
              {result.errors.length > 0 && (
                <p className="text-sm text-neutral-500 mt-0.5">{result.errors.length} rows skipped</p>
              )}
            </div>
          </div>

          {result.errors.length > 0 && result.errors.length <= 20 && (
            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium text-neutral-400 uppercase tracking-wide">Skipped rows</p>
              <div className="bg-white rounded-2xl card-shadow overflow-hidden">
                {result.errors.map((e) => (
                  <div key={e.row} className="flex items-start gap-3 px-5 py-3 border-b border-neutral-50 last:border-0">
                    <AlertCircle size={14} className="text-red-400 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-xs font-mono text-neutral-400 mr-2">Row {e.row}</span>
                      <span className="text-sm text-neutral-600">{e.message}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.errors.length > 20 && (
            <p className="text-sm text-neutral-500 bg-neutral-50 rounded-xl px-4 py-3">
              {result.errors.length} rows skipped. First error: Row {result.errors[0].row} — {result.errors[0].message}
            </p>
          )}

          <div className="flex justify-end">
            <Button variant="ghost" onClick={reset}>Import another file</Button>
          </div>
        </div>
      )}
    </div>
  );
}
