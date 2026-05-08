CREATE TABLE IF NOT EXISTS public.company_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  singleton boolean NOT NULL DEFAULT true UNIQUE,
  nome_fantasia text,
  razao_social text,
  cnpj text,
  email text,
  phone text,
  website text,
  slogan text,
  endereco text,
  numero text,
  complemento text,
  cep text,
  bairro text,
  cidade text,
  estado text,
  signed_by_name text,
  signed_by_title text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view company settings"
  ON public.company_settings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins manage company settings"
  ON public.company_settings FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_company_settings_updated
  BEFORE UPDATE ON public.company_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.company_settings (singleton, nome_fantasia, slogan)
VALUES (true, 'The Best Cloud', 'Soluções em Cloud e Cybersegurança')
ON CONFLICT (singleton) DO NOTHING;