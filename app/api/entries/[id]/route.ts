import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  portfolio: z.string().min(1).optional(),
  project: z.string().min(1).optional(),
  task: z.string().min(1).optional(),
  folderLink: z.string().url().or(z.literal("")).optional().transform(v => v || null),
  adminPanelLink: z.string().url().or(z.literal("")).optional().transform(v => v || null),
  titleId: z.string().optional().transform(v => v || null),
  kpId: z.string().optional().transform(v => v || null),
  figmaLink: z.string().url().or(z.literal("")).optional().transform(v => v || null),
  sourceLink: z.string().url().or(z.literal("")).optional().transform(v => v || null),
  description: z.string().optional().transform(v => v || null),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const entry = await prisma.entry.update({ where: { id }, data: parsed.data });
  return NextResponse.json(entry);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  await prisma.entry.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
