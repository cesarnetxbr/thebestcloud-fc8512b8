import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function normalizePhone(phone: string): string {
  const digits = (phone || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("55")) return digits;
  return `55${digits}`;
}

async function sendZapi(phone: string, message: string) {
  const ZAPI_INSTANCE_ID = Deno.env.get("ZAPI_INSTANCE_ID");
  const ZAPI_TOKEN = Deno.env.get("ZAPI_TOKEN");
  const ZAPI_CLIENT_TOKEN = Deno.env.get("ZAPI_CLIENT_TOKEN");
  if (!ZAPI_INSTANCE_ID || !ZAPI_TOKEN) {
    console.warn("Z-API not configured — skipping outbound greeting");
    return false;
  }
  try {
    const res = await fetch(
      `https://api.z-api.io/instances/${ZAPI_INSTANCE_ID}/token/${ZAPI_TOKEN}/send-text`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(ZAPI_CLIENT_TOKEN ? { "Client-Token": ZAPI_CLIENT_TOKEN } : {}),
        },
        body: JSON.stringify({ phone, message }),
      },
    );
    if (!res.ok) {
      console.error("Z-API send failed:", res.status, await res.text());
      return false;
    }
    return true;
  } catch (e) {
    console.error("Z-API error:", e);
    return false;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = await req.json();
    const name = String(body.name ?? "").trim().slice(0, 120);
    const phoneRaw = String(body.phone ?? "").trim().slice(0, 20);
    const email = String(body.email ?? "").trim().toLowerCase().slice(0, 180);
    const company = String(body.company ?? "").trim().slice(0, 160);
    const origin = String(body.origin ?? "landing").trim().slice(0, 60);

    if (!name || name.length < 2) return json({ error: "Nome inválido" }, 400);
    if (!phoneRaw || phoneRaw.replace(/\D/g, "").length < 10)
      return json({ error: "Telefone inválido" }, 400);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: "E-mail inválido" }, 400);
    if (!company || company.length < 2) return json({ error: "Empresa inválida" }, 400);

    const phone = normalizePhone(phoneRaw);

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

    // 1. Create lead (source=site, status=novo)
    const { data: lead, error: leadErr } = await supabase
      .from("crm_leads")
      .insert({
        name,
        email,
        phone,
        company,
        source: "site",
        status: "novo",
        notes: `Solicitação via site (${origin}) — botão "Fale com um Consultor".`,
        tags: ["site", "fale-com-consultor"],
      })
      .select("id")
      .single();
    if (leadErr) {
      console.error("Lead insert error:", leadErr);
      return json({ error: "Falha ao registrar lead" }, 500);
    }

    // 2. Find or create WhatsApp conversation for this phone (reuse if exists)
    let conversationId: string | null = null;
    const { data: existingConvs } = await supabase
      .from("chat_conversations")
      .select("id, phone, status")
      .eq("channel", "whatsapp")
      .order("last_message_at", { ascending: false });

    const match = existingConvs?.find(
      (c: { phone?: string | null }) => normalizePhone(c.phone || "") === phone,
    );

    if (match) {
      conversationId = match.id;
      await supabase
        .from("chat_conversations")
        .update({
          status: "ativa",
          lead_id: lead.id,
          title: `${name} — ${company}`,
          last_message_at: new Date().toISOString(),
        })
        .eq("id", conversationId);
    } else {
      const { data: newConv, error: convErr } = await supabase
        .from("chat_conversations")
        .insert({
          title: `${name} — ${company}`,
          channel: "whatsapp",
          phone,
          lead_id: lead.id,
          status: "ativa",
          last_message_at: new Date().toISOString(),
        })
        .select("id")
        .single();
      if (convErr) {
        console.error("Conversation insert error:", convErr);
      } else {
        conversationId = newConv.id;
      }
    }

    // 3. Log a system note inside the conversation
    if (conversationId) {
      await supabase.from("chat_messages").insert({
        conversation_id: conversationId,
        sender_type: "agent",
        sender_name: "🌐 Site",
        content:
          `📥 *Novo lead via site*\n` +
          `• Nome: ${name}\n` +
          `• Empresa: ${company}\n` +
          `• E-mail: ${email}\n` +
          `• Telefone: ${phoneRaw}\n` +
          `• Origem: ${origin}`,
        is_read: false,
      });
    }

    // 4. Proactive WhatsApp greeting via Z-API (best-effort)
    const greeting =
      `Olá ${name}! 👋\n\n` +
      `Aqui é da *The Best Cloud*. Recebemos sua solicitação pelo site e um consultor já está preparando o atendimento.\n\n` +
      `Para agilizar, me conte rapidamente: qual o principal desafio da *${company}* hoje? (ex.: backup, segurança, ransomware, conformidade LGPD)`;
    const sent = await sendZapi(phone, greeting);
    if (sent && conversationId) {
      await supabase.from("chat_messages").insert({
        conversation_id: conversationId,
        sender_type: "agent",
        sender_name: "🤖 Chatbot",
        content: greeting,
        is_read: true,
      });
    }

    return json({ ok: true, leadId: lead.id, conversationId, whatsappSent: sent });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("consultant-lead error:", msg);
    return json({ error: msg }, 500);
  }
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
