---
name: Consultant Lead Flow (Site → WhatsApp → Pipeline)
description: Public "Fale com um Consultor" form creates lead, opens WhatsApp, AI classifies probability and creates Pipeline deal
type: feature
---
- Component: src/components/ConsultantContactDialog.tsx (modal with name, phone, email, company)
- Triggered by "Fale com um Consultor" buttons in: Hero, CTASection, SolutionPage
- Edge function: supabase/functions/consultant-lead (verify_jwt = false)
  - Inserts into crm_leads (source="site", status="novo", tags=["site","fale-com-consultor"])
  - Reuses or creates chat_conversations (channel="whatsapp", lead_id linked)
  - Sends proactive Z-API greeting + logs system note in conversation
- Client also opens wa.me with pre-filled greeting (dual redirect)
- Webhook (whatsapp-webhook) extension: classifyLeadProbability()
  - Runs ONLY when conversation has lead_id and no deal yet
  - Needs ≥2 customer messages
  - Calls Lovable AI (google/gemini-2.5-flash) with JSON response_format
  - Thresholds: probability ≥40 → creates crm_deals at first active stage; ≥75 → adds green tag "Alta Probabilidade" (#16a34a)
- Existing flows preserved: greeting menu, numeric resolution, services/quote/category handlers untouched
