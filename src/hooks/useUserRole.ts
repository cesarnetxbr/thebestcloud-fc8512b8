import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type AppRole = "admin" | "manager" | "viewer" | "client" | "operador" | "supervisor";

export const useUserRole = () => {
  const { user, loading: isAuthLoading } = useAuth();
  const [role, setRole] = useState<AppRole | null>(null);
  const [isRoleLoading, setIsRoleLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    if (isAuthLoading) {
      setIsRoleLoading(true);
      return () => {
        isActive = false;
      };
    }

    if (!user) {
      setRole(null);
      setIsRoleLoading(false);
      return () => {
        isActive = false;
      };
    }

    const fetchRole = async () => {
      setIsRoleLoading(true);
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!isActive) return;

      if (error) {
        console.error("Error fetching user role:", error);
        setRole(null);
      } else {
        setRole(data?.role ?? null);
      }

      setIsRoleLoading(false);
    };

    fetchRole();

    return () => {
      isActive = false;
    };
  }, [user, isAuthLoading]);

  return { role, isRoleLoading };
};
