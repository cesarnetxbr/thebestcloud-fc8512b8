
-- Deal Notes
CREATE TABLE public.crm_deal_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  deal_id UUID NOT NULL REFERENCES public.crm_deals(id) ON DELETE CASCADE,
  author_id UUID NOT NULL,
  author_name TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.crm_deal_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view crm_deal_notes" ON public.crm_deal_notes
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admin/manager can insert crm_deal_notes" ON public.crm_deal_notes
  FOR INSERT TO authenticated WITH CHECK (
    has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role)
  );

CREATE POLICY "Admin can delete crm_deal_notes" ON public.crm_deal_notes
  FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- Deal Tags
CREATE TABLE public.crm_deal_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  deal_id UUID NOT NULL REFERENCES public.crm_deals(id) ON DELETE CASCADE,
  tag_name TEXT NOT NULL,
  tag_color TEXT DEFAULT '#3b82f6',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.crm_deal_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view crm_deal_tags" ON public.crm_deal_tags
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admin/manager can insert crm_deal_tags" ON public.crm_deal_tags
  FOR INSERT TO authenticated WITH CHECK (
    has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role)
  );

CREATE POLICY "Admin/manager can delete crm_deal_tags" ON public.crm_deal_tags
  FOR DELETE TO authenticated USING (
    has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role)
  );

-- Deal Items
CREATE TABLE public.crm_deal_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  deal_id UUID NOT NULL REFERENCES public.crm_deals(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.crm_deal_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view crm_deal_items" ON public.crm_deal_items
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admin/manager can manage crm_deal_items" ON public.crm_deal_items
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));
