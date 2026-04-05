
DROP POLICY IF EXISTS "Allow trial ticket inserts" ON public.tickets;

CREATE POLICY "Allow public trial ticket inserts"
  ON public.tickets FOR INSERT
  TO anon, authenticated
  WITH CHECK (created_by = '00000000-0000-0000-0000-000000000000'::uuid);
