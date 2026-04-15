---
name: CRM & Pipeline Module
description: CRM module with leads, deals, pipeline kanban, activities, multi-agent WhatsApp chat, and marketing
type: feature
---
- Tables: crm_leads, crm_deals, crm_pipeline_stages, crm_activities, crm_appointments, chat_conversations, chat_messages, chat_departments, chat_quick_replies
- Pages: /admin/crm (dashboard), /admin/crm/pipeline (kanban), /admin/crm/leads, /admin/crm/chat (multi-agent WhatsApp), /admin/crm/chat/settings (departments & quick replies), /admin/crm/agenda (calendar), /admin/crm/marketing
- Multi-agent WhatsApp: agent assignment, transfer between agents, department routing, quick replies, channel filtering, KPI cards, realtime notifications
- chat_conversations has: assigned_to, department_id, channel (whatsapp/chat/email/telefone)
- Default pipeline stages: Prospecção, Qualificação, Proposta, Negociação, Fechamento, Perdido
- Deals link to leads, quotes, and commercial_requests
- Agenda: calendar view with monthly navigation, CRUD for appointments
