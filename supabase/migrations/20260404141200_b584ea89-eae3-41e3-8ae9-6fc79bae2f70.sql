
-- Add tracking columns to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS last_login_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS created_by_user_id uuid,
ADD COLUMN IF NOT EXISTS created_by_name text;

-- Function to update last_login_at on sign in
CREATE OR REPLACE FUNCTION public.handle_user_login()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.profiles
  SET last_login_at = now()
  WHERE user_id = NEW.id;
  RETURN NEW;
END;
$$;
