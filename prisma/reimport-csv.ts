import { PrismaClient } from "@prisma/client";
import { readFileSync } from "fs";
import { resolve } from "path";

const prisma = new PrismaClient();

const CONTENT_TYPE_MAP: Record<string, string> = {
  "ott-movie": "MOVIES",
  "movie": "MOVIES",
  "tv-series": "SERIES",
  "series": "SERIES",
  "exclusive": "EXCLUSIVE",
  "original": "ORIGINAL",
};

function normalizeContentType(v: string): string | null {
  if (!v) return null;
  const mapped = CONTENT_TYPE_MAP[v.toLowerCase().trim()];
  if (mapped) return mapped;
  const upper = v.toUpperCase().trim();
  if (["EXCLUSIVE", "MOVIES", "SERIES", "ORIGINAL"].includes(upper)) return upper;
  return null;
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

// Proper multiline-aware CSV parser — reads entire text at once
function parseCSV(text: string): Record<string, string>[] {
  const rows: Record<string, string>[] = [];
  let pos = 0;
  const len = text.length;

  function readField(): string {
    if (pos >= len) return "";
    if (text[pos] === '"') {
      pos++; // skip opening quote
      let field = "";
      while (pos < len) {
        if (text[pos] === '"') {
          if (text[pos + 1] === '"') { field += '"'; pos += 2; }
          else { pos++; break; } // closing quote
        } else {
          field += text[pos++];
        }
      }
      return field;
    } else {
      let field = "";
      while (pos < len && text[pos] !== ',' && text[pos] !== '\n' && text[pos] !== '\r') {
        field += text[pos++];
      }
      return field;
    }
  }

  function readRow(): string[] | null {
    if (pos >= len) return null;
    const fields: string[] = [];
    while (true) {
      fields.push(readField());
      if (pos >= len || text[pos] === '\n' || text[pos] === '\r') {
        // consume line ending
        if (pos < len && text[pos] === '\r') pos++;
        if (pos < len && text[pos] === '\n') pos++;
        break;
      }
      if (text[pos] === ',') pos++;
    }
    return fields;
  }

  const headerFields = readRow();
  if (!headerFields) return rows;
  const headers = headerFields.map((h) => h.trim());

  while (pos < len) {
    const fields = readRow();
    if (!fields) break;
    // Skip blank rows
    if (fields.every((f) => !f.trim())) continue;
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = (fields[i] ?? "").trim(); });
    rows.push(row);
  }

  return rows;
}

async function main() {
  const csvPath = process.argv[2];
  if (!csvPath) {
    console.error("Usage: tsx prisma/reimport-csv.ts <path-to-csv>");
    process.exit(1);
  }

  // 1. Delete previously imported entries (portfolio="-" and project="-")
  const deleted = await prisma.entry.deleteMany({
    where: { portfolio: "-", project: "-" },
  });
  console.log(`Deleted ${deleted.count} previously imported entries`);

  // 2. Find admin user
  const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  if (!admin) { console.error("No ADMIN user found"); process.exit(1); }
  console.log(`Using admin: ${admin.email}`);

  // 3. Parse CSV properly
  const text = readFileSync(resolve(csvPath), "utf-8").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const rows = parseCSV(text);
  console.log(`Parsed ${rows.length} rows from CSV`);

  // 4. Import
  let created = 0;
  let skipped = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const titleName = row["title_en"] || row["titleName"] || row["title"] || "";
    if (!titleName) { skipped++; continue; }

    const contentType = normalizeContentType(row["content_type"] || row["contentType"] || "");
    const yearRaw = parseInt(row["year"] ?? "");
    const year = !isNaN(yearRaw) && yearRaw >= 1900 && yearRaw <= 2100 ? yearRaw : null;

    try {
      await prisma.entry.create({
        data: {
          titleName,
          portfolio: "-",
          project: "-",
          contentType: contentType as "EXCLUSIVE" | "MOVIES" | "SERIES" | "ORIGINAL" | null,
          titleId: row["entity_id"] || row["titleId"] || null,
          kpId: row["uuid"] || row["kpId"] || null,
          description: row["ott_description_en"] || row["description"] || null,
          arabicTitle: row["title_ar"] || row["arabicTitle"] || null,
          arabicDescription: row["ott_description_ar"] || row["arabicDescription"] || null,
          rightholder: row["rightholder"] || null,
          year,
          restrictionAge: row["restriction_age"] || row["restrictionAge"] || null,
          genres: row["genres"] || null,
          countries: row["countries"] || null,
          createdById: admin.id,
        },
      });
      created++;
      if (created % 100 === 0) process.stdout.write(`\r  ${created} created...`);
    } catch {
      skipped++;
    }
  }

  console.log(`\n\nDone: ${created} created, ${skipped} skipped (out of ${rows.length} rows)`);
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
