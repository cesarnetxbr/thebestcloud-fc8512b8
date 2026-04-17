import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import { useAuth } from "@/contexts/AuthContext";

export interface ModulePermission {
  module: string;
  can_view: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
}

/**
 * Effective permissions = preset (by role) merged with user-specific overrides (user_permissions).
 * Override always wins when present for a given module.
 * Admin role bypasses checks (full access).
 */
export const useRolePermissions = () => {
  const { user } = useAuth();
  const { role, isRoleLoading } = useUserRole();
  const [permissions, setPermissions] = useState<ModulePermission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    if (isRoleLoading) {
      setLoading(true);
      return;
    }
    if (!role || !user) {
      setPermissions([]);
      setLoading(false);
      return;
    }
    (async () => {
      setLoading(true);
      const [presetRes, overrideRes] = await Promise.all([
        supabase
          .from("role_permission_presets")
          .select("module, can_view, can_create, can_edit, can_delete")
          .eq("role_name", role),
        supabase
          .from("user_permissions" as any)
          .select("module, can_view, can_create, can_edit, can_delete")
          .eq("user_id", user.id),
      ]);
      if (!active) return;
      if (presetRes.error) console.error("preset perms error:", presetRes.error);
      if (overrideRes.error) console.error("override perms error:", overrideRes.error);

      const map = new Map<string, ModulePermission>();
      ((presetRes.data || []) as ModulePermission[]).forEach((p) => map.set(p.module, p));
      // overrides win
      ((overrideRes.data || []) as unknown as ModulePermission[]).forEach((p) => map.set(p.module, p));
      setPermissions(Array.from(map.values()));
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [role, isRoleLoading, user?.id]);

  const canView = (module: string): boolean => {
    if (role === "admin") return true;
    return permissions.some((p) => p.module === module && p.can_view);
  };

  const canCreate = (module: string): boolean => {
    if (role === "admin") return true;
    return permissions.some((p) => p.module === module && p.can_create);
  };

  const canEdit = (module: string): boolean => {
    if (role === "admin") return true;
    return permissions.some((p) => p.module === module && p.can_edit);
  };

  const canDelete = (module: string): boolean => {
    if (role === "admin") return true;
    return permissions.some((p) => p.module === module && p.can_delete);
  };

  return {
    role,
    permissions,
    loading: loading || isRoleLoading,
    canView,
    canCreate,
    canEdit,
    canDelete,
  };
};
