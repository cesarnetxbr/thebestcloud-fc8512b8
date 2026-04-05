import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Plus, MessageSquare, Gift, Info } from "lucide-react";
import { format } from "date-fns";

const statusLabels: Record<string, string> = {
  aberto: "Aberto", em_andamento: "Em Andamento", aguardando_cliente: "Aguardando", resolvido: "Resolvido", fechado: "Fechado",
};

const TRIAL_SUBCATEGORY_NAME = "Teste 14 Dias Grátis — Sem Cartão";

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

const ClientTickets = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [detailTicket, setDetailTicket] = useState<any>(null);
  const [replyMsg, setReplyMsg] = useState("");
  const [form, setForm] = useState({ subject: "", description: "", priority: "media", category_id: "", subcategory_id: "" });
  const [trialForm, setTrialForm] = useState({ name: "", email: "", phone: "", cpf_cnpj: "", available_date: "", available_time: "" });

  const { data: tickets = [] } = useQuery({
    queryKey: ["client_tickets", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tickets")
        .select("*, ticket_categories(name, color)")
        .eq("created_by", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["ticket_categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("ticket_categories").select("*").eq("is_active", true);
      if (error) throw error;
      return data;
    },
  });

  const parentCategories = useMemo(() => categories.filter((c: any) => !c.parent_id), [categories]);
  const subcategories = useMemo(() => categories.filter((c: any) => c.parent_id === form.category_id), [categories, form.category_id]);

  const selectedSubcategory = useMemo(() => {
    if (!form.subcategory_id) return null;
    return categories.find((c: any) => c.id === form.subcategory_id);
  }, [categories, form.subcategory_id]);

  const isTrialSelected = selectedSubcategory?.name === TRIAL_SUBCATEGORY_NAME;

  const { data: messages = [], refetch: refetchMessages } = useQuery({
    queryKey: ["client_ticket_messages", detailTicket?.id],
    queryFn: async () => {
      if (!detailTicket) return [];
      const { data, error } = await supabase
        .from("ticket_messages")
        .select("*")
        .eq("ticket_id", detailTicket.id)
        .eq("is_internal", false)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!detailTicket,
  });

  const createTicket = useMutation({
    mutationFn: async () => {
      const num = `CHM-${Date.now().toString().slice(-6)}`;
      const finalCategoryId = form.subcategory_id || form.category_id || null;

      let description = form.description;
      if (isTrialSelected) {
        description = [
          `📋 Solicitação de Teste Gratuito 14 Dias`,
          ``,
          `Nome: ${trialForm.name}`,
          `E-mail: ${trialForm.email}`,
          `WhatsApp: ${trialForm.phone}`,
          trialForm.cpf_cnpj ? `CPF/CNPJ: ${trialForm.cpf_cnpj}` : null,
          `Data disponível: ${trialForm.available_date}`,
          `Horário disponível: ${trialForm.available_time}`,
          ``,
          `🎁 Benefícios do teste:`,
          `• 15 dias de teste gratuito`,
          `• 50 GB de espaço`,
          `• 1 licença desktop inclusa`,
        ].filter(Boolean).join("\n");
      }

      const { error } = await supabase.from("tickets").insert({
        ticket_number: num,
        subject: isTrialSelected ? `Teste Grátis 14 Dias — ${trialForm.name}` : form.subject,
        description,
        priority: form.priority,
        category_id: finalCategoryId,
        created_by: user!.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client_tickets"] });
      setOpen(false);
      setForm({ subject: "", description: "", priority: "media", category_id: "", subcategory_id: "" });
      setTrialForm({ name: "", email: "", phone: "", cpf_cnpj: "", available_date: "", available_time: "" });
      toast({ title: "Chamado aberto com sucesso!" });
    },
    onError: (e: any) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const sendMessage = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("ticket_messages").insert({
        ticket_id: detailTicket.id,
        sender_id: user!.id,
        message: replyMsg,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setReplyMsg("");
      refetchMessages();
    },
  });

  const canSubmitTrial = trialForm.name && trialForm.email && trialForm.phone && trialForm.available_date && trialForm.available_time;
  const canSubmitNormal = form.subject;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Meus Chamados</h2>
        <Dialog open={open} onOpenChange={(o) => {
          setOpen(o);
          if (!o) {
            setForm({ subject: "", description: "", priority: "media", category_id: "", subcategory_id: "" });
            setTrialForm({ name: "", email: "", phone: "", cpf_cnpj: "", available_date: "", available_time: "" });
          }
        }}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Abrir Chamado</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Novo Chamado</DialogTitle></DialogHeader>
            <div className="space-y-4">
              {/* Categoria */}
              <Select value={form.category_id} onValueChange={v => setForm({ ...form, category_id: v, subcategory_id: "" })}>
                <SelectTrigger><SelectValue placeholder="Categoria" /></SelectTrigger>
                <SelectContent>
                  {parentCategories.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>

              {/* Subcategoria */}
              {subcategories.length > 0 && (
                <Select value={form.subcategory_id} onValueChange={v => setForm({ ...form, subcategory_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Subcategoria (opcional)" /></SelectTrigger>
                  <SelectContent>
                    {subcategories.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}

              {/* Formulário especial de Teste Grátis */}
              {isTrialSelected ? (
                <div className="space-y-4">
                  <div className="bg-accent/30 border border-accent rounded-lg p-4 space-y-2">
                    <div className="flex items-center gap-2 text-primary font-semibold">
                      <Gift className="h-5 w-5" />
                      Teste 14 Dias Grátis — Sem Cartão
                    </div>
                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Info className="h-4 w-4 mt-0.5 shrink-0" />
                      <p>Você terá <strong>15 dias de teste</strong> com direito a <strong>50 GB de espaço</strong> e <strong>1 licença desktop</strong>.</p>
                    </div>
                  </div>

                  <Input
                    placeholder="Nome completo *"
                    value={trialForm.name}
                    onChange={e => setTrialForm({ ...trialForm, name: e.target.value })}
                  />
                  <Input
                    type="email"
                    placeholder="E-mail *"
                    value={trialForm.email}
                    onChange={e => setTrialForm({ ...trialForm, email: e.target.value })}
                  />
                  <Input
                    placeholder="WhatsApp * (xx) xxxxx-xxxx"
                    value={trialForm.phone}
                    onChange={e => setTrialForm({ ...trialForm, phone: formatPhone(e.target.value) })}
                  />
                  <Input
                    placeholder="CPF/CNPJ (opcional)"
                    value={trialForm.cpf_cnpj}
                    onChange={e => setTrialForm({ ...trialForm, cpf_cnpj: formatCpfCnpj(e.target.value) })}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm text-muted-foreground mb-1 block">Data disponível *</label>
                      <Input
                        type="date"
                        value={trialForm.available_date}
                        onChange={e => setTrialForm({ ...trialForm, available_date: e.target.value })}
                        min={new Date().toISOString().split("T")[0]}
                      />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground mb-1 block">Horário disponível *</label>
                      <Input
                        type="time"
                        value={trialForm.available_time}
                        onChange={e => setTrialForm({ ...trialForm, available_time: e.target.value })}
                      />
                    </div>
                  </div>

                  <Button onClick={() => createTicket.mutate()} disabled={!canSubmitTrial} className="w-full">
                    <Gift className="h-4 w-4 mr-2" />Solicitar Teste Grátis
                  </Button>
                </div>
              ) : (
                <>
                  {/* Formulário padrão */}
                  <Input placeholder="Assunto" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} />
                  <Textarea placeholder="Descreva seu problema ou solicitação..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={4} />
                  <Select value={form.priority} onValueChange={v => setForm({ ...form, priority: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="baixa">Baixa</SelectItem>
                      <SelectItem value="media">Média</SelectItem>
                      <SelectItem value="alta">Alta</SelectItem>
                      <SelectItem value="urgente">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={() => createTicket.mutate()} disabled={!canSubmitNormal} className="w-full">Abrir Chamado</Button>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {tickets.map((t: any) => (
          <Card key={t.id} className="cursor-pointer hover:shadow-md transition" onClick={() => setDetailTicket(t)}>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold">{t.subject}</p>
                <p className="text-sm text-muted-foreground">{t.ticket_number} • {format(new Date(t.created_at), "dd/MM/yyyy")}</p>
              </div>
              <div className="flex items-center gap-2">
                {t.ticket_categories && <Badge variant="outline">{t.ticket_categories.name}</Badge>}
                <Badge variant={t.status === "aberto" ? "default" : "secondary"}>{statusLabels[t.status] || t.status}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
        {tickets.length === 0 && <p className="text-center text-muted-foreground py-8">Nenhum chamado encontrado</p>}
      </div>

      <Dialog open={!!detailTicket} onOpenChange={o => !o && setDetailTicket(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              {detailTicket?.ticket_number}
            </DialogTitle>
          </DialogHeader>
          {detailTicket && (
            <div className="space-y-4">
              <h3 className="font-semibold">{detailTicket.subject}</h3>
              {detailTicket.description && <p className="text-sm bg-muted p-3 rounded whitespace-pre-line">{detailTicket.description}</p>}
              <Badge>{statusLabels[detailTicket.status]}</Badge>
              <div className="border-t pt-4 space-y-3 max-h-60 overflow-y-auto">
                {messages.map((m: any) => (
                  <div key={m.id} className={`p-3 rounded-lg text-sm ${m.sender_id === user?.id ? "bg-primary/10 ml-8" : "bg-muted mr-8"}`}>
                    <p className="text-xs text-muted-foreground mb-1">{format(new Date(m.created_at), "dd/MM HH:mm")}</p>
                    <p>{m.message}</p>
                  </div>
                ))}
              </div>
              {detailTicket.status !== "fechado" && (
                <div className="flex gap-2">
                  <Textarea placeholder="Responder..." value={replyMsg} onChange={e => setReplyMsg(e.target.value)} rows={2} className="flex-1" />
                  <Button onClick={() => sendMessage.mutate()} disabled={!replyMsg}>Enviar</Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientTickets;
