import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function getZapiConfig() {
  const ZAPI_INSTANCE_ID = Deno.env.get("ZAPI_INSTANCE_ID");
  const ZAPI_TOKEN = Deno.env.get("ZAPI_TOKEN");
  const ZAPI_CLIENT_TOKEN = Deno.env.get("ZAPI_CLIENT_TOKEN");
  if (!ZAPI_INSTANCE_ID || !ZAPI_TOKEN) return null;
  const baseUrl = `https://api.z-api.io/instances/${ZAPI_INSTANCE_ID}/token/${ZAPI_TOKEN}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(ZAPI_CLIENT_TOKEN ? { "Client-Token": ZAPI_CLIENT_TOKEN } : {}),
  };
  return { baseUrl, headers };
}

async function sendZapiMessage(phone: string, message: string) {
  const config = getZapiConfig();
  if (!config) { console.error("Z-API not configured"); return false; }
  try {
    const res = await fetch(`${config.baseUrl}/send-text`, {
      method: "POST", headers: config.headers,
      body: JSON.stringify({ phone, message }),
    });
    if (!res.ok) { console.error("Z-API send failed:", res.status, await res.text()); return false; }
    console.log("Auto-reply sent to:", phone);
    return true;
  } catch (e) { console.error("Z-API send error:", e); return false; }
}

// Send text message with numbered menu options appended
async function sendZapiMenu(phone: string, message: string, options: { id: string; label: string }[]) {
  const menuText = options.map((o, i) => `${i + 1}️⃣ ${o.label}`).join("\n");
  const fullMessage = message + "\n\n" + menuText + "\n\n_Responda com o número da opção desejada._";
  return sendZapiMessage(phone, fullMessage);
}

// Normalize accented characters for matching
function normalizeText(text: string): string {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

function normalizePhone(phone: string): string {
  const digits = phone.replace(/@c\.us$/i, "").replace(/@s\.whatsapp\.net$/i, "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("55")) return digits;
  return `55${digits}`;
}

// Action ID → keyword mapping for matching chatbot rules
const actionKeywords: Record<string, string[]> = {
  "backup": ["backup", "ciberprotecao", "nuvem", "cloud"],
  "ransomware": ["ransomware", "virus", "malware", "seguranca", "antivirus", "protecao"],
  "disaster": ["disaster recovery", "recuperacao", "desastre", "continuidade"],
  "cotacao": ["preco", "valor", "cotacao", "custo", "plano", "orcamento"],
  "suporte": ["suporte", "ajuda", "problema", "erro", "ticket"],
  "servicos": ["servicos", "solucoes", "produtos", "catalogo"],
  "seguranca_cat": ["seguranca_cat"],
  "protecao_cat": ["protecao_cat"],
  "operacoes_cat": ["operacoes_cat"],
  "encerrar": ["encerrar"],
};

// Menu definitions: each context maps to ordered option IDs + labels
const menuDefinitions: Record<string, { id: string; label: string }[]> = {
  greeting: [
    { id: "servicos", label: "📋 Nossos Serviços" },
    { id: "cotacao", label: "💰 Cotação" },
    { id: "suporte", label: "🎧 Suporte" },
    { id: "encerrar", label: "❌ Encerrar" },
  ],
  reopen: [
    { id: "servicos", label: "📋 Nossos Serviços" },
    { id: "cotacao", label: "💰 Cotação" },
    { id: "suporte", label: "🎧 Suporte Técnico" },
    { id: "encerrar", label: "❌ Encerrar" },
  ],
  servicos: [
    { id: "seguranca_cat", label: "🔐 Segurança" },
    { id: "protecao_cat", label: "🛡️ Proteção" },
    { id: "operacoes_cat", label: "⚙️ Operações" },
    { id: "cotacao", label: "💰 Cotação" },
    { id: "encerrar", label: "❌ Encerrar" },
  ],
  category: [
    { id: "cotacao", label: "💰 Solicitar Cotação" },
    { id: "servicos", label: "📋 Ver Outros Serviços" },
    { id: "encerrar", label: "❌ Encerrar" },
  ],
  cotacao: [
    { id: "suporte", label: "🎧 Falar com Consultor" },
    { id: "servicos", label: "📋 Ver Serviços" },
    { id: "encerrar", label: "❌ Encerrar" },
  ],
  keyword: [
    { id: "cotacao", label: "💰 Solicitar Cotação" },
    { id: "servicos", label: "📋 Nossos Serviços" },
    { id: "suporte", label: "🎧 Falar com Consultor" },
    { id: "encerrar", label: "❌ Encerrar" },
  ],
};

// Detect which menu context the last bot message used by checking content markers
// IMPORTANT: order matters — checks mais específicos primeiro (cotacao, category, reopen, greeting),
// e só depois servicos. Caso contrário, a saudação que menciona "3 pilares" / "Nossos Serviços"
// como prévia seria classificada como menu de serviços.
function detectMenuContext(lastBotMessage: string): string | null {
  if (!lastBotMessage) return null;
  const lower = lastBotMessage.toLowerCase();
  if (lastBotMessage.includes("Solicitar Cotação") && lastBotMessage.includes("volume de dados")) return "cotacao";
  if (lastBotMessage.includes("Segurança –") || lastBotMessage.includes("Proteção –") || lastBotMessage.includes("Operações –")) return "category";
  if (lastBotMessage.includes("Conversa reaberta")) return "reopen";
  if (lower.includes("bem-vindo") || lower.includes("como posso te ajud") || lower.includes("como posso ajud")) return "greeting";
  if (lastBotMessage.includes("*Nossos Serviços") || lastBotMessage.includes("3 pilares")) return "servicos";
  if (lastBotMessage.includes("Responda com o número")) return "keyword";
  return null;
}

// Resolve numeric input (1, 2, 3...) to action ID using last bot message context
async function resolveNumericInput(supabase: any, conversationId: string, numStr: string): Promise<string | null> {
  const num = parseInt(numStr.trim(), 10);
  if (isNaN(num) || num < 1) return null;

  // Get last bot message
  const { data: lastBot } = await supabase
    .from("chat_messages").select("content")
    .eq("conversation_id", conversationId)
    .eq("sender_type", "agent")
    .eq("sender_name", "🤖 Chatbot")
    .order("created_at", { ascending: false })
    .limit(1).maybeSingle();

  if (!lastBot?.content) return null;
  const context = detectMenuContext(lastBot.content);
  if (!context) return null;

  const menu = menuDefinitions[context];
  if (!menu || num > menu.length) return null;

  return menu[num - 1].id;
}

async function matchChatbotRule(
  supabase: any, messageContent: string, conversationId: string, greetingSent: boolean
) {
  const { data: rules, error } = await supabase
    .from("chatbot_rules").select("*").eq("is_active", true)
    .order("priority", { ascending: false });
  if (error || !rules?.length) return null;

  const normalizedMsg = normalizeText(messageContent);

  // 1. Greeting ONLY if never sent before in this conversation
  if (!greetingSent) {
    const greetingRule = rules.find((r: any) => r.trigger_type === "greeting");
    if (greetingRule) return greetingRule;
  }

  // 2. Keyword rules (with accent-normalized matching)
  for (const rule of rules) {
    if (rule.trigger_type !== "keyword" || !rule.trigger_value) continue;
    const keywords = rule.trigger_value.split(",").map((k: string) => normalizeText(k));
    if (keywords.some((kw: string) => kw && normalizedMsg.includes(kw))) return rule;
  }

  // 3. AI rules
  const aiRule = rules.find((r: any) => r.trigger_type === "ai");
  if (aiRule) return aiRule;

  // 4. Fallback
  return rules.find((r: any) => r.trigger_type === "fallback") || null;
}

async function generateAIResponse(systemPrompt: string, userMessage: string): Promise<string | null> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) { console.error("LOVABLE_API_KEY not configured"); return null; }
  try {
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
      }),
    });
    if (!res.ok) { console.error("AI gateway error:", res.status); return null; }
    const data = await res.json();
    return data.choices?.[0]?.message?.content || null;
  } catch (e) { console.error("AI call error:", e); return null; }
}

// ===== Probability classification (only for site-originated leads) =====
async function classifyLeadProbability(
  supabase: any,
  conversationId: string,
  leadId: string,
): Promise<void> {
  try {
    // Avoid re-classifying if a deal already exists for this lead
    const { data: existingDeal } = await supabase
      .from("crm_deals").select("id").eq("lead_id", leadId).maybeSingle();
    if (existingDeal) return;

    // Need at least 2 customer messages to classify meaningfully
    const { data: customerMsgs } = await supabase
      .from("chat_messages").select("content, created_at")
      .eq("conversation_id", conversationId)
      .eq("sender_type", "customer")
      .order("created_at", { ascending: true });
    if (!customerMsgs || customerMsgs.length < 2) return;

    const transcript = customerMsgs
      .map((m: any, i: number) => `Cliente #${i + 1}: ${m.content}`)
      .join("\n");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) return;

    const systemPrompt =
      "Você é analista comercial da The Best Cloud (ciberproteção, backup, segurança em nuvem). " +
      "Avalie a probabilidade de fechamento de venda com base nas mensagens do cliente. " +
      "Responda APENAS com JSON válido no formato: " +
      '{"probability": <0-100>, "reason": "<curto>", "title": "<título do deal>"}';

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: transcript },
        ],
        response_format: { type: "json_object" },
      }),
    });
    if (!aiRes.ok) { console.error("AI classify error:", aiRes.status); return; }
    const aiData = await aiRes.json();
    const raw = aiData.choices?.[0]?.message?.content || "{}";
    let parsed: { probability?: number; reason?: string; title?: string } = {};
    try { parsed = JSON.parse(raw); } catch { return; }

    // Carrega limiares configuráveis (com fallback seguro)
    const { data: settingsRow } = await supabase
      .from("ai_settings").select("value").eq("key", "lead_classification").maybeSingle();
    const cfg = (settingsRow?.value || {}) as {
      deal_threshold?: number; tag_threshold?: number;
      tag_name?: string; tag_color?: string; enabled?: boolean;
    };
    if (cfg.enabled === false) {
      console.log("AI lead classification disabled by admin settings");
      return;
    }
    const dealThreshold = Number.isFinite(cfg.deal_threshold) ? Number(cfg.deal_threshold) : 40;
    const tagThreshold = Number.isFinite(cfg.tag_threshold) ? Number(cfg.tag_threshold) : 75;
    const tagName = cfg.tag_name || "Alta Probabilidade";
    const tagColor = cfg.tag_color || "#16a34a";

    const prob = Math.max(0, Math.min(100, Number(parsed.probability) || 0));
    if (prob < dealThreshold) {
      console.log("Classification below threshold:", prob, "<", dealThreshold);
      return;
    }

    // Get lead + first pipeline stage
    const { data: lead } = await supabase
      .from("crm_leads").select("name, company, customer_id").eq("id", leadId).maybeSingle();
    const { data: stage } = await supabase
      .from("crm_pipeline_stages").select("id")
      .eq("is_active", true).order("position", { ascending: true }).limit(1).maybeSingle();

    const dealTitle = (parsed.title || `${lead?.company || lead?.name || "Lead"} — Site`).slice(0, 200);

    const { data: newDeal, error: dealErr } = await supabase
      .from("crm_deals").insert({
        title: dealTitle,
        lead_id: leadId,
        stage_id: stage?.id ?? null,
        probability: prob,
        status: "aberto",
        notes: `Criado automaticamente pela IA. Motivo: ${parsed.reason || "n/d"}`,
      }).select("id").single();
    if (dealErr) { console.error("Deal insert error:", dealErr); return; }

    // Alta probabilidade → tag colorida (limiar configurável)
    if (prob >= tagThreshold && newDeal) {
      await supabase.from("crm_deal_tags").insert({
        deal_id: newDeal.id,
        tag_name: tagName,
        tag_color: tagColor,
      });
    }

    console.log("Deal created from AI classification:", newDeal?.id, "prob:", prob);
  } catch (e) {
    console.error("classifyLeadProbability error:", e);
  }
}

function isCloseRequest(msg: string): boolean {
  const n = normalizeText(msg);
  // Match exato para "0" e "encerrar"; substring apenas para frases longas inequívocas.
  if (n === "0" || n === "encerrar" || n === "finalizar" || n === "sair") return true;
  return ["fechar conversa", "encerrar conversa", "encerrar atendimento", "finalizar atendimento", "finalizar conversa"].some(kw => n.includes(kw));
}

function isReopenRequest(msg: string): boolean {
  const n = normalizeText(msg);
  if (n === "reabrir" || n === "voltar") return true;
  return ["reabrir conversa", "reabrir atendimento", "novo atendimento"].some(kw => n.includes(kw));
}

// Resolve button click ID or action ID into a searchable keyword
function resolveActionId(actionId: string): string | null {
  const mapped = actionKeywords[actionId];
  if (mapped && mapped.length > 0) return mapped[0];
  return null;
}

// =====================================================================================
// Qualificação automática de cotação WhatsApp → CRM (lead + deal no Pipeline)
// Disparada quando a última msg do bot foi o menu de cotação E o cliente respondeu
// com texto livre contendo informações qualificadoras (volume, dispositivos, serviços).
// Não recria lead/deal se a conversa já tem lead_id/deal_id.
// =====================================================================================
async function tryQualifyCotacaoLead(
  supabase: any,
  conversationId: string,
  phone: string,
  senderName: string,
  messageContent: string,
): Promise<{ created: boolean; reason?: string; leadId?: string; dealId?: string }> {
  // 1) Conversa ainda sem lead vinculado?
  const { data: conv } = await supabase
    .from("chat_conversations")
    .select("id, lead_id, deal_id, customer_id")
    .eq("id", conversationId).maybeSingle();
  if (!conv) return { created: false, reason: "conversation_not_found" };
  if (conv.lead_id && conv.deal_id) return { created: false, reason: "already_qualified" };

  // 2) Última msg do bot foi o menu de cotação?
  const { data: lastBot } = await supabase
    .from("chat_messages").select("content")
    .eq("conversation_id", conversationId)
    .eq("sender_type", "agent")
    .eq("sender_name", "🤖 Chatbot")
    .order("created_at", { ascending: false })
    .limit(1).maybeSingle();
  const lastBotContent: string = lastBot?.content || "";
  const cameFromCotacao = lastBotContent.includes("Solicitar Cotação") && lastBotContent.includes("volume de dados");
  if (!cameFromCotacao) return { created: false, reason: "not_after_cotacao_menu" };

  // 3) Heurística de pré-filtro: precisa ter dígitos OU palavras de serviço
  const lower = messageContent.toLowerCase();
  const hasDigits = /\d/.test(messageContent);
  const hasServiceKw = ["backup", "antivirus", "antivírus", "ransomware", "disaster", "edr", "xdr", "mdr", "dlp", "e-mail", "email"].some(k => lower.includes(k));
  if (messageContent.trim().length < 15 || (!hasDigits && !hasServiceKw)) {
    return { created: false, reason: "insufficient_signal" };
  }

  // 4) Extrair dados estruturados via Lovable AI (tool calling)
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) return { created: false, reason: "no_ai_key" };

  let extracted: any = null;
  try {
    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: "Você extrai dados de qualificação comercial de mensagens de WhatsApp para a The Best Cloud (ciberproteção, backup em nuvem, antivírus, DR). Retorne SEMPRE via tool 'extract_quote_qualification'. Se um campo não estiver claro, deixe vazio/null. Estime valor mensal em BRL apenas como referência (R$ 25/estação, R$ 80/servidor, R$ 30/TB de backup, R$ 15/estação para antivírus) — soma todos os serviços identificados.",
          },
          { role: "user", content: messageContent },
        ],
        tools: [{
          type: "function",
          function: {
            name: "extract_quote_qualification",
            description: "Extrai dados qualificadores de cotação enviados pelo cliente",
            parameters: {
              type: "object",
              properties: {
                contact_name: { type: "string", description: "Nome da pessoa de contato, se mencionado" },
                company: { type: "string", description: "Nome da empresa, se mencionado" },
                email: { type: "string", description: "E-mail corporativo, se mencionado" },
                volume_tb: { type: "number", description: "Volume de dados em TB (converta GB→TB se necessário). 0 se não mencionado" },
                workstations: { type: "integer", description: "Quantidade de estações/notebooks. 0 se não mencionado" },
                servers: { type: "integer", description: "Quantidade de servidores. 0 se não mencionado" },
                services: {
                  type: "array",
                  items: { type: "string", enum: ["backup", "antivirus", "ransomware", "disaster_recovery", "email_security", "edr", "xdr", "mdr", "dlp", "outros"] },
                  description: "Serviços de interesse identificados",
                },
                estimated_monthly_brl: { type: "number", description: "Estimativa de valor mensal em R$ baseada nas heurísticas do sistema" },
                confidence: { type: "number", description: "Confiança da extração (0 a 1)" },
              },
              required: ["services", "confidence"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "extract_quote_qualification" } },
      }),
    });
    if (!aiResp.ok) {
      console.error("AI qualification failed:", aiResp.status, await aiResp.text());
      return { created: false, reason: "ai_error_" + aiResp.status };
    }
    const aiData = await aiResp.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) return { created: false, reason: "no_tool_call" };
    extracted = JSON.parse(toolCall.function.arguments || "{}");
  } catch (e) {
    console.error("AI qualification exception:", e);
    return { created: false, reason: "ai_exception" };
  }

  if (!extracted || extracted.confidence < 0.4 || !extracted.services?.length) {
    return { created: false, reason: "low_confidence" };
  }

  // 5) Criar/reaproveitar lead
  let leadId = conv.lead_id as string | null;
  if (!leadId) {
    const leadName = extracted.contact_name || senderName || `WhatsApp ${phone}`;
    const tags = ["whatsapp", "cotacao-qualificada", ...extracted.services.map((s: string) => `serv:${s}`)];
    const { data: newLead, error: leadErr } = await supabase
      .from("crm_leads").insert({
        name: leadName,
        company: extracted.company || null,
        email: extracted.email || null,
        phone,
        source: "whatsapp",
        status: "qualificado",
        score: Math.round((extracted.confidence || 0.5) * 100),
        tags,
        notes: `Qualificação automática via WhatsApp:\n• Volume: ${extracted.volume_tb || 0} TB\n• Estações: ${extracted.workstations || 0}\n• Servidores: ${extracted.servers || 0}\n• Serviços: ${extracted.services.join(", ")}\n• Mensagem original:\n"${messageContent}"`,
      }).select("id").single();
    if (leadErr) {
      console.error("Lead create failed:", leadErr);
      return { created: false, reason: "lead_insert_failed" };
    }
    leadId = newLead.id;
    await supabase.from("chat_conversations").update({ lead_id: leadId }).eq("id", conversationId);
  }

  // 6) Criar deal na primeira etapa do pipeline
  let dealId = conv.deal_id as string | null;
  if (!dealId) {
    const { data: firstStage } = await supabase
      .from("crm_pipeline_stages").select("id").eq("is_active", true)
      .order("position", { ascending: true }).limit(1).maybeSingle();
    if (!firstStage) return { created: false, reason: "no_pipeline_stage", leadId: leadId || undefined };

    const monthly = Math.max(0, Number(extracted.estimated_monthly_brl) || 0);
    const annualValue = monthly * 12; // valor anual estimado
    const dealTitle = `${extracted.company || senderName || "Cliente WhatsApp"} – ${extracted.services.slice(0, 3).join(" + ")}`;

    const { data: newDeal, error: dealErr } = await supabase
      .from("crm_deals").insert({
        title: dealTitle,
        value: annualValue,
        lead_id: leadId,
        stage_id: firstStage.id,
        probability: Math.min(95, Math.round((extracted.confidence || 0.5) * 100)),
        notes: `Origem: WhatsApp (qualificação automática)\nValor mensal estimado: R$ ${monthly.toFixed(2)}\nVolume: ${extracted.volume_tb || 0} TB | Estações: ${extracted.workstations || 0} | Servidores: ${extracted.servers || 0}\nServiços: ${extracted.services.join(", ")}`,
        status: "aberto",
      }).select("id").single();
    if (dealErr) {
      console.error("Deal create failed:", dealErr);
      return { created: false, reason: "deal_insert_failed", leadId };
    }
    dealId = newDeal.id;
    await supabase.from("chat_conversations").update({ deal_id: dealId }).eq("id", conversationId);

    // Tag de alta probabilidade quando confiança >= 0.7
    if ((extracted.confidence || 0) >= 0.7) {
      await supabase.from("crm_deal_tags").insert({
        deal_id: dealId, tag_name: "Alta Probabilidade", tag_color: "#16a34a",
      });
    }
    await supabase.from("crm_deal_tags").insert({
      deal_id: dealId, tag_name: "WhatsApp", tag_color: "#25D366",
    });
  }

  return { created: true, leadId: leadId || undefined, dealId: dealId || undefined };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    const payload = await req.json();
    console.log("Webhook received:", JSON.stringify(payload).substring(0, 500));

    const isFromMe = payload.fromMe === true;
    const phone = payload.phone;
    const messageId = payload.messageId;
    const senderName = payload.senderName || payload.chatName || phone;
    const isGroup = payload.isGroup === true;

    // Extract message text — handle button responses first
    let messageContent = "";
    let isButtonClick = false;
    let resolvedActionId: string | null = null;

    if (payload.buttonsResponseMessage?.selectedButtonId) {
      const btnId = payload.buttonsResponseMessage.selectedButtonId;
      isButtonClick = true;
      resolvedActionId = btnId;
      const resolved = resolveActionId(btnId);
      messageContent = resolved || btnId;
      console.log("Button click resolved:", btnId, "→", messageContent);
    } else if (payload.listResponseMessage?.title) {
      isButtonClick = true;
      messageContent = payload.listResponseMessage.title;
    } else if (payload.text?.message) {
      messageContent = payload.text.message;
    } else if (payload.body) {
      messageContent = payload.body;
    } else if (payload.image?.caption) {
      messageContent = `[Imagem] ${payload.image.caption}`;
    } else if (payload.image) {
      messageContent = "[Imagem recebida]";
    } else if (payload.audio) {
      messageContent = "[Áudio recebido]";
    } else if (payload.video) {
      messageContent = "[Vídeo recebido]";
    } else if (payload.document) {
      messageContent = `[Documento] ${payload.document.fileName || "arquivo"}`;
    } else if (payload.sticker) {
      messageContent = "[Sticker]";
    } else if (payload.contact) {
      messageContent = "[Contato compartilhado]";
    } else if (payload.location) {
      messageContent = "[Localização]";
    } else {
      messageContent = "[Mensagem não suportada]";
    }

    if (!phone || !messageContent) {
      return new Response(JSON.stringify({ ok: true, skipped: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (isGroup || isFromMe) {
      return new Response(JSON.stringify({ ok: true, skipped: true, reason: isGroup ? "group" : "fromMe" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const normalizedPhone = normalizePhone(phone);

    // Deduplicate
    if (messageId) {
      const { data: existing } = await supabase
        .from("chat_messages").select("id").eq("external_message_id", messageId).maybeSingle();
      if (existing) {
        return new Response(JSON.stringify({ ok: true, skipped: true, reason: "duplicate" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Find or create conversation
    let conversationId: string;
    let greetingSent = false;
    let conversationStatus = "ativa";

    const { data: existingConvs } = await supabase
      .from("chat_conversations").select("id, status, phone, created_at, last_message_at")
      .eq("channel", "whatsapp")
      .order("last_message_at", { ascending: false })
      .order("created_at", { ascending: false });

    const existingConv = existingConvs?.find((conv: any) => normalizePhone(conv.phone || "") === normalizedPhone) ?? null;

    if (existingConv) {
      conversationId = existingConv.id;
      conversationStatus = existingConv.status;

      if (existingConv.status === "encerrada") {
        // ALWAYS reopen the existing conversation to preserve full history
        // (no new conversation is created for the same phone)
        await supabase.from("chat_conversations")
          .update({ status: "ativa", last_message_at: new Date().toISOString() })
          .eq("id", conversationId);
        conversationStatus = "ativa";

        // Check if greeting was previously sent — if yes, don't re-greet on reopen
        const { data: botGreeting } = await supabase
          .from("chat_messages").select("id")
          .eq("conversation_id", conversationId)
          .eq("sender_type", "agent")
          .eq("sender_name", "🤖 Chatbot")
          .limit(1).maybeSingle();
        greetingSent = !!botGreeting;
      } else {
        // Reactivate
        await supabase.from("chat_conversations")
          .update({ status: "ativa", last_message_at: new Date().toISOString() })
          .eq("id", conversationId);

        // Check if greeting was already sent by looking for bot greeting message
        const { data: botGreeting } = await supabase
          .from("chat_messages").select("id")
          .eq("conversation_id", conversationId)
          .eq("sender_type", "agent")
          .eq("sender_name", "🤖 Chatbot")
          .limit(1).maybeSingle();
        greetingSent = !!botGreeting;
      }
    } else {
      // Brand new conversation
      const { data: customer } = await supabase
        .from("customers").select("id, name").eq("phone", normalizedPhone).maybeSingle();
      const title = customer?.name || senderName || `WhatsApp ${normalizedPhone}`;
      const { data: newConv, error: convError } = await supabase
        .from("chat_conversations").insert({
          title, channel: "whatsapp", phone: normalizedPhone,
          customer_id: customer?.id || null, status: "ativa",
          last_message_at: new Date().toISOString(),
        }).select("id").single();
      if (convError) {
        // Possível corrida com índice único (uniq_chat_conversations_whatsapp_phone)
        // — recupera a conversa que já foi criada por outra requisição
        const { data: raceConv } = await supabase
          .from("chat_conversations").select("id")
          .eq("channel", "whatsapp").eq("phone", normalizedPhone)
          .maybeSingle();
        if (!raceConv) throw convError;
        conversationId = raceConv.id;
        greetingSent = true; // outra requisição já está cuidando da saudação
      } else {
        conversationId = newConv.id;
        greetingSent = false;
      }
    }

    // Store the original display content for saving
    const displayContent = isButtonClick
      ? (payload.buttonsResponseMessage?.selectedButtonId || payload.listResponseMessage?.title || messageContent)
      : messageContent;

    // Insert customer message
    const { error: msgError } = await supabase.from("chat_messages").insert({
      conversation_id: conversationId, sender_type: "customer",
      sender_name: senderName || normalizedPhone, content: displayContent,
      external_message_id: messageId || null, is_read: false,
    });
    if (msgError) throw msgError;
    console.log("Message saved for conversation:", conversationId, "greetingSent:", greetingSent);

    // --- Resolve numeric input (1, 2, 3...) to action ID ---
    const trimmedMsg = messageContent.trim();
    if (/^[1-9]$/.test(trimmedMsg) && !resolvedActionId) {
      const resolved = await resolveNumericInput(supabase, conversationId, trimmedMsg);
      if (resolved) {
        resolvedActionId = resolved;
        const keyword = resolveActionId(resolved);
        if (keyword) messageContent = keyword;
        console.log("Numeric input resolved:", trimmedMsg, "→", resolved, "→", messageContent);
      }
    }

    // --- Handle close request ---
    if (isCloseRequest(messageContent)) {
      const closeMsg = "Atendimento encerrado. ✅\n\nObrigado por entrar em contato com a The Best Cloud! Se precisar de algo, envie *reabrir* para retomar o atendimento.\n\nAté logo! 👋";
      const sent = await sendZapiMessage(normalizedPhone, closeMsg);
      if (sent) {
        await supabase.from("chat_messages").insert({
          conversation_id: conversationId, sender_type: "agent",
          sender_name: "🤖 Chatbot", content: closeMsg, is_read: true,
        });
      }
      await supabase.from("chat_conversations")
        .update({ status: "encerrada" }).eq("id", conversationId);
      return new Response(JSON.stringify({ ok: true, conversationId, action: "closed" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // --- Handle reopen request ---
    if (isReopenRequest(messageContent) && conversationStatus === "ativa") {
      const reopenMsg = "Conversa reaberta! 🔄\n\nComo posso ajudá-lo?";
      const sent = await sendZapiMenu(normalizedPhone, reopenMsg, menuDefinitions.reopen);
      if (sent) {
        await supabase.from("chat_messages").insert({
          conversation_id: conversationId, sender_type: "agent",
          sender_name: "🤖 Chatbot", content: reopenMsg, is_read: true,
        });
      }
      return new Response(JSON.stringify({ ok: true, conversationId, action: "reopened" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // --- Handle "servicos" / services request ---
    const normalizedForSpecial = normalizeText(messageContent);
    const isServicosRequest = ["servicos", "solucoes", "produtos", "catalogo", "o que voces fazem", "quais servicos", "servico"].some(kw => normalizedForSpecial.includes(kw));
    if (isServicosRequest || resolvedActionId === "servicos") {
      const servicosMsg = "📋 *Nossos Serviços – The Best Cloud*\n\nOferecemos soluções completas de ciberproteção organizadas em 3 pilares:\n\n🔐 *Segurança*\n• Detecção e Resposta (XDR, EDR, MDR)\n• Prevenção de Perda de Dados (DLP)\n• Segurança e Arquivamento de E-mail\n• Treinamento de Conscientização (SAT)\n\n🛡️ *Proteção*\n• Backup em Nuvem com IA\n• Anti-Ransomware\n• Antivírus Gerenciado\n• Disaster Recovery\n\n⚙️ *Operações*\n• Gerenciamento Remoto (RMM)\n• Monitoramento 24/7\n• Automação de TI\n• Gestão de Patches\n\n🌐 Saiba mais: thebestcloud.com.br";
      const sent = await sendZapiMenu(normalizedPhone, servicosMsg, menuDefinitions.servicos);
      if (sent) {
        await supabase.from("chat_messages").insert({
          conversation_id: conversationId, sender_type: "agent",
          sender_name: "🤖 Chatbot", content: servicosMsg, is_read: true,
        });
      }
      return new Response(JSON.stringify({ ok: true, conversationId, action: "servicos" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // --- Handle category detail ---
    if (resolvedActionId === "seguranca_cat" || resolvedActionId === "protecao_cat" || resolvedActionId === "operacoes_cat") {
      let categoryMsg = "";
      if (resolvedActionId === "seguranca_cat") {
        categoryMsg = "🔐 *Segurança – The Best Cloud*\n\nNossas soluções de segurança:\n\n• *XDR* – Detecção e resposta estendidas em toda a infraestrutura\n• *EDR* – Proteção avançada de endpoints com IA\n• *MDR* – Monitoramento 24/7 por especialistas\n• *DLP* – Prevenção contra vazamento de dados (LGPD)\n• *Segurança de E-mail* – Bloqueio de phishing e malware\n• *Arquivamento de E-mail* – Conformidade regulatória\n• *SAT* – Treinamento de conscientização em segurança\n\n🌐 thebestcloud.com.br";
      } else if (resolvedActionId === "protecao_cat") {
        categoryMsg = "🛡️ *Proteção – The Best Cloud*\n\nNossas soluções de proteção:\n\n• *Backup em Nuvem* – Automático, contínuo, criptografia AES-256\n• *Anti-Ransomware* – Detecção e reversão em tempo real com IA\n• *Antivírus Gerenciado* – Atualizações contínuas e relatórios\n• *Disaster Recovery* – Failover automático, RTO/RPO configuráveis\n• *Proteção contra Ransomware* – Integrada à plataforma\n\n🌐 thebestcloud.com.br";
      } else {
        categoryMsg = "⚙️ *Operações – The Best Cloud*\n\nNossas soluções de operações:\n\n• *RMM* – Gerenciamento e monitoramento remoto\n• *Monitoramento 24/7* – Alertas em tempo real\n• *Automação de TI* – Scripts e tarefas automatizadas\n• *Gestão de Patches* – Atualizações de segurança centralizadas\n• *Inventário de Hardware/Software* – Visibilidade completa\n\n🌐 thebestcloud.com.br";
      }

      const sent = await sendZapiMenu(normalizedPhone, categoryMsg, menuDefinitions.category);
      if (sent) {
        await supabase.from("chat_messages").insert({
          conversation_id: conversationId, sender_type: "agent",
          sender_name: "🤖 Chatbot", content: categoryMsg, is_read: true,
        });
      }
      return new Response(JSON.stringify({ ok: true, conversationId, action: "category_detail" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // --- Handle "cotacao" specifically - ask qualifying questions ---
    const isCotacaoRequest = resolvedActionId === "cotacao" || 
      ["cotacao", "orcamento", "quanto custa", "preco", "valor", "plano"].some(kw => normalizedForSpecial.includes(kw));
    if (isCotacaoRequest) {
      const cotacaoMsg = "💰 *Solicitar Cotação – The Best Cloud*\n\nPara elaborar uma proposta personalizada, preciso de algumas informações:\n\n1️⃣ *Qual o volume de dados aproximado?* (em GB ou TB)\n2️⃣ *Quantos dispositivos deseja proteger?* (servidores, estações, notebooks)\n3️⃣ *Quais serviços tem interesse?*\n   • Backup em Nuvem\n   • Anti-Ransomware\n   • Disaster Recovery\n   • Segurança de E-mail\n   • Outros\n\nPor favor, responda com essas informações e um consultor preparará sua proposta! 📋";
      const sent = await sendZapiMenu(normalizedPhone, cotacaoMsg, menuDefinitions.cotacao);
      if (sent) {
        await supabase.from("chat_messages").insert({
          conversation_id: conversationId, sender_type: "agent",
          sender_name: "🤖 Chatbot", content: cotacaoMsg, is_read: true,
        });
      }
      return new Response(JSON.stringify({ ok: true, conversationId, action: "cotacao" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // --- Qualificação automática pós-cotação (cria lead + deal no Pipeline) ---
    try {
      const qualResult = await tryQualifyCotacaoLead(
        supabase, conversationId, normalizedPhone, senderName || normalizedPhone, messageContent,
      );
      if (qualResult.created) {
        let trackingUrl = "";
        if (qualResult.dealId) {
          const { data: dealRow } = await supabase
            .from("crm_deals").select("tracking_token").eq("id", qualResult.dealId).maybeSingle();
          if (dealRow?.tracking_token) {
            trackingUrl = `https://thebestcloud.app/cotacao/${dealRow.tracking_token}`;
          }
        }
        const ackMsg = "✅ *Cotação recebida com sucesso!*\n\nObrigado pelas informações. Já registramos sua solicitação no nosso sistema comercial e um *consultor especialista* da The Best Cloud entrará em contato em até *2 horas úteis* com a proposta personalizada.\n\nProtocolo interno: " + (qualResult.dealId?.slice(0, 8).toUpperCase() || "—") + (trackingUrl ? `\n\n🔎 *Acompanhe sua cotação em tempo real:*\n${trackingUrl}` : "") + "\n\nEnquanto isso, se preferir falar diretamente:\n📞 (91) 98131-7645\n📧 comercial@thebestcloud.com.br";
        const sent = await sendZapiMessage(normalizedPhone, ackMsg);
        if (sent) {
          await supabase.from("chat_messages").insert({
            conversation_id: conversationId, sender_type: "agent",
            sender_name: "🤖 Chatbot", content: ackMsg, is_read: true,
          });
        }
        console.log("Cotação qualificada criou lead+deal:", qualResult);
        return new Response(JSON.stringify({ ok: true, conversationId, action: "cotacao_qualified", ...qualResult }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } else {
        console.log("Cotação não qualificada:", qualResult.reason);
      }
    } catch (e) {
      console.error("tryQualifyCotacaoLead error:", e);
    }

    // --- Chatbot auto-reply ---
    const matchedRule = await matchChatbotRule(supabase, messageContent, conversationId, greetingSent);

    if (matchedRule) {
      let replyContent: string | null = null;

      if (matchedRule.response_type === "ai") {
        replyContent = await generateAIResponse(matchedRule.response_content, messageContent);
      } else {
        replyContent = matchedRule.response_content;
      }

      if (replyContent) {
        let sent: boolean;

        if (matchedRule.trigger_type === "greeting") {
          sent = await sendZapiMenu(normalizedPhone, replyContent, menuDefinitions.greeting);
        } else if (matchedRule.trigger_type === "keyword") {
          sent = await sendZapiMenu(normalizedPhone, replyContent, menuDefinitions.keyword);
        } else {
          sent = await sendZapiMessage(normalizedPhone, replyContent);
        }

        if (sent) {
          await supabase.from("chat_messages").insert({
            conversation_id: conversationId, sender_type: "agent",
            sender_name: "🤖 Chatbot", content: replyContent, is_read: true,
          });
          console.log("Chatbot auto-reply sent, rule:", matchedRule.name);
        }
      }
    }


    // --- AI lead-probability classification (only for site-originated leads) ---
    try {
      const { data: convInfo } = await supabase
        .from("chat_conversations").select("lead_id").eq("id", conversationId).maybeSingle();
      if (convInfo?.lead_id) {
        await classifyLeadProbability(supabase, conversationId, convInfo.lead_id);
      }
    } catch (e) {
      console.error("Probability classification skipped:", e);
    }

    return new Response(JSON.stringify({ ok: true, conversationId, autoReply: !!matchedRule }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("Webhook error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
