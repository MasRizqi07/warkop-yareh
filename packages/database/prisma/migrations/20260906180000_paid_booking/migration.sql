CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE "reservations"
  ADD COLUMN "orderId" TEXT,
  ADD COLUMN "startAt" TIMESTAMP(3),
  ADD COLUMN "endAt" TIMESTAMP(3);

UPDATE "reservations" SET
  "startAt" = "date"::date + "startTime"::time - INTERVAL '7 hours',
  "endAt" = "date"::date + "endTime"::time - INTERVAL '7 hours';

ALTER TABLE "reservations"
  ALTER COLUMN "startAt" SET NOT NULL,
  ALTER COLUMN "endAt" SET NOT NULL,
  ADD CONSTRAINT "reservations_valid_interval" CHECK ("endAt" > "startAt"),
  ADD CONSTRAINT "reservations_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
CREATE UNIQUE INDEX "reservations_orderId_key" ON "reservations"("orderId");
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_table_no_overlap"
  EXCLUDE USING gist ("tableId" WITH =, tsrange("startAt", "endAt", '[)') WITH &&)
  WHERE ("tableId" IS NOT NULL AND "status" IN ('PENDING', 'CONFIRMED'));

INSERT INTO "categories" ("id", "name", "slug", "isActive", "updatedAt")
VALUES ('booking-services', 'Workspace packages', 'booking-services', false, CURRENT_TIMESTAMP);

INSERT INTO "products" ("id", "name", "slug", "description", "price", "categoryId", "isActive", "updatedAt") VALUES
('booking-morning', 'Morning Focus', 'booking-morning', '08:00-12:00 WIB, fresh roast included', 35000, 'booking-services', false, CURRENT_TIMESTAMP),
('booking-afternoon', 'Afternoon Deep Work', 'booking-afternoon', '13:00-18:00 WIB', 45000, 'booking-services', false, CURRENT_TIMESTAMP),
('booking-night-owl', 'Night Owl / Hackathon', 'booking-night-owl', '19:00-02:00 WIB on the following day', 55000, 'booking-services', false, CURRENT_TIMESTAMP),
('booking-full-day', '24H Full Day Pass', 'booking-full-day', '08:00-08:00 WIB on the following day, two drinks included', 85000, 'booking-services', false, CURRENT_TIMESTAMP),
('booking-cold-brew', 'Unlimited Cold Brew', 'booking-cold-brew', 'Booking add-on', 25000, 'booking-services', false, CURRENT_TIMESTAMP),
('booking-brew-flight', 'Manual Brew Flight', 'booking-brew-flight', 'Booking add-on', 35000, 'booking-services', false, CURRENT_TIMESTAMP),
('booking-monitor', '4K Monitor Rental', 'booking-monitor', 'Booking add-on', 40000, 'booking-services', false, CURRENT_TIMESTAMP);

CREATE FUNCTION public.available_booking_tables(branch_id TEXT, starts_at TIMESTAMP, ends_at TIMESTAMP)
RETURNS TABLE (id TEXT) LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
  SELECT t.id FROM public.tables t
  JOIN public.branches b ON b.id = t."branchId"
  WHERE t."branchId" = branch_id AND t."isActive" AND b."isActive" AND b."deletedAt" IS NULL
    AND NOT EXISTS (
      SELECT 1 FROM public.reservations r WHERE r."tableId" = t.id
        AND r.status IN ('PENDING', 'CONFIRMED')
        AND r."startAt" < ends_at AND r."endAt" > starts_at
    );
$$;
REVOKE ALL ON FUNCTION public.available_booking_tables(TEXT, TIMESTAMP, TIMESTAMP) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.available_booking_tables(TEXT, TIMESTAMP, TIMESTAMP) TO api_user;
