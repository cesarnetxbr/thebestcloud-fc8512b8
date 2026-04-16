---
name: WhatsApp Z-API Integration
description: WhatsApp connection via Z-API (replaced Evolution API), using QR Code for multi-agent chat
type: feature
---
- Provider: Z-API (api.z-api.io)
- Secrets: ZAPI_INSTANCE_ID, ZAPI_TOKEN, ZAPI_CLIENT_TOKEN
- Edge function: whatsapp-evolution (name kept for backward compat, uses Z-API internally)
- Actions: qrcode, qrcode-image, status, disconnect, restart, send-text, connected
- Status response: { connected: boolean, smartphoneConnected: boolean }
- QR code response: { value: "base64..." } when disconnected, { connected: true } when connected
- Frontend: CRMWhatsAppConnect.tsx - single instance view (not multi-instance like Evolution)
- Client-Token header required for all Z-API requests
