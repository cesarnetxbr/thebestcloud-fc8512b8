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

    // Fetch all active connections
    const { data: connections, error: connError } = await supabase
      .from("connections")
      .select("id, name")
      .eq("status", "active");

    if (connError) throw connError;
    if (!connections || connections.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: "No active connections found", results: [] }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const results = [];

    for (const conn of connections) {
      try {
        // Call the existing sync function internally
        const { data: connDetails } = await supabase
          .from("connections")
          .select("*")
          .eq("id", conn.id)
          .single();

        if (!connDetails) {
          results.push({ connection: conn.name, error: "Connection details not found" });
          continue;
        }

        // Authenticate with Acronis
        const tokenUrl = `${connDetails.datacenter_url}/api/2/idp/token`;
        const credentials = btoa(`${connDetails.api_key}:${connDetails.api_secret}`);

        const tokenResponse = await fetch(tokenUrl, {
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

        let rootTenantId = tokenData.scope_tenant_id;
        if (!rootTenantId) {
          const clientResp = await fetch(
            `${connDetails.datacenter_url}/api/2/clients/${connDetails.api_key}`,
            { headers: { "Authorization": `Bearer ${accessToken}` } }
          );
          if (clientResp.ok) {
            const clientData = await clientResp.json();
            rootTenantId = clientData.tenant_id;
          }
        }

        if (!rootTenantId) {
          results.push({ connection: conn.name, error: "Could not determine root tenant" });
          continue;
        }

        // Fetch tenants
        const tenantsResponse = await fetch(
          `${connDetails.datacenter_url}/api/2/tenants?subtree_root_id=${rootTenantId}&limit=500`,
          { headers: { "Authorization": `Bearer ${accessToken}` } }
        );

        if (!tenantsResponse.ok) {
          results.push({ connection: conn.name, error: `Fetch tenants failed: ${tenantsResponse.status}` });
          continue;
        }

        const tenantsData = await tenantsResponse.json();
        const allTenants = tenantsData.items || [];
        const customerTenants = allTenants.filter((t: any) => t.kind === "customer");

        let synced = 0;
        let errors = 0;

        for (const at of customerTenants) {
          const { data: existing } = await supabase
            .from("tenants")
            .select("id")
            .eq("external_id", at.id)
            .eq("connection_id", conn.id)
            .maybeSingle();

          if (existing) {
            const { error } = await supabase
              .from("tenants")
              .update({ name: at.name, status: at.enabled ? "active" : "inactive" })
              .eq("id", existing.id);
            if (error) errors++;
            else synced++;
          } else {
            const { error } = await supabase
              .from("tenants")
              .insert({
                name: at.name,
                external_id: at.id,
                connection_id: conn.id,
                status: at.enabled ? "active" : "inactive",
              });
            if (error) errors++;
            else synced++;
          }
        }

        results.push({
          connection: conn.name,
          total_found: allTenants.length,
          customers_only: customerTenants.length,
          synced,
          errors,
        });
      } catch (e) {
        results.push({ connection: conn.name, error: e.message });
      }
    }

    return new Response(
      JSON.stringify({ success: true, results }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
