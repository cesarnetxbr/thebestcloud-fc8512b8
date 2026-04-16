---
name: WhatsApp Z-API Integration
description: WhatsApp connection via Z-API (replaced Evolution API), using QR Code for multi-agent chat with webhook
type: feature
---
- Provider: Z-API (api.z-api.io)
- Secrets: ZAPI_INSTANCE_ID, ZAPI_TOKEN, ZAPI_CLIENT_TOKEN
- Edge function: whatsapp-evolution (name kept for backward compat, uses Z-API internally)
- Edge function: whatsapp-webhook (receives incoming messages from Z-API)
- Actions: qrcode, qrcode-image, status, disconnect, restart, send-text, send-button-list, connected
- Status response: { connected: boolean, smartphoneConnected: boolean }
- QR code response: { value: "base64..." } when disconnected, { connected: true } when connected
- Frontend: CRMWhatsAppConnect.tsx - single instance view (not multi-instance like Evolution)
- Client-Token header required for all Z-API requests
- Webhook URL: https://qcbnevxisuzljxtdjbvl.supabase.co/functions/v1/whatsapp-webhook
- Webhook creates/finds chat_conversations by phone number, inserts chat_messages with sender_type=customer
- chat_conversations has phone column for WhatsApp number matching
- chat_messages has external_message_id for deduplication
- CRMChat sendMessage sends via Z-API for WhatsApp conversations with phone
- Z-API webhook must be configured in Z-API dashboard pointing to the webhook URL
- Webhook flow: greeting (once) → special handlers (servicos, cotacao, categories, close, reopen) → chatbot rules → AI fallback
- Special button handlers: servicos (3 pillars), cotacao (qualifying questions), seguranca_cat/protecao_cat/operacoes_cat (detail)
- Greeting buttons: Nossos Serviços, Cotação, Suporte, Encerrar
- Keyword buttons always include: Cotação, Nossos Serviços, Falar com Consultor, Encerrar
- Auto-close after 48h via whatsapp-auto-close edge function + pg_cron
