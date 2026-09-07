ALTER TABLE "branch_products"
  ADD COLUMN "stockQuantity" DECIMAL(12,3),
  ADD COLUMN "stockCapacity" DECIMAL(12,3),
  ADD COLUMN "stockThreshold" DECIMAL(12,3),
  ADD COLUMN "stockUnit" TEXT,
  ADD COLUMN "supplier" TEXT,
  ADD COLUMN "leadTimeHours" INTEGER,
  ADD COLUMN "burnRatePerDay" DECIMAL(12,3),
  ADD COLUMN "inventoryUpdatedAt" TIMESTAMP(3);

ALTER TABLE "branch_products"
  ADD CONSTRAINT "branch_products_stock_quantity_nonnegative" CHECK ("stockQuantity" IS NULL OR "stockQuantity" >= 0),
  ADD CONSTRAINT "branch_products_stock_capacity_positive" CHECK ("stockCapacity" IS NULL OR "stockCapacity" > 0),
  ADD CONSTRAINT "branch_products_stock_threshold_nonnegative" CHECK ("stockThreshold" IS NULL OR "stockThreshold" >= 0),
  ADD CONSTRAINT "branch_products_stock_threshold_capacity" CHECK (
    "stockThreshold" IS NULL OR "stockCapacity" IS NULL OR "stockThreshold" <= "stockCapacity"
  ),
  ADD CONSTRAINT "branch_products_lead_time_nonnegative" CHECK ("leadTimeHours" IS NULL OR "leadTimeHours" >= 0),
  ADD CONSTRAINT "branch_products_burn_rate_nonnegative" CHECK ("burnRatePerDay" IS NULL OR "burnRatePerDay" >= 0);

CREATE TYPE "MarketingCampaignStatus" AS ENUM ('DRAFT', 'DISPATCHING', 'SENT', 'FAILED');
CREATE TYPE "MarketingDeliveryStatus" AS ENUM ('PENDING', 'SENT', 'FAILED');

CREATE TABLE "marketing_campaigns" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "objective" TEXT NOT NULL,
  "audience" TEXT NOT NULL,
  "targetUserId" TEXT,
  "branchId" TEXT,
  "discountPercent" INTEGER NOT NULL DEFAULT 0,
  "expiresInHours" INTEGER NOT NULL,
  "message" TEXT NOT NULL,
  "includeHeaderMedia" BOOLEAN NOT NULL DEFAULT false,
  "status" "MarketingCampaignStatus" NOT NULL DEFAULT 'DRAFT',
  "recipientCount" INTEGER NOT NULL DEFAULT 0,
  "createdById" TEXT NOT NULL,
  "dispatchedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "marketing_campaigns_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "marketing_campaigns_discount_range" CHECK ("discountPercent" BETWEEN 0 AND 100),
  CONSTRAINT "marketing_campaigns_expiry_positive" CHECK ("expiresInHours" > 0),
  CONSTRAINT "marketing_campaigns_recipient_count_nonnegative" CHECK ("recipientCount" >= 0),
  CONSTRAINT "marketing_campaigns_target_user_fkey" FOREIGN KEY ("targetUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "marketing_campaigns_branch_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "marketing_campaigns_created_by_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "marketing_deliveries" (
  "id" TEXT NOT NULL,
  "campaignId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "channel" TEXT NOT NULL DEFAULT 'WHATSAPP',
  "recipient" TEXT NOT NULL,
  "status" "MarketingDeliveryStatus" NOT NULL DEFAULT 'PENDING',
  "providerMessageId" TEXT,
  "failureReason" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "marketing_deliveries_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "marketing_deliveries_campaign_fkey" FOREIGN KEY ("campaignId") REFERENCES "marketing_campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "marketing_deliveries_user_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "marketing_campaigns_branchId_createdAt_idx" ON "marketing_campaigns"("branchId", "createdAt");
CREATE INDEX "marketing_campaigns_targetUserId_idx" ON "marketing_campaigns"("targetUserId");
CREATE INDEX "marketing_campaigns_status_createdAt_idx" ON "marketing_campaigns"("status", "createdAt");
CREATE UNIQUE INDEX "marketing_deliveries_campaignId_userId_channel_key" ON "marketing_deliveries"("campaignId", "userId", "channel");
CREATE INDEX "marketing_deliveries_campaignId_status_idx" ON "marketing_deliveries"("campaignId", "status");
CREATE INDEX "marketing_deliveries_userId_createdAt_idx" ON "marketing_deliveries"("userId", "createdAt");

GRANT SELECT, INSERT, UPDATE, DELETE ON "marketing_campaigns", "marketing_deliveries" TO api_user;

ALTER TABLE "marketing_campaigns" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "marketing_campaigns" FORCE ROW LEVEL SECURITY;
CREATE POLICY "marketing_campaigns_branch_isolation" ON "marketing_campaigns" FOR ALL USING (
  CURRENT_USER <> 'api_user' OR
  current_setting('app.current_user_role', true) IN ('ADMIN', 'SUPERADMIN') OR
  "branchId" = current_setting('app.current_branch_id', true)
);

ALTER TABLE "marketing_deliveries" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "marketing_deliveries" FORCE ROW LEVEL SECURITY;
CREATE POLICY "marketing_deliveries_branch_isolation" ON "marketing_deliveries" FOR ALL USING (
  CURRENT_USER <> 'api_user' OR
  current_setting('app.current_user_role', true) IN ('ADMIN', 'SUPERADMIN') OR
  EXISTS (
    SELECT 1 FROM "marketing_campaigns" campaign
    WHERE campaign."id" = "campaignId"
      AND campaign."branchId" = current_setting('app.current_branch_id', true)
  )
);
