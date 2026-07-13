-- Drop old policies if they exist
DROP POLICY IF EXISTS branch_isolation_users ON "users";
DROP POLICY IF EXISTS branch_isolation_orders ON "orders";
DROP POLICY IF EXISTS branch_isolation_reservations ON "reservations";
DROP POLICY IF EXISTS branch_isolation_tables ON "tables";
DROP POLICY IF EXISTS branch_isolation_events ON "events";
DROP POLICY IF EXISTS branch_isolation_branch_products ON "branch_products";
DROP POLICY IF EXISTS branch_isolation_franchise_agreements ON "franchise_agreements";

-- 1. Users table policy
CREATE POLICY branch_isolation_users ON "users"
  FOR ALL
  USING (
    CURRENT_USER != 'api_user' OR
    "id" = current_setting('app.current_user_id', true) OR
    "branchId" = current_setting('app.current_branch_id', true) OR
    current_setting('app.current_user_role', true) IN ('ADMIN', 'SUPERADMIN')
  );

-- 2. Orders table policy
CREATE POLICY branch_isolation_orders ON "orders"
  FOR ALL
  USING (
    CURRENT_USER != 'api_user' OR
    "userId" = current_setting('app.current_user_id', true) OR
    "branchId" = current_setting('app.current_branch_id', true) OR
    current_setting('app.current_user_role', true) IN ('ADMIN', 'SUPERADMIN')
  );

-- 3. Reservations table policy
CREATE POLICY branch_isolation_reservations ON "reservations"
  FOR ALL
  USING (
    CURRENT_USER != 'api_user' OR
    "userId" = current_setting('app.current_user_id', true) OR
    "branchId" = current_setting('app.current_branch_id', true) OR
    current_setting('app.current_user_role', true) IN ('ADMIN', 'SUPERADMIN')
  );

-- 4. Tables table policy
CREATE POLICY branch_isolation_tables ON "tables"
  FOR ALL
  USING (
    CURRENT_USER != 'api_user' OR
    current_setting('app.current_user_role', true) IN ('CUSTOMER', 'SUPERADMIN', 'ADMIN') OR
    "branchId" = current_setting('app.current_branch_id', true)
  );

-- 5. Events table policy
CREATE POLICY branch_isolation_events ON "events"
  FOR ALL
  USING (
    CURRENT_USER != 'api_user' OR
    current_setting('app.current_user_role', true) IN ('CUSTOMER', 'SUPERADMIN', 'ADMIN') OR
    "branchId" = current_setting('app.current_branch_id', true)
  );

-- 6. Branch Products table policy
CREATE POLICY branch_isolation_branch_products ON "branch_products"
  FOR ALL
  USING (
    CURRENT_USER != 'api_user' OR
    current_setting('app.current_user_role', true) IN ('CUSTOMER', 'SUPERADMIN', 'ADMIN') OR
    "branchId" = current_setting('app.current_branch_id', true)
  );

-- 7. Franchise Agreements table policy
CREATE POLICY branch_isolation_franchise_agreements ON "franchise_agreements"
  FOR ALL
  USING (
    CURRENT_USER != 'api_user' OR
    "branchId" = current_setting('app.current_branch_id', true) OR
    current_setting('app.current_user_role', true) IN ('ADMIN', 'SUPERADMIN')
  );
