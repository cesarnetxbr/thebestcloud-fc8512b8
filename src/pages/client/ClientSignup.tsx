import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const ClientSignup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          emailRedirectTo: window.location.origin + "/portal",
        },
      });
      if (error) throw error;
      
      toast({ title: "Cadastro realizado!", description: "Verifique seu email para confirmar a conta." });
      navigate("/portal/login");
    } catch (err: any) {
      toast({ title: "Erro no cadastro", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Criar Conta</CardTitle>
          <CardDescription>Cadastre-se para acessar o portal do cliente</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            <Input placeholder="Nome completo" value={fullName} onChange={e => setFullName(e.target.value)} required />
            <Input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
            <Input type="password" placeholder="Senha (mínimo 6 caracteres)" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Cadastrar
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <span className="text-muted-foreground">Já tem conta? </span>
            <Link to="/portal/login" className="text-primary hover:underline">Entrar</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientSignup;
