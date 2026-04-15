
CREATE TABLE public.crm_appointments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  start_at TIMESTAMP WITH TIME ZONE NOT NULL,
  end_at TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT,
  type TEXT NOT NULL DEFAULT 'reuniao',
  status TEXT NOT NULL DEFAULT 'agendado',
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  lead_id UUID REFERENCES public.crm_leads(id) ON DELETE SET NULL,
  deal_id UUID REFERENCES public.crm_deals(id) ON DELETE SET NULL,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.crm_appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view crm_appointments"
ON public.crm_appointments FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins managers can insert crm_appointments"
ON public.crm_appointments FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

CREATE POLICY "Admins managers can update crm_appointments"
ON public.crm_appointments FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

CREATE POLICY "Admins can delete crm_appointments"
ON public.crm_appointments FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_crm_appointments_updated_at
BEFORE UPDATE ON public.crm_appointments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_crm_appointments_start ON public.crm_appointments(start_at);
CREATE INDEX idx_crm_appointments_customer ON public.crm_appointments(customer_id);
