-- Expand audit logging to cover tickets, ticket movements, users, roles and permissions
-- Reuses the existing public.log_audit_event() function. No schema changes to audit_logs.

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='tickets') THEN
    DROP TRIGGER IF EXISTS audit_tickets ON public.tickets;
    CREATE TRIGGER audit_tickets
      AFTER INSERT OR UPDATE OR DELETE ON public.tickets
      FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='ticket_messages') THEN
    DROP TRIGGER IF EXISTS audit_ticket_messages ON public.ticket_messages;
    CREATE TRIGGER audit_ticket_messages
      AFTER INSERT OR UPDATE OR DELETE ON public.ticket_messages
      FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='profiles') THEN
    DROP TRIGGER IF EXISTS audit_profiles ON public.profiles;
    CREATE TRIGGER audit_profiles
      AFTER INSERT OR UPDATE OR DELETE ON public.profiles
      FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='user_roles') THEN
    DROP TRIGGER IF EXISTS audit_user_roles ON public.user_roles;
    CREATE TRIGGER audit_user_roles
      AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
      FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='user_permissions') THEN
    DROP TRIGGER IF EXISTS audit_user_permissions ON public.user_permissions;
    CREATE TRIGGER audit_user_permissions
      AFTER INSERT OR UPDATE OR DELETE ON public.user_permissions
      FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();
  END IF;
END$$;