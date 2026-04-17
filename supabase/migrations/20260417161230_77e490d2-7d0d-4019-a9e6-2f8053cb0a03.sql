
-- 1. Permitir que anon veja categorias de tickets (necessário para o trial form)
CREATE POLICY "Anon can view active ticket categories"
ON public.ticket_categories
FOR SELECT
TO anon
USING (is_active = true);

-- 2. Permitir que anon leia tickets criados pelo formulário público de trial
CREATE POLICY "Anon can view public trial tickets"
ON public.tickets
FOR SELECT
TO anon
USING (created_by = '00000000-0000-0000-0000-000000000000'::uuid);

-- 3. Tabela de slots de agenda técnica de suporte
CREATE TABLE public.support_schedule_slots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  operator_id UUID NOT NULL,
  operator_name TEXT NOT NULL,
  slot_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status TEXT NOT NULL DEFAULT 'disponivel',
  trial_client_id UUID REFERENCES public.trial_clients(id) ON DELETE SET NULL,
  reserved_by_name TEXT,
  reserved_by_email TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_support_slots_date ON public.support_schedule_slots(slot_date, status);
CREATE INDEX idx_support_slots_operator ON public.support_schedule_slots(operator_id);

ALTER TABLE public.support_schedule_slots ENABLE ROW LEVEL SECURITY;

-- Staff: gerenciamento total
CREATE POLICY "Staff can manage support_schedule_slots"
ON public.support_schedule_slots
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

-- Authenticated: visualizar
CREATE POLICY "Authenticated can view support_schedule_slots"
ON public.support_schedule_slots
FOR SELECT
TO authenticated
USING (true);

-- Anon: ver apenas slots disponíveis futuros (para o formulário público)
CREATE POLICY "Anon can view available future slots"
ON public.support_schedule_slots
FOR SELECT
TO anon
USING (status = 'disponivel' AND slot_date >= CURRENT_DATE);

-- Anon: reservar um slot disponível (atualizar para reservado, vinculando ao trial)
CREATE POLICY "Anon can reserve available slots"
ON public.support_schedule_slots
FOR UPDATE
TO anon
USING (status = 'disponivel' AND slot_date >= CURRENT_DATE)
WITH CHECK (status = 'reservado');

-- Trigger updated_at
CREATE TRIGGER update_support_schedule_slots_updated_at
BEFORE UPDATE ON public.support_schedule_slots
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
