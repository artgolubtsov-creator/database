import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  title: z.string().min(1),
  description: z.string().optional().nullable(),
  link: z.string().url().or(z.literal("")).optional().transform(v => v || null),
  category: z.enum(["GUIDE", "LOGO", "PRESENTATION", "ACTIVE_OFFER"]),
  owner: z.string().optional().nullable(),
  isPublic: z.boolean().optional().default(true),
});

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const materials = await prisma.brandMaterial.findMany({
    orderBy: [{ category: "asc" }, { createdAt: "desc" }],
    select: {
      id: true, title: true, description: true, link: true,
      category: true, owner: true, isPublic: true, createdAt: true,
    },
  });

  return NextResponse.json(materials);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const material = await prisma.brandMaterial.create({
    data: { ...parsed.data, createdById: session.user.id },
  });

  return NextResponse.json(material, { status: 201 });
}
