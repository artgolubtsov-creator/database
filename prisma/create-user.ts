import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "tinaaltaie@yango-team.com";
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log("User already exists:", existing.email, existing.role);
    return;
  }
  const passwordHash = await bcrypt.hash("qwerty", 12);
  const user = await prisma.user.create({
    data: { email, name: "Tina Altaie", role: "EDITOR", passwordHash, isActive: true },
  });
  console.log("Created:", user.email, user.role);
}

main().catch(console.error).finally(() => prisma.$disconnect());
