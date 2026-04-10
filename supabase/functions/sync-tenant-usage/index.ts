import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const BYTES_TO_GB = 1073741824;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    let targetTenantId: string | null = null;
    let targetDate: string | null = null;
    try {
      const body = await req.json();
      targetTenantId = body.tenant_id || null;
      targetDate = body.usage_date || null;
    } catch { /* no body is fine */ }

    const usageDate = targetDate || new Date().toISOString().split("T")[0];

    // Load SKU mapping from DB
    const { data: skuMappings } = await supabase
      .from("acronis_sku_mapping")
      .select("acronis_name, sku_code, unit_type, is_billable, description");

    const mappingLookup: Record<string, { sku_code: string; unit_type: string; is_billable: boolean; description: string }> = {};
    if (skuMappings) {
      for (const m of skuMappings) {
        mappingLookup[m.acronis_name] = {
          sku_code: m.sku_code,
          unit_type: m.unit_type,
          is_billable: m.is_billable,
          description: m.description || m.acronis_name,
        };
      }
    }

    // Fetch active connections
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

    // Fetch default cost table and build cost lookup
    const { data: defaultCostTable } = await supabase
      .from("price_tables")
      .select("id")
      .eq("type", "cost")
      .eq("is_default", true)
      .single();

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

        // Get tenants linked to customers
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

        // Pre-load sale table lookups
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
            // Fetch usage from Acronis API
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

            const salePrices = tenant.sale_table_id ? (saleLookups[tenant.sale_table_id] || {}) : {};

            for (const usage of items) {
              const offeringName = usage.offering_item?.name || usage.name || "";
              if (!offeringName) continue;

              let rawQuantity = Number(usage.value || usage.usage_value || 0);
              if (rawQuantity === 0) continue;

              // Use mapping table to resolve SKU code
              // Skip non-billable items entirely
              const mapping = mappingLookup[offeringName];
              if (mapping && !mapping.is_billable) continue;
              const mapping = mappingLookup[offeringName];
              let matchedSkuCode: string;
              let skuName: string;
              let quantity: number;

              if (mapping) {
                matchedSkuCode = mapping.sku_code;
                skuName = mapping.description;
                // Convert bytes to GB for storage items
                if (mapping.unit_type === "bytes_to_gb") {
                  quantity = Math.round((rawQuantity / BYTES_TO_GB) * 100) / 100;
                } else {
                  quantity = rawQuantity;
                }
              } else {
                // Fallback: use offering name as code
                matchedSkuCode = offeringName.toUpperCase().replace(/[^A-Z0-9]/g, "").substring(0, 20) || "UNKNOWN";
                skuName = offeringName;
                quantity = rawQuantity;
              }

              // Look up cost and sale prices
              const costInfo = costLookup[matchedSkuCode];
              const unitCost = costInfo ? costInfo.cost : 0;
              if (costInfo) skuName = costInfo.name;

              const totalCost = unitCost * quantity;
              const unitPrice = salePrices[matchedSkuCode] || 0;
              const totalPrice = unitPrice * quantity;

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
