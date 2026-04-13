
CREATE TABLE public.trial_clients (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  cpf_cnpj text,
  support_option text NOT NULL DEFAULT 'email',
  available_date date,
  available_time text,
  status text NOT NULL DEFAULT 'pending',
  trial_start_date date,
  trial_end_date date,
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE SET NULL,
  customer_id uuid REFERENCES public.customers(id) ON DELETE SET NULL,
  ticket_id uuid REFERENCES public.tickets(id) ON DELETE SET NULL,
  notes text,
  commercial_notes text,
  technical_notes text,
  converted_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.trial_clients ENABLE ROW LEVEL SECURITY;

-- Admins and managers full access
CREATE POLICY "Admins and managers can manage trial_clients"
ON public.trial_clients FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

-- Operators and supervisors can view
CREATE POLICY "Staff can view trial_clients"
ON public.trial_clients FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'operador'::app_role) OR has_role(auth.uid(), 'supervisor'::app_role));

-- Operators and supervisors can update
CREATE POLICY "Staff can update trial_clients"
ON public.trial_clients FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'operador'::app_role) OR has_role(auth.uid(), 'supervisor'::app_role));

-- Anonymous can insert (public trial form)
CREATE POLICY "Anyone can create trial_clients"
ON public.trial_clients FOR INSERT TO anon
WITH CHECK (name IS NOT NULL AND name <> '' AND email IS NOT NULL AND email <> '');

-- Trigger for updated_at
CREATE TRIGGER update_trial_clients_updated_at
BEFORE UPDATE ON public.trial_clients
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
