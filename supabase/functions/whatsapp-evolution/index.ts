import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const ZAPI_INSTANCE_ID = Deno.env.get("ZAPI_INSTANCE_ID");
  const ZAPI_TOKEN = Deno.env.get("ZAPI_TOKEN");
  const ZAPI_CLIENT_TOKEN = Deno.env.get("ZAPI_CLIENT_TOKEN");

  if (!ZAPI_INSTANCE_ID || !ZAPI_TOKEN) {
    console.error("Z-API not configured", { hasInstanceId: !!ZAPI_INSTANCE_ID, hasToken: !!ZAPI_TOKEN });
    return new Response(
      JSON.stringify({ error: "Z-API not configured" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const baseUrl = `https://api.z-api.io/instances/${ZAPI_INSTANCE_ID}/token/${ZAPI_TOKEN}`;
  const zapiGetHeaders: Record<string, string> = {
    ...(ZAPI_CLIENT_TOKEN ? { "Client-Token": ZAPI_CLIENT_TOKEN } : {}),
  };
  const zapiPostHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...(ZAPI_CLIENT_TOKEN ? { "Client-Token": ZAPI_CLIENT_TOKEN } : {}),
  };
  console.log("Z-API baseUrl constructed, instance:", ZAPI_INSTANCE_ID.substring(0, 8) + "..., hasClientToken:", !!ZAPI_CLIENT_TOKEN);

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    let result;

    switch (action) {
      case "qrcode": {
        console.log("Fetching QR code from Z-API...");
        const res = await fetch(`${baseUrl}/qr-code`, { method: "GET", headers: zapiGetHeaders });
        if (!res.ok) {
          const errorText = await res.text();
          console.error("QR code fetch failed:", res.status, errorText);
          return new Response(JSON.stringify({ error: "Failed to get QR code", status: res.status, detail: errorText }), {
            status: res.status,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        result = await res.json();
        console.log("QR code response keys:", Object.keys(result));
        break;
      }

      case "qrcode-image": {
        console.log("Fetching QR code image from Z-API...");
        const res = await fetch(`${baseUrl}/qr-code/image`, { method: "GET", headers: zapiGetHeaders });
        if (!res.ok) {
          const errorText = await res.text();
          console.error("QR code image fetch failed:", res.status, errorText);
          return new Response(JSON.stringify({ error: "Failed to get QR code image", status: res.status }), {
            status: res.status,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        result = await res.json();
        break;
      }

      case "status": {
        console.log("Checking Z-API status...");
        const res = await fetch(`${baseUrl}/status`, { method: "GET", headers: zapiGetHeaders });
        if (!res.ok) {
          const errorText = await res.text();
          console.error("Status check failed:", res.status, errorText);
          return new Response(JSON.stringify({ error: "Failed to check status", status: res.status }), {
            status: res.status,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        result = await res.json();
        console.log("Status response:", JSON.stringify(result));
        break;
      }

      case "disconnect": {
        console.log("Disconnecting Z-API...");
        const res = await fetch(`${baseUrl}/disconnect`, { method: "GET", headers: zapiGetHeaders });
        result = await res.json();
        break;
      }

      case "restart": {
        console.log("Restarting Z-API...");
        const res = await fetch(`${baseUrl}/restart`, { method: "GET", headers: zapiGetHeaders });
        result = await res.json();
        break;
      }

      case "send-text": {
        const body = await req.json();
        console.log("Sending text message via Z-API to:", body.phone);
        const res = await fetch(`${baseUrl}/send-text`, {
          method: "POST",
          headers: zapiGetHeaders,
          body: JSON.stringify({
            phone: body.phone,
            message: body.message,
          }),
        });
        if (!res.ok) {
          const errorText = await res.text();
          console.error("Send text failed:", res.status, errorText);
          return new Response(JSON.stringify({ error: "Failed to send message", detail: errorText }), {
            status: res.status,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        result = await res.json();
        break;
      }

      case "connected": {
        console.log("Checking if connected...");
        const res = await fetch(`${baseUrl}/connected`, { method: "GET", headers: zapiGetHeaders });
        result = await res.json();
        console.log("Connected response:", JSON.stringify(result));
        break;
      }

      default:
        return new Response(JSON.stringify({ error: "Invalid action. Use: qrcode, status, disconnect, restart, send-text, connected" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("Z-API error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
