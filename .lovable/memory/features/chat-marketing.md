---
name: Chat Marketing Module
description: WhatsApp Connect (QR Code), Chatbot/IA automation, and chat-to-pipeline conversion within CRM
type: feature
---
- Sidebar section "Chat Marketing" under CRM & MARKETING with: Multi-atendimento, WhatsApp Connect, Chatbot & IA, Config. Chat
- Tables: whatsapp_instances (instance_name, phone_number, status, qr_code_data, session_data), chatbot_rules (name, trigger_type, trigger_value, response_type, response_content, is_active, priority)
- Pages: /admin/crm/whatsapp-connect (QR Code connection), /admin/crm/chatbot (automation rules & AI), /admin/crm/chat (multi-agent), /admin/crm/chat/settings
- Chat conversations can be converted to Pipeline deals via button in chat header (creates crm_deal, links deal_id)
- Chatbot trigger types: keyword, greeting, fallback, ai
- Response types: text (fixed), ai (AI-powered)
