
-- WhatsApp instances table
CREATE TABLE public.whatsapp_instances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  instance_name TEXT NOT NULL,
  phone_number TEXT,
  status TEXT NOT NULL DEFAULT 'disconnected',
  qr_code_data TEXT,
  session_data JSONB,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.whatsapp_instances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin/manager can manage whatsapp_instances"
  ON public.whatsapp_instances FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

CREATE POLICY "Authenticated can view whatsapp_instances"
  ON public.whatsapp_instances FOR SELECT
  TO authenticated
  USING (true);

CREATE TRIGGER update_whatsapp_instances_updated_at
  BEFORE UPDATE ON public.whatsapp_instances
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Chatbot rules table
CREATE TABLE public.chatbot_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  trigger_type TEXT NOT NULL DEFAULT 'keyword',
  trigger_value TEXT,
  response_type TEXT NOT NULL DEFAULT 'text',
  response_content TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  priority INTEGER NOT NULL DEFAULT 0,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.chatbot_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin/manager can manage chatbot_rules"
  ON public.chatbot_rules FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

CREATE POLICY "Authenticated can view chatbot_rules"
  ON public.chatbot_rules FOR SELECT
  TO authenticated
  USING (true);

CREATE TRIGGER update_chatbot_rules_updated_at
  BEFORE UPDATE ON public.chatbot_rules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
