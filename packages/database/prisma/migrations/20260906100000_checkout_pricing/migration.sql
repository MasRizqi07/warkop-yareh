ALTER TABLE "orders"
  ADD COLUMN "serviceFee" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "loyaltyPointsRestored" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "orders" ADD CONSTRAINT "orders_service_fee_nonnegative" CHECK ("serviceFee" >= 0);

CREATE TABLE "vouchers" (
  "code" TEXT PRIMARY KEY,
  "amount" INTEGER NOT NULL CHECK ("amount" > 0),
  "minSubtotal" INTEGER NOT NULL DEFAULT 0 CHECK ("minSubtotal" >= 0),
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "startsAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expiresAt" TIMESTAMP(3),
  "usageLimit" INTEGER CHECK ("usageLimit" > 0),
  "usedCount" INTEGER NOT NULL DEFAULT 0 CHECK ("usedCount" >= 0),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "voucher_valid_dates" CHECK ("expiresAt" IS NULL OR "expiresAt" > "startsAt")
);
CREATE TABLE "voucher_redemptions" (
  "id" TEXT PRIMARY KEY,
  "voucherCode" TEXT NOT NULL REFERENCES "vouchers"("code") ON DELETE RESTRICT ON UPDATE CASCADE,
  "userId" TEXT NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  "orderId" TEXT NOT NULL REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX "voucher_redemptions_orderId_key" ON "voucher_redemptions"("orderId");
CREATE UNIQUE INDEX "voucher_redemptions_voucherCode_userId_key" ON "voucher_redemptions"("voucherCode", "userId");
GRANT SELECT, INSERT, UPDATE, DELETE ON "vouchers", "voucher_redemptions" TO api_user;
ALTER TABLE "voucher_redemptions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "voucher_redemptions" FORCE ROW LEVEL SECURITY;
CREATE POLICY "voucher_redemptions_owner" ON "voucher_redemptions" FOR ALL USING (
  CURRENT_USER <> 'api_user' OR
  "userId" = current_setting('app.current_user_id', true) OR
  current_setting('app.current_user_role', true) IN ('ADMIN', 'SUPERADMIN') OR
  EXISTS (SELECT 1 FROM "orders" o WHERE o."id" = "orderId" AND o."branchId" = current_setting('app.current_branch_id', true))
);
