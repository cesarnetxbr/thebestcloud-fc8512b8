
-- 1. Função de normalização de telefone (somente dígitos)
CREATE OR REPLACE FUNCTION public.normalize_phone(_phone text)
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT NULLIF(regexp_replace(COALESCE(_phone, ''), '\D', '', 'g'), '');
$$;

-- 2. Função de fusão de duas conversas (preserva histórico)
CREATE OR REPLACE FUNCTION public.merge_chat_conversations(_keep_id uuid, _drop_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _keep RECORD;
  _drop RECORD;
BEGIN
  IF _keep_id = _drop_id THEN RETURN; END IF;

  SELECT * INTO _keep FROM public.chat_conversations WHERE id = _keep_id;
  SELECT * INTO _drop FROM public.chat_conversations WHERE id = _drop_id;
  IF _keep.id IS NULL OR _drop.id IS NULL THEN RETURN; END IF;

  -- Move mensagens
  UPDATE public.chat_messages SET conversation_id = _keep_id WHERE conversation_id = _drop_id;

  -- Consolida vínculos (preserva os existentes em _keep, completa com os de _drop)
  UPDATE public.chat_conversations
  SET
    lead_id = COALESCE(_keep.lead_id, _drop.lead_id),
    customer_id = COALESCE(_keep.customer_id, _drop.customer_id),
    deal_id = COALESCE(_keep.deal_id, _drop.deal_id),
    assigned_to = COALESCE(_keep.assigned_to, _drop.assigned_to),
    department_id = COALESCE(_keep.department_id, _drop.department_id),
    external_id = COALESCE(_keep.external_id, _drop.external_id),
    last_message_at = GREATEST(
      COALESCE(_keep.last_message_at, _keep.created_at),
      COALESCE(_drop.last_message_at, _drop.created_at)
    ),
    status = CASE
      WHEN _keep.status = 'ativa' OR _drop.status = 'ativa' THEN 'ativa'
      ELSE _keep.status
    END,
    updated_at = now()
  WHERE id = _keep_id;

  DELETE FROM public.chat_conversations WHERE id = _drop_id;
END;
$$;

-- 3. Backfill: normaliza telefones existentes
UPDATE public.chat_conversations
SET phone = public.normalize_phone(phone)
WHERE phone IS NOT NULL
  AND phone <> public.normalize_phone(phone);

-- 4. Faz merge das duplicatas existentes (mantém a mais recente)
DO $$
DECLARE
  _row RECORD;
  _keep_id uuid;
  _drop_id uuid;
BEGIN
  FOR _row IN
    SELECT phone, array_agg(id ORDER BY COALESCE(last_message_at, created_at) DESC, created_at DESC) AS ids
    FROM public.chat_conversations
    WHERE channel = 'whatsapp' AND phone IS NOT NULL
    GROUP BY phone
    HAVING COUNT(*) > 1
  LOOP
    _keep_id := _row.ids[1];
    FOR i IN 2..array_length(_row.ids, 1) LOOP
      _drop_id := _row.ids[i];
      PERFORM public.merge_chat_conversations(_keep_id, _drop_id);
    END LOOP;
  END LOOP;
END $$;

-- 5. Trigger para normalizar telefone em INSERT/UPDATE
CREATE OR REPLACE FUNCTION public.normalize_chat_conversation_phone()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.phone IS NOT NULL THEN
    NEW.phone := public.normalize_phone(NEW.phone);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_normalize_chat_conversation_phone ON public.chat_conversations;
CREATE TRIGGER trg_normalize_chat_conversation_phone
BEFORE INSERT OR UPDATE OF phone ON public.chat_conversations
FOR EACH ROW
EXECUTE FUNCTION public.normalize_chat_conversation_phone();

-- 6. Índice único parcial: 1 conversa de WhatsApp por telefone
CREATE UNIQUE INDEX IF NOT EXISTS uniq_chat_conversations_whatsapp_phone
ON public.chat_conversations (phone)
WHERE channel = 'whatsapp' AND phone IS NOT NULL;
