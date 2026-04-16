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

  const ZAPI_INSTANCE_ID = Deno.env.get("ZAPI_INSTANCE_ID");
  const ZAPI_TOKEN = Deno.env.get("ZAPI_TOKEN");
  const ZAPI_CLIENT_TOKEN = Deno.env.get("ZAPI_CLIENT_TOKEN");

  try {
    // Find conversations inactive for 48h
    const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();

    const { data: staleConvs, error } = await supabase
      .from("chat_conversations")
      .select("id, phone, title")
      .eq("channel", "whatsapp")
      .eq("status", "ativa")
      .lt("last_message_at", cutoff);

    if (error) throw error;

    let closedCount = 0;

    for (const conv of staleConvs || []) {
      // Send warning message via Z-API
      if (ZAPI_INSTANCE_ID && ZAPI_TOKEN && conv.phone) {
        const baseUrl = `https://api.z-api.io/instances/${ZAPI_INSTANCE_ID}/token/${ZAPI_TOKEN}`;
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          ...(ZAPI_CLIENT_TOKEN ? { "Client-Token": ZAPI_CLIENT_TOKEN } : {}),
        };

        const closeMsg = "⏰ Esta conversa foi encerrada automaticamente por inatividade (48h).\n\nSe precisar de ajuda, envie *reabrir* para retomar o atendimento.\n\nEquipe The Best Cloud 💙";

        try {
          await fetch(`${baseUrl}/send-text`, {
            method: "POST", headers,
            body: JSON.stringify({ phone: conv.phone, message: closeMsg }),
          });
        } catch (e) {
          console.error("Failed to send close msg to:", conv.phone, e);
        }

        // Save bot message
        await supabase.from("chat_messages").insert({
          conversation_id: conv.id,
          sender_type: "agent",
          sender_name: "🤖 Chatbot",
          content: closeMsg,
          is_read: true,
        });
      }

      // Close the conversation
      await supabase.from("chat_conversations")
        .update({ status: "encerrada" })
        .eq("id", conv.id);

      closedCount++;
    }

    console.log(`Auto-closed ${closedCount} conversations`);

    return new Response(JSON.stringify({ ok: true, closedCount }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("Auto-close error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
