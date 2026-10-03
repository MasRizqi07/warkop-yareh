-- Historical booking package rows are retained for FK/order compatibility.
-- They are not verified menu products and must never be published by default.
UPDATE "products"
SET "publicationStatus" = 'ARCHIVED', "isActive" = false, "publishedAt" = NULL
WHERE "id" IN (
  'booking-morning', 'booking-afternoon', 'booking-night-owl',
  'booking-full-day', 'booking-cold-brew', 'booking-brew-flight', 'booking-monitor'
)
AND "publicationStatus" = 'DRAFT';

UPDATE "categories" SET "isActive" = false WHERE "id" = 'booking-services';
