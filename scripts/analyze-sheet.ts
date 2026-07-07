import { google } from "googleapis";
import * as XLSX from "xlsx";
import * as dotenv from "dotenv";

dotenv.config();

const SHEET_ID = "1fC0EYVY-5hMmevkBqZgwz--Rtm48WuOF";

// Tabs to inspect — last ~10 and a few that look like "current offer" candidates
const TABS_TO_CHECK = [
  "C",
  "FP",
  "ML all",
  "Template",
  "TEST LIST DO NOT DELETE",
  "Eid may 22",
  "FINAL — Eid may 22",
  "1 coin",
  "Presell EG",
  "Family till 1505",
];

async function main() {
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key:   process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/drive.readonly"],
  });

  const drive = google.drive({ version: "v3", auth });
  const res = await drive.files.get(
    { fileId: SHEET_ID, alt: "media" },
    { responseType: "arraybuffer" }
  );
  const workbook = XLSX.read(res.data as ArrayBuffer, { type: "buffer" });

  for (const tabName of TABS_TO_CHECK) {
    const ws = workbook.Sheets[tabName];
    if (!ws) { console.log(`\n❌ Tab "${tabName}" not found`); continue; }

    const rows: string[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
    const nonEmpty = rows.filter(r => r.some(c => String(c).trim()));
    console.log(`\n${"─".repeat(60)}`);
    console.log(`📄 "${tabName}"  (${nonEmpty.length} non-empty rows)`);
    nonEmpty.slice(0, 8).forEach((row, i) =>
      console.log(`  [${i + 1}] ${JSON.stringify(row.slice(0, 6))}`)
    );
  }
}

main().catch(e => { console.error("❌", e.message); process.exit(1); });
