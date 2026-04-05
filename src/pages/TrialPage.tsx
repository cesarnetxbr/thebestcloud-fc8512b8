import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Gift, Info, CheckCircle, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const formatPhone = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

const formatCpfCnpj = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 14);
  if (digits.length <= 11) {
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
  }
  if (digits.length <= 12) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
};

const TrialPage = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    cpf_cnpj: "",
    support_option: "" as "" | "email" | "agendar",
    available_date: "",
    available_time: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const submitTrial = useMutation({
    mutationFn: async () => {
      const { data: categories } = await supabase
        .from("ticket_categories")
        .select("id")
        .eq("name", "Teste 14 Dias Grátis — Sem Cartão")
        .eq("is_active", true)
        .limit(1);

      const categoryId = categories?.[0]?.id || null;

      const optionLabel = form.support_option === "email"
        ? "📧 Receber por e-mail (acesso + manual)"
        : "📅 Agendamento de suporte remoto";

      const description = [
        `📋 Solicitação de Teste Gratuito 14 Dias`,
        ``,
        `Nome: ${form.name}`,
        `E-mail: ${form.email}`,
        `WhatsApp: ${form.phone}`,
        form.cpf_cnpj ? `CPF/CNPJ: ${form.cpf_cnpj}` : null,
        ``,
        `Opção escolhida: ${optionLabel}`,
        form.support_option === "agendar" ? `Data disponível: ${form.available_date}` : null,
        form.support_option === "agendar" ? `Horário disponível: ${form.available_time}` : null,
        ``,
        `🎁 Benefícios do teste:`,
        `• 15 dias de teste gratuito`,
        `• 50 GB de espaço`,
        `• 1 licença desktop inclusa`,
      ].filter(Boolean).join("\n");

      const num = `CHM-${Date.now().toString().slice(-6)}`;

      const { error } = await supabase.from("tickets").insert({
        ticket_number: num,
        subject: `Teste Grátis 14 Dias — ${form.name}`,
        description,
        priority: "media",
        category_id: categoryId,
        created_by: "00000000-0000-0000-0000-000000000000",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setSubmitted(true);
      toast({ title: "Solicitação enviada com sucesso!" });
    },
    onError: (e: any) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const canSubmit =
    form.name && form.email && form.phone && form.support_option &&
    (form.support_option === "email" || (form.available_date && form.available_time));

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-8 pb-8 space-y-4">
            <CheckCircle className="h-16 w-16 text-primary mx-auto" />
            <h2 className="text-2xl font-bold">Solicitação Enviada!</h2>
            <p className="text-muted-foreground">
              Em breve nossa equipe entrará em contato para configurar seu teste gratuito de 14 dias.
            </p>
            <div className="pt-4">
              <Link to="/">
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar ao site
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Gift className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Teste 14 Dias Grátis — Sem Cartão</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-accent/30 border border-accent rounded-lg p-4 space-y-2">
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <Info className="h-4 w-4 mt-0.5 shrink-0" />
              <p>
                Você terá <strong className="text-foreground">15 dias de teste</strong> com direito a{" "}
                <strong className="text-foreground">50 GB de espaço</strong> e{" "}
                <strong className="text-foreground">1 licença desktop</strong>.
              </p>
            </div>
          </div>

          <Input
            placeholder="Nome completo *"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <Input
            type="email"
            placeholder="E-mail *"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <Input
            placeholder="WhatsApp * (xx) xxxxx-xxxx"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: formatPhone(e.target.value) })}
          />
          <Input
            placeholder="CPF/CNPJ (opcional)"
            value={form.cpf_cnpj}
            onChange={(e) => setForm({ ...form, cpf_cnpj: formatCpfCnpj(e.target.value) })}
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Data disponível *</label>
              <Input
                type="date"
                value={form.available_date}
                onChange={(e) => setForm({ ...form, available_date: e.target.value })}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Horário disponível *</label>
              <Input
                type="time"
                value={form.available_time}
                onChange={(e) => setForm({ ...form, available_time: e.target.value })}
              />
            </div>
          </div>

          <Button
            onClick={() => submitTrial.mutate()}
            disabled={!canSubmit || submitTrial.isPending}
            className="w-full"
            size="lg"
          >
            <Gift className="h-4 w-4 mr-2" />
            Solicitar Teste Grátis
          </Button>

          <div className="text-center pt-2">
            <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition">
              ← Voltar ao site
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrialPage;
