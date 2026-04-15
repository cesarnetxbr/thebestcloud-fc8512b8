---
name: SMS Marketing Module
description: SMS campaign management, contacts, templates, metrics — prepared for Twilio/Vonage integration
type: feature
---
## Tables
- `sms_marketing_contacts` — contacts with phone (unique), name, email, status, tags
- `sms_marketing_templates` — reusable message templates with char_count (auto-generated)
- `sms_marketing_campaigns` — campaigns with message, template, status flow, provider fields
- `sms_marketing_campaign_metrics` — per-campaign delivery metrics (sent, delivered, failed, replied)

## Pages
- `/admin/sms` — Dashboard with KPIs and onboarding steps
- `/admin/sms/campaigns` — Campaign CRUD with 160-char counter
- `/admin/sms/contacts` — Contact management with search
- `/admin/sms/templates` — Template CRUD with char counter

## Integration
- Fields `provider`, `provider_campaign_id`, `sender_number` ready for Twilio/Vonage
- `target_tags` on campaigns for segmented sending
- RLS: admin/manager only
