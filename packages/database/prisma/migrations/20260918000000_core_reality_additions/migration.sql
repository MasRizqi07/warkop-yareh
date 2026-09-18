-- Migration: 20260918000000_core_reality_additions
-- Scope: Additive schema additions for Warkop Ya'reh core verified reality domain

-- CreateEnum
CREATE TYPE "AssetCategory" AS ENUM ('ATMOSPHERE', 'OUTLET_EXTERIOR', 'OUTLET_INTERIOR', 'MENU_DISPLAY', 'COMMUNITY');

-- CreateEnum
CREATE TYPE "FactConfidence" AS ENUM ('VERIFIED', 'PARTIALLY_VERIFIED', 'UNVERIFIED', 'VERIFIED_ABSENT', 'DISPUTED', 'DEPRECATED');

-- CreateEnum
CREATE TYPE "SourceType" AS ENUM ('PRIMARY_OPERATOR', 'DIRECT_PHYSICAL_AUDIT', 'GOOGLE_MAPS', 'SOCIAL_MEDIA', 'COMMUNITY_SUBMISSION', 'INFERRED');

-- AlterTable
ALTER TABLE "branches" ADD COLUMN IF NOT EXISTS "plusCode" TEXT;
ALTER TABLE "branches" ADD COLUMN IF NOT EXISTS "brandName" TEXT DEFAULT 'Warkop Ya''reh';

-- CreateTable
CREATE TABLE IF NOT EXISTS "business_hours" (
    "id" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "openTime" TEXT NOT NULL DEFAULT '00:00',
    "closeTime" TEXT NOT NULL DEFAULT '24:00',
    "is24Hours" BOOLEAN NOT NULL DEFAULT true,
    "isOpen" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "business_hours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "gallery_assets" (
    "id" TEXT NOT NULL,
    "branchId" TEXT,
    "title" TEXT NOT NULL,
    "caption" TEXT,
    "imageUrl" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "category" "AssetCategory" NOT NULL DEFAULT 'ATMOSPHERE',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isVerified" BOOLEAN NOT NULL DEFAULT true,
    "capturedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gallery_assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "site_contents" (
    "id" TEXT NOT NULL,
    "sectionKey" TEXT NOT NULL,
    "title" TEXT,
    "subtitle" TEXT,
    "body" TEXT,
    "metadata" JSONB,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "site_contents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "business_facts" (
    "id" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "entityKey" TEXT NOT NULL,
    "claim" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "confidence" "FactConfidence" NOT NULL DEFAULT 'UNVERIFIED',
    "notes" TEXT,
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastVerifiedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "business_facts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "source_references" (
    "id" TEXT NOT NULL,
    "factId" TEXT NOT NULL,
    "sourceType" "SourceType" NOT NULL,
    "name" TEXT NOT NULL,
    "referenceUrl" TEXT,
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verifiedBy" TEXT,
    "rawExcerpt" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "source_references_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "business_hours_branchId_idx" ON "business_hours"("branchId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "business_hours_branchId_dayOfWeek_key" ON "business_hours"("branchId", "dayOfWeek");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "gallery_assets_branchId_idx" ON "gallery_assets"("branchId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "gallery_assets_category_idx" ON "gallery_assets"("category");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "site_contents_sectionKey_key" ON "site_contents"("sectionKey");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "site_contents_sectionKey_idx" ON "site_contents"("sectionKey");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "business_facts_domain_idx" ON "business_facts"("domain");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "business_facts_confidence_idx" ON "business_facts"("confidence");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "business_facts_domain_entityKey_key" ON "business_facts"("domain", "entityKey");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "source_references_factId_idx" ON "source_references"("factId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "source_references_sourceType_idx" ON "source_references"("sourceType");

-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'business_hours_branchId_fkey'
  ) THEN
    ALTER TABLE "business_hours" ADD CONSTRAINT "business_hours_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'gallery_assets_branchId_fkey'
  ) THEN
    ALTER TABLE "gallery_assets" ADD CONSTRAINT "gallery_assets_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'source_references_factId_fkey'
  ) THEN
    ALTER TABLE "source_references" ADD CONSTRAINT "source_references_factId_fkey" FOREIGN KEY ("factId") REFERENCES "business_facts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

