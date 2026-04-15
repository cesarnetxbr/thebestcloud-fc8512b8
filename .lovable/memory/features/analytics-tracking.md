---
name: Analytics & Tracking Module
description: Unified analytics dashboard with site tracking, marketing metrics, and internal usage monitoring
type: feature
---
- Tables: `analytics_pageviews`, `analytics_events` (immutable, insert-only)
- RLS: anon/authenticated can insert; admin/manager can view
- Client tracker: `useAnalyticsTracker` hook tracks public page visits automatically
- `trackEvent()` function for custom conversion/click events
- Dashboard consolidates: pageviews, sessions, devices, events, email/SMS metrics, audit logs
- Does NOT modify existing tables (email_marketing_campaign_metrics, sms_marketing_campaign_metrics, audit_logs)
- Routes: /admin/analytics
- Navigation: ANALYTICS section in AdminLayout sidebar
