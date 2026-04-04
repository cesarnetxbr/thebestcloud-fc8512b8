import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface AcronisTenant {
  id: string;
  name: string;
  kind: string;
  enabled: boolean;
  language: string;
  mfa_status: string;
  pricing_mode: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify user JWT using service role client
    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get connection_id from body
    const { connection_id } = await req.json();
    if (!connection_id) {
      return new Response(
        JSON.stringify({ error: "connection_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch connection details
    const { data: connection, error: connError } = await supabase
      .from("connections")
      .select("*")
      .eq("id", connection_id)
      .single();

    if (connError || !connection) {
      return new Response(
        JSON.stringify({ error: "Connection not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 1: Authenticate with Acronis API to get access token
    const tokenUrl = `${connection.datacenter_url}/api/2/idp/token`;
    const credentials = btoa(`${connection.api_key}:${connection.api_secret}`);

    const tokenResponse = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    if (!tokenResponse.ok) {
      const errText = await tokenResponse.text();
      return new Response(
        JSON.stringify({ error: `Acronis auth failed: ${tokenResponse.status}`, details: errText }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Step 2: Fetch tenants from Acronis
    const tenantsUrl = `${connection.datacenter_url}/api/2/tenants?subtree_root_id=${tokenData.scope_tenant_id || ""}&limit=500`;

    const tenantsResponse = await fetch(tenantsUrl, {
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!tenantsResponse.ok) {
      const errText = await tenantsResponse.text();
      return new Response(
        JSON.stringify({ error: `Failed to fetch tenants: ${tenantsResponse.status}`, details: errText }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const tenantsData = await tenantsResponse.json();
    const acronisTenants: AcronisTenant[] = tenantsData.items || [];

    // Step 3: Upsert tenants into our database
    let synced = 0;
    let errors = 0;

    for (const at of acronisTenants) {
      // Check if tenant already exists by external_id
      const { data: existing } = await supabase
        .from("tenants")
        .select("id")
        .eq("external_id", at.id)
        .eq("connection_id", connection_id)
        .maybeSingle();

      if (existing) {
        // Update existing
        const { error } = await supabase
          .from("tenants")
          .update({
            name: at.name,
            status: at.enabled ? "active" : "inactive",
          })
          .eq("id", existing.id);
        if (error) errors++;
        else synced++;
      } else {
        // Insert new
        const { error } = await supabase
          .from("tenants")
          .insert({
            name: at.name,
            external_id: at.id,
            connection_id: connection_id,
            status: at.enabled ? "active" : "inactive",
          });
        if (error) errors++;
        else synced++;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        total_found: acronisTenants.length,
        synced,
        errors,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
