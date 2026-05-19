import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { canManageContent } from "@/lib/roles";

const urlField = z.union([z.string().url(), z.literal(""), z.null()]).optional().transform(v => v || null);
const strField = z.union([z.string(), z.null()]).optional().transform(v => v || null);

const schema = z.object({
  titleName: z.string().min(1),
  contentType: z.enum(["EXCLUSIVE", "MOVIES", "SERIES", "ORIGINAL"]).optional().nullable(),
  portfolio: z.string().min(1),
  project: z.string().min(1),
  titleId: strField,
  kpId: strField,
  description: strField,

  folderLink: urlField,
  adminPanelLink: urlField,
  figmaLink: urlField,
  sourceLink: urlField,
  performanceCopiesLink: urlField,
  digitalCopiesLink: urlField,
  copyDeckLink: urlField,

  arabicTitle: strField,
  arabicDescription: strField,
  arabicShortCopy: strField,
  arabicMarketingCopy: strField,
  arabicNotes: strField,

  rightholder: strField,
  year: z.coerce.number().int().min(1900).max(2100).optional().nullable(),
  restrictionAge: strField,
  genres: strField,
  countries: strField,

  mainPosterStatus: z.enum(["ADDED", "NOT_RECEIVED_YET", "NOT_REQUIRED", "REQUEST_FROM_OTT"]).optional().nullable(),
  characterPostersStatus: z.enum(["ADDED", "NOT_RECEIVED_YET", "NOT_REQUIRED", "REQUEST_FROM_OTT"]).optional().nullable(),
  trailerStatus: z.enum(["ADDED", "NOT_RECEIVED_YET", "NOT_REQUIRED", "REQUEST_FROM_OTT"]).optional().nullable(),
  teaserStatus: z.enum(["ADDED", "NOT_RECEIVED_YET", "NOT_REQUIRED", "REQUEST_FROM_OTT"]).optional().nullable(),
  episodesStatus: z.enum(["ADDED", "NOT_RECEIVED_YET", "NOT_REQUIRED", "REQUEST_FROM_OTT"]).optional().nullable(),
  highlightsNotes: strField,
});

export async function POST(req: NextRequest) {
  const session = await auth();
  const role = session?.user?.role;
  if (!role || !canManageContent(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const entry = await prisma.entry.create({
    data: { ...parsed.data, createdById: session.user.id },
  });

  return NextResponse.json(entry, { status: 201 });
}
