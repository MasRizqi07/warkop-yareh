-- Additive evidence fields and safer defaults. Existing values are preserved.
ALTER TABLE "gallery_assets" ADD COLUMN "provenance" TEXT NOT NULL DEFAULT 'UNVERIFIED';
ALTER TABLE "gallery_assets" ADD COLUMN "sourceUrl" TEXT;
ALTER TABLE "gallery_assets" ADD COLUMN "sourceType" "SourceType";
ALTER TABLE "gallery_assets" ADD COLUMN "lastVerifiedAt" TIMESTAMP(3);
ALTER TABLE "gallery_assets" ALTER COLUMN "isVerified" SET DEFAULT false;
ALTER TABLE "site_contents" ALTER COLUMN "isPublished" SET DEFAULT false;
ALTER TABLE "business_facts" ALTER COLUMN "capturedAt" DROP NOT NULL;
ALTER TABLE "business_facts" ALTER COLUMN "capturedAt" DROP DEFAULT;
ALTER TABLE "business_facts" ALTER COLUMN "lastVerifiedAt" DROP NOT NULL;
ALTER TABLE "business_facts" ALTER COLUMN "lastVerifiedAt" DROP DEFAULT;
ALTER TABLE "source_references" ALTER COLUMN "capturedAt" DROP NOT NULL;
ALTER TABLE "source_references" ALTER COLUMN "capturedAt" DROP DEFAULT;
