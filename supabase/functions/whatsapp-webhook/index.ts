import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

    // Z-API webhook events: on-message-received, on-message-send, on-whatsapp-disconnected, etc.
    // Main payload fields for incoming messages:
    // phone, isGroup, messageId, body (or text.message), fromMe, senderName, timestamp, type

    const isFromMe = payload.fromMe === true;
    const phone = payload.phone;
    const messageId = payload.messageId;
    const senderName = payload.senderName || payload.chatName || phone;
    const isGroup = payload.isGroup === true;

    // Extract message text based on type
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
      console.log("Ignoring event - no phone or content:", { phone, messageContent, type: payload.type });
      return new Response(JSON.stringify({ ok: true, skipped: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Skip group messages for now
    if (isGroup) {
      console.log("Skipping group message from:", phone);
      return new Response(JSON.stringify({ ok: true, skipped: true, reason: "group" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Skip messages sent by us (fromMe)
    if (isFromMe) {
      console.log("Skipping fromMe message to:", phone);
      return new Response(JSON.stringify({ ok: true, skipped: true, reason: "fromMe" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Normalize phone (remove @c.us suffix if present)
    const normalizedPhone = phone.replace(/@c\.us$/, "").replace(/@s\.whatsapp\.net$/, "");

    // Check for duplicate message
    if (messageId) {
      const { data: existing } = await supabase
        .from("chat_messages")
        .select("id")
        .eq("external_message_id", messageId)
        .maybeSingle();

      if (existing) {
        console.log("Duplicate message ignored:", messageId);
        return new Response(JSON.stringify({ ok: true, skipped: true, reason: "duplicate" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Find or create conversation by phone
    let conversationId: string;
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
      // Reopen if archived
      await supabase
        .from("chat_conversations")
        .update({ status: "ativa", last_message_at: new Date().toISOString() })
        .eq("id", conversationId);
      console.log("Existing conversation found:", conversationId);
    } else {
      // Try to match customer by phone
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

      if (convError) {
        console.error("Error creating conversation:", convError);
        throw convError;
      }
      conversationId = newConv.id;
      console.log("New conversation created:", conversationId, "for phone:", normalizedPhone);
    }

    // Insert message
    const { error: msgError } = await supabase.from("chat_messages").insert({
      conversation_id: conversationId,
      sender_type: "customer",
      sender_name: senderName || normalizedPhone,
      content: messageContent,
      external_message_id: messageId || null,
      is_read: false,
    });

    if (msgError) {
      console.error("Error inserting message:", msgError);
      throw msgError;
    }

    console.log("Message saved successfully for conversation:", conversationId);

    return new Response(JSON.stringify({ ok: true, conversationId }), {
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
