/*
  Warnings:

  - You are about to drop the column `task` on the `Entry` table. All the data in the column will be lost.
  - Added the required column `titleName` to the `Entry` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ContentType" AS ENUM ('EXCLUSIVE', 'MOVIES', 'SERIES', 'ORIGINAL');

-- CreateEnum
CREATE TYPE "MaterialStatus" AS ENUM ('ADDED', 'NOT_RECEIVED_YET', 'NOT_REQUIRED', 'REQUEST_FROM_OTT');

-- AlterTable
ALTER TABLE "Entry" DROP COLUMN "task",
ADD COLUMN     "arabicDescription" TEXT,
ADD COLUMN     "arabicMarketingCopy" TEXT,
ADD COLUMN     "arabicNotes" TEXT,
ADD COLUMN     "arabicShortCopy" TEXT,
ADD COLUMN     "arabicTitle" TEXT,
ADD COLUMN     "characterPostersStatus" "MaterialStatus",
ADD COLUMN     "contentType" "ContentType",
ADD COLUMN     "copyDeckLink" TEXT,
ADD COLUMN     "countries" TEXT,
ADD COLUMN     "digitalCopiesLink" TEXT,
ADD COLUMN     "episodesStatus" "MaterialStatus",
ADD COLUMN     "genres" TEXT,
ADD COLUMN     "highlightsNotes" TEXT,
ADD COLUMN     "mainPosterStatus" "MaterialStatus",
ADD COLUMN     "performanceCopiesLink" TEXT,
ADD COLUMN     "restrictionAge" TEXT,
ADD COLUMN     "rightholder" TEXT,
ADD COLUMN     "teaserStatus" "MaterialStatus",
ADD COLUMN     "titleName" TEXT NOT NULL,
ADD COLUMN     "trailerStatus" "MaterialStatus",
ADD COLUMN     "year" INTEGER;

-- CreateIndex
CREATE INDEX "Entry_contentType_idx" ON "Entry"("contentType");
