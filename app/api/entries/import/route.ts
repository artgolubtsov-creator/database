import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const CONTENT_TYPE_MAP: Record<string, string> = {
  "ott-movie": "MOVIES",
  "movie": "MOVIES",
  "tv-series": "SERIES",
  "series": "SERIES",
  "exclusive": "EXCLUSIVE",
  "original": "ORIGINAL",
};

function normalizeContentType(v: string | undefined): string | null {
  if (!v) return null;
  const mapped = CONTENT_TYPE_MAP[v.toLowerCase().trim()];
  if (mapped) return mapped;
  const upper = v.toUpperCase().trim();
  if (["EXCLUSIVE", "MOVIES", "SERIES", "ORIGINAL"].includes(upper)) return upper;
  return null;
}

const rowSchema = z.object({
  titleName: z.string().min(1),
  portfolio: z.string().optional().transform(v => v || "-"),
  project: z.string().optional().transform(v => v || "-"),
  contentType: z.string().optional().nullable(),
  titleId: z.string().optional().transform(v => v || null),
  kpId: z.string().optional().transform(v => v || null),
  description: z.string().optional().transform(v => v || null),
  rightholder: z.string().optional().transform(v => v || null),
  year: z.preprocess(
    (v) => (v === "" || v == null ? null : Number(v)),
    z.number().int().min(1900).max(2100).nullable().optional()
  ),
  genres: z.string().optional().transform(v => v || null),
  countries: z.string().optional().transform(v => v || null),
  restrictionAge: z.string().optional().transform(v => v || null),
  folderLink: z.string().url().or(z.literal("")).optional().transform(v => v || null),
  adminPanelLink: z.string().url().or(z.literal("")).optional().transform(v => v || null),
  figmaLink: z.string().url().or(z.literal("")).optional().transform(v => v || null),
  sourceLink: z.string().url().or(z.literal("")).optional().transform(v => v || null),
  arabicTitle: z.string().optional().transform(v => v || null),
  arabicDescription: z.string().optional().transform(v => v || null),
  arabicShortCopy: z.string().optional().transform(v => v || null),
  arabicMarketingCopy: z.string().optional().transform(v => v || null),
  arabicNotes: z.string().optional().transform(v => v || null),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  const role = session?.user?.role;
  if (!role || (role !== "ADMIN" && role !== "EDITOR")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { rows } = await req.json() as { rows: Record<string, string>[] };
  if (!Array.isArray(rows) || rows.length === 0) {
    return NextResponse.json({ error: "No rows provided" }, { status: 400 });
  }

  const results: { created: number; errors: { row: number; message: string }[] } = {
    created: 0,
    errors: [],
  };

  for (let i = 0; i < rows.length; i++) {
    const raw = rows[i];
    // Normalize content type before validation
    const normalized = { ...raw, contentType: normalizeContentType(raw.contentType) };

    const parsed = rowSchema.safeParse(normalized);
    if (!parsed.success) {
      const msg = Object.values(parsed.error.flatten().fieldErrors).flat().join("; ");
      results.errors.push({ row: i + 2, message: msg || "Validation error" });
      continue;
    }

    const { contentType, ...rest } = parsed.data;
    try {
      await prisma.entry.create({
        data: {
          ...rest,
          contentType: contentType as "EXCLUSIVE" | "MOVIES" | "SERIES" | "ORIGINAL" | null,
          createdById: session.user.id,
        },
      });
      results.created++;
    } catch {
      results.errors.push({ row: i + 2, message: "Database error — possibly duplicate" });
    }
  }

  return NextResponse.json(results);
}
