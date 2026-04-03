
-- Audit logs table
CREATE TABLE public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  operation TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id UUID,
  user_id UUID,
  user_email TEXT,
  tenant_name TEXT,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view audit_logs" ON public.audit_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "System can insert audit_logs" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (true);

-- Index for performance
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_entity ON public.audit_logs(entity);
CREATE INDEX idx_audit_logs_operation ON public.audit_logs(operation);

-- Generic audit trigger function
CREATE OR REPLACE FUNCTION public.log_audit_event()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _operation TEXT;
  _entity_id UUID;
  _details JSONB;
  _user_email TEXT;
BEGIN
  IF TG_OP = 'INSERT' THEN
    _operation := 'Criação';
    _entity_id := NEW.id;
    _details := to_jsonb(NEW);
  ELSIF TG_OP = 'UPDATE' THEN
    _operation := 'Atualização';
    _entity_id := NEW.id;
    _details := jsonb_build_object('old', to_jsonb(OLD), 'new', to_jsonb(NEW));
  ELSIF TG_OP = 'DELETE' THEN
    _operation := 'Exclusão';
    _entity_id := OLD.id;
    _details := to_jsonb(OLD);
  END IF;

  -- Try to get user email
  BEGIN
    SELECT email INTO _user_email FROM auth.users WHERE id = auth.uid();
  EXCEPTION WHEN OTHERS THEN
    _user_email := NULL;
  END;

  INSERT INTO public.audit_logs (operation, entity, entity_id, user_id, user_email, details)
  VALUES (_operation, TG_TABLE_NAME, _entity_id, auth.uid(), _user_email, _details);

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

-- Attach triggers to main tables
CREATE TRIGGER audit_customers AFTER INSERT OR UPDATE OR DELETE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();
CREATE TRIGGER audit_connections AFTER INSERT OR UPDATE OR DELETE ON public.connections FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();
CREATE TRIGGER audit_tenants AFTER INSERT OR UPDATE OR DELETE ON public.tenants FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();
CREATE TRIGGER audit_price_tables AFTER INSERT OR UPDATE OR DELETE ON public.price_tables FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();
CREATE TRIGGER audit_invoices AFTER INSERT OR UPDATE OR DELETE ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();
CREATE TRIGGER audit_skus AFTER INSERT OR UPDATE OR DELETE ON public.skus FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();
