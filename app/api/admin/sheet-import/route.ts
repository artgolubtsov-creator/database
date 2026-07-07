import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canManageOffers } from "@/lib/roles";
import { getSheetTabs, parseSheetTab, ParsedOfferRow } from "@/lib/offers/sheet-parser";
import { z } from "zod";

export async function GET(req: NextRequest) {
  const session = await auth();
  const role = session?.user?.role;
  if (!role || !canManageOffers(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const tab = searchParams.get("tab");

  try {
    if (!tab) {
      const tabs = await getSheetTabs();
      return NextResponse.json({ tabs });
    }
    const result = await parseSheetTab(tab);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

const rowSchema = z.object({
  country:      z.string(),
  buttonTextEn: z.string(),
  buttonTextAr: z.string(),
  disclaimerEn: z.string(),
  disclaimerAr: z.string(),
});

const importSchema = z.object({
  rows:      z.array(rowSchema),
  offerName: z.string().min(1),
  type:      z.enum(["future", "current", "old"]),
  tariff:    z.enum(["Basic", "Premium", "Crunchyroll"]),
  platforms: z.array(z.enum(["iOS", "Android", "Native"])).min(1),
  dateFrom:  z.string().optional().nullable(),
  dateTo:    z.string().optional().nullable(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  const role = session?.user?.role;
  if (!role || !canManageOffers(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = importSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { rows, offerName, type, tariff, platforms, dateFrom, dateTo } = parsed.data;

  const records = rows.flatMap((row: ParsedOfferRow) =>
    platforms.map((platform) => ({
      type,
      offerKind:    "Main product",
      country:      row.country,
      tariff,
      platform,
      offerName,
      source:       "Google Sheet",
      dateFrom:     dateFrom ?? null,
      dateTo:       dateTo ?? null,
      buttonTextEn: row.buttonTextEn || null,
      buttonTextAr: row.buttonTextAr || null,
      disclaimerEn: row.disclaimerEn || null,
      disclaimerAr: row.disclaimerAr || null,
      createdById:  session!.user.id,
    }))
  );

  await prisma.offerRecord.createMany({ data: records });

  return NextResponse.json({ created: records.length }, { status: 201 });
}
