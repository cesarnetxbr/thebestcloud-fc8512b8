
-- Financial Categories
CREATE TABLE public.financial_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'despesa' CHECK (type IN ('receita', 'despesa')),
  color TEXT DEFAULT '#6366f1',
  icon TEXT DEFAULT 'circle',
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.financial_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view financial_categories" ON public.financial_categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins and managers can insert financial_categories" ON public.financial_categories FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));
CREATE POLICY "Admins and managers can update financial_categories" ON public.financial_categories FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));
CREATE POLICY "Admins can delete financial_categories" ON public.financial_categories FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_financial_categories_updated_at BEFORE UPDATE ON public.financial_categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Financial Transactions (receitas e despesas)
CREATE TABLE public.financial_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL DEFAULT 'despesa' CHECK (type IN ('receita', 'despesa')),
  category_id UUID REFERENCES public.financial_categories(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  payment_date DATE,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago', 'atrasado', 'cancelado')),
  recurrence TEXT DEFAULT 'none' CHECK (recurrence IN ('none', 'monthly', 'quarterly', 'yearly')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view financial_transactions" ON public.financial_transactions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins and managers can insert financial_transactions" ON public.financial_transactions FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));
CREATE POLICY "Admins and managers can update financial_transactions" ON public.financial_transactions FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));
CREATE POLICY "Admins can delete financial_transactions" ON public.financial_transactions FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_financial_transactions_updated_at BEFORE UPDATE ON public.financial_transactions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Financial Commissions
CREATE TABLE public.financial_commissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  description TEXT NOT NULL,
  beneficiary TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  percentage NUMERIC DEFAULT 0,
  reference_type TEXT DEFAULT 'manual' CHECK (reference_type IN ('invoice', 'transaction', 'manual')),
  reference_id UUID,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago', 'cancelado')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.financial_commissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view financial_commissions" ON public.financial_commissions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins and managers can insert financial_commissions" ON public.financial_commissions FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));
CREATE POLICY "Admins and managers can update financial_commissions" ON public.financial_commissions FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));
CREATE POLICY "Admins can delete financial_commissions" ON public.financial_commissions FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_financial_commissions_updated_at BEFORE UPDATE ON public.financial_commissions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
