
ALTER TABLE public.ticket_categories
ADD COLUMN parent_id uuid REFERENCES public.ticket_categories(id) ON DELETE CASCADE;
