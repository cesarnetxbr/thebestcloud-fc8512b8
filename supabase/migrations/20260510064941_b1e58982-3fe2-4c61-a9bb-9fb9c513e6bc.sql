CREATE TABLE IF NOT EXISTS public.consultant_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID,
  lead_id UUID,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT,
  specialist_user_id UUID,
  scheduled_at TIMESTAMPTZ,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  status TEXT NOT NULL DEFAULT 'pendente',
  booking_token UUID UNIQUE DEFAULT gen_random_uuid(),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_consultant_bookings_deal ON public.consultant_bookings(deal_id);
CREATE INDEX IF NOT EXISTS idx_consultant_bookings_token ON public.consultant_bookings(booking_token);
CREATE INDEX IF NOT EXISTS idx_consultant_bookings_scheduled ON public.consultant_bookings(scheduled_at);

ALTER TABLE public.consultant_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin/manager can manage consultant_bookings"
  ON public.consultant_bookings FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

CREATE POLICY "Authenticated can view consultant_bookings"
  ON public.consultant_bookings FOR SELECT TO authenticated USING (true);

CREATE TRIGGER update_consultant_bookings_updated_at
  BEFORE UPDATE ON public.consultant_bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.set_booking_token()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.booking_token IS NULL THEN NEW.booking_token := gen_random_uuid(); END IF;
  RETURN NEW;
END; $$;

CREATE TRIGGER trg_set_booking_token
  BEFORE INSERT ON public.consultant_bookings
  FOR EACH ROW EXECUTE FUNCTION public.set_booking_token();