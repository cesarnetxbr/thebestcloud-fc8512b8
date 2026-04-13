import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldX } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import logo from "@/assets/logo.png";

const Unauthorized = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary p-4">
      <Card className="w-full max-w-md shadow-strong text-center">
        <CardHeader className="space-y-4">
          <div className="flex justify-center">
            <img src={logo} alt="The Best Cloud" className="h-12 w-auto" />
          </div>
          <div className="flex justify-center">
            <ShieldX className="h-16 w-16 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Acesso Não Autorizado</CardTitle>
          <CardDescription>
            Sua conta ainda não possui permissão para acessar o Portal de Gestão.
            Entre em contato com o administrador para que seu perfil seja configurado.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            O administrador precisa atribuir um perfil de acesso à sua conta antes que você possa utilizar esta área.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button
            variant="outline"
            className="w-full"
            onClick={async () => {
              await signOut();
              navigate("/admin/login", { replace: true });
            }}
          >
            Sair e voltar ao login
          </Button>
          <Link to="/" className="text-sm text-muted-foreground hover:text-primary">
            ← Voltar ao site
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Unauthorized;
