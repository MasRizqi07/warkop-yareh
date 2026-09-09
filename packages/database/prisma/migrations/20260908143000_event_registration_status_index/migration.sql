DROP INDEX "event_registrations_eventId_idx";
CREATE INDEX "event_registrations_eventId_status_idx" ON "event_registrations"("eventId", "status");
