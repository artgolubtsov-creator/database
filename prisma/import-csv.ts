import { PrismaClient } from "@prisma/client";
import { createReadStream } from "fs";
import { createInterface } from "readline";
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

async function main() {
  const csvPath = process.argv[2];
  if (!csvPath) {
    console.error("Usage: tsx prisma/import-csv.ts <path-to-csv>");
    process.exit(1);
  }

  // Find admin user to set createdById
  const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  if (!admin) {
    console.error("No ADMIN user found in database");
    process.exit(1);
  }
  console.log(`Using admin: ${admin.email}`);

  const rl = createInterface({
    input: createReadStream(resolve(csvPath), { encoding: "utf-8" }),
    crlfDelay: Infinity,
  });

  let headers: string[] = [];
  let created = 0;
  let skipped = 0;
  let rowNum = 0;

  for await (const line of rl) {
    rowNum++;
    if (rowNum === 1) {
      headers = parseLine(line).map((h) => h.trim());
      console.log(`Headers: ${headers.slice(0, 6).join(", ")} ...`);
      continue;
    }

    const values = parseLine(line);
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = (values[i] ?? "").trim(); });

    const titleName = row["title_en"] || row["titleName"] || row["title"];
    if (!titleName) { skipped++; continue; }

    const contentType = normalizeContentType(
      row["content_type"] || row["contentType"] || ""
    );
    const year = row["year"] ? parseInt(row["year"]) : null;
    const validYear = year && year >= 1900 && year <= 2100 ? year : null;

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
          year: validYear,
          restrictionAge: row["restriction_age"] || row["restrictionAge"] || null,
          genres: row["genres"] || null,
          countries: row["countries"] || null,
          createdById: admin.id,
        },
      });
      created++;
      if (created % 100 === 0) process.stdout.write(`\r  ${created} created...`);
    } catch (e) {
      skipped++;
      if (skipped <= 5) console.error(`\nRow ${rowNum} error:`, (e as Error).message?.slice(0, 80));
    }
  }

  console.log(`\n\nDone: ${created} created, ${skipped} skipped (out of ${rowNum - 1} rows)`);
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
