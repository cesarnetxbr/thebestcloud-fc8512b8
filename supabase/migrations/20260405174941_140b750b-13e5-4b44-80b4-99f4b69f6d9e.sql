
DROP POLICY IF EXISTS "Authenticated users can view connections" ON public.connections;

CREATE POLICY "Admins and managers can view connections"
  ON public.connections FOR SELECT
  TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'manager'::app_role)
  );
