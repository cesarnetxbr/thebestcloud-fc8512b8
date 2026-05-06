-- Tabela de configurações da IA comercial (singleton key/value)
CREATE TABLE IF NOT EXISTS public.ai_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID
);

ALTER TABLE public.ai_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view ai_settings"
  ON public.ai_settings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin/manager can insert ai_settings"
  ON public.ai_settings FOR INSERT
  TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

CREATE POLICY "Admin/manager can update ai_settings"
  ON public.ai_settings FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

CREATE POLICY "Admin can delete ai_settings"
  ON public.ai_settings FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_ai_settings_updated_at
  BEFORE UPDATE ON public.ai_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Seed com os limiares atuais (preserva comportamento existente)
INSERT INTO public.ai_settings (key, value, description) VALUES
  ('lead_classification', 
   jsonb_build_object(
     'deal_threshold', 40,
     'tag_threshold', 75,
     'tag_name', 'Alta Probabilidade',
     'tag_color', '#16a34a',
     'enabled', true
   ),
   'Limiares de classificação automática da IA comercial: probabilidade mínima para criar card no Pipeline e para aplicar a tag de alta probabilidade'
  )
ON CONFLICT (key) DO NOTHING;