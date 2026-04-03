
-- Price tables (cost and sale pricelists)
CREATE TABLE public.price_tables (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'cost' CHECK (type IN ('cost', 'sale')),
  total_value NUMERIC DEFAULT 0,
  version TEXT DEFAULT 'v1',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.price_tables ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view price_tables"
  ON public.price_tables FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins and managers can insert price_tables"
  ON public.price_tables FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

CREATE POLICY "Admins and managers can update price_tables"
  ON public.price_tables FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

CREATE POLICY "Admins can delete price_tables"
  ON public.price_tables FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_price_tables_updated_at
  BEFORE UPDATE ON public.price_tables
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Price table items
CREATE TABLE public.price_table_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  price_table_id UUID NOT NULL REFERENCES public.price_tables(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  sku_code TEXT NOT NULL DEFAULT '',
  currency TEXT NOT NULL DEFAULT 'BRL',
  unit_value NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.price_table_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view price_table_items"
  ON public.price_table_items FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins and managers can insert price_table_items"
  ON public.price_table_items FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

CREATE POLICY "Admins and managers can update price_table_items"
  ON public.price_table_items FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

CREATE POLICY "Admins can delete price_table_items"
  ON public.price_table_items FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));
