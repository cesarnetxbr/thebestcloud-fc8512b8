import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";

export interface ModulePermission {
  module: string;
  can_view: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
}

export const useRolePermissions = () => {
  const { role, isRoleLoading } = useUserRole();
  const [permissions, setPermissions] = useState<ModulePermission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    if (isRoleLoading) {
      setLoading(true);
      return;
    }
    if (!role) {
      setPermissions([]);
      setLoading(false);
      return;
    }
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("role_permission_presets")
        .select("module, can_view, can_create, can_edit, can_delete")
        .eq("role_name", role);
      if (!active) return;
      if (error) {
        console.error("Error loading permissions:", error);
        setPermissions([]);
      } else {
        setPermissions((data || []) as ModulePermission[]);
      }
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [role, isRoleLoading]);

  const canView = (module: string): boolean => {
    if (role === "admin") return true;
    return permissions.some((p) => p.module === module && p.can_view);
  };

  return { role, permissions, loading: loading || isRoleLoading, canView };
};
