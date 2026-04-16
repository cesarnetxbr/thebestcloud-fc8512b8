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
