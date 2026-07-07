import { google } from "googleapis";
import * as XLSX from "xlsx";

const SHEET_ID = process.env.GOOGLE_SHEET_ID ?? "1fC0EYVY-5hMmevkBqZgwz--Rtm48WuOF";

export type ParsedOfferRow = {
  country: string;
  buttonTextEn: string;
  buttonTextAr: string;
  disclaimerEn: string;
  disclaimerAr: string;
};

export type SheetParseResult = {
  dateFrom: string;
  dateTo: string;
  platform: string;
  rows: ParsedOfferRow[];
};

async function loadWorkbook(): Promise<XLSX.WorkBook> {
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/drive.readonly"],
  });
  const drive = google.drive({ version: "v3", auth });
  const res = await drive.files.get(
    { fileId: SHEET_ID, alt: "media" },
    { responseType: "arraybuffer" }
  );
  return XLSX.read(res.data as ArrayBuffer, { type: "buffer" });
}

export async function getSheetTabs(): Promise<string[]> {
  const wb = await loadWorkbook();
  return wb.SheetNames;
}

export async function parseSheetTab(tabName: string): Promise<SheetParseResult> {
  const wb = await loadWorkbook();
  const ws = wb.Sheets[tabName];
  if (!ws) throw new Error(`Tab "${tabName}" not found`);

  const rows: string[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
  const cell = (r: number, c: number) => String(rows[r]?.[c] ?? "").trim();

  const dateFrom = cell(0, 2);
  const dateTo   = cell(1, 2);
  const platform = cell(3, 0);

  const result: ParsedOfferRow[] = [];
  let current: Partial<ParsedOfferRow> | null = null;

  // Data starts from row index 5 (row 6), after the header row at index 4
  for (let i = 5; i < rows.length; i++) {
    const colA = cell(i, 0);
    const colB = cell(i, 1);
    const colC = cell(i, 2);
    const colD = cell(i, 3);

    if (!colA) continue;

    if (colB) {
      // Non-empty col B = country → this is a button text row
      if (current?.country) result.push(current as ParsedOfferRow);
      current = {
        country:      colB,
        buttonTextEn: colC,
        buttonTextAr: colD,
        disclaimerEn: "",
        disclaimerAr: "",
      };
    } else if (current) {
      // Empty col B = text under the button for the previous country
      current.disclaimerEn = colC;
      current.disclaimerAr = colD;
    }
  }
  if (current?.country) result.push(current as ParsedOfferRow);

  return { dateFrom, dateTo, platform, rows: result };
}
