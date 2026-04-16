
-- Add phone and external_id to chat_conversations
ALTER TABLE public.chat_conversations
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS external_id TEXT;

-- Add external_message_id to chat_messages  
ALTER TABLE public.chat_messages
ADD COLUMN IF NOT EXISTS external_message_id TEXT;

-- Indexes for quick lookup
CREATE INDEX IF NOT EXISTS idx_chat_conversations_phone ON public.chat_conversations(phone);
CREATE INDEX IF NOT EXISTS idx_chat_messages_external_id ON public.chat_messages(external_message_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_chat_conversations_external_id ON public.chat_conversations(external_id) WHERE external_id IS NOT NULL;
