import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { question, articles } = await req.json();

    if (!question || typeof question !== "string" || question.trim().length < 3) {
      return new Response(
        JSON.stringify({ error: "Pergunta inválida. Mínimo 3 caracteres." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "LOVABLE_API_KEY não configurada" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build context from articles
    const contextArticles = (articles || [])
      .slice(0, 30)
      .map(
        (a: any, i: number) =>
          `[${i + 1}] ${a.title} (${a.category} > ${a.subcategory})\n${a.description}\n${a.content ? a.content.slice(0, 600) : ""}`
      )
      .join("\n---\n");

    const systemPrompt = `Você é o assistente de suporte técnico da The Best Cloud, especialista em soluções de ciberproteção baseadas na plataforma Acronis Cyber Protect Cloud.

Responda SEMPRE em Português do Brasil (PT-BR).

Use SOMENTE as informações dos artigos da base de conhecimento fornecidos abaixo como contexto. Se a pergunta não puder ser respondida com o contexto disponível, diga educadamente que não encontrou a informação e sugira entrar em contato com o suporte.

Formate a resposta em Markdown com títulos, listas e destaques quando apropriado.
Ao final, sugira 1-3 artigos relacionados do contexto (mencione o título exato).

## Base de Conhecimento (contexto)
${contextArticles}`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: question },
          ],
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Muitas requisições. Tente novamente em alguns segundos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos de IA esgotados." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "Erro no serviço de IA" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("kb-ai-search error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
