
-- Pipeline stages
CREATE TABLE public.crm_pipeline_stages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  color TEXT DEFAULT '#3b82f6',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.crm_pipeline_stages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view crm_pipeline_stages" ON public.crm_pipeline_stages FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins managers can manage crm_pipeline_stages" ON public.crm_pipeline_stages FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

-- Insert default stages
INSERT INTO public.crm_pipeline_stages (name, position, color) VALUES
  ('Prospecção', 0, '#6366f1'),
  ('Qualificação', 1, '#3b82f6'),
  ('Proposta', 2, '#f59e0b'),
  ('Negociação', 3, '#f97316'),
  ('Fechamento', 4, '#10b981'),
  ('Perdido', 5, '#ef4444');

-- Leads
CREATE TABLE public.crm_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  source TEXT NOT NULL DEFAULT 'manual',
  status TEXT NOT NULL DEFAULT 'novo',
  score INTEGER DEFAULT 0,
  assigned_to UUID,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.crm_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view crm_leads" ON public.crm_leads FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins managers can insert crm_leads" ON public.crm_leads FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));
CREATE POLICY "Admins managers can update crm_leads" ON public.crm_leads FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));
CREATE POLICY "Admins can delete crm_leads" ON public.crm_leads FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_crm_leads_updated_at BEFORE UPDATE ON public.crm_leads FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Deals
CREATE TABLE public.crm_deals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  value NUMERIC DEFAULT 0,
  lead_id UUID REFERENCES public.crm_leads(id) ON DELETE SET NULL,
  stage_id UUID REFERENCES public.crm_pipeline_stages(id) ON DELETE SET NULL,
  assigned_to UUID,
  expected_close_date DATE,
  probability INTEGER DEFAULT 50,
  status TEXT NOT NULL DEFAULT 'aberto',
  quote_id UUID REFERENCES public.quotes(id) ON DELETE SET NULL,
  request_id UUID REFERENCES public.commercial_requests(id) ON DELETE SET NULL,
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.crm_deals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view crm_deals" ON public.crm_deals FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins managers can insert crm_deals" ON public.crm_deals FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));
CREATE POLICY "Admins managers can update crm_deals" ON public.crm_deals FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));
CREATE POLICY "Admins can delete crm_deals" ON public.crm_deals FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_crm_deals_updated_at BEFORE UPDATE ON public.crm_deals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Activities
CREATE TABLE public.crm_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  deal_id UUID REFERENCES public.crm_deals(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES public.crm_leads(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'nota',
  description TEXT NOT NULL,
  scheduled_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.crm_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view crm_activities" ON public.crm_activities FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins managers can insert crm_activities" ON public.crm_activities FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));
CREATE POLICY "Admins managers can update crm_activities" ON public.crm_activities FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));
CREATE POLICY "Admins can delete crm_activities" ON public.crm_activities FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
