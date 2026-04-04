ALTER TABLE public.tenants 
ADD COLUMN sale_table_id uuid REFERENCES public.price_tables(id) ON DELETE SET NULL;