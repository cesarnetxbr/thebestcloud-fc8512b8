-- Tabela de reservas horárias (sub-slots de 1h dentro de uma janela)
CREATE TABLE public.support_slot_reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_id UUID NOT NULL REFERENCES public.support_schedule_slots(id) ON DELETE CASCADE,
  trial_client_id UUID REFERENCES public.trial_clients(id) ON DELETE SET NULL,
  reserved_hour TIME NOT NULL,
  reserved_by_name TEXT NOT NULL,
  reserved_by_email TEXT NOT NULL,
  reserved_by_phone TEXT,
  status TEXT NOT NULL DEFAULT 'reservado',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (slot_id, reserved_hour)
);

ALTER TABLE public.support_slot_reservations ENABLE ROW LEVEL SECURITY;

-- Staff total
CREATE POLICY "Staff manage reservations" ON public.support_slot_reservations
  FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'manager') OR has_role(auth.uid(),'supervisor') OR has_role(auth.uid(),'operador'))
  WITH CHECK (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'manager') OR has_role(auth.uid(),'supervisor') OR has_role(auth.uid(),'operador'));

-- Anon pode ver as horas já reservadas (apenas para saber o que está ocupado)
CREATE POLICY "Anon view reservations" ON public.support_slot_reservations
  FOR SELECT TO anon USING (true);

-- Anon pode inserir uma reserva (durante o teste grátis)
CREATE POLICY "Anon insert reservation" ON public.support_slot_reservations
  FOR INSERT TO anon
  WITH CHECK (status = 'reservado');

-- Permitir UPDATE de profile pelo próprio usuário (para edição)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='profiles' AND policyname='Admins manage profiles') THEN
    CREATE POLICY "Admins manage profiles" ON public.profiles
      FOR UPDATE TO authenticated
      USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'manager') OR user_id = auth.uid())
      WITH CHECK (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'manager') OR user_id = auth.uid());
  END IF;
END $$;