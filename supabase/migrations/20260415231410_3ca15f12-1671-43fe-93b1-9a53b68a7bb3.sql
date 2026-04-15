ALTER TABLE public.whatsapp_instances 
ADD COLUMN IF NOT EXISTS evolution_instance_id text,
ADD COLUMN IF NOT EXISTS session_status text DEFAULT 'pending';