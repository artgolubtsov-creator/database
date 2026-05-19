import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { canManageOffers } from "@/lib/roles";

const patchSchema = z.object({
  type:         z.enum(["future", "current", "old"]).optional(),
  offerKind:    z.enum(["Main product", "Performance", "Trial", "Promo"]).optional().nullable(),
  date:         z.string().optional().nullable(),
  country:      z.string().min(1).optional(),
  tariff:       z.enum(["Basic", "Premium", "Crunchyroll"]).optional(),
  platform:     z.enum(["iOS", "Android", "Native"]).optional(),
  offerName:    z.string().min(1).optional(),
  offerValue:   z.string().optional().nullable(),
  price:        z.string().optional().nullable(),
  duration:     z.string().optional().nullable(),
  promoCode:    z.string().optional().nullable(),
  description:  z.string().optional().nullable(),
  source:       z.string().optional(),
  dateFrom:     z.string().optional().nullable(),
  dateTo:       z.string().optional().nullable(),
  comment:      z.string().optional().nullable(),
  status:       z.string().optional().nullable(),
  buttonTextEn: z.string().optional().nullable(),
  buttonTextAr: z.string().optional().nullable(),
  disclaimerEn: z.string().optional().nullable(),
  disclaimerAr: z.string().optional().nullable(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const role = session?.user?.role;
  if (!role || !canManageOffers(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const offer = await prisma.offerRecord.update({ where: { id }, data: parsed.data });
  return NextResponse.json(offer);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!canManageOffers(session?.user?.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  await prisma.offerRecord.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
