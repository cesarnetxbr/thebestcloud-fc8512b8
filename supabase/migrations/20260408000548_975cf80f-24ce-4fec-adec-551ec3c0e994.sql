
-- Allow anonymous users to insert ombudsman reports (public ouvidoria)
CREATE POLICY "Public can create ombudsman reports"
ON public.ombudsman_reports
FOR INSERT
TO anon
WITH CHECK (created_by = '00000000-0000-0000-0000-000000000000'::uuid);

-- Allow anonymous users to search by protocol number
CREATE POLICY "Public can view reports by protocol"
ON public.ombudsman_reports
FOR SELECT
TO anon
USING (true);
