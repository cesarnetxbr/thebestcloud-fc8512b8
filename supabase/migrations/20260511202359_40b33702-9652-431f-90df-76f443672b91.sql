
-- 1) audit_logs: remove client INSERT (logging happens via SECURITY DEFINER trigger)
DROP POLICY IF EXISTS "Authenticated users can insert audit_logs" ON public.audit_logs;

-- 2) quote_items: enforce admin/manager role on SELECT
DROP POLICY IF EXISTS "Admins and managers can view quote_items" ON public.quote_items;
CREATE POLICY "Admins and managers can view quote_items"
  ON public.quote_items FOR SELECT
  TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'manager'::app_role)
  );

-- 3) ombudsman_reports: remove broad anon SELECT, expose lookup via SECURITY DEFINER function
DROP POLICY IF EXISTS "Public can view reports by protocol" ON public.ombudsman_reports;

CREATE OR REPLACE FUNCTION public.lookup_ombudsman_report(_protocol text)
RETURNS TABLE (
  id uuid,
  protocol_number text,
  type text,
  subject text,
  description text,
  status text,
  admin_response text,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, protocol_number, type, subject, description, status, admin_response, created_at, updated_at
  FROM public.ombudsman_reports
  WHERE protocol_number = _protocol
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.lookup_ombudsman_report(text) TO anon, authenticated;
