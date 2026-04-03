
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS razao_social text;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS nome_fantasia text;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS cep text;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS endereco text;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS numero text;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS complemento text;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS bairro text;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS cidade text;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS estado text;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS exclude_auto_invoice boolean DEFAULT false;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS exclude_auto_email boolean DEFAULT false;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS exclude_auto_crm boolean DEFAULT false;
