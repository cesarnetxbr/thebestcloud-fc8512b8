import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Parse optional period from body
    let periodStart: string;
    let periodEnd: string;
    try {
      const body = await req.json();
      periodStart = body.period_start;
      periodEnd = body.period_end;
    } catch {
      // Default: previous month (1st to last day)
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth(), 0);
      periodStart = firstDay.toISOString().split("T")[0];
      periodEnd = lastDay.toISOString().split("T")[0];
    }

    if (!periodStart || !periodEnd) {
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth(), 0);
      periodStart = firstDay.toISOString().split("T")[0];
      periodEnd = lastDay.toISOString().split("T")[0];
    }

    const today = new Date().toISOString().split("T")[0];

    // Fetch usage data grouped by tenant for the period
    // We get the latest usage data available (most recent date)
    const { data: usageData, error: usageError } = await supabase
      .from("tenant_usage")
      .select("tenant_id, sku_code, sku_name, quantity, unit_cost, total_cost, unit_price, total_price, usage_date")
      .gte("usage_date", periodStart)
      .lte("usage_date", periodEnd)
      .order("usage_date", { ascending: false });

    if (usageError) throw usageError;
    if (!usageData || usageData.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: "No usage data found for period", invoices_created: 0 }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Group by tenant_id, using the most recent usage_date per SKU
    const tenantUsage: Record<string, {
      items: Record<string, { sku_code: string; sku_name: string; quantity: number; unit_cost: number; total_cost: number; unit_price: number; total_price: number }>;
    }> = {};

    for (const u of usageData) {
      if (!tenantUsage[u.tenant_id]) {
        tenantUsage[u.tenant_id] = { items: {} };
      }
      // Keep only the most recent entry per SKU (data is sorted desc by date)
      if (!tenantUsage[u.tenant_id].items[u.sku_code]) {
        tenantUsage[u.tenant_id].items[u.sku_code] = {
          sku_code: u.sku_code,
          sku_name: u.sku_name,
          quantity: Number(u.quantity),
          unit_cost: Number(u.unit_cost),
          total_cost: Number(u.total_cost),
          unit_price: Number(u.unit_price),
          total_price: Number(u.total_price),
        };
      }
    }

    // Get tenant details with customer_id
    const tenantIds = Object.keys(tenantUsage);
    const { data: tenants } = await supabase
      .from("tenants")
      .select("id, name, customer_id")
      .in("id", tenantIds)
      .not("customer_id", "is", null);

    if (!tenants || tenants.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: "No linked tenants found", invoices_created: 0 }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get existing SKUs to map sku_code to sku.id
    const { data: skus } = await supabase.from("skus").select("id, code");
    const skuIdMap: Record<string, string> = {};
    if (skus) {
      for (const s of skus) {
        skuIdMap[s.code] = s.id;
      }
    }

    let costInvoicesCreated = 0;
    let saleInvoicesCreated = 0;
    const errors: string[] = [];

    for (const tenant of tenants) {
      const usage = tenantUsage[tenant.id];
      if (!usage) continue;

      const items = Object.values(usage.items).filter(i => i.quantity > 0);
      if (items.length === 0) continue;

      const totalCost = items.reduce((s, i) => s + i.total_cost, 0);
      const totalSale = items.reduce((s, i) => s + i.total_price, 0);
      const margin = totalSale - totalCost;

      // Generate sequential invoice numbers
      const datePrefix = today.replace(/-/g, "-");

      // Check if invoices already exist for this tenant/period
      const { data: existingCost } = await supabase
        .from("invoices")
        .select("id")
        .eq("customer_id", tenant.customer_id!)
        .eq("period_start", periodStart)
        .eq("period_end", periodEnd)
        .like("invoice_number", "COST-%")
        .maybeSingle();

      if (existingCost) {
        // Update existing invoice
        await supabase.from("invoices")
          .update({ total_cost: totalCost, total_sale: totalSale, margin, due_date: today, updated_at: new Date().toISOString() })
          .eq("id", existingCost.id);

        // Delete old items and re-insert
        await supabase.from("invoice_items").delete().eq("invoice_id", existingCost.id);

        for (const item of items) {
          let skuId = skuIdMap[item.sku_code];
          if (!skuId) {
            // Create SKU if it doesn't exist
            const { data: newSku } = await supabase.from("skus").insert({
              code: item.sku_code,
              name: item.sku_name,
              unit_cost: item.unit_cost,
              sale_price: item.unit_price,
              category: "Acronis",
              is_active: true,
            }).select("id").single();
            if (newSku) {
              skuId = newSku.id;
              skuIdMap[item.sku_code] = skuId;
            }
          }
          if (skuId) {
            await supabase.from("invoice_items").insert({
              invoice_id: existingCost.id,
              sku_id: skuId,
              quantity: item.quantity,
              unit_cost: item.unit_cost,
              unit_price: item.unit_price,
            });
          }
        }
        costInvoicesCreated++;
      } else {
        // Create cost invoice
        const costNumber = `COST-${datePrefix}-${costInvoicesCreated + 1}`;
        const { data: costInvoice, error: costErr } = await supabase.from("invoices").insert({
          invoice_number: costNumber,
          customer_id: tenant.customer_id!,
          period_start: periodStart,
          period_end: periodEnd,
          total_cost: totalCost,
          total_sale: totalSale,
          margin,
          due_date: today,
          status: "draft",
        }).select("id").single();

        if (costErr) {
          errors.push(`Cost invoice for ${tenant.name}: ${costErr.message}`);
          continue;
        }

        // Insert invoice items
        for (const item of items) {
          let skuId = skuIdMap[item.sku_code];
          if (!skuId) {
            const { data: newSku } = await supabase.from("skus").insert({
              code: item.sku_code,
              name: item.sku_name,
              unit_cost: item.unit_cost,
              sale_price: item.unit_price,
              category: "Acronis",
              is_active: true,
            }).select("id").single();
            if (newSku) {
              skuId = newSku.id;
              skuIdMap[item.sku_code] = skuId;
            }
          }
          if (skuId && costInvoice) {
            await supabase.from("invoice_items").insert({
              invoice_id: costInvoice.id,
              sku_id: skuId,
              quantity: item.quantity,
              unit_cost: item.unit_cost,
              unit_price: item.unit_price,
            });
          }
        }
        costInvoicesCreated++;
      }

      // Create/update sale invoice
      const { data: existingSale } = await supabase
        .from("invoices")
        .select("id")
        .eq("customer_id", tenant.customer_id!)
        .eq("period_start", periodStart)
        .eq("period_end", periodEnd)
        .like("invoice_number", "SALE-%")
        .maybeSingle();

      if (existingSale) {
        await supabase.from("invoices")
          .update({ total_cost: totalCost, total_sale: totalSale, margin, due_date: today, updated_at: new Date().toISOString() })
          .eq("id", existingSale.id);

        await supabase.from("invoice_items").delete().eq("invoice_id", existingSale.id);

        for (const item of items) {
          const skuId = skuIdMap[item.sku_code];
          if (skuId) {
            await supabase.from("invoice_items").insert({
              invoice_id: existingSale.id,
              sku_id: skuId,
              quantity: item.quantity,
              unit_cost: item.unit_cost,
              unit_price: item.unit_price,
            });
          }
        }
        saleInvoicesCreated++;
      } else {
        const saleNumber = `SALE-${datePrefix}-${saleInvoicesCreated + 1}`;
        const { data: saleInvoice, error: saleErr } = await supabase.from("invoices").insert({
          invoice_number: saleNumber,
          customer_id: tenant.customer_id!,
          period_start: periodStart,
          period_end: periodEnd,
          total_cost: totalCost,
          total_sale: totalSale,
          margin,
          due_date: today,
          status: "draft",
        }).select("id").single();

        if (saleErr) {
          errors.push(`Sale invoice for ${tenant.name}: ${saleErr.message}`);
          continue;
        }

        for (const item of items) {
          const skuId = skuIdMap[item.sku_code];
          if (skuId && saleInvoice) {
            await supabase.from("invoice_items").insert({
              invoice_id: saleInvoice.id,
              sku_id: skuId,
              quantity: item.quantity,
              unit_cost: item.unit_cost,
              unit_price: item.unit_price,
            });
          }
        }
        saleInvoicesCreated++;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        period: { start: periodStart, end: periodEnd },
        cost_invoices: costInvoicesCreated,
        sale_invoices: saleInvoicesCreated,
        errors: errors.length > 0 ? errors : undefined,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
