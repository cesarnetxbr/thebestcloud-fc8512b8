// Edge function pública: gerencia agendamento de reunião com especialista via booking_token
// GET ?token=xxx → retorna detalhes do booking + slots disponíveis (próximos 7 dias úteis)
// POST { token, scheduled_at } → confirma agendamento
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function generateSlots(): string[] {
  const slots: string[] = [];
  const now = new Date();
  let added = 0;
  for (let dayOffset = 1; dayOffset <= 14 && added < 7; dayOffset++) {
    const d = new Date(now);
    d.setDate(d.getDate() + dayOffset);
    const dow = d.getDay();
    if (dow === 0 || dow === 6) continue;
    for (let hour = 9; hour < 18; hour++) {
      for (const min of [0, 30]) {
        const slot = new Date(d);
        slot.setHours(hour, min, 0, 0);
        slots.push(slot.toISOString());
      }
    }
    added++;
  }
  return slots;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  try {
    if (req.method === "GET") {
      const url = new URL(req.url);
      const token = url.searchParams.get("token");
      if (!token || !/^[0-9a-f-]{36}$/i.test(token)) {
        return new Response(JSON.stringify({ error: "token inválido" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const { data: booking } = await supabase
        .from("consultant_bookings")
        .select("id, customer_name, customer_email, scheduled_at, status, duration_minutes, deal_id")
        .eq("booking_token", token).maybeSingle();
      if (!booking) {
        return new Response(JSON.stringify({ error: "agendamento não encontrado" }), {
          status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      // Slots ocupados nos próximos 14 dias
      const { data: busy } = await supabase
        .from("consultant_bookings")
        .select("scheduled_at")
        .gte("scheduled_at", new Date().toISOString())
        .neq("status", "cancelado");
      const busySet = new Set((busy ?? []).map((b: any) => b.scheduled_at));
      const slots = generateSlots().filter((s) => !busySet.has(s));
      return new Response(JSON.stringify({ booking, slots }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (req.method === "POST") {
      const body = await req.json();
      const { token, scheduled_at, customer_email } = body;
      if (!token || !scheduled_at) {
        return new Response(JSON.stringify({ error: "token e scheduled_at obrigatórios" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const { data: booking } = await supabase
        .from("consultant_bookings").select("id, deal_id, customer_name").eq("booking_token", token).maybeSingle();
      if (!booking) {
        return new Response(JSON.stringify({ error: "token inválido" }), {
          status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      // Verifica conflito
      const { data: conflict } = await supabase
        .from("consultant_bookings").select("id")
        .eq("scheduled_at", scheduled_at).neq("status", "cancelado").neq("id", booking.id).maybeSingle();
      if (conflict) {
        return new Response(JSON.stringify({ error: "horário já ocupado" }), {
          status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const { error: updErr } = await supabase
        .from("consultant_bookings")
        .update({
          scheduled_at,
          status: "confirmado",
          customer_email: customer_email ?? undefined,
          updated_at: new Date().toISOString(),
        })
        .eq("id", booking.id);
      if (updErr) throw updErr;

      // Cria appointment no CRM se houver deal
      if (booking.deal_id) {
        const end = new Date(new Date(scheduled_at).getTime() + 30 * 60 * 1000).toISOString();
        await supabase.from("crm_appointments").insert({
          deal_id: booking.deal_id,
          title: `Reunião com ${booking.customer_name}`,
          description: "Agendamento via link público (Fase 2 - WhatsApp)",
          start_at: scheduled_at,
          end_at: end,
          type: "reuniao",
          status: "agendado",
        });
      }
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response("method not allowed", { status: 405, headers: corsHeaders });
  } catch (e) {
    console.error("book-consultant-slot", e);
    return new Response(JSON.stringify({ error: String((e as Error).message ?? e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
