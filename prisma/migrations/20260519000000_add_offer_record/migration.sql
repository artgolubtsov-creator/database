CREATE TABLE "OfferRecord" (
  "id"           TEXT         NOT NULL,
  "type"         TEXT         NOT NULL,
  "date"         TEXT,
  "country"      TEXT         NOT NULL,
  "tariff"       TEXT         NOT NULL,
  "platform"     TEXT         NOT NULL,
  "offerName"    TEXT         NOT NULL,
  "offerValue"   TEXT,
  "price"        TEXT,
  "duration"     TEXT,
  "promoCode"    TEXT,
  "description"  TEXT,
  "source"       TEXT         NOT NULL DEFAULT 'Manual',
  "dateFrom"     TEXT,
  "dateTo"       TEXT,
  "comment"      TEXT,
  "status"       TEXT,
  "buttonTextEn" TEXT,
  "buttonTextAr" TEXT,
  "disclaimerEn" TEXT,
  "disclaimerAr" TEXT,
  "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdById"  TEXT         NOT NULL,
  CONSTRAINT "OfferRecord_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "OfferRecord_type_idx"    ON "OfferRecord"("type");
CREATE INDEX "OfferRecord_country_idx" ON "OfferRecord"("country");

ALTER TABLE "OfferRecord"
  ADD CONSTRAINT "OfferRecord_createdById_fkey"
  FOREIGN KEY ("createdById") REFERENCES "User"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
