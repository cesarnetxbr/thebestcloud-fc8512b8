ALTER TABLE public.tenants 
ADD COLUMN trial_start_date date DEFAULT NULL,
ADD COLUMN trial_end_date date DEFAULT NULL,
ADD COLUMN trial_notified boolean DEFAULT false;