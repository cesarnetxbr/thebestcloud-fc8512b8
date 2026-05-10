-- Fase 4: tracking_token em crm_deals
ALTER TABLE public.crm_deals
  ADD COLUMN IF NOT EXISTS tracking_token UUID UNIQUE DEFAULT gen_random_uuid();

-- Backfill (caso defaults não tenham aplicado a linhas pré-existentes)
UPDATE public.crm_deals SET tracking_token = gen_random_uuid() WHERE tracking_token IS NULL;

-- Garantia via trigger
CREATE OR REPLACE FUNCTION public.set_deal_tracking_token()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.tracking_token IS NULL THEN
    NEW.tracking_token := gen_random_uuid();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_deal_tracking_token ON public.crm_deals;
CREATE TRIGGER trg_set_deal_tracking_token
BEFORE INSERT ON public.crm_deals
FOR EACH ROW
EXECUTE FUNCTION public.set_deal_tracking_token();

CREATE INDEX IF NOT EXISTS idx_crm_deals_tracking_token ON public.crm_deals(tracking_token);