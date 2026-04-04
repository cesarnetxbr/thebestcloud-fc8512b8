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
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const authHeader = req.headers.get("Authorization");

    if (!supabaseUrl || !serviceRoleKey || !anonKey) {
      return json({ error: "Configuração do backend incompleta" }, 500);
    }

    if (!authHeader) {
      return json({ error: "Não autenticado" }, 401);
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user: caller },
      error: authError,
    } = await callerClient.auth.getUser();

    if (authError || !caller) {
      console.error("Auth error:", authError);
      return json({ error: "Não autenticado" }, 401);
    }

    const { data: roleData } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", caller.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      return json({ error: "Apenas administradores podem visualizar usuários" }, 403);
    }

    const [{ data: roles, error: rolesError }, { data: profiles, error: profilesError }, authUsersResult] = await Promise.all([
      adminClient.from("user_roles").select("id, user_id, role"),
      adminClient.from("profiles").select("user_id, full_name, created_at, updated_at, last_login_at, created_by_name, is_active"),
      adminClient.auth.admin.listUsers({ page: 1, perPage: 1000 }),
    ]);

    if (rolesError) {
      console.error("Roles error:", rolesError);
      return json({ error: "Falha ao carregar papéis dos usuários" }, 500);
    }

    if (profilesError) {
      console.error("Profiles error:", profilesError);
      return json({ error: "Falha ao carregar perfis dos usuários" }, 500);
    }

    if (authUsersResult.error) {
      console.error("Auth users error:", authUsersResult.error);
      return json({ error: "Falha ao carregar contas de acesso" }, 500);
    }

    const profileMap = new Map((profiles ?? []).map((profile) => [profile.user_id, profile]));
    const authUserMap = new Map((authUsersResult.data.users ?? []).map((authUser) => [authUser.id, authUser]));

    const users = (roles ?? [])
      .map((roleRow) => {
        const profile = profileMap.get(roleRow.user_id);
        const authUser = authUserMap.get(roleRow.user_id);
        const metadataName = typeof authUser?.user_metadata?.full_name === "string"
          ? authUser.user_metadata.full_name
          : null;
        const email = authUser?.email ?? "";

        return {
          user_id: roleRow.user_id,
          role_id: roleRow.id,
          role: roleRow.role,
          email,
          full_name: profile?.full_name ?? metadataName ?? email ?? null,
          last_login_at: profile?.last_login_at ?? authUser?.last_sign_in_at ?? null,
          created_at: profile?.created_at ?? authUser?.created_at ?? null,
          updated_at: profile?.updated_at ?? null,
          created_by_name: profile?.created_by_name ?? null,
        };
      })
      .sort((a, b) => {
        const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
        const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
        return bTime - aTime;
      });

    return json({ users });
  } catch (err) {
    console.error("Unexpected error:", err);
    return json({ error: err instanceof Error ? err.message : "Erro inesperado" }, 500);
  }
});
