import { PrismaClient } from "@prisma/client";
import { readFileSync } from "fs";
import { resolve } from "path";

function parseCSV(text: string): Record<string, string>[] {
  const rows: Record<string, string>[] = [];
  let pos = 0;
  const len = text.length;

  function readField(): string {
    if (pos >= len) return "";
    if (text[pos] === '"') {
      pos++;
      let field = "";
      while (pos < len) {
        if (text[pos] === '"') {
          if (text[pos + 1] === '"') { field += '"'; pos += 2; }
          else { pos++; break; }
        } else field += text[pos++];
      }
      return field;
    }
    let field = "";
    while (pos < len && text[pos] !== ',' && text[pos] !== '\n' && text[pos] !== '\r')
      field += text[pos++];
    return field;
  }

  function readRow(): string[] | null {
    if (pos >= len) return null;
    const fields: string[] = [];
    while (true) {
      fields.push(readField());
      if (pos >= len || text[pos] === '\n' || text[pos] === '\r') {
        if (pos < len && text[pos] === '\r') pos++;
        if (pos < len && text[pos] === '\n') pos++;
        break;
      }
      if (text[pos] === ',') pos++;
    }
    return fields;
  }

  const headerRow = readRow();
  if (!headerRow) return rows;
  const headers = headerRow.map(h => h.trim());

  while (pos < len) {
    const fields = readRow();
    if (!fields) break;
    if (fields.every(f => !f.trim())) continue;
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = (fields[i] ?? "").trim(); });
    rows.push(row);
  }
  return rows;
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

const TRANSIENT = new Set(["P1001", "P1002", "P1008", "P1017"]);

async function withRetry<T>(fn: (prisma: PrismaClient) => Promise<T>, retries = 5): Promise<T> {
  let prisma = new PrismaClient();
  for (let i = 0; i <= retries; i++) {
    try {
      const result = await fn(prisma);
      await prisma.$disconnect();
      return result;
    } catch (e: any) {
      await prisma.$disconnect().catch(() => {});
      if (i < retries && TRANSIENT.has(e?.code)) {
        const delay = 2000 * (i + 1);
        process.stderr.write(`\n  [retry ${i + 1}] ${e.code} — waiting ${delay}ms\n`);
        await sleep(delay);
        prisma = new PrismaClient();
        continue;
      }
      throw e;
    }
  }
  throw new Error("unreachable");
}

async function main() {
  const csvPath = process.argv[2] ?? "/tmp/sheets.csv";
  const text = readFileSync(resolve(csvPath), "utf-8").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const rows = parseCSV(text);
  console.log(`Parsed ${rows.length} rows`);

  const map = new Map<string, { figmaLink?: string; sourceLink?: string }>();

  for (const row of rows) {
    const id = (row["mena_id"] ?? "").trim();
    if (!id || id === "#N/A" || !/^\d+$/.test(id)) continue;

    const figma = (row["ссылка на Figma"] ?? "").trim();
    const source = (row["Sources"] ?? "").trim();

    const existing = map.get(id) ?? {};
    if (figma && figma !== "#N/A") existing.figmaLink = figma;
    if (source && source !== "#N/A") existing.sourceLink = source;
    map.set(id, existing);
  }

  console.log(`Unique mena_ids to process: ${map.size}`);

  let updated = 0;
  let notFound = 0;

  for (const [menaId, data] of map) {
    if (!data.figmaLink && !data.sourceLink) continue;

    const entry = await withRetry(p =>
      p.entry.findFirst({ where: { titleId: menaId }, select: { id: true } })
    );
    if (!entry) { notFound++; continue; }

    await withRetry(p =>
      p.entry.update({
        where: { id: entry.id },
        data: {
          ...(data.figmaLink ? { figmaLink: data.figmaLink } : {}),
          ...(data.sourceLink ? { sourceLink: data.sourceLink } : {}),
        },
      })
    );
    updated++;
    if (updated % 50 === 0) process.stdout.write(`\r  ${updated} updated...`);

    // Small pause every 10 queries to not overwhelm pgbouncer
    if (updated % 10 === 0) await sleep(200);
  }

  console.log(`\n\nDone: ${updated} entries updated, ${notFound} mena_ids not found in DB`);
}

main().catch(e => { console.error(e); process.exit(1); });
