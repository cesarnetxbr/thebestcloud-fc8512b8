import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const getSessionId = () => {
  let sid = sessionStorage.getItem("analytics_sid");
  if (!sid) {
    sid = crypto.randomUUID();
    sessionStorage.setItem("analytics_sid", sid);
  }
  return sid;
};

const getDeviceType = () => {
  const w = window.innerWidth;
  if (w < 768) return "mobile";
  if (w < 1024) return "tablet";
  return "desktop";
};

export const trackEvent = async (
  eventName: string,
  options?: { category?: string; label?: string; value?: number; metadata?: Record<string, unknown> }
) => {
  try {
    await supabase.from("analytics_events").insert({
      event_name: eventName,
      category: options?.category || "general",
      label: options?.label,
      value: options?.value || 0,
      page_path: window.location.pathname,
      session_id: getSessionId(),
      metadata: options?.metadata as any,
    });
  } catch (e) {
    console.error("Analytics event error:", e);
  }
};

export const useAnalyticsTracker = () => {
  const location = useLocation();
  const lastPath = useRef("");

  useEffect(() => {
    if (location.pathname === lastPath.current) return;
    lastPath.current = location.pathname;

    // Don't track admin pages
    if (location.pathname.startsWith("/admin") || location.pathname.startsWith("/portal")) return;

    supabase.from("analytics_pageviews").insert({
      page_path: location.pathname,
      page_title: document.title,
      referrer: document.referrer || null,
      user_agent: navigator.userAgent,
      session_id: getSessionId(),
      device_type: getDeviceType(),
    }).then(({ error }) => {
      if (error) console.error("Pageview tracking error:", error);
    });
  }, [location.pathname]);
};
