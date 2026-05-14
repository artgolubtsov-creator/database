import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/Navbar";
import { DashboardClient } from "./DashboardClient";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string; country?: string; genre?: string; dateFrom?: string; dateTo?: string }>;
}) {
  const session = await auth();
  const params = await searchParams;
  const { q, type, country, genre, dateFrom, dateTo } = params;

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
            { portfolio: { contains: q, mode: "insensitive" as const } },
            { project: { contains: q, mode: "insensitive" as const } },
            { titleId: { contains: q, mode: "insensitive" as const } },
            { kpId: { contains: q, mode: "insensitive" as const } },
            { description: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const entries = await prisma.entry.findMany({ where, orderBy: { createdAt: "desc" } });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar role={session!.user.role} name={session!.user.name} />
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        <DashboardClient
          entries={entries}
          contentTypeOptions={["EXCLUSIVE", "MOVIES", "SERIES", "ORIGINAL"]}
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
