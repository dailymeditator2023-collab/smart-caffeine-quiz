-- Grant table access to anon and authenticated roles
-- (RLS policies already exist, but the base GRANT was missing)

GRANT SELECT ON campaigns TO anon, authenticated;
GRANT SELECT ON questions TO anon, authenticated;
GRANT SELECT, INSERT ON entries TO anon, authenticated;

-- Also grant usage on the schema
GRANT USAGE ON SCHEMA public TO anon, authenticated;
