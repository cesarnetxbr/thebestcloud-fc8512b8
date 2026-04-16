import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function sendZapiMessage(phone: string, message: string) {
  const ZAPI_INSTANCE_ID = Deno.env.get("ZAPI_INSTANCE_ID");
  const ZAPI_TOKEN = Deno.env.get("ZAPI_TOKEN");
  const ZAPI_CLIENT_TOKEN = Deno.env.get("ZAPI_CLIENT_TOKEN");

  if (!ZAPI_INSTANCE_ID || !ZAPI_TOKEN) {
    console.error("Z-API not configured for auto-reply");
    return false;
  }

  const baseUrl = `https://api.z-api.io/instances/${ZAPI_INSTANCE_ID}/token/${ZAPI_TOKEN}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(ZAPI_CLIENT_TOKEN ? { "Client-Token": ZAPI_CLIENT_TOKEN } : {}),
  };

  try {
    const res = await fetch(`${baseUrl}/send-text`, {
      method: "POST",
      headers,
      body: JSON.stringify({ phone, message }),
    });
    if (!res.ok) {
      console.error("Z-API send failed:", res.status, await res.text());
      return false;
    }
    console.log("Auto-reply sent to:", phone);
    return true;
  } catch (e) {
    console.error("Z-API send error:", e);
    return false;
  }
}

async function matchChatbotRule(
  supabase: any,
  messageContent: string,
  conversationId: string,
  isFirstMessage: boolean
) {
  // Fetch all active rules ordered by priority desc
  const { data: rules, error } = await supabase
    .from("chatbot_rules")
    .select("*")
    .eq("is_active", true)
    .order("priority", { ascending: false });

  if (error || !rules?.length) return null;

  const lowerMsg = messageContent.toLowerCase().trim();

  // 1. Check greeting rules (only for first message in conversation)
  if (isFirstMessage) {
    const greetingRule = rules.find((r: any) => r.trigger_type === "greeting");
    if (greetingRule) return greetingRule;
  }

  // 2. Check keyword rules
  for (const rule of rules) {
    if (rule.trigger_type !== "keyword" || !rule.trigger_value) continue;
    const keywords = rule.trigger_value.split(",").map((k: string) => k.trim().toLowerCase());
    if (keywords.some((kw: string) => kw && lowerMsg.includes(kw))) {
      return rule;
    }
  }

  // 3. Check AI rules
  const aiRule = rules.find((r: any) => r.trigger_type === "ai");
  if (aiRule) return aiRule;

  // 4. Fallback
  const fallbackRule = rules.find((r: any) => r.trigger_type === "fallback");
  return fallbackRule || null;
}

async function generateAIResponse(systemPrompt: string, userMessage: string): Promise<string | null> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) {
    console.error("LOVABLE_API_KEY not configured for AI responses");
    return null;
  }

  try {
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
      }),
    });

    if (!res.ok) {
      console.error("AI gateway error:", res.status);
      return null;
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content || null;
  } catch (e) {
    console.error("AI call error:", e);
    return null;
  }
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

    // Extract message text
    let messageContent = "";
    if (payload.text?.message) {
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

    if (isGroup) {
      return new Response(JSON.stringify({ ok: true, skipped: true, reason: "group" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (isFromMe) {
      return new Response(JSON.stringify({ ok: true, skipped: true, reason: "fromMe" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const normalizedPhone = phone.replace(/@c\.us$/, "").replace(/@s\.whatsapp\.net$/, "");

    // Deduplicate
    if (messageId) {
      const { data: existing } = await supabase
        .from("chat_messages")
        .select("id")
        .eq("external_message_id", messageId)
        .maybeSingle();

      if (existing) {
        return new Response(JSON.stringify({ ok: true, skipped: true, reason: "duplicate" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Find or create conversation
    let conversationId: string;
    let isFirstMessage = false;

    const { data: existingConv } = await supabase
      .from("chat_conversations")
      .select("id")
      .eq("phone", normalizedPhone)
      .eq("channel", "whatsapp")
      .in("status", ["ativa", "arquivada"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existingConv) {
      conversationId = existingConv.id;
      await supabase
        .from("chat_conversations")
        .update({ status: "ativa", last_message_at: new Date().toISOString() })
        .eq("id", conversationId);

      // Check if this is the first customer message in this conversation
      const { count } = await supabase
        .from("chat_messages")
        .select("id", { count: "exact", head: true })
        .eq("conversation_id", conversationId)
        .eq("sender_type", "customer");
      isFirstMessage = (count || 0) === 0;
    } else {
      isFirstMessage = true;
      const { data: customer } = await supabase
        .from("customers")
        .select("id, name")
        .eq("phone", normalizedPhone)
        .maybeSingle();

      const title = customer?.name || senderName || `WhatsApp ${normalizedPhone}`;

      const { data: newConv, error: convError } = await supabase
        .from("chat_conversations")
        .insert({
          title,
          channel: "whatsapp",
          phone: normalizedPhone,
          customer_id: customer?.id || null,
          status: "ativa",
          last_message_at: new Date().toISOString(),
        })
        .select("id")
        .single();

      if (convError) throw convError;
      conversationId = newConv.id;
    }

    // Insert customer message
    const { error: msgError } = await supabase.from("chat_messages").insert({
      conversation_id: conversationId,
      sender_type: "customer",
      sender_name: senderName || normalizedPhone,
      content: messageContent,
      external_message_id: messageId || null,
      is_read: false,
    });

    if (msgError) throw msgError;
    console.log("Message saved for conversation:", conversationId);

    // --- Chatbot auto-reply ---
    const matchedRule = await matchChatbotRule(supabase, messageContent, conversationId, isFirstMessage);

    if (matchedRule) {
      let replyContent: string | null = null;

      if (matchedRule.response_type === "ai") {
        replyContent = await generateAIResponse(matchedRule.response_content, messageContent);
      } else {
        replyContent = matchedRule.response_content;
      }

      if (replyContent) {
        // Send via Z-API
        const sent = await sendZapiMessage(normalizedPhone, replyContent);

        if (sent) {
          // Save bot reply in chat_messages
          await supabase.from("chat_messages").insert({
            conversation_id: conversationId,
            sender_type: "agent",
            sender_name: "🤖 Chatbot",
            content: replyContent,
            is_read: true,
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
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
