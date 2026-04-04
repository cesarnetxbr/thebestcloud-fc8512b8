-- Add new roles to enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'operador';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'supervisor';

-- Create user_permissions table
CREATE TABLE public.user_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  module TEXT NOT NULL,
  can_view BOOLEAN DEFAULT false,
  can_create BOOLEAN DEFAULT false,
  can_edit BOOLEAN DEFAULT false,
  can_delete BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, module)
);

ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all permissions"
  ON public.user_permissions FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Managers can view permissions"
  ON public.user_permissions FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'manager'));

CREATE POLICY "Users can view own permissions"
  ON public.user_permissions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create role permission presets table
CREATE TABLE public.role_permission_presets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_name TEXT NOT NULL,
  module TEXT NOT NULL,
  can_view BOOLEAN DEFAULT false,
  can_create BOOLEAN DEFAULT false,
  can_edit BOOLEAN DEFAULT false,
  can_delete BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(role_name, module)
);

ALTER TABLE public.role_permission_presets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage presets"
  ON public.role_permission_presets FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated can view presets"
  ON public.role_permission_presets FOR SELECT
  TO authenticated
  USING (true);

-- Trigger for updated_at
CREATE TRIGGER update_user_permissions_updated_at
  BEFORE UPDATE ON public.user_permissions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default presets for each role
INSERT INTO public.role_permission_presets (role_name, module, can_view, can_create, can_edit, can_delete) VALUES
-- Administrador: acesso total
('admin', 'dashboard', true, true, true, true),
('admin', 'usuarios', true, true, true, true),
('admin', 'clientes', true, true, true, true),
('admin', 'conexoes', true, true, true, true),
('admin', 'tenants', true, true, true, true),
('admin', 'skus', true, true, true, true),
('admin', 'tabelas_custo', true, true, true, true),
('admin', 'tabelas_venda', true, true, true, true),
('admin', 'financeiro', true, true, true, true),
('admin', 'faturamento', true, true, true, true),
('admin', 'comercial', true, true, true, true),
('admin', 'chamados', true, true, true, true),
('admin', 'auditoria', true, true, true, true),
('admin', 'configuracoes', true, true, true, true),
-- Gerente: acesso amplo sem deletar
('manager', 'dashboard', true, true, true, false),
('manager', 'usuarios', true, false, false, false),
('manager', 'clientes', true, true, true, false),
('manager', 'conexoes', true, true, true, false),
('manager', 'tenants', true, true, true, false),
('manager', 'skus', true, true, true, false),
('manager', 'tabelas_custo', true, true, true, false),
('manager', 'tabelas_venda', true, true, true, false),
('manager', 'financeiro', true, true, true, false),
('manager', 'faturamento', true, true, true, false),
('manager', 'comercial', true, true, true, false),
('manager', 'chamados', true, true, true, false),
('manager', 'auditoria', true, false, false, false),
('manager', 'configuracoes', true, false, false, false),
-- Supervisor: acesso operacional
('supervisor', 'dashboard', true, false, false, false),
('supervisor', 'clientes', true, true, true, false),
('supervisor', 'tenants', true, false, false, false),
('supervisor', 'financeiro', true, false, false, false),
('supervisor', 'faturamento', true, false, false, false),
('supervisor', 'comercial', true, true, true, false),
('supervisor', 'chamados', true, true, true, false),
-- Operador: acesso básico operacional
('operador', 'dashboard', true, false, false, false),
('operador', 'clientes', true, false, false, false),
('operador', 'comercial', true, true, false, false),
('operador', 'chamados', true, true, true, false),
-- Cliente: acesso restrito ao portal
('client', 'dashboard', true, false, false, false),
('client', 'chamados', true, true, false, false),
('client', 'faturamento', true, false, false, false);