
-- LGPD Data Mapping (ROPA)
CREATE TABLE public.lgpd_data_mapping (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  data_category TEXT NOT NULL,
  personal_data_types TEXT NOT NULL,
  purpose TEXT NOT NULL,
  legal_basis TEXT NOT NULL,
  storage_location TEXT NOT NULL DEFAULT 'Lovable Cloud',
  retention_period TEXT NOT NULL DEFAULT '5 anos',
  third_parties TEXT,
  is_sensitive BOOLEAN NOT NULL DEFAULT false,
  data_subjects TEXT NOT NULL DEFAULT 'Clientes',
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.lgpd_data_mapping ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins and managers can view lgpd_data_mapping" ON public.lgpd_data_mapping
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

CREATE POLICY "Admins and managers can insert lgpd_data_mapping" ON public.lgpd_data_mapping
  FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

CREATE POLICY "Admins and managers can update lgpd_data_mapping" ON public.lgpd_data_mapping
  FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

CREATE POLICY "Admins can delete lgpd_data_mapping" ON public.lgpd_data_mapping
  FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_lgpd_data_mapping_updated_at
  BEFORE UPDATE ON public.lgpd_data_mapping
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- LGPD Consent Records
CREATE TABLE public.lgpd_consent_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_identifier TEXT NOT NULL,
  consent_type TEXT NOT NULL DEFAULT 'cookies',
  granted BOOLEAN NOT NULL DEFAULT false,
  ip_address TEXT,
  user_agent TEXT,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.lgpd_consent_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins and managers can view lgpd_consent_records" ON public.lgpd_consent_records
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

CREATE POLICY "Anyone can insert consent records" ON public.lgpd_consent_records
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- LGPD Data Requests (Direitos dos Titulares)
CREATE SEQUENCE IF NOT EXISTS lgpd_request_seq START 1;

CREATE TABLE public.lgpd_data_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  protocol_number TEXT NOT NULL,
  requester_name TEXT NOT NULL,
  requester_email TEXT NOT NULL,
  requester_document TEXT,
  request_type TEXT NOT NULL DEFAULT 'access',
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pendente',
  admin_response TEXT,
  responded_by UUID,
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.lgpd_data_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins and managers can view lgpd_data_requests" ON public.lgpd_data_requests
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

CREATE POLICY "Anyone can create lgpd_data_requests" ON public.lgpd_data_requests
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can update lgpd_data_requests" ON public.lgpd_data_requests
  FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete lgpd_data_requests" ON public.lgpd_data_requests
  FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_lgpd_data_requests_updated_at
  BEFORE UPDATE ON public.lgpd_data_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Generate protocol for data requests
CREATE OR REPLACE FUNCTION public.generate_lgpd_request_protocol()
  RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.protocol_number := 'LGPD-' || TO_CHAR(now(), 'YYYY') || '-' || LPAD(nextval('lgpd_request_seq')::TEXT, 5, '0');
  RETURN NEW;
END;
$$;

CREATE TRIGGER generate_lgpd_request_protocol_trigger
  BEFORE INSERT ON public.lgpd_data_requests
  FOR EACH ROW EXECUTE FUNCTION public.generate_lgpd_request_protocol();

-- LGPD Incidents
CREATE TABLE public.lgpd_incidents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'media',
  affected_data TEXT,
  affected_count INTEGER DEFAULT 0,
  notified_anpd BOOLEAN NOT NULL DEFAULT false,
  notified_at TIMESTAMPTZ,
  resolution TEXT,
  status TEXT NOT NULL DEFAULT 'aberto',
  reported_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.lgpd_incidents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins and managers can view lgpd_incidents" ON public.lgpd_incidents
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

CREATE POLICY "Admins and managers can insert lgpd_incidents" ON public.lgpd_incidents
  FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

CREATE POLICY "Admins can update lgpd_incidents" ON public.lgpd_incidents
  FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete lgpd_incidents" ON public.lgpd_incidents
  FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_lgpd_incidents_updated_at
  BEFORE UPDATE ON public.lgpd_incidents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
