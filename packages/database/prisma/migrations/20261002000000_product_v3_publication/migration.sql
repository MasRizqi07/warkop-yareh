-- Additive publication gate. Existing active products remain drafts until independently verified.
CREATE TYPE "ProductPublicationStatus" AS ENUM ('DRAFT', 'REVIEW', 'VERIFIED', 'PUBLISHED', 'ARCHIVED');

ALTER TABLE "products"
  ADD COLUMN "publicationStatus" "ProductPublicationStatus" NOT NULL DEFAULT 'DRAFT',
  ADD COLUMN "verifiedAt" TIMESTAMP(3),
  ADD COLUMN "verifiedById" TEXT,
  ADD COLUMN "sourceReferenceId" TEXT,
  ADD COLUMN "publishedAt" TIMESTAMP(3);

CREATE INDEX "products_publicationStatus_isActive_idx" ON "products"("publicationStatus", "isActive");
ALTER TABLE "products" ADD CONSTRAINT "products_sourceReferenceId_fkey"
  FOREIGN KEY ("sourceReferenceId") REFERENCES "source_references"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Remove guesses from future branch writes while preserving historical rows for review.
ALTER TABLE "branches"
  ALTER COLUMN "capacity" DROP NOT NULL,
  ALTER COLUMN "capacity" DROP DEFAULT,
  ALTER COLUMN "weekdayHours" DROP NOT NULL,
  ALTER COLUMN "weekdayHours" DROP DEFAULT,
  ALTER COLUMN "weekendHours" DROP NOT NULL,
  ALTER COLUMN "weekendHours" DROP DEFAULT;
