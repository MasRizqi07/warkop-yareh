CREATE TYPE "CashierShiftStatus" AS ENUM ('OPEN', 'CLOSED');
CREATE TYPE "CashMovementType" AS ENUM ('CASH_IN', 'CASH_OUT');

CREATE TABLE "cashier_shifts" (
  "id" TEXT NOT NULL,
  "branchId" TEXT NOT NULL,
  "openedById" TEXT NOT NULL,
  "closedById" TEXT,
  "status" "CashierShiftStatus" NOT NULL DEFAULT 'OPEN',
  "openingFloat" INTEGER NOT NULL,
  "closingCash" INTEGER,
  "expectedCash" INTEGER,
  "variance" INTEGER,
  "notes" TEXT,
  "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "closedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "cashier_shifts_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "cashier_shifts_opening_float_nonnegative" CHECK ("openingFloat" >= 0),
  CONSTRAINT "cashier_shifts_closing_cash_nonnegative" CHECK ("closingCash" IS NULL OR "closingCash" >= 0),
  CONSTRAINT "cashier_shifts_closed_state_consistent" CHECK (
    ("status" = 'OPEN' AND "closedAt" IS NULL AND "closingCash" IS NULL AND "expectedCash" IS NULL AND "variance" IS NULL AND "closedById" IS NULL)
    OR
    ("status" = 'CLOSED' AND "closedAt" IS NOT NULL AND "closingCash" IS NOT NULL AND "expectedCash" IS NOT NULL AND "variance" IS NOT NULL AND "closedById" IS NOT NULL)
  ),
  CONSTRAINT "cashier_shifts_branch_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "cashier_shifts_opened_by_fkey" FOREIGN KEY ("openedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "cashier_shifts_closed_by_fkey" FOREIGN KEY ("closedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "cash_drawer_movements" (
  "id" TEXT NOT NULL,
  "shiftId" TEXT NOT NULL,
  "type" "CashMovementType" NOT NULL,
  "amount" INTEGER NOT NULL,
  "reason" TEXT NOT NULL,
  "createdById" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "cash_drawer_movements_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "cash_drawer_movements_amount_positive" CHECK ("amount" > 0),
  CONSTRAINT "cash_drawer_movements_reason_nonempty" CHECK (length(btrim("reason")) >= 3),
  CONSTRAINT "cash_drawer_movements_shift_fkey" FOREIGN KEY ("shiftId") REFERENCES "cashier_shifts"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "cash_drawer_movements_created_by_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "cashier_shifts_one_open_per_branch" ON "cashier_shifts"("branchId") WHERE "status" = 'OPEN';
CREATE INDEX "cashier_shifts_branchId_status_idx" ON "cashier_shifts"("branchId", "status");
CREATE INDEX "cashier_shifts_branchId_openedAt_idx" ON "cashier_shifts"("branchId", "openedAt");
CREATE INDEX "cashier_shifts_openedById_idx" ON "cashier_shifts"("openedById");
CREATE INDEX "cashier_shifts_closedById_idx" ON "cashier_shifts"("closedById");
CREATE INDEX "cash_drawer_movements_shiftId_createdAt_idx" ON "cash_drawer_movements"("shiftId", "createdAt");
CREATE INDEX "cash_drawer_movements_createdById_idx" ON "cash_drawer_movements"("createdById");

GRANT SELECT, INSERT, UPDATE, DELETE ON "cashier_shifts", "cash_drawer_movements" TO api_user;

ALTER TABLE "cashier_shifts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "cashier_shifts" FORCE ROW LEVEL SECURITY;
CREATE POLICY "cashier_shifts_branch_isolation" ON "cashier_shifts" FOR ALL
USING (
  CURRENT_USER <> 'api_user'
  OR current_setting('app.current_user_role', true) IN ('ADMIN', 'SUPERADMIN')
  OR "branchId" = current_setting('app.current_branch_id', true)
)
WITH CHECK (
  CURRENT_USER <> 'api_user'
  OR current_setting('app.current_user_role', true) IN ('ADMIN', 'SUPERADMIN')
  OR "branchId" = current_setting('app.current_branch_id', true)
);

ALTER TABLE "cash_drawer_movements" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "cash_drawer_movements" FORCE ROW LEVEL SECURITY;
CREATE POLICY "cash_drawer_movements_branch_isolation" ON "cash_drawer_movements" FOR ALL
USING (
  CURRENT_USER <> 'api_user'
  OR current_setting('app.current_user_role', true) IN ('ADMIN', 'SUPERADMIN')
  OR EXISTS (
    SELECT 1 FROM "cashier_shifts" shift
    WHERE shift."id" = "shiftId"
      AND shift."branchId" = current_setting('app.current_branch_id', true)
  )
)
WITH CHECK (
  CURRENT_USER <> 'api_user'
  OR current_setting('app.current_user_role', true) IN ('ADMIN', 'SUPERADMIN')
  OR EXISTS (
    SELECT 1 FROM "cashier_shifts" shift
    WHERE shift."id" = "shiftId"
      AND shift."branchId" = current_setting('app.current_branch_id', true)
  )
);
