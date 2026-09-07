ALTER TABLE "users"
  ADD COLUMN "whatsAppMarketingOptInAt" TIMESTAMP(3);

COMMENT ON COLUMN "users"."whatsAppMarketingOptInAt" IS
  'Explicit customer opt-in timestamp for promotional WhatsApp delivery; NULL means no active consent.';
