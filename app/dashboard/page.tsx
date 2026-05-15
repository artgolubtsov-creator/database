import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/Navbar";
import { DashboardClient } from "./DashboardClient";

const PAGE_SIZE = 100;

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string; country?: string; genre?: string; dateFrom?: string; dateTo?: string; page?: string }>;
}) {
  const session = await auth();
  const params = await searchParams;
  const { q, type, country, genre, dateFrom, dateTo } = params;
  const page = Math.max(1, parseInt(params.page ?? "1") || 1);

  const where = {
    ...(type ? { contentType: type as never } : {}),
    ...(country ? { countries: { contains: country, mode: "insensitive" as const } } : {}),
    ...(genre ? { genres: { contains: genre, mode: "insensitive" as const } } : {}),
    ...(dateFrom || dateTo
      ? {
          createdAt: {
            ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
            ...(dateTo ? { lte: new Date(dateTo) } : {}),
          },
        }
      : {}),
    ...(q
      ? {
          OR: [
            { titleName: { contains: q, mode: "insensitive" as const } },
            { arabicTitle: { contains: q, mode: "insensitive" as const } },
            { titleId: { contains: q, mode: "insensitive" as const } },
            { kpId: { contains: q, mode: "insensitive" as const } },
            { description: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [entries, total] = await Promise.all([
    prisma.entry.findMany({
      where,
      orderBy: [{ year: { sort: "desc", nulls: "last" } }, { createdAt: "desc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        titleName: true,
        arabicTitle: true,
        contentType: true,
        titleId: true,
        kpId: true,
        year: true,
        countries: true,
        genres: true,
        portfolio: true,
        figmaLink: true,
        sourceLink: true,
        folderLink: true,
        adminPanelLink: true,
        performanceCopiesLink: true,
        digitalCopiesLink: true,
        copyDeckLink: true,
      },
    }),
    prisma.entry.count({ where }),
  ]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar role={session!.user.role} name={session!.user.name} />
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        <DashboardClient
          entries={entries}
          total={total}
          page={page}
          pageSize={PAGE_SIZE}
          initialQ={q ?? ""}
          initialContentType={type ?? ""}
          initialCountry={country ?? ""}
          initialGenre={genre ?? ""}
          initialDateFrom={dateFrom ?? ""}
          initialDateTo={dateTo ?? ""}
        />
      </main>
    </div>
  );
}
