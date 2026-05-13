import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/Navbar";
import { EntryCard } from "@/components/EntryCard";
import { DashboardClient } from "./DashboardClient";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; portfolio?: string; project?: string }>;
}) {
  const session = await auth();
  const params = await searchParams;
  const { q, portfolio, project } = params;

  const where = {
    ...(portfolio ? { portfolio } : {}),
    ...(project ? { project } : {}),
    ...(q
      ? {
          OR: [
            { portfolio: { contains: q, mode: "insensitive" as const } },
            { project: { contains: q, mode: "insensitive" as const } },
            { task: { contains: q, mode: "insensitive" as const } },
            { titleId: { contains: q, mode: "insensitive" as const } },
            { kpId: { contains: q, mode: "insensitive" as const } },
            { description: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [entries, portfolios, projects] = await Promise.all([
    prisma.entry.findMany({ where, orderBy: { createdAt: "desc" } }),
    prisma.entry.findMany({ select: { portfolio: true }, distinct: ["portfolio"] }),
    prisma.entry.findMany({ select: { project: true }, distinct: ["project"] }),
  ]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar role={session!.user.role} name={session!.user.name} />
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        <DashboardClient
          entries={entries}
          portfolioOptions={portfolios.map((p) => p.portfolio)}
          projectOptions={projects.map((p) => p.project)}
          initialQ={q ?? ""}
          initialPortfolio={portfolio ?? ""}
          initialProject={project ?? ""}
        />
      </main>
    </div>
  );
}
