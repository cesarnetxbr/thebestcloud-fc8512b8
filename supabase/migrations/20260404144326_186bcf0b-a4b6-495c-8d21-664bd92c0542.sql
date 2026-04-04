DO $$
DECLARE
  pol record;
BEGIN
  FOR pol IN
    SELECT schemaname, tablename, policyname, cmd
    FROM pg_policies
    WHERE schemaname = 'public'
      AND (
        qual = 'true'
        OR with_check = 'true'
        OR qual = '(true)'
        OR with_check = '(true)'
      )
  LOOP
    RAISE NOTICE 'Permissive policy found: %.% (%)', pol.tablename, pol.policyname, pol.cmd;
  END LOOP;
END $$;