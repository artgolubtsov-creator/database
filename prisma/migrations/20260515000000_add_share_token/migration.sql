-- Add shareToken as nullable first
ALTER TABLE "Entry" ADD COLUMN "shareToken" TEXT;

-- Backfill existing rows with unique UUIDs
UPDATE "Entry" SET "shareToken" = gen_random_uuid()::text WHERE "shareToken" IS NULL;

-- Now make it required
ALTER TABLE "Entry" ALTER COLUMN "shareToken" SET NOT NULL;

-- Add unique constraint
CREATE UNIQUE INDEX "Entry_shareToken_key" ON "Entry"("shareToken");
