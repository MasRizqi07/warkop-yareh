-- Enable RLS on users table
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
CREATE POLICY branch_isolation_users ON "users"
  FOR ALL
  USING (
    "branchId" IS NULL OR 
    "branchId" = current_setting('app.current_branch_id', true)
  );

-- Enable RLS on orders table
ALTER TABLE "orders" ENABLE ROW LEVEL SECURITY;
CREATE POLICY branch_isolation_orders ON "orders"
  FOR ALL
  USING (
    "branchId" IS NULL OR 
    "branchId" = current_setting('app.current_branch_id', true)
  );

-- Enable RLS on reservations table
ALTER TABLE "reservations" ENABLE ROW LEVEL SECURITY;
CREATE POLICY branch_isolation_reservations ON "reservations"
  FOR ALL
  USING ("branchId" = current_setting('app.current_branch_id', true));

-- Enable RLS on tables table
ALTER TABLE "tables" ENABLE ROW LEVEL SECURITY;
CREATE POLICY branch_isolation_tables ON "tables"
  FOR ALL
  USING ("branchId" = current_setting('app.current_branch_id', true));

-- Enable RLS on events table
ALTER TABLE "events" ENABLE ROW LEVEL SECURITY;
CREATE POLICY branch_isolation_events ON "events"
  FOR ALL
  USING ("branchId" = current_setting('app.current_branch_id', true));

-- Enable RLS on branch_products table
ALTER TABLE "branch_products" ENABLE ROW LEVEL SECURITY;
CREATE POLICY branch_isolation_branch_products ON "branch_products"
  FOR ALL
  USING ("branchId" = current_setting('app.current_branch_id', true));

-- Enable RLS on franchise_agreements table
ALTER TABLE "franchise_agreements" ENABLE ROW LEVEL SECURITY;
CREATE POLICY branch_isolation_franchise_agreements ON "franchise_agreements"
  FOR ALL
  USING ("branchId" = current_setting('app.current_branch_id', true));