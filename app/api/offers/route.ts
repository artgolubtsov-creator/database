import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { canManageOffers } from "@/lib/roles";

const offerSchema = z.object({
  type:         z.enum(["future", "current", "old"]),
  offerKind:    z.enum(["Main product", "Performance", "Trial", "Promo"]).optional().nullable(),
  date:         z.string().optional().nullable(),
  country:      z.string().min(1),
  tariff:       z.enum(["Basic", "Premium", "Crunchyroll"]),
  platform:     z.enum(["iOS", "Android", "Native"]),
  offerName:    z.string().min(1),
  offerValue:   z.string().optional().nullable(),
  price:        z.string().optional().nullable(),
  duration:     z.string().optional().nullable(),
  promoCode:    z.string().optional().nullable(),
  description:  z.string().optional().nullable(),
  source:       z.string().optional().default("Manual"),
  dateFrom:     z.string().optional().nullable(),
  dateTo:       z.string().optional().nullable(),
  comment:      z.string().optional().nullable(),
  status:       z.string().optional().nullable(),
  buttonTextEn: z.string().optional().nullable(),
  buttonTextAr: z.string().optional().nullable(),
  disclaimerEn: z.string().optional().nullable(),
  disclaimerAr: z.string().optional().nullable(),
});

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const type      = searchParams.get("type");
  const country   = searchParams.get("country");
  const tariff    = searchParams.get("tariff");
  const platform  = searchParams.get("platform");
  const offerKind = searchParams.get("offerKind");

  const offers = await prisma.offerRecord.findMany({
    where: {
      ...(type      ? { type }      : {}),
      ...(country   ? { country }   : {}),
      ...(tariff    ? { tariff }    : {}),
      ...(platform  ? { platform }  : {}),
      ...(offerKind ? { offerKind } : {}),
    },
    orderBy: [{ type: "asc" }, { country: "asc" }, { createdAt: "desc" }],
  });

  return NextResponse.json(offers);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  const role = session?.user?.role;
  if (!role || !canManageOffers(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = offerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const offer = await prisma.offerRecord.create({
    data: { ...parsed.data, createdById: session.user.id },
  });

  return NextResponse.json(offer, { status: 201 });
}
