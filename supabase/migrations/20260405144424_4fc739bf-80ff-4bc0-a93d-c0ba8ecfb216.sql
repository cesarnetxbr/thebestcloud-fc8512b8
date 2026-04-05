
-- Create ombudsman_reports table
CREATE TABLE public.ombudsman_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  protocol_number TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL DEFAULT 'reclamacao',
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendente',
  admin_response TEXT,
  responded_at TIMESTAMP WITH TIME ZONE,
  responded_by UUID,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ombudsman_reports ENABLE ROW LEVEL SECURITY;

-- Users can view their own reports
CREATE POLICY "Users can view own ombudsman reports"
ON public.ombudsman_reports
FOR SELECT
TO authenticated
USING (auth.uid() = created_by OR public.has_role(auth.uid(), 'admin'));

-- Users can create reports
CREATE POLICY "Users can create ombudsman reports"
ON public.ombudsman_reports
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);

-- Only admins can update reports
CREATE POLICY "Admins can update ombudsman reports"
ON public.ombudsman_reports
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_ombudsman_reports_updated_at
BEFORE UPDATE ON public.ombudsman_reports
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Audit trigger
CREATE TRIGGER audit_ombudsman_reports
AFTER INSERT OR UPDATE OR DELETE ON public.ombudsman_reports
FOR EACH ROW
EXECUTE FUNCTION public.log_audit_event();

-- Sequence for protocol numbers
CREATE SEQUENCE IF NOT EXISTS ombudsman_protocol_seq START 1;

-- Function to generate protocol number
CREATE OR REPLACE FUNCTION public.generate_ombudsman_protocol()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.protocol_number := 'OUV-' || TO_CHAR(now(), 'YYYY') || '-' || LPAD(nextval('ombudsman_protocol_seq')::TEXT, 5, '0');
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_ombudsman_protocol
BEFORE INSERT ON public.ombudsman_reports
FOR EACH ROW
EXECUTE FUNCTION public.generate_ombudsman_protocol();
