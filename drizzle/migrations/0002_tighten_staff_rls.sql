CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id
    AND role IN ('admin','manager','viewer','operador','supervisor'))
$$;

DROP POLICY IF EXISTS "Authenticated users can view tenants" ON public.tenants;
CREATE POLICY "Staff can view tenants" ON public.tenants FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
DROP POLICY IF EXISTS "Authenticated users can view financial_categories" ON public.financial_categories;
CREATE POLICY "Staff can view financial_categories" ON public.financial_categories FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
DROP POLICY IF EXISTS "Authenticated users can view invoices" ON public.invoices;
CREATE POLICY "Staff can view invoices" ON public.invoices FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
DROP POLICY IF EXISTS "Authenticated can view ai_settings" ON public.ai_settings;
CREATE POLICY "Staff can view ai_settings" ON public.ai_settings FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
DROP POLICY IF EXISTS "Authenticated can view crm_pipeline_stages" ON public.crm_pipeline_stages;
CREATE POLICY "Staff can view crm_pipeline_stages" ON public.crm_pipeline_stages FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
DROP POLICY IF EXISTS "Authenticated can view request_tags" ON public.commercial_request_tags;
CREATE POLICY "Staff can view commercial_request_tags" ON public.commercial_request_tags FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
DROP POLICY IF EXISTS "Authenticated users can view financial_commissions" ON public.financial_commissions;
CREATE POLICY "Staff can view financial_commissions" ON public.financial_commissions FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
DROP POLICY IF EXISTS "Authenticated can view chatbot_rules" ON public.chatbot_rules;
CREATE POLICY "Staff can view chatbot_rules" ON public.chatbot_rules FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
DROP POLICY IF EXISTS "Authenticated can view crm_deals" ON public.crm_deals;
CREATE POLICY "Staff can view crm_deals" ON public.crm_deals FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
DROP POLICY IF EXISTS "Authenticated users can view financial_transactions" ON public.financial_transactions;
CREATE POLICY "Staff can view financial_transactions" ON public.financial_transactions FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
DROP POLICY IF EXISTS "Authenticated can view chat_quick_replies" ON public.chat_quick_replies;
CREATE POLICY "Staff can view chat_quick_replies" ON public.chat_quick_replies FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
DROP POLICY IF EXISTS "Authenticated users can view price_table_items" ON public.price_table_items;
CREATE POLICY "Staff can view price_table_items" ON public.price_table_items FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
DROP POLICY IF EXISTS "Authenticated can view support_schedule_slots" ON public.support_schedule_slots;
CREATE POLICY "Staff can view support_schedule_slots" ON public.support_schedule_slots FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
DROP POLICY IF EXISTS "Authenticated users can view price_tables" ON public.price_tables;
CREATE POLICY "Staff can view price_tables" ON public.price_tables FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
DROP POLICY IF EXISTS "Authenticated users can view kanban_stages" ON public.kanban_stages;
CREATE POLICY "Staff can view kanban_stages" ON public.kanban_stages FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
DROP POLICY IF EXISTS "Authenticated users can view customers" ON public.customers;
CREATE POLICY "Staff can view customers" ON public.customers FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
DROP POLICY IF EXISTS "Authenticated users can view mappings" ON public.acronis_sku_mapping;
CREATE POLICY "Staff can view acronis_sku_mapping" ON public.acronis_sku_mapping FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
DROP POLICY IF EXISTS "Authenticated can view crm_activities" ON public.crm_activities;
CREATE POLICY "Staff can view crm_activities" ON public.crm_activities FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
DROP POLICY IF EXISTS "Authenticated can view consultant_bookings" ON public.consultant_bookings;
CREATE POLICY "Staff can view consultant_bookings" ON public.consultant_bookings FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
DROP POLICY IF EXISTS "Staff can view commercial_requests" ON public.commercial_requests;
CREATE POLICY "Staff can view commercial_requests" ON public.commercial_requests FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
DROP POLICY IF EXISTS "Authenticated can view presets" ON public.role_permission_presets;
CREATE POLICY "Staff can view role_permission_presets" ON public.role_permission_presets FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
DROP POLICY IF EXISTS "Authenticated users can view invoice items" ON public.invoice_items;
CREATE POLICY "Staff can view invoice_items" ON public.invoice_items FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
DROP POLICY IF EXISTS "Authenticated can view whatsapp_instances" ON public.whatsapp_instances;
CREATE POLICY "Staff can view whatsapp_instances" ON public.whatsapp_instances FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
DROP POLICY IF EXISTS "Authenticated can view chat_departments" ON public.chat_departments;
CREATE POLICY "Staff can view chat_departments" ON public.chat_departments FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
DROP POLICY IF EXISTS "Authenticated can view crm_deal_tags" ON public.crm_deal_tags;
CREATE POLICY "Staff can view crm_deal_tags" ON public.crm_deal_tags FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
DROP POLICY IF EXISTS "Authenticated can view request_items" ON public.commercial_request_items;
CREATE POLICY "Staff can view commercial_request_items" ON public.commercial_request_items FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
DROP POLICY IF EXISTS "Authenticated can view crm_deal_items" ON public.crm_deal_items;
CREATE POLICY "Staff can view crm_deal_items" ON public.crm_deal_items FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
DROP POLICY IF EXISTS "Authenticated can view chat_messages" ON public.chat_messages;
CREATE POLICY "Staff can view chat_messages" ON public.chat_messages FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
DROP POLICY IF EXISTS "Authenticated can view company settings" ON public.company_settings;
CREATE POLICY "Staff can view company_settings" ON public.company_settings FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
DROP POLICY IF EXISTS "Authenticated can view chat_conversations" ON public.chat_conversations;
CREATE POLICY "Staff can view chat_conversations" ON public.chat_conversations FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
DROP POLICY IF EXISTS "Authenticated can view crm_leads" ON public.crm_leads;
CREATE POLICY "Staff can view crm_leads" ON public.crm_leads FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
DROP POLICY IF EXISTS "Authenticated can view request_notes" ON public.commercial_request_notes;
CREATE POLICY "Staff can view commercial_request_notes" ON public.commercial_request_notes FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
DROP POLICY IF EXISTS "Authenticated users can view tenant usage" ON public.tenant_usage;
CREATE POLICY "Staff can view tenant_usage" ON public.tenant_usage FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
DROP POLICY IF EXISTS "Authenticated can view crm_appointments" ON public.crm_appointments;
CREATE POLICY "Staff can view crm_appointments" ON public.crm_appointments FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
DROP POLICY IF EXISTS "Authenticated can view crm_deal_notes" ON public.crm_deal_notes;
CREATE POLICY "Staff can view crm_deal_notes" ON public.crm_deal_notes FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));

CREATE POLICY "Clients view own customer by email" ON public.customers FOR SELECT TO authenticated
  USING (lower(email) = lower(auth.jwt()->>'email'));
CREATE POLICY "Clients view own invoices" ON public.invoices FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.customers c WHERE c.id = invoices.customer_id
    AND (c.user_id = auth.uid() OR lower(c.email) = lower(auth.jwt()->>'email'))));
CREATE POLICY "Clients view price_tables" ON public.price_tables FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'client'));
CREATE POLICY "Clients view price_table_items" ON public.price_table_items FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'client'));
CREATE POLICY "Clients view own commercial_requests" ON public.commercial_requests FOR SELECT TO authenticated
  USING (created_by = auth.uid());
CREATE POLICY "Clients view own request_items" ON public.commercial_request_items FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.commercial_requests cr WHERE cr.id = commercial_request_items.request_id AND cr.created_by = auth.uid()));

DROP POLICY IF EXISTS "Authenticated can insert quote_audit_log" ON public.quote_audit_log;
CREATE POLICY "Staff can insert quote_audit_log" ON public.quote_audit_log FOR INSERT TO authenticated
  WITH CHECK (public.is_staff(auth.uid()) AND user_id = auth.uid());

DROP POLICY IF EXISTS "Anon view reservations" ON public.support_slot_reservations;
CREATE OR REPLACE FUNCTION public.get_reserved_slot_hours()
RETURNS TABLE(slot_id uuid, reserved_hour text) LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT r.slot_id, r.reserved_hour::text FROM public.support_slot_reservations r
  JOIN public.support_schedule_slots s ON s.id = r.slot_id WHERE s.slot_date >= current_date
$$;
GRANT EXECUTE ON FUNCTION public.get_reserved_slot_hours() TO anon, authenticated;

ALTER FUNCTION public.move_to_dlq(text,text,bigint,jsonb) SET search_path = public, pgmq;
ALTER FUNCTION public.read_email_batch(text,integer,integer) SET search_path = public, pgmq;
ALTER FUNCTION public.enqueue_email(text,jsonb) SET search_path = public, pgmq;
ALTER FUNCTION public.delete_email(text,bigint) SET search_path = public, pgmq;