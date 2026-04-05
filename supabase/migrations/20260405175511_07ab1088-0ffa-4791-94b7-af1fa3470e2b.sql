
-- Fix audit_logs: restrict SELECT to admins + own entries
DROP POLICY IF EXISTS "Authenticated users can view audit_logs" ON public.audit_logs;

CREATE POLICY "Admins can view audit_logs"
  ON public.audit_logs FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view own audit_logs"
  ON public.audit_logs FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Fix trial ticket insert: restrict to authenticated only
DROP POLICY IF EXISTS "Allow public trial ticket inserts" ON public.tickets;

CREATE POLICY "Allow trial ticket inserts"
  ON public.tickets FOR INSERT
  TO authenticated
  WITH CHECK (created_by = '00000000-0000-0000-0000-000000000000'::uuid);
