import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { canManageContent } from "@/lib/roles";

const schema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  link: z.string().url().or(z.literal("")).optional().transform(v => v || null),
  category: z.enum(["GUIDE", "LOGO", "PRESENTATION", "ACTIVE_OFFER"]).optional(),
  owner: z.string().optional().nullable(),
  isPublic: z.boolean().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const role = session?.user?.role;
  if (!role || !canManageContent(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const material = await prisma.brandMaterial.update({ where: { id }, data: parsed.data });
  return NextResponse.json(material);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  await prisma.brandMaterial.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
