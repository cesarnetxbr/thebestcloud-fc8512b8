// Generates a styled proposal PDF, uploads to the "proposals" bucket,
// and returns a signed URL. Designed to be called server-side from
// other edge functions (e.g. whatsapp-webhook) using the Service Role Key.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { PDFDocument, StandardFonts, rgb } from "https://esm.sh/pdf-lib@1.17.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Body {
  dealId: string;
  customerName?: string;
  customerEmail?: string;
  service?: string;
  notes?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { dealId, customerName, customerEmail, service, notes } = (await req.json()) as Body;
    if (!dealId) {
      return json({ error: "dealId required" }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Fetch deal context
    const { data: deal } = await supabase
      .from("crm_deals")
      .select("id, title, value, probability, stage, expected_close_at, lead_id, quote_id")
      .eq("id", dealId)
      .maybeSingle();

    // If deal has a linked quote, fetch its commercial conditions
    let quote: any = null;
    if (deal?.quote_id) {
      const { data: q } = await supabase
        .from("quotes")
        .select("payment_method, discount_type, discount_value, installments_plan, installments, final_value, payment_status, payment_terms, total_value")
        .eq("id", deal.quote_id)
        .maybeSingle();
      quote = q;
    }

    const title = deal?.title ?? "Proposta Comercial";
    const value = Number(quote?.final_value ?? deal?.value ?? 0);

    // Build PDF
    const pdf = await PDFDocument.create();
    const page = pdf.addPage([595, 842]); // A4
    const font = await pdf.embedFont(StandardFonts.Helvetica);
    const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
    const navy = rgb(0.04, 0.15, 0.29);
    const orange = rgb(1, 0.42, 0);
    const gray = rgb(0.3, 0.3, 0.35);

    // Header band
    page.drawRectangle({ x: 0, y: 782, width: 595, height: 60, color: navy });
    page.drawText("THE BEST CLOUD", { x: 40, y: 808, size: 18, font: bold, color: rgb(1, 1, 1) });
    page.drawText("Proposta Comercial Personalizada", {
      x: 40, y: 790, size: 10, font, color: rgb(0.85, 0.9, 1),
    });

    let y = 750;
    const draw = (txt: string, opts: { size?: number; color?: any; bold?: boolean; x?: number } = {}) => {
      page.drawText(txt, {
        x: opts.x ?? 40,
        y,
        size: opts.size ?? 11,
        font: opts.bold ? bold : font,
        color: opts.color ?? gray,
      });
      y -= (opts.size ?? 11) + 6;
    };

    draw(`Cliente: ${customerName ?? "—"}`, { size: 12, color: navy, bold: true });
    if (customerEmail) draw(`E-mail: ${customerEmail}`);
    draw(`Data: ${new Date().toLocaleDateString("pt-BR")}`);
    y -= 10;

    draw("Escopo da proposta", { size: 14, bold: true, color: navy });
    draw(title, { size: 12, color: navy });
    if (service) draw(`Serviço de interesse: ${service}`);
    y -= 10;

    draw("Resumo executivo", { size: 14, bold: true, color: navy });
    const summary =
      notes ??
      "A The Best Cloud oferece soluções de segurança digital, backup em nuvem e proteção de dados com SLA empresarial, suporte em português e infraestrutura redundante.";
    wrapText(page, summary, 40, y, 515, font, 11, gray).forEach(() => (y -= 16));

    y -= 10;
    draw("Investimento estimado", { size: 14, bold: true, color: navy });
    page.drawRectangle({ x: 40, y: y - 30, width: 515, height: 40, color: rgb(0.97, 0.97, 1) });
    page.drawText(
      value > 0 ? `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "Sob consulta",
      { x: 50, y: y - 18, size: 16, font: bold, color: orange },
    );
    page.drawText("Valor mensal estimado — confirmação após análise técnica", {
      x: 50, y: y - 32, size: 9, font, color: gray,
    });
    y -= 60;

    draw("Próximos passos", { size: 14, bold: true, color: navy });
    ["1. Validação técnica do escopo com nosso time", "2. Reunião de fechamento comercial", "3. Ativação e onboarding em até 48h"].forEach((t) => draw(t));

    // Footer
    page.drawText("The Best Cloud — Soluções em Nuvem | contato@thebestcloud.com.br", {
      x: 40, y: 30, size: 9, font, color: gray,
    });

    const bytes = await pdf.save();

    // Upload
    const path = `${dealId}/proposta-${Date.now()}.pdf`;
    const { error: upErr } = await supabase.storage.from("proposals").upload(path, bytes, {
      contentType: "application/pdf",
      upsert: false,
    });
    if (upErr) throw upErr;

    const { data: signed, error: signErr } = await supabase.storage
      .from("proposals")
      .createSignedUrl(path, 60 * 60 * 24 * 30); // 30 days
    if (signErr) throw signErr;

    return json({ ok: true, path, url: signed.signedUrl });
  } catch (e) {
    console.error("generate-proposal-pdf error", e);
    return json({ error: String(e?.message ?? e) }, 500);
  }
});

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function wrapText(page: any, text: string, x: number, y: number, maxWidth: number, font: any, size: number, color: any) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const test = line ? line + " " + w : w;
    if (font.widthOfTextAtSize(test, size) > maxWidth) {
      lines.push(line);
      line = w;
    } else line = test;
  }
  if (line) lines.push(line);
  lines.forEach((l, i) => page.drawText(l, { x, y: y - i * 16, size, font, color }));
  return lines;
}
