// Edge function: agregadas métricas de atendimento WhatsApp para o CRM admin.
// Somente leitura. Validação de admin via JWT.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Verifica usuário autenticado (admin/manager)
    const authHeader = req.headers.get("Authorization") || "";
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData } = await userClient.auth.getUser();
    if (!userData?.user) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, serviceKey);
    const { data: roleAdmin } = await supabase.rpc("has_role", {
      _user_id: userData.user.id,
      _role: "admin",
    });
    const { data: roleManager } = await supabase.rpc("has_role", {
      _user_id: userData.user.id,
      _role: "manager",
    });
    if (!roleAdmin && !roleManager) {
      return new Response(JSON.stringify({ error: "forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const url = new URL(req.url);
    const days = Math.min(Math.max(parseInt(url.searchParams.get("days") || "30"), 1), 365);
    const since = new Date(Date.now() - days * 86400000).toISOString();

    // Leads WhatsApp
    const { data: leads } = await supabase
      .from("crm_leads")
      .select("id, name, company, created_at, tags, status")
      .eq("source", "whatsapp")
      .gte("created_at", since)
      .order("created_at", { ascending: false });

    const leadIds = (leads || []).map((l) => l.id);

    // Deals vinculados aos leads
    const { data: deals } = leadIds.length
      ? await supabase
          .from("crm_deals")
          .select("id, lead_id, title, value, status, created_at, probability, stage_id")
          .in("lead_id", leadIds)
      : { data: [] as any[] };

    // KPIs
    const totalLeads = leads?.length || 0;
    const dealsArr = deals || [];
    const totalDeals = dealsArr.length;
    const totalGanho = dealsArr.filter((d) => d.status === "ganho").length;
    const conversionRate = totalLeads > 0 ? (totalGanho / totalLeads) * 100 : 0;

    // Tempo médio até proposta (lead -> deal)
    const dealByLead = new Map<string, any>();
    dealsArr.forEach((d) => {
      if (d.lead_id && !dealByLead.has(d.lead_id)) dealByLead.set(d.lead_id, d);
    });
    const diffsMs: number[] = [];
    (leads || []).forEach((l) => {
      const d = dealByLead.get(l.id);
      if (d) diffsMs.push(new Date(d.created_at).getTime() - new Date(l.created_at).getTime());
    });
    const avgTimeToProposalHours =
      diffsMs.length > 0 ? diffsMs.reduce((a, b) => a + b, 0) / diffsMs.length / 3600000 : 0;

    // Top serviços (tags serv:*)
    const serviceCount = new Map<string, number>();
    (leads || []).forEach((l) => {
      (l.tags || []).forEach((t: string) => {
        if (t.startsWith("serv:")) {
          const key = t.slice(5);
          serviceCount.set(key, (serviceCount.get(key) || 0) + 1);
        }
      });
    });
    const topServices = [...serviceCount.entries()]
      .map(([service, count]) => ({ service, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Série temporal diária
    const seriesMap = new Map<string, { date: string; leads: number; deals: number }>();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const k = d.toISOString().slice(0, 10);
      seriesMap.set(k, { date: k, leads: 0, deals: 0 });
    }
    (leads || []).forEach((l) => {
      const k = new Date(l.created_at).toISOString().slice(0, 10);
      const e = seriesMap.get(k);
      if (e) e.leads += 1;
    });
    dealsArr.forEach((d) => {
      const k = new Date(d.created_at).toISOString().slice(0, 10);
      const e = seriesMap.get(k);
      if (e) e.deals += 1;
    });
    const series = [...seriesMap.values()];

    // Últimos 20 deals
    const recentDeals = dealsArr
      .slice()
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 20);

    return new Response(
      JSON.stringify({
        period_days: days,
        kpis: {
          total_leads: totalLeads,
          total_deals: totalDeals,
          total_ganho: totalGanho,
          conversion_rate: Number(conversionRate.toFixed(1)),
          avg_time_to_proposal_hours: Number(avgTimeToProposalHours.toFixed(1)),
        },
        top_services: topServices,
        series,
        recent_deals: recentDeals,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("crm-whatsapp-metrics error", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
