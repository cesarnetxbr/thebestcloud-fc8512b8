import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const authHeader = req.headers.get("Authorization");

    if (!authHeader) return json({ error: "Não autenticado" }, 401);

    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await callerClient.auth.getUser();
    if (authError || !user) return json({ error: "Não autenticado" }, 401);

    const { document, phone } = await req.json();

    // Update profile phone if provided
    if (phone) {
      await adminClient
        .from("profiles")
        .update({ phone })
        .eq("user_id", user.id);
    }

    // Check if user already has a role
    const { data: existingRole } = await adminClient
      .from("user_roles")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!existingRole) {
      // Assign client role
      const { error: roleError } = await adminClient
        .from("user_roles")
        .insert({ user_id: user.id, role: "client" });
      if (roleError) {
        console.error("Role insert error:", roleError);
        return json({ error: "Falha ao atribuir perfil de cliente" }, 500);
      }
    }

    // If no document provided, just create role and return
    if (!document) {
      return json({
        success: true,
        linked: false,
        customer_name: null,
        message: "Conta criada com perfil de cliente. Você pode informar seu CPF/CNPJ posteriormente para vincular ao cadastro.",
      });
    }

    // Clean document (remove non-digits)
    const cleanDoc = document.replace(/\D/g, "");
    if (cleanDoc.length !== 11 && cleanDoc.length !== 14) {
      return json({ error: "CPF deve ter 11 dígitos e CNPJ deve ter 14 dígitos" }, 400);
    }

    // Find customer by CPF or CNPJ
    const { data: customer } = await adminClient
      .from("customers")
      .select("id, name, cnpj, user_id")
      .eq("cnpj", cleanDoc)
      .maybeSingle();

    let linked = false;
    let customerName: string | null = null;

    if (customer) {
      if (customer.user_id && customer.user_id !== user.id) {
        return json({ error: "Este CPF/CNPJ já está vinculado a outro usuário" }, 400);
      }
      if (!customer.user_id) {
        const { error: linkError } = await adminClient
          .from("customers")
          .update({ user_id: user.id })
          .eq("id", customer.id);
        if (linkError) {
          console.error("Link error:", linkError);
          return json({ error: "Falha ao vincular cliente" }, 500);
        }
      }
      linked = true;
      customerName = customer.name;
    }

    return json({
      success: true,
      linked,
      customer_name: customerName,
      message: linked
        ? `Conta vinculada ao cliente: ${customerName}`
        : "Conta criada com perfil de cliente. CPF/CNPJ não encontrado no cadastro — o administrador poderá vincular manualmente.",
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return json({ error: err instanceof Error ? err.message : "Erro inesperado" }, 500);
  }
});
