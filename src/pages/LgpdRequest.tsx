import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const requestTypes = [
  { value: "access", label: "Acesso aos meus dados" },
  { value: "correction", label: "Correção de dados" },
  { value: "deletion", label: "Exclusão de dados" },
  { value: "portability", label: "Portabilidade de dados" },
  { value: "revoke_consent", label: "Revogação de consentimento" },
  { value: "information", label: "Informações sobre tratamento" },
];

const LgpdRequest = () => {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [protocol, setProtocol] = useState("");
  const [form, setForm] = useState({
    requester_name: "",
    requester_email: "",
    requester_document: "",
    request_type: "access",
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.requester_name.trim() || !form.requester_email.trim()) {
      toast({ title: "Preencha nome e e-mail", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("lgpd_data_requests")
        .insert({
          requester_name: form.requester_name.trim(),
          requester_email: form.requester_email.trim(),
          requester_document: form.requester_document.trim() || null,
          request_type: form.request_type,
          description: form.description.trim() || null,
          protocol_number: "temp",
        })
        .select("protocol_number")
        .single();

      if (error) throw error;
      setProtocol(data.protocol_number);
      setSubmitted(true);
      toast({ title: "Solicitação enviada com sucesso!" });
    } catch (err: any) {
      toast({ title: "Erro ao enviar", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-2xl">
          <h1 className="text-3xl font-bold mb-2">Solicitação de Direitos — LGPD</h1>
          <p className="text-muted-foreground mb-8">
            Exerça seus direitos como titular de dados pessoais conforme a Lei nº 13.709/2018.
          </p>

          {submitted ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
              <h2 className="text-xl font-semibold text-green-800 mb-2">Solicitação Recebida!</h2>
              <p className="text-green-700 mb-4">
                Seu protocolo é: <strong className="text-lg">{protocol}</strong>
              </p>
              <p className="text-green-600 text-sm">
                Responderemos em até 15 dias úteis conforme a LGPD. Uma confirmação será enviada para o e-mail informado.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Nome completo *</Label>
                  <Input value={form.requester_name} onChange={e => setForm(f => ({ ...f, requester_name: e.target.value }))} required maxLength={100} />
                </div>
                <div>
                  <Label>E-mail *</Label>
                  <Input type="email" value={form.requester_email} onChange={e => setForm(f => ({ ...f, requester_email: e.target.value }))} required maxLength={255} />
                </div>
              </div>
              <div>
                <Label>CPF/CNPJ</Label>
                <Input value={form.requester_document} onChange={e => setForm(f => ({ ...f, requester_document: e.target.value }))} maxLength={18} placeholder="Opcional" />
              </div>
              <div>
                <Label>Tipo de solicitação *</Label>
                <Select value={form.request_type} onValueChange={v => setForm(f => ({ ...f, request_type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {requestTypes.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Descrição</Label>
                <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} maxLength={1000} placeholder="Descreva sua solicitação..." rows={4} />
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Enviando..." : "Enviar Solicitação"}
              </Button>
            </form>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LgpdRequest;
