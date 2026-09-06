-- Store the provider redirect URL so payment initialization can be replayed
-- safely without issuing a duplicate transaction to Midtrans.
ALTER TABLE "payments"
ADD COLUMN "redirectUrl" TEXT;
