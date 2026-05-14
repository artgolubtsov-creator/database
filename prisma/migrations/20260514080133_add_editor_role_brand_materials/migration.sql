-- CreateEnum
CREATE TYPE "BrandCategory" AS ENUM ('GUIDE', 'LOGO', 'PRESENTATION', 'ACTIVE_OFFER');

-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'EDITOR';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "BrandMaterial" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "link" TEXT,
    "category" "BrandCategory" NOT NULL,
    "owner" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "BrandMaterial_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BrandMaterial_category_idx" ON "BrandMaterial"("category");

-- AddForeignKey
ALTER TABLE "BrandMaterial" ADD CONSTRAINT "BrandMaterial_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
