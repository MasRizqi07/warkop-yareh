-- The API switches to the least-privilege api_user role for each request.
-- These editorial tables were created after the role's initial table grant.
GRANT SELECT, INSERT, UPDATE ON "gallery_assets", "site_contents" TO api_user;
