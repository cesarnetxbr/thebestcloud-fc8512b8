
-- Chat conversations
CREATE TABLE public.chat_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  channel TEXT NOT NULL DEFAULT 'chat',
  status TEXT NOT NULL DEFAULT 'ativa',
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  lead_id UUID REFERENCES public.crm_leads(id) ON DELETE SET NULL,
  deal_id UUID REFERENCES public.crm_deals(id) ON DELETE SET NULL,
  assigned_to UUID,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view chat_conversations"
  ON public.chat_conversations FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admin/manager can insert chat_conversations"
  ON public.chat_conversations FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

CREATE POLICY "Admin/manager can update chat_conversations"
  ON public.chat_conversations FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

CREATE POLICY "Admin can delete chat_conversations"
  ON public.chat_conversations FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_chat_conversations_updated_at
  BEFORE UPDATE ON public.chat_conversations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Chat messages
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL DEFAULT 'agent',
  sender_name TEXT,
  content TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view chat_messages"
  ON public.chat_messages FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admin/manager can insert chat_messages"
  ON public.chat_messages FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

CREATE POLICY "Admin/manager can update chat_messages"
  ON public.chat_messages FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

CREATE POLICY "Admin can delete chat_messages"
  ON public.chat_messages FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
