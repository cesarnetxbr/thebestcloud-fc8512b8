
ALTER TABLE public.quotes
  ADD COLUMN IF NOT EXISTS general_notes text,
  ADD COLUMN IF NOT EXISTS policy_text text,
  ADD COLUMN IF NOT EXISTS client_acceptance_name text,
  ADD COLUMN IF NOT EXISTS client_acceptance_document text,
  ADD COLUMN IF NOT EXISTS client_acceptance_date date,
  ADD COLUMN IF NOT EXISTS client_signature_data_url text;
