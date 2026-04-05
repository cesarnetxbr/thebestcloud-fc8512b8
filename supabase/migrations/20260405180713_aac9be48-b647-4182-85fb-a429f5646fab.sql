
-- Fix consent records INSERT policy
DROP POLICY "Anyone can insert consent records" ON public.lgpd_consent_records;
CREATE POLICY "Anyone can insert consent records" ON public.lgpd_consent_records
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    user_identifier IS NOT NULL AND user_identifier <> ''
    AND consent_type IS NOT NULL AND consent_type <> ''
  );

-- Fix data requests INSERT policy  
DROP POLICY "Anyone can create lgpd_data_requests" ON public.lgpd_data_requests;
CREATE POLICY "Anyone can create lgpd_data_requests" ON public.lgpd_data_requests
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    requester_name IS NOT NULL AND requester_name <> ''
    AND requester_email IS NOT NULL AND requester_email <> ''
  );
