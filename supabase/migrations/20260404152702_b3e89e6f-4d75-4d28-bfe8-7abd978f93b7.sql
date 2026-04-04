-- Add user_id to customers to link to portal user
ALTER TABLE public.customers ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add is_active to profiles for deactivation
ALTER TABLE public.profiles ADD COLUMN is_active boolean NOT NULL DEFAULT true;

-- Allow clients to view their own customer record
CREATE POLICY "Clients can view own customer"
ON public.customers
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Allow admins to delete profiles (needed for user deletion)
CREATE POLICY "Admins can delete profiles"
ON public.profiles
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));