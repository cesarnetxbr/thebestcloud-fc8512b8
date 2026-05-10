// Edge function pública: retorna dados sanitizados de uma cotação por tracking_token
// Sem JWT — protegido apenas pelo token UUID secreto
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token");
    if (!token || !/^[0-9a-f-]{36}$/i.test(token)) {
      return new Response(JSON.stringify({ error: "token inválido" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: deal, error } = await supabase
      .from("crm_deals")
      .select("id, title, status, value, probability, expected_close_date, created_at, updated_at, stage_id, lead_id")
      .eq("tracking_token", token)
      .maybeSingle();

    if (error) throw error;
    if (!deal) {
      return new Response(JSON.stringify({ error: "cotação não encontrada" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Stage atual e ordem de stages para o stepper
    const { data: stages } = await supabase
      .from("crm_pipeline_stages")
      .select("id, name, position, color")
      .eq("is_active", true)
      .order("position", { ascending: true });

    const currentStage = stages?.find((s) => s.id === deal.stage_id) ?? null;
    const currentIndex = currentStage ? stages!.findIndex((s) => s.id === currentStage.id) : -1;

    // Lead enxuto (sem dados sensíveis)
    let leadName: string | null = null;
    let company: string | null = null;
    if (deal.lead_id) {
      const { data: lead } = await supabase
        .from("crm_leads")
        .select("name, company")
        .eq("id", deal.lead_id)
        .maybeSingle();
      leadName = lead?.name ?? null;
      company = lead?.company ?? null;
    }

    // Tags do deal
    const { data: tags } = await supabase
      .from("crm_deal_tags")
      .select("tag_name, tag_color")
      .eq("deal_id", deal.id);

    // Decide se valor é exibido (apenas a partir de Proposta)
    const stageNameLower = (currentStage?.name ?? "").toLowerCase();
    const showValue = ["proposta", "negociação", "negociacao", "fechamento", "ganho"].some((s) =>
      stageNameLower.includes(s),
    );

    const nextSteps = (() => {
      if (!currentStage) return "Aguardando contato do consultor.";
      const n = stageNameLower;
      if (n.includes("prospec")) return "Nossa equipe entrará em contato para entender suas necessidades.";
      if (n.includes("qualific")) return "Estamos preparando sua proposta personalizada.";
      if (n.includes("proposta")) return "Proposta enviada. Aguardamos seu retorno para próximos passos.";
      if (n.includes("negocia")) return "Negociação em andamento — alinhamento de valores e escopo.";
      if (n.includes("fechamento")) return "Finalizando contrato e onboarding.";
      if (n.includes("perdido")) return "Cotação encerrada.";
      return "Acompanhe esta página para atualizações.";
    })();

    return new Response(
      JSON.stringify({
        deal: {
          id: deal.id,
          title: deal.title,
          status: deal.status,
          probability: deal.probability,
          expected_close_date: deal.expected_close_date,
          created_at: deal.created_at,
          updated_at: deal.updated_at,
          value: showValue ? Number(deal.value ?? 0) : null,
        },
        lead: { name: leadName, company },
        stages: (stages ?? []).map((s) => ({ id: s.id, name: s.name, position: s.position, color: s.color })),
        current_stage_id: currentStage?.id ?? null,
        current_stage_index: currentIndex,
        tags: tags ?? [],
        next_steps: nextSteps,
        consultant: {
          name: "Equipe Comercial The Best Cloud",
          whatsapp: "+55 91 98131-7645",
          email: "comercial@thebestcloud.app",
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("quote-tracking error", e);
    return new Response(JSON.stringify({ error: String((e as Error).message ?? e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
