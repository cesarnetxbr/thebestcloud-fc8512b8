
-- Add 'client' role to app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'client';

-- ============================================
-- TICKET CATEGORIES
-- ============================================
CREATE TABLE public.ticket_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#6366f1',
  icon TEXT DEFAULT 'circle',
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ticket_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view ticket_categories" ON public.ticket_categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins and managers can insert ticket_categories" ON public.ticket_categories FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'));
CREATE POLICY "Admins and managers can update ticket_categories" ON public.ticket_categories FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'));
CREATE POLICY "Admins can delete ticket_categories" ON public.ticket_categories FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'));

-- ============================================
-- TICKETS (CHAMADOS)
-- ============================================
CREATE TABLE public.tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_number TEXT NOT NULL UNIQUE,
  subject TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'aberto',
  priority TEXT NOT NULL DEFAULT 'media',
  category_id UUID REFERENCES public.ticket_categories(id),
  customer_id UUID REFERENCES public.customers(id),
  created_by UUID NOT NULL,
  assigned_to UUID,
  closed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tickets" ON public.tickets FOR SELECT TO authenticated 
  USING (created_by = auth.uid() OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager') OR has_role(auth.uid(), 'viewer'));
CREATE POLICY "Authenticated users can create tickets" ON public.tickets FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Staff can update tickets" ON public.tickets FOR UPDATE TO authenticated 
  USING (created_by = auth.uid() OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'));
CREATE POLICY "Admins can delete tickets" ON public.tickets FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'));

-- ============================================
-- TICKET MESSAGES
-- ============================================
CREATE TABLE public.ticket_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  message TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view ticket messages" ON public.ticket_messages FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.tickets t WHERE t.id = ticket_id AND (t.created_by = auth.uid() OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager') OR has_role(auth.uid(), 'viewer'))));
CREATE POLICY "Users can send ticket messages" ON public.ticket_messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Admins can delete ticket messages" ON public.ticket_messages FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'));

-- ============================================
-- KANBAN STAGES
-- ============================================
CREATE TABLE public.kanban_stages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#3b82f6',
  position INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.kanban_stages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view kanban_stages" ON public.kanban_stages FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins and managers can manage kanban_stages" ON public.kanban_stages FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'));

-- ============================================
-- COMMERCIAL REQUESTS (SOLICITAÇÕES)
-- ============================================
CREATE TABLE public.commercial_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_number TEXT NOT NULL UNIQUE,
  customer_id UUID REFERENCES public.customers(id),
  customer_name TEXT NOT NULL,
  stage_id UUID REFERENCES public.kanban_stages(id),
  assigned_to UUID,
  assigned_name TEXT,
  priority TEXT DEFAULT 'normal',
  status TEXT NOT NULL DEFAULT 'aberto',
  notes TEXT,
  closed_at TIMESTAMPTZ,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.commercial_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view commercial_requests" ON public.commercial_requests FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can create commercial_requests" ON public.commercial_requests FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Staff can update commercial_requests" ON public.commercial_requests FOR UPDATE TO authenticated 
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager') OR assigned_to = auth.uid());
CREATE POLICY "Admins can delete commercial_requests" ON public.commercial_requests FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'));

-- ============================================
-- COMMERCIAL REQUEST ITEMS
-- ============================================
CREATE TABLE public.commercial_request_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID NOT NULL REFERENCES public.commercial_requests(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.commercial_request_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view request_items" ON public.commercial_request_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Staff can manage request_items" ON public.commercial_request_items FOR ALL TO authenticated 
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'));
CREATE POLICY "Authenticated can insert request_items" ON public.commercial_request_items FOR INSERT TO authenticated WITH CHECK (true);

-- ============================================
-- COMMERCIAL REQUEST NOTES (ANOTAÇÕES)
-- ============================================
CREATE TABLE public.commercial_request_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID NOT NULL REFERENCES public.commercial_requests(id) ON DELETE CASCADE,
  author_id UUID NOT NULL,
  author_name TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.commercial_request_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view request_notes" ON public.commercial_request_notes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert request_notes" ON public.commercial_request_notes FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Admins can delete request_notes" ON public.commercial_request_notes FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'));

-- ============================================
-- COMMERCIAL REQUEST TAGS
-- ============================================
CREATE TABLE public.commercial_request_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID NOT NULL REFERENCES public.commercial_requests(id) ON DELETE CASCADE,
  tag_name TEXT NOT NULL,
  tag_color TEXT DEFAULT '#3b82f6',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.commercial_request_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view request_tags" ON public.commercial_request_tags FOR SELECT TO authenticated USING (true);
CREATE POLICY "Staff can manage request_tags" ON public.commercial_request_tags FOR ALL TO authenticated 
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'));
CREATE POLICY "Authenticated can insert request_tags" ON public.commercial_request_tags FOR INSERT TO authenticated WITH CHECK (true);

-- ============================================
-- DEFAULT DATA
-- ============================================
INSERT INTO public.ticket_categories (name, description, color, icon, is_default) VALUES
  ('Suporte Técnico', 'Chamados de suporte técnico e infraestrutura', '#3b82f6', 'wrench', true),
  ('Financeiro', 'Chamados financeiros, boletos e notas fiscais', '#10b981', 'dollar-sign', true),
  ('Administrativo', 'Chamados administrativos gerais', '#f59e0b', 'briefcase', true);

INSERT INTO public.kanban_stages (name, color, position) VALUES
  ('Novo', '#3b82f6', 0),
  ('Contato Realizado', '#10b981', 1),
  ('Em Negociação', '#f59e0b', 2),
  ('Pendente por Terceiros', '#8b5cf6', 3),
  ('Em Fechamento', '#06b6d4', 4),
  ('Cancelado', '#ef4444', 5),
  ('Encerrado', '#22c55e', 6);

-- Triggers for updated_at
CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON public.tickets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_ticket_categories_updated_at BEFORE UPDATE ON public.ticket_categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_commercial_requests_updated_at BEFORE UPDATE ON public.commercial_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
