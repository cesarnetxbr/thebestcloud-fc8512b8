
-- Departments for routing
CREATE TABLE public.chat_departments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#3b82f6',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_departments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view chat_departments" ON public.chat_departments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin/manager can manage chat_departments" ON public.chat_departments FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

-- Quick replies / canned responses
CREATE TABLE public.chat_quick_replies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT DEFAULT 'geral',
  department_id UUID REFERENCES public.chat_departments(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_quick_replies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view chat_quick_replies" ON public.chat_quick_replies FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin/manager can manage chat_quick_replies" ON public.chat_quick_replies FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

-- Add department to conversations
ALTER TABLE public.chat_conversations ADD COLUMN department_id UUID REFERENCES public.chat_departments(id) ON DELETE SET NULL;

-- Triggers for updated_at
CREATE TRIGGER update_chat_departments_updated_at BEFORE UPDATE ON public.chat_departments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_chat_quick_replies_updated_at BEFORE UPDATE ON public.chat_quick_replies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
