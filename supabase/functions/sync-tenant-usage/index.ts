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

    // Optional: specific tenant_id or connection_id from body
    let targetTenantId: string | null = null;
    let targetDate: string | null = null;
    try {
      const body = await req.json();
      targetTenantId = body.tenant_id || null;
      targetDate = body.usage_date || null;
    } catch { /* no body is fine */ }

    const usageDate = targetDate || new Date().toISOString().split("T")[0];

    // Fetch all active connections
    const { data: connections, error: connError } = await supabase
      .from("connections")
      .select("id, name, datacenter_url, api_key, api_secret")
      .eq("status", "active");

    if (connError) throw connError;
    if (!connections || connections.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: "No active connections", results: [] }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch default cost table
    const { data: defaultCostTable } = await supabase
      .from("price_tables")
      .select("id")
      .eq("type", "cost")
      .eq("is_default", true)
      .single();

    // Build cost lookup from default cost table
    const costLookup: Record<string, { name: string; cost: number }> = {};
    if (defaultCostTable) {
      const { data: costItems } = await supabase
        .from("price_table_items")
        .select("sku_code, item_name, unit_value")
        .eq("price_table_id", defaultCostTable.id);
      if (costItems) {
        for (const item of costItems) {
          costLookup[item.sku_code] = { name: item.item_name, cost: Number(item.unit_value) };
        }
      }
    }

    const results: any[] = [];

    for (const conn of connections) {
      try {
        // Authenticate with Acronis
        const credentials = btoa(`${conn.api_key}:${conn.api_secret}`);
        const tokenResponse = await fetch(`${conn.datacenter_url}/api/2/idp/token`, {
          method: "POST",
          headers: {
            "Authorization": `Basic ${credentials}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: "grant_type=client_credentials",
        });

        if (!tokenResponse.ok) {
          results.push({ connection: conn.name, error: `Auth failed: ${tokenResponse.status}` });
          continue;
        }

        const tokenData = await tokenResponse.json();
        const accessToken = tokenData.access_token;

        // Get tenants linked to customers with sale tables
        let tenantQuery = supabase
          .from("tenants")
          .select("id, name, external_id, customer_id, sale_table_id, connection_id")
          .eq("connection_id", conn.id)
          .not("customer_id", "is", null)
          .not("external_id", "is", null);

        if (targetTenantId) {
          tenantQuery = tenantQuery.eq("id", targetTenantId);
        }

        const { data: tenants } = await tenantQuery;
        if (!tenants || tenants.length === 0) {
          results.push({ connection: conn.name, message: "No linked tenants", synced: 0 });
          continue;
        }

        // Pre-load sale table lookups for all unique sale_table_ids
        const saleTableIds = [...new Set(tenants.map(t => t.sale_table_id).filter(Boolean))];
        const saleLookups: Record<string, Record<string, number>> = {};

        for (const stId of saleTableIds) {
          const { data: saleItems } = await supabase
            .from("price_table_items")
            .select("sku_code, unit_value")
            .eq("price_table_id", stId!);
          if (saleItems) {
            saleLookups[stId!] = {};
            for (const si of saleItems) {
              saleLookups[stId!][si.sku_code] = Number(si.unit_value);
            }
          }
        }

        let synced = 0;
        let errors = 0;

        for (const tenant of tenants) {
          try {
            // Fetch usage from Acronis API for this tenant
            const usagesUrl = `${conn.datacenter_url}/api/2/tenants/${tenant.external_id}/usages`;
            const usagesResponse = await fetch(usagesUrl, {
              headers: { "Authorization": `Bearer ${accessToken}` },
            });

            if (!usagesResponse.ok) {
              console.error(`Usage fetch failed for ${tenant.name}: ${usagesResponse.status}`);
              errors++;
              continue;
            }

            const usagesData = await usagesResponse.json();
            const items = usagesData.items || [];

            // Get sale prices for this tenant
            const salePrices = tenant.sale_table_id ? (saleLookups[tenant.sale_table_id] || {}) : {};

            // Process each usage item
            for (const usage of items) {
              const skuCode = usage.offering_item?.name || usage.name || "";
              if (!skuCode) continue;

              // Map Acronis usage name to our SKU code format
              const quantity = Number(usage.value || usage.usage_value || 0);
              if (quantity === 0) continue;

              // Find matching SKU in our cost table
              // Acronis API returns names like "storage", "workstations", etc.
              // We need to match by the application_id + offering_item combination
              const infraId = usage.infra_id || "";
              const editionName = usage.edition || "";
              const offeringName = usage.offering_item?.name || usage.name || "";
              
              // Try to find matching SKU code
              let matchedSkuCode = "";
              let unitCost = 0;
              let skuName = offeringName;

              // Direct SKU code match (Acronis sometimes returns measurement_name which maps to our codes)
              const measurementName = usage.measurement_name || usage.offering_item?.measurement_name || "";
              
              // Try matching by offering item name patterns
              for (const [code, info] of Object.entries(costLookup)) {
                const itemNameLower = info.name.toLowerCase();
                const offeringLower = offeringName.toLowerCase();
                
                if (code === offeringName || code === measurementName) {
                  matchedSkuCode = code;
                  unitCost = info.cost;
                  skuName = info.name;
                  break;
                }
                
                // Fuzzy match: check if offering name is contained
                if (offeringLower && itemNameLower.includes(offeringLower)) {
                  matchedSkuCode = code;
                  unitCost = info.cost;
                  skuName = info.name;
                  break;
                }
              }

              // If no match found, use the offering name directly with zero cost
              if (!matchedSkuCode) {
                matchedSkuCode = offeringName.toUpperCase().replace(/[^A-Z0-9]/g, "").substring(0, 20) || "UNKNOWN";
              }

              const totalCost = unitCost * quantity;
              const unitPrice = salePrices[matchedSkuCode] || 0;
              const totalPrice = unitPrice * quantity;

              // Upsert into tenant_usage
              const { error: upsertError } = await supabase
                .from("tenant_usage")
                .upsert(
                  {
                    tenant_id: tenant.id,
                    connection_id: conn.id,
                    sku_code: matchedSkuCode,
                    sku_name: skuName,
                    quantity,
                    unit_cost: unitCost,
                    total_cost: totalCost,
                    unit_price: unitPrice,
                    total_price: totalPrice,
                    usage_date: usageDate,
                  },
                  { onConflict: "tenant_id,sku_code,usage_date" }
                );

              if (upsertError) {
                console.error(`Upsert error for ${tenant.name}/${matchedSkuCode}:`, upsertError);
                errors++;
              } else {
                synced++;
              }
            }
          } catch (tenantErr: any) {
            console.error(`Error processing tenant ${tenant.name}:`, tenantErr.message);
            errors++;
          }
        }

        results.push({
          connection: conn.name,
          tenants_processed: tenants.length,
          usage_items_synced: synced,
          errors,
        });
      } catch (connErr: any) {
        results.push({ connection: conn.name, error: connErr.message });
      }
    }

    return new Response(
      JSON.stringify({ success: true, usage_date: usageDate, results }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
