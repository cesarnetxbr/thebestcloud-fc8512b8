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

    const { data: { user: caller }, error: authError } = await callerClient.auth.getUser();
    if (authError || !caller) return json({ error: "Não autenticado" }, 401);

    const { data: roleData } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", caller.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) return json({ error: "Apenas administradores podem gerenciar usuários" }, 403);

    const { action, user_id } = await req.json();
    if (!action || !user_id) return json({ error: "action e user_id são obrigatórios" }, 400);

    // Prevent self-action
    if (user_id === caller.id) {
      return json({ error: "Você não pode realizar esta ação em sua própria conta" }, 400);
    }

    if (action === "deactivate") {
      const { error } = await adminClient
        .from("profiles")
        .update({ is_active: false })
        .eq("user_id", user_id);
      if (error) return json({ error: error.message }, 500);
      return json({ success: true, message: "Usuário desativado" });
    }

    if (action === "activate") {
      const { error } = await adminClient
        .from("profiles")
        .update({ is_active: true })
        .eq("user_id", user_id);
      if (error) return json({ error: error.message }, 500);
      return json({ success: true, message: "Usuário ativado" });
    }

    if (action === "delete") {
      // Delete user roles
      await adminClient.from("user_roles").delete().eq("user_id", user_id);
      // Delete user permissions
      await adminClient.from("user_permissions").delete().eq("user_id", user_id);
      // Delete profile
      await adminClient.from("profiles").delete().eq("user_id", user_id);
      // Unlink from customers
      await adminClient.from("customers").update({ user_id: null }).eq("user_id", user_id);
      // Delete auth user
      const { error } = await adminClient.auth.admin.deleteUser(user_id);
      if (error) return json({ error: error.message }, 500);
      return json({ success: true, message: "Usuário excluído permanentemente" });
    }

    return json({ error: "Ação inválida. Use: deactivate, activate ou delete" }, 400);
  } catch (err) {
    console.error("Unexpected error:", err);
    return json({ error: err instanceof Error ? err.message : "Erro inesperado" }, 500);
  }
});
