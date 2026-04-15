
-- SMS Marketing Contacts
CREATE TABLE public.sms_marketing_contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT,
  phone TEXT NOT NULL,
  email TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  tags TEXT[],
  metadata JSONB,
  opted_in_at TIMESTAMPTZ DEFAULT now(),
  opted_out_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(phone)
);
ALTER TABLE public.sms_marketing_contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin/manager can manage sms contacts" ON public.sms_marketing_contacts FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager')) WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));
CREATE TRIGGER update_sms_marketing_contacts_updated_at BEFORE UPDATE ON public.sms_marketing_contacts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- SMS Marketing Templates
CREATE TABLE public.sms_marketing_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT DEFAULT 'geral',
  char_count INTEGER GENERATED ALWAYS AS (length(content)) STORED,
  is_active BOOLEAN DEFAULT true,
  created_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.sms_marketing_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin/manager can manage sms templates" ON public.sms_marketing_templates FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager')) WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));
CREATE TRIGGER update_sms_marketing_templates_updated_at BEFORE UPDATE ON public.sms_marketing_templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- SMS Marketing Campaigns
CREATE TABLE public.sms_marketing_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  message TEXT NOT NULL,
  template_id UUID REFERENCES public.sms_marketing_templates(id),
  status TEXT NOT NULL DEFAULT 'draft',
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  sender_number TEXT,
  provider TEXT,
  provider_campaign_id TEXT,
  target_tags TEXT[],
  created_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.sms_marketing_campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin/manager can manage sms campaigns" ON public.sms_marketing_campaigns FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager')) WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));
CREATE TRIGGER update_sms_marketing_campaigns_updated_at BEFORE UPDATE ON public.sms_marketing_campaigns FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- SMS Marketing Campaign Metrics
CREATE TABLE public.sms_marketing_campaign_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES public.sms_marketing_campaigns(id) ON DELETE CASCADE,
  total_sent INTEGER DEFAULT 0,
  total_delivered INTEGER DEFAULT 0,
  total_failed INTEGER DEFAULT 0,
  total_replied INTEGER DEFAULT 0,
  delivery_rate NUMERIC(5,2) DEFAULT 0,
  reply_rate NUMERIC(5,2) DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(campaign_id)
);
ALTER TABLE public.sms_marketing_campaign_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin/manager can manage sms metrics" ON public.sms_marketing_campaign_metrics FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager')) WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));
CREATE TRIGGER update_sms_marketing_metrics_updated_at BEFORE UPDATE ON public.sms_marketing_campaign_metrics FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
