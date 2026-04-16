import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const EVOLUTION_API_URL = Deno.env.get("EVOLUTION_API_URL");
  const EVOLUTION_API_KEY = Deno.env.get("EVOLUTION_API_KEY");

  console.log("EVOLUTION_API_URL length:", EVOLUTION_API_URL?.length);
  console.log("EVOLUTION_API_URL starts with http:", EVOLUTION_API_URL?.startsWith("http"));

  if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY) {
    return new Response(
      JSON.stringify({ error: "Evolution API not configured", hasUrl: !!EVOLUTION_API_URL, hasKey: !!EVOLUTION_API_KEY }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Auto-fix URL if missing protocol
  let apiUrl = EVOLUTION_API_URL.trim();
  if (!apiUrl.startsWith("http://") && !apiUrl.startsWith("https://")) {
    apiUrl = `https://${apiUrl}`;
  }
  const baseUrl = apiUrl.replace(/\/$/, "");
  console.log("Using Evolution API baseUrl:", baseUrl);

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get("action");
    const instanceName = url.searchParams.get("instance");

    const headers = {
      "apikey": EVOLUTION_API_KEY,
      "Content-Type": "application/json",
    };

    let result;

    switch (action) {
      case "create": {
        const body = await req.json();
        const targetUrl = `${baseUrl}/instance/create`;
        console.log("Creating instance at:", targetUrl);
        const res = await fetch(targetUrl, {
          method: "POST",
          headers,
          body: JSON.stringify({
            instanceName: body.instanceName,
            qrcode: true,
            integration: "WHATSAPP-BAILEYS",
          }),
        });
        result = await res.json();
        if (!res.ok) {
          return new Response(JSON.stringify({ error: "Evolution create failed", detail: result }), {
            status: res.status,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        break;
      }

      case "connect": {
        if (!instanceName) {
          return new Response(JSON.stringify({ error: "instance param required" }), {
            status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        const res = await fetch(`${baseUrl}/instance/connect/${instanceName}`, {
          method: "GET",
          headers,
        });
        result = await res.json();
        break;
      }

      case "status": {
        if (!instanceName) {
          return new Response(JSON.stringify({ error: "instance param required" }), {
            status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        const res = await fetch(`${baseUrl}/instance/connectionState/${instanceName}`, {
          method: "GET",
          headers,
        });
        result = await res.json();
        break;
      }

      case "delete": {
        if (!instanceName) {
          return new Response(JSON.stringify({ error: "instance param required" }), {
            status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        const res = await fetch(`${baseUrl}/instance/delete/${instanceName}`, {
          method: "DELETE",
          headers,
        });
        result = await res.json();
        break;
      }

      case "list": {
        const res = await fetch(`${baseUrl}/instance/fetchInstances`, {
          method: "GET",
          headers,
        });
        result = await res.json();
        break;
      }

      default:
        return new Response(JSON.stringify({ error: "Invalid action. Use: create, connect, status, delete, list" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("Evolution API error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
