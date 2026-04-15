
-- Email Marketing Lists
CREATE TABLE public.email_marketing_lists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  contact_count INTEGER DEFAULT 0,
  created_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.email_marketing_lists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin/manager can manage email lists" ON public.email_marketing_lists FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager')) WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));
CREATE TRIGGER update_email_marketing_lists_updated_at BEFORE UPDATE ON public.email_marketing_lists FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Email Marketing Contacts
CREATE TABLE public.email_marketing_contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  list_id UUID NOT NULL REFERENCES public.email_marketing_lists(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  tags TEXT[],
  metadata JSONB,
  subscribed_at TIMESTAMPTZ DEFAULT now(),
  unsubscribed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(list_id, email)
);
ALTER TABLE public.email_marketing_contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin/manager can manage email contacts" ON public.email_marketing_contacts FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager')) WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));
CREATE TRIGGER update_email_marketing_contacts_updated_at BEFORE UPDATE ON public.email_marketing_contacts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Email Marketing Templates
CREATE TABLE public.email_marketing_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  html_content TEXT,
  text_content TEXT,
  category TEXT DEFAULT 'geral',
  thumbnail_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.email_marketing_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin/manager can manage email templates" ON public.email_marketing_templates FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager')) WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));
CREATE TRIGGER update_email_marketing_templates_updated_at BEFORE UPDATE ON public.email_marketing_templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Email Marketing Campaigns
CREATE TABLE public.email_marketing_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  template_id UUID REFERENCES public.email_marketing_templates(id),
  list_id UUID REFERENCES public.email_marketing_lists(id),
  status TEXT NOT NULL DEFAULT 'draft',
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  sender_name TEXT DEFAULT 'The Best Cloud',
  sender_email TEXT,
  reply_to TEXT,
  provider TEXT,
  provider_campaign_id TEXT,
  created_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.email_marketing_campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin/manager can manage campaigns" ON public.email_marketing_campaigns FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager')) WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));
CREATE TRIGGER update_email_marketing_campaigns_updated_at BEFORE UPDATE ON public.email_marketing_campaigns FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Email Marketing Campaign Metrics
CREATE TABLE public.email_marketing_campaign_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES public.email_marketing_campaigns(id) ON DELETE CASCADE,
  total_sent INTEGER DEFAULT 0,
  total_delivered INTEGER DEFAULT 0,
  total_opened INTEGER DEFAULT 0,
  total_clicked INTEGER DEFAULT 0,
  total_bounced INTEGER DEFAULT 0,
  total_unsubscribed INTEGER DEFAULT 0,
  total_complained INTEGER DEFAULT 0,
  open_rate NUMERIC(5,2) DEFAULT 0,
  click_rate NUMERIC(5,2) DEFAULT 0,
  bounce_rate NUMERIC(5,2) DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(campaign_id)
);
ALTER TABLE public.email_marketing_campaign_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin/manager can view campaign metrics" ON public.email_marketing_campaign_metrics FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager')) WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));
CREATE TRIGGER update_email_marketing_metrics_updated_at BEFORE UPDATE ON public.email_marketing_campaign_metrics FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
