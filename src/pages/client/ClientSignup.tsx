import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft } from "lucide-react";

const formatCPF = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
};

const formatCNPJ = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 14);
  return digits
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1/$2")
    .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
};

const ClientSignup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [docType, setDocType] = useState<"cpf" | "cnpj">("cnpj");
  const [document, setDocument] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleDocChange = (value: string) => {
    setDocument(docType === "cpf" ? formatCPF(value) : formatCNPJ(value));
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanDoc = document.replace(/\D/g, "");
    if (docType === "cpf" && cleanDoc.length !== 11) {
      toast({ title: "CPF inválido", description: "O CPF deve ter 11 dígitos", variant: "destructive" });
      return;
    }
    if (docType === "cnpj" && cleanDoc.length !== 14) {
      toast({ title: "CNPJ inválido", description: "O CNPJ deve ter 14 dígitos", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { data: signUpData, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName, document: cleanDoc, document_type: docType },
          emailRedirectTo: window.location.origin + "/portal",
        },
      });
      if (error) throw error;

      // If user was created and session exists, register as client immediately
      if (signUpData.session) {
        const { data: regData } = await supabase.functions.invoke("client-register", {
          body: { document: cleanDoc },
        });
        if (regData?.linked) {
          toast({ title: "Conta vinculada!", description: regData.message });
        } else if (regData?.success) {
          toast({ title: "Cadastro realizado!", description: regData.message });
        }
      } else {
        toast({ title: "Cadastro realizado!", description: "Verifique seu email para confirmar a conta." });
      }
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
            
            <div className="space-y-3">
              <Label className="text-sm font-medium">Tipo de documento</Label>
              <RadioGroup value={docType} onValueChange={(val) => { setDocType(val as "cpf" | "cnpj"); setDocument(""); }} className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="cpf" id="cpf" />
                  <Label htmlFor="cpf">CPF (Pessoa Física)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="cnpj" id="cnpj" />
                  <Label htmlFor="cnpj">CNPJ (Pessoa Jurídica)</Label>
                </div>
              </RadioGroup>
              <Input
                placeholder={docType === "cpf" ? "000.000.000-00" : "00.000.000/0000-00"}
                value={document}
                onChange={e => handleDocChange(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                Informe o {docType.toUpperCase()} para vincular sua conta à empresa cadastrada.
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Cadastrar
            </Button>
          </form>
          <div className="mt-4 text-center text-sm space-y-2">
            <div>
              <span className="text-muted-foreground">Já tem conta? </span>
              <Link to="/portal/login" className="text-primary hover:underline">Entrar</Link>
            </div>
            <div>
              <Link to="/" className="text-muted-foreground hover:text-primary inline-flex items-center gap-1">
                <ArrowLeft className="h-3 w-3" /> Voltar ao site
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientSignup;
