
-- Fix commercial_requests INSERT policy - require auth.uid() = created_by
DROP POLICY IF EXISTS "Authenticated can create commercial_requests" ON public.commercial_requests;
CREATE POLICY "Authenticated can create commercial_requests" ON public.commercial_requests FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);

-- Fix commercial_request_items: remove duplicate INSERT, tighten the ALL policy
DROP POLICY IF EXISTS "Authenticated can insert request_items" ON public.commercial_request_items;
DROP POLICY IF EXISTS "Staff can manage request_items" ON public.commercial_request_items;
CREATE POLICY "Staff can manage request_items" ON public.commercial_request_items FOR ALL TO authenticated 
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager')
    OR EXISTS (SELECT 1 FROM public.commercial_requests cr WHERE cr.id = request_id AND cr.created_by = auth.uid()));

-- Fix commercial_request_tags: remove duplicate INSERT, tighten ALL policy
DROP POLICY IF EXISTS "Authenticated can insert request_tags" ON public.commercial_request_tags;
DROP POLICY IF EXISTS "Staff can manage request_tags" ON public.commercial_request_tags;
CREATE POLICY "Staff can manage request_tags" ON public.commercial_request_tags FOR ALL TO authenticated 
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager')
    OR EXISTS (SELECT 1 FROM public.commercial_requests cr WHERE cr.id = request_id AND cr.created_by = auth.uid()));
