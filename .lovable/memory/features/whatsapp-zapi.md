---
name: WhatsApp Z-API Integration
description: WhatsApp connection via Z-API (replaced Evolution API), using QR Code for multi-agent chat with webhook
type: feature
---
- Provider: Z-API (api.z-api.io)
- Secrets: ZAPI_INSTANCE_ID, ZAPI_TOKEN, ZAPI_CLIENT_TOKEN
- Edge function: whatsapp-evolution (name kept for backward compat, uses Z-API internally)
- Edge function: whatsapp-webhook (receives incoming messages from Z-API)
- Actions: qrcode, qrcode-image, status, disconnect, restart, send-text, connected
- NO buttons (send-button-list removed) — all menus use numbered text options via sendZapiMenu
- Numeric input resolution: user sends "1", "2", etc. → webhook checks last bot message to detect menu context → resolves to action ID
- Menu contexts: greeting, reopen, servicos, category, cotacao, keyword — defined in menuDefinitions
- detectMenuContext reads last bot message content markers to determine which menu was shown
- Webhook flow: greeting (once) → numeric resolution → special handlers (servicos, cotacao, categories, close, reopen) → chatbot rules → AI fallback
- Special handlers: servicos (3 pillars), cotacao (qualifying questions: volume GB/TB + devices), seguranca_cat/protecao_cat/operacoes_cat (detail)
- Auto-close after 48h via whatsapp-auto-close edge function + pg_cron
- chat_conversations has phone column for WhatsApp number matching
- chat_messages has external_message_id for deduplication
- UNIFIED CONVERSATION PER PHONE: webhook ALWAYS reuses the most recent conversation for a phone number, even if status="encerrada" (auto-reopens to "ativa"). Never creates duplicate conversations for the same contact — preserves full history.
- DB-LEVEL UNIQUENESS: índice único parcial `uniq_chat_conversations_whatsapp_phone` em (phone) WHERE channel='whatsapp' garante 1 conversa por número. Trigger `trg_normalize_chat_conversation_phone` normaliza telefone (somente dígitos via `public.normalize_phone`) em todo INSERT/UPDATE. Função `public.merge_chat_conversations(keep_id, drop_id)` (SECURITY DEFINER, somente service_role) faz fusão preservando mensagens e vínculos (lead/customer/deal). Edge functions `whatsapp-webhook` e `consultant-lead` tratam violação do índice (corrida) reaproveitando a conversa existente.
- BUGFIX QA 2026-05-10: detectMenuContext checa "greeting" ANTES de "servicos" (a saudação menciona "3 pilares"/"Nossos Serviços" como prévia e era classificada erroneamente como menu de serviços, fazendo opção 2 cair em "protecao_cat" ao invés de "cotacao"). Marcador "servicos" agora exige "*Nossos Serviços" (com asterisco) ou "3 pilares" sem ser saudação.
- BUGFIX QA 2026-05-10: isCloseRequest agora exige match EXATO para "0", "encerrar", "finalizar", "sair" — antes usava `includes("0")`, fazendo qualquer mensagem com "10 TB", "100 dispositivos" etc. encerrar a conversa indevidamente. Frases longas ("encerrar conversa", "finalizar atendimento") continuam por substring.
- FEATURE 2026-05-10 — Qualificação automática WhatsApp → CRM: função `tryQualifyCotacaoLead` no `whatsapp-webhook` é chamada quando a última msg do bot foi o menu de Cotação. Usa Lovable AI (`google/gemini-3-flash-preview` + tool calling `extract_quote_qualification`) para extrair `contact_name`, `company`, `email`, `volume_tb`, `workstations`, `servers`, `services[]`, `estimated_monthly_brl`, `confidence`. Heurística de pré-filtro exige texto ≥15 chars com dígitos OU palavras de serviço. Se `confidence ≥ 0.4`: cria `crm_leads` (source="whatsapp", status="qualificado", tags `serv:*`), cria `crm_deals` na primeira etapa com valor anual = mensal×12 e `probability=confidence×100`, vincula `lead_id`/`deal_id` em `chat_conversations`, adiciona tag "WhatsApp" (#25D366) e, se `confidence ≥ 0.7`, tag "Alta Probabilidade" (#16a34a). Responde ao cliente com confirmação + protocolo (8 chars do dealId) + contato comercial (91) 98131-7645. Idempotente: não recria lead/deal se conversa já tem `lead_id` E `deal_id`.
