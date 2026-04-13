import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";

const ADMIN_ROLES = ["admin", "manager", "viewer", "operador", "supervisor"];

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const { role, isRoleLoading } = useUserRole();

  if (loading || isRoleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!role || !ADMIN_ROLES.includes(role)) {
    return <Navigate to="/admin/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
