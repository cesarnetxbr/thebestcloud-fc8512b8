
DROP POLICY IF EXISTS "Admins and managers can manage kanban_stages" ON public.kanban_stages;
CREATE POLICY "Admins and managers can insert kanban_stages" ON public.kanban_stages FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'));
CREATE POLICY "Admins and managers can update kanban_stages" ON public.kanban_stages FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'));
CREATE POLICY "Admins can delete kanban_stages" ON public.kanban_stages FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'));
