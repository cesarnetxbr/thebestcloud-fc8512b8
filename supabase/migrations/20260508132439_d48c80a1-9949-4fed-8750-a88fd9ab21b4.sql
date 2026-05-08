-- Versionamento
ALTER TABLE public.quotes
  ADD COLUMN IF NOT EXISTS parent_quote_id uuid REFERENCES public.quotes(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS version integer NOT NULL DEFAULT 1;

CREATE INDEX IF NOT EXISTS idx_quotes_parent ON public.quotes(parent_quote_id);

-- Tabela de histórico/auditoria
CREATE TABLE IF NOT EXISTS public.quote_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id uuid NOT NULL REFERENCES public.quotes(id) ON DELETE CASCADE,
  user_id uuid,
  user_email text,
  action text NOT NULL,
  changes jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_quote_audit_quote ON public.quote_audit_log(quote_id, created_at DESC);

ALTER TABLE public.quote_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin/manager can view quote_audit_log"
  ON public.quote_audit_log FOR SELECT TO authenticated
  USING (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'manager'::app_role));

CREATE POLICY "Authenticated can insert quote_audit_log"
  ON public.quote_audit_log FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- Trigger de auditoria
CREATE OR REPLACE FUNCTION public.log_quote_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _email text;
  _action text;
  _changes jsonb;
BEGIN
  BEGIN
    SELECT email INTO _email FROM auth.users WHERE id = auth.uid();
  EXCEPTION WHEN OTHERS THEN _email := NULL; END;

  IF TG_OP = 'INSERT' THEN
    _action := 'criado';
    _changes := jsonb_build_object('quote_number', NEW.quote_number, 'status', NEW.status, 'version', NEW.version, 'total_value', NEW.total_value);
  ELSIF TG_OP = 'UPDATE' THEN
    _action := 'atualizado';
    _changes := jsonb_build_object(
      'old', jsonb_build_object('status', OLD.status, 'total_value', OLD.total_value, 'customer_name', OLD.customer_name),
      'new', jsonb_build_object('status', NEW.status, 'total_value', NEW.total_value, 'customer_name', NEW.customer_name)
    );
    IF OLD.status IS DISTINCT FROM NEW.status THEN
      _action := 'status alterado: ' || OLD.status || ' → ' || NEW.status;
    END IF;
  END IF;

  INSERT INTO public.quote_audit_log(quote_id, user_id, user_email, action, changes)
  VALUES (NEW.id, auth.uid(), _email, _action, _changes);

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_log_quote_changes ON public.quotes;
CREATE TRIGGER trg_log_quote_changes
  AFTER INSERT OR UPDATE ON public.quotes
  FOR EACH ROW EXECUTE FUNCTION public.log_quote_changes();
