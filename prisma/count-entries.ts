import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const count = await prisma.entry.count();
  console.log("Entries in DB:", count);
}
main().finally(() => prisma.$disconnect());
