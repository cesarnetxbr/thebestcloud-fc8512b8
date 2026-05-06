
REVOKE EXECUTE ON FUNCTION public.merge_chat_conversations(uuid, uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.merge_chat_conversations(uuid, uuid) TO service_role;
