
-- Create tenant_usage table for daily consumption tracking
CREATE TABLE public.tenant_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  connection_id UUID REFERENCES public.connections(id) ON DELETE SET NULL,
  sku_code TEXT NOT NULL,
  sku_name TEXT NOT NULL DEFAULT '',
  quantity NUMERIC NOT NULL DEFAULT 0,
  unit_cost NUMERIC NOT NULL DEFAULT 0,
  total_cost NUMERIC NOT NULL DEFAULT 0,
  unit_price NUMERIC NOT NULL DEFAULT 0,
  total_price NUMERIC NOT NULL DEFAULT 0,
  usage_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Unique constraint to prevent duplicate entries per tenant/sku/date
CREATE UNIQUE INDEX idx_tenant_usage_unique ON public.tenant_usage (tenant_id, sku_code, usage_date);

-- Index for querying by date range
CREATE INDEX idx_tenant_usage_date ON public.tenant_usage (usage_date);
CREATE INDEX idx_tenant_usage_tenant ON public.tenant_usage (tenant_id);

-- Enable RLS
ALTER TABLE public.tenant_usage ENABLE ROW LEVEL SECURITY;

-- Authenticated users can view
CREATE POLICY "Authenticated users can view tenant usage"
ON public.tenant_usage
FOR SELECT
TO authenticated
USING (true);

-- Only admins/managers can insert
CREATE POLICY "Admins and managers can insert tenant usage"
ON public.tenant_usage
FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager')
);

-- Only admins/managers can update
CREATE POLICY "Admins and managers can update tenant usage"
ON public.tenant_usage
FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager')
);

-- Only admins/managers can delete
CREATE POLICY "Admins and managers can delete tenant usage"
ON public.tenant_usage
FOR DELETE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager')
);

-- Trigger for updated_at
CREATE TRIGGER update_tenant_usage_updated_at
BEFORE UPDATE ON public.tenant_usage
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
