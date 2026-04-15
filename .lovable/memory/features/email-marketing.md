---
name: Email Marketing Module
description: Campaign management, contact lists, templates, and metrics — prepared for external provider integration
type: feature
---
## Tables
- `email_marketing_lists` — contact lists with name, description, count
- `email_marketing_contacts` — contacts per list (name, email, phone, status, tags)
- `email_marketing_templates` — reusable HTML templates with categories
- `email_marketing_campaigns` — campaigns linking template + list, with status flow (draft → scheduled → sending → sent)
- `email_marketing_campaign_metrics` — per-campaign delivery metrics

## Pages
- `/admin/marketing` — Dashboard with KPIs and onboarding steps
- `/admin/marketing/campaigns` — Campaign CRUD with status tracking
- `/admin/marketing/lists` — List management + contact panel
- `/admin/marketing/templates` — Template CRUD with HTML preview

## Integration
- Fields `provider` and `provider_campaign_id` on campaigns table ready for external providers (Brevo, SendGrid, Mailchimp)
- No actual sending yet — requires external provider connection
- RLS: admin/manager only
