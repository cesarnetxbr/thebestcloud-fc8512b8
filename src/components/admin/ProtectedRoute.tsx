import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

const ADMIN_ROLES = ["admin", "manager", "viewer", "operador", "supervisor"];

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const { role, isRoleLoading, roleError, retryRole } = useUserRole();

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

  if (roleError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="w-full max-w-md rounded-lg border bg-card p-6 text-center shadow-sm space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-semibold text-foreground">Falha ao validar o acesso</h1>
            <p className="text-sm text-muted-foreground">
              Não foi possível confirmar seu perfil agora. Isso parece ser uma instabilidade momentânea de conexão.
            </p>
          </div>
          <Button onClick={retryRole} className="w-full">
            <RefreshCw className="mr-2 h-4 w-4" />
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  if (!role || !ADMIN_ROLES.includes(role)) {
    return <Navigate to="/admin/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
