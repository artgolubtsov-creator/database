import { google } from "googleapis";
import { prisma } from "@/lib/prisma";

const SHEET_ID   = "1TvR9vZb90obaYZ1sJ0S0HDH2M75-h12R6T5J_cwSCBg";
const SHEET_NAME = "Graphics";

const COL_MENA_ID = 5;  // F — mena_id (= titleId in DB)
const COL_FIGMA   = 17; // R — Clean (Figma link)
const COL_SOURCE  = 20; // U — Sources

export type FigmaSyncRow = {
  menaId:     string;
  titleName:  string;       // from col B
  figmaUrl:   string | null;
  sourceUrl:  string | null;
  dbEntryId:  string | null; // null = no match in DB
  dbName:     string | null;
  willUpdate: boolean;
};

export type SyncResult = {
  scanned: number;
  updated: number;
  skipped: number;
  errors:  string[];
};

function isReal(v: string): boolean {
  return !!v && v !== "#N/A" && v !== "N/A" && v !== "-" && v !== "FALSE";
}

async function fetchRows(): Promise<string[][]> {
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key:   process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });
  const sheets = google.sheets({ version: "v4", auth });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_NAME}!A:U`,
  });
  return (res.data.values ?? []).slice(1) as string[][]; // skip header
}

export async function previewFigmaSync(): Promise<FigmaSyncRow[]> {
  const rows = await fetchRows();
  const result: FigmaSyncRow[] = [];

  for (const row of rows) {
    const menaId   = String(row[COL_MENA_ID] ?? "").trim();
    const titleName = String(row[1] ?? "").trim();
    const figmaUrl  = isReal(String(row[COL_FIGMA]  ?? "")) ? String(row[COL_FIGMA]).trim()  : null;
    const sourceUrl = isReal(String(row[COL_SOURCE] ?? "")) ? String(row[COL_SOURCE]).trim() : null;

    if (!isReal(menaId)) continue;
    if (!figmaUrl && !sourceUrl) continue;

    const entry = await prisma.entry.findFirst({
      where: { titleId: menaId },
      select: { id: true, titleName: true },
    });

    result.push({
      menaId,
      titleName,
      figmaUrl,
      sourceUrl,
      dbEntryId:  entry?.id ?? null,
      dbName:     entry?.titleName ?? null,
      willUpdate: !!entry,
    });
  }

  return result;
}

export async function syncFigmaLinks(): Promise<SyncResult> {
  const rows = await fetchRows();
  const result: SyncResult = { scanned: 0, updated: 0, skipped: 0, errors: [] };

  for (const row of rows) {
    const menaId    = String(row[COL_MENA_ID] ?? "").trim();
    const figmaUrl  = isReal(String(row[COL_FIGMA]  ?? "")) ? String(row[COL_FIGMA]).trim()  : null;
    const sourceUrl = isReal(String(row[COL_SOURCE] ?? "")) ? String(row[COL_SOURCE]).trim() : null;

    if (!isReal(menaId)) continue;
    if (!figmaUrl && !sourceUrl) { result.skipped++; continue; }
    result.scanned++;

    try {
      const updated = await prisma.entry.updateMany({
        where: { titleId: menaId },
        data: {
          ...(figmaUrl  ? { figmaLink:  figmaUrl  } : {}),
          ...(sourceUrl ? { sourceLink: sourceUrl } : {}),
        },
      });
      if (updated.count > 0) result.updated += updated.count;
      else result.skipped++;
    } catch (e: unknown) {
      result.errors.push(`${menaId}: ${e instanceof Error ? e.message : e}`);
    }
  }

  return result;
}
