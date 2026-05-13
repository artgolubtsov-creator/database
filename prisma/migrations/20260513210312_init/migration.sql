-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'VIEWER');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'VIEWER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Entry" (
    "id" TEXT NOT NULL,
    "portfolio" TEXT NOT NULL,
    "project" TEXT NOT NULL,
    "task" TEXT NOT NULL,
    "folderLink" TEXT,
    "adminPanelLink" TEXT,
    "titleId" TEXT,
    "kpId" TEXT,
    "figmaLink" TEXT,
    "sourceLink" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "Entry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Entry_portfolio_idx" ON "Entry"("portfolio");

-- CreateIndex
CREATE INDEX "Entry_project_idx" ON "Entry"("project");

-- CreateIndex
CREATE INDEX "Entry_titleId_idx" ON "Entry"("titleId");

-- CreateIndex
CREATE INDEX "Entry_kpId_idx" ON "Entry"("kpId");

-- AddForeignKey
ALTER TABLE "Entry" ADD CONSTRAINT "Entry_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
