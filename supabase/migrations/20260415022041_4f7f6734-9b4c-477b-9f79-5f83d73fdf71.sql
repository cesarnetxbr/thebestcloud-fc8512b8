
-- Pageviews table for site visitor tracking
CREATE TABLE public.analytics_pageviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_path TEXT NOT NULL,
  page_title TEXT,
  referrer TEXT,
  user_agent TEXT,
  ip_hash TEXT,
  session_id TEXT,
  device_type TEXT DEFAULT 'desktop',
  country TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.analytics_pageviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert pageviews"
ON public.analytics_pageviews FOR INSERT
TO anon, authenticated
WITH CHECK (page_path IS NOT NULL AND page_path <> '');

CREATE POLICY "Admin/manager can view pageviews"
ON public.analytics_pageviews FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

-- Events table for custom event tracking (conversions, clicks, forms)
CREATE TABLE public.analytics_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_name TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  label TEXT,
  value NUMERIC DEFAULT 0,
  page_path TEXT,
  session_id TEXT,
  metadata JSONB,
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert events"
ON public.analytics_events FOR INSERT
TO anon, authenticated
WITH CHECK (event_name IS NOT NULL AND event_name <> '');

CREATE POLICY "Admin/manager can view events"
ON public.analytics_events FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

-- Indexes for performance
CREATE INDEX idx_pageviews_created_at ON public.analytics_pageviews(created_at DESC);
CREATE INDEX idx_pageviews_page_path ON public.analytics_pageviews(page_path);
CREATE INDEX idx_pageviews_session ON public.analytics_pageviews(session_id);
CREATE INDEX idx_events_created_at ON public.analytics_events(created_at DESC);
CREATE INDEX idx_events_name ON public.analytics_events(event_name);
CREATE INDEX idx_events_category ON public.analytics_events(category);
