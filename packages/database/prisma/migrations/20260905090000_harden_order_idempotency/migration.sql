-- Persist order idempotency at the database boundary so concurrent requests
-- cannot create duplicate orders when cache checks race or Redis is unavailable.
ALTER TABLE "orders"
ADD COLUMN "idempotencyKeyHash" TEXT,
ADD COLUMN "requestFingerprint" TEXT;

CREATE UNIQUE INDEX "orders_idempotencyKeyHash_key"
ON "orders"("idempotencyKeyHash");

CREATE INDEX "orders_branchId_createdAt_idx"
ON "orders"("branchId", "createdAt");

CREATE INDEX "orders_userId_createdAt_idx"
ON "orders"("userId", "createdAt");
