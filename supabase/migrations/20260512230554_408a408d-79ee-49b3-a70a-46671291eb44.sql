ALTER TABLE public.quotes
  ADD COLUMN IF NOT EXISTS payment_method text DEFAULT 'faturado',
  ADD COLUMN IF NOT EXISTS discount_type text,
  ADD COLUMN IF NOT EXISTS discount_value numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS installments_plan text,
  ADD COLUMN IF NOT EXISTS installments jsonb,
  ADD COLUMN IF NOT EXISTS final_value numeric,
  ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'aguardando',
  ADD COLUMN IF NOT EXISTS payment_link text;

-- Validation trigger (no CHECK due to mutability concerns)
CREATE OR REPLACE FUNCTION public.validate_quote_payment()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.payment_method IS NOT NULL AND NEW.payment_method NOT IN ('a_vista','faturado') THEN
    RAISE EXCEPTION 'payment_method inválido: %', NEW.payment_method;
  END IF;
  IF NEW.discount_type IS NOT NULL AND NEW.discount_type NOT IN ('percent','value') THEN
    RAISE EXCEPTION 'discount_type inválido: %', NEW.discount_type;
  END IF;
  IF NEW.payment_status IS NOT NULL AND NEW.payment_status NOT IN ('aguardando','pago','faturado','parcial') THEN
    RAISE EXCEPTION 'payment_status inválido: %', NEW.payment_status;
  END IF;
  IF NEW.final_value IS NOT NULL AND NEW.final_value < 0 THEN
    RAISE EXCEPTION 'final_value não pode ser negativo';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_quote_payment ON public.quotes;
CREATE TRIGGER trg_validate_quote_payment
BEFORE INSERT OR UPDATE ON public.quotes
FOR EACH ROW EXECUTE FUNCTION public.validate_quote_payment();