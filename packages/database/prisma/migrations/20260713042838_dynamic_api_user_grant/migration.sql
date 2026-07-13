DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_auth_members m
    JOIN pg_roles r ON m.roleid = r.oid
    JOIN pg_roles u ON m.member = u.oid
    WHERE r.rolname = 'api_user' AND u.rolname = current_user
  ) THEN
    EXECUTE format('GRANT api_user TO %I', current_user);
  END IF;
END
$$;