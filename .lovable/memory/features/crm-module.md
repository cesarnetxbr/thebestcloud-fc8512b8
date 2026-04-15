---
name: CRM & Pipeline Module
description: CRM module with leads, deals, pipeline kanban, and activities — absorbs commercial requests and quotes
type: feature
---
- Tables: crm_leads, crm_deals, crm_pipeline_stages, crm_activities, crm_appointments
- Pages: /admin/crm (dashboard), /admin/crm/pipeline (kanban), /admin/crm/leads, /admin/crm/agenda (calendar)
- Commercial Requests and Quotes moved under CRM section but keep original routes for backward compat
- Default pipeline stages: Prospecção, Qualificação, Proposta, Negociação, Fechamento, Perdido
- Deals link to leads, quotes, and commercial_requests
- Agenda: calendar view with monthly navigation, CRUD for appointments linked to customers/leads/deals
- Future modules planned: Chat, WhatsApp multi-agent
