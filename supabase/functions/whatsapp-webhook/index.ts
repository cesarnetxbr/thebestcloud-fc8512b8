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

async function sendZapiButtonList(phone: string, message: string, buttons: { id: string; label: string }[]) {
  const config = getZapiConfig();
  if (!config) return sendZapiMessage(phone, message);
  try {
    const res = await fetch(`${config.baseUrl}/send-button-list`, {
      method: "POST", headers: config.headers,
      body: JSON.stringify({
        phone, message,
        buttonList: { buttons: buttons.map(b => ({ id: b.id, label: b.label })) },
      }),
    });
    if (!res.ok) {
      console.warn("Z-API button-list failed, falling back to text:", res.status);
      const fallbackText = message + "\n\n" + buttons.map((b, i) => `${i + 1}️⃣ ${b.label}`).join("\n");
      return sendZapiMessage(phone, fallbackText);
    }
    console.log("Button list sent to:", phone);
    return true;
  } catch (e) {
    console.error("Z-API button error:", e);
    const fallbackText = message + "\n\n" + buttons.map((b, i) => `${i + 1}️⃣ ${b.label}`).join("\n");
    return sendZapiMessage(phone, fallbackText);
  }
}

// Normalize accented characters for matching
function normalizeText(text: string): string {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

// Button ID → keyword mapping so button clicks route correctly
const buttonIdKeywords: Record<string, string[]> = {
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

function isCloseRequest(msg: string): boolean {
  const n = normalizeText(msg);
  return ["encerrar", "finalizar", "fechar conversa", "encerrar conversa", "finalizar atendimento", "0"].some(kw => n.includes(kw));
}

function isReopenRequest(msg: string): boolean {
  const n = normalizeText(msg);
  return ["reabrir", "voltar", "reabrir conversa", "novo atendimento"].some(kw => n.includes(kw));
}

// Resolve button click ID into a searchable message
function resolveButtonId(buttonId: string): string | null {
  const mapped = buttonIdKeywords[buttonId];
  if (mapped && mapped.length > 0) return mapped[0];
  return null;
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

    if (payload.buttonsResponseMessage?.selectedButtonId) {
      const btnId = payload.buttonsResponseMessage.selectedButtonId;
      isButtonClick = true;
      // Resolve button ID to keyword for matching
      const resolved = resolveButtonId(btnId);
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

    const normalizedPhone = phone.replace(/@c\.us$/, "").replace(/@s\.whatsapp\.net$/, "");

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

    const { data: existingConv } = await supabase
      .from("chat_conversations").select("id, status")
      .eq("phone", normalizedPhone).eq("channel", "whatsapp")
      .in("status", ["ativa", "arquivada", "encerrada"])
      .order("created_at", { ascending: false }).limit(1).maybeSingle();

    if (existingConv) {
      conversationId = existingConv.id;
      conversationStatus = existingConv.status;

      if (existingConv.status === "encerrada") {
        if (isReopenRequest(messageContent)) {
          await supabase.from("chat_conversations")
            .update({ status: "ativa", last_message_at: new Date().toISOString() })
            .eq("id", conversationId);
          conversationStatus = "ativa";
          greetingSent = true; // don't re-greet on reopen
        } else {
          // Create new conversation
          const { data: customer } = await supabase
            .from("customers").select("id, name").eq("phone", normalizedPhone).maybeSingle();
          const title = customer?.name || senderName || `WhatsApp ${normalizedPhone}`;
          const { data: newConv, error: convError } = await supabase
            .from("chat_conversations").insert({
              title, channel: "whatsapp", phone: normalizedPhone,
              customer_id: customer?.id || null, status: "ativa",
              last_message_at: new Date().toISOString(),
            }).select("id").single();
          if (convError) throw convError;
          conversationId = newConv.id;
          conversationStatus = "ativa";
          greetingSent = false; // new conv, greeting not yet sent
        }
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
      if (convError) throw convError;
      conversationId = newConv.id;
      greetingSent = false;
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
      const sent = await sendZapiButtonList(normalizedPhone, reopenMsg, [
        { id: "backup", label: "☁️ Backup em Nuvem" },
        { id: "ransomware", label: "🛡️ Anti-Ransomware" },
        { id: "suporte", label: "🎧 Suporte Técnico" },
        { id: "cotacao", label: "💰 Cotação" },
        { id: "encerrar", label: "❌ Encerrar" },
      ]);
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
          sent = await sendZapiButtonList(normalizedPhone, replyContent, [
            { id: "backup", label: "☁️ Backup em Nuvem" },
            { id: "ransomware", label: "🛡️ Anti-Ransomware" },
            { id: "disaster", label: "🔄 Disaster Recovery" },
            { id: "cotacao", label: "💰 Cotação" },
            { id: "suporte", label: "🎧 Suporte" },
            { id: "encerrar", label: "❌ Encerrar" },
          ]);
        } else if (matchedRule.trigger_type === "keyword") {
          sent = await sendZapiButtonList(normalizedPhone, replyContent, [
            { id: "cotacao", label: "💰 Solicitar Cotação" },
            { id: "suporte", label: "🎧 Falar com Consultor" },
            { id: "encerrar", label: "❌ Encerrar" },
          ]);
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
