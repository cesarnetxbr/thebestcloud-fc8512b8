import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Gift, Info, CheckCircle, ArrowLeft, Mail, Calendar, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

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

// Gera lista de horas inteiras (1h cada) entre start e end
const generateHourSlots = (start: string, end: string): string[] => {
  const startHour = parseInt(start.slice(0, 2), 10);
  const endHour = parseInt(end.slice(0, 2), 10);
  const hours: string[] = [];
  for (let h = startHour; h < endHour; h++) {
    hours.push(`${String(h).padStart(2, "0")}:00`);
  }
  return hours;
};

const TrialPage = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    cpf_cnpj: "",
    support_option: "" as "" | "email" | "agendar",
    selected_date: "",
    selected_hour: "",
    selected_slot_id: "",
  });
  const [submitted, setSubmitted] = useState(false);

  // Carrega slots disponíveis futuros (agenda técnica) — sem expor nome do técnico ao cliente
  const { data: availableSlots = [] } = useQuery({
    queryKey: ["available-support-slots"],
    queryFn: async () => {
      const today = new Date().toISOString().split("T")[0];
      const { data, error } = await supabase
        .from("support_schedule_slots")
        .select("id, slot_date, start_time, end_time")
        .eq("status", "disponivel")
        .gte("slot_date", today)
        .order("slot_date", { ascending: true })
        .order("start_time", { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });

  // Reservas já feitas (para esconder horários ocupados)
  const { data: reservations = [] } = useQuery({
    queryKey: ["slot-reservations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("support_slot_reservations")
        .select("slot_id, reserved_hour");
      if (error) throw error;
      return data || [];
    },
  });

  // Agrupa slots por data
  const slotsByDate = availableSlots.reduce((acc: Record<string, any[]>, s: any) => {
    (acc[s.slot_date] = acc[s.slot_date] || []).push(s);
    return acc;
  }, {});

  const availableDates = Object.keys(slotsByDate);

  // Para a data selecionada, gera todas as horas disponíveis (1h) considerando reservas
  const hoursForSelectedDate = (() => {
    if (!form.selected_date) return [] as { hour: string; slot_id: string }[];
    const slots = slotsByDate[form.selected_date] || [];
    const result: { hour: string; slot_id: string }[] = [];
    slots.forEach((s) => {
      generateHourSlots(s.start_time, s.end_time).forEach((h) => {
        const isReserved = reservations.some(
          (r: any) => r.slot_id === s.id && r.reserved_hour?.slice(0, 5) === h
        );
        if (!isReserved) result.push({ hour: h, slot_id: s.id });
      });
    });
    return result;
  })();

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

      const slotInfo = form.support_option === "agendar" && form.selected_date && form.selected_hour
        ? `${format(new Date(form.selected_date + "T00:00:00"), "dd/MM/yyyy (EEEE)", { locale: ptBR })} às ${form.selected_hour}`
        : null;

      const description = [
        `📋 Solicitação de Teste Gratuito 14 Dias`,
        ``,
        `Nome: ${form.name}`,
        `E-mail: ${form.email}`,
        `WhatsApp: ${form.phone}`,
        form.cpf_cnpj ? `CPF/CNPJ: ${form.cpf_cnpj}` : null,
        ``,
        `Opção escolhida: ${optionLabel}`,
        slotInfo ? `Horário agendado: ${slotInfo}` : null,
        ``,
        `🎁 Benefícios do teste:`,
        `• 15 dias de teste gratuito`,
        `• 50 GB de espaço`,
        `• 1 licença desktop inclusa`,
      ].filter(Boolean).join("\n");

      const num = `CHM-${Date.now().toString().slice(-6)}`;

      const { data: ticketData, error: ticketError } = await supabase
        .from("tickets")
        .insert({
          ticket_number: num,
          subject: `Teste Grátis 14 Dias — ${form.name}`,
          description,
          priority: "media",
          category_id: categoryId,
          created_by: "00000000-0000-0000-0000-000000000000",
        })
        .select("id")
        .maybeSingle();
      if (ticketError) throw ticketError;

      const trialStart = new Date().toISOString().split("T")[0];
      const trialEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
      const { data: trialData, error: trialError } = await supabase
        .from("trial_clients")
        .insert({
          name: form.name,
          email: form.email,
          phone: form.phone,
          cpf_cnpj: form.cpf_cnpj || null,
          support_option: form.support_option,
          available_date: form.selected_date || null,
          available_time: form.selected_hour || null,
          ticket_id: ticketData?.id || null,
          trial_start_date: trialStart,
          trial_end_date: trialEnd,
          status: "pending",
        })
        .select("id")
        .maybeSingle();
      if (trialError) throw trialError;

      // Cria a reserva da hora escolhida (1h dentro da janela do técnico)
      if (form.support_option === "agendar" && form.selected_slot_id && form.selected_hour) {
        const { error: resError } = await supabase
          .from("support_slot_reservations")
          .insert({
            slot_id: form.selected_slot_id,
            trial_client_id: trialData?.id || null,
            reserved_hour: form.selected_hour,
            reserved_by_name: form.name,
            reserved_by_email: form.email,
            reserved_by_phone: form.phone,
            status: "reservado",
          });
        if (resError) throw resError;
      }
    },
    onSuccess: () => {
      setSubmitted(true);
      toast({ title: "Solicitação enviada com sucesso!" });
    },
    onError: (e: any) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const canSubmit =
    form.name && form.email && form.phone && form.support_option &&
    (form.support_option === "email" || (form.selected_date && form.selected_hour));

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

          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground block">Como deseja receber o acesso? *</label>
            <div
              onClick={() => setForm({ ...form, support_option: "email", selected_slot_id: "", selected_date: "", selected_hour: "" })}
              className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                form.support_option === "email"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-muted-foreground/40"
              }`}
            >
              <div className={`mt-0.5 h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                form.support_option === "email" ? "border-primary" : "border-muted-foreground"
              }`}>
                {form.support_option === "email" && <div className="h-2 w-2 rounded-full bg-primary" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary" />
                  <span className="font-medium text-sm">Receber por e-mail</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Receba as informações de acesso e o manual de uso diretamente no seu e-mail.
                </p>
              </div>
            </div>
            <div
              onClick={() => setForm({ ...form, support_option: "agendar" })}
              className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                form.support_option === "agendar"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-muted-foreground/40"
              }`}
            >
              <div className={`mt-0.5 h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                form.support_option === "agendar" ? "border-primary" : "border-muted-foreground"
              }`}>
                {form.support_option === "agendar" && <div className="h-2 w-2 rounded-full bg-primary" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span className="font-medium text-sm">Agendar suporte remoto</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Escolha um horário disponível na agenda do nosso técnico.
                </p>
              </div>
            </div>
          </div>

          {form.support_option === "agendar" && (
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium mb-1 block flex items-center gap-1">
                  <Calendar className="h-4 w-4" /> Escolha o dia *
                </label>
                {availableDates.length === 0 ? (
                  <div className="text-sm text-muted-foreground p-3 border rounded-lg bg-muted/30">
                    Nenhum dia disponível no momento. Escolha "Receber por e-mail" ou tente novamente em breve.
                  </div>
                ) : (
                  <Select
                    value={form.selected_date}
                    onValueChange={(v) => setForm({ ...form, selected_date: v, selected_hour: "", selected_slot_id: "" })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um dia" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableDates.map((d) => (
                        <SelectItem key={d} value={d}>
                          {format(new Date(d + "T00:00:00"), "dd/MM/yyyy (EEEE)", { locale: ptBR })}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {form.selected_date && (
                <div>
                  <label className="text-sm font-medium mb-2 block flex items-center gap-1">
                    <Clock className="h-4 w-4" /> Escolha o horário (1 hora) *
                  </label>
                  {hoursForSelectedDate.length === 0 ? (
                    <div className="text-sm text-muted-foreground p-3 border rounded-lg bg-muted/30">
                      Todos os horários deste dia já foram reservados. Escolha outro dia.
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 gap-2">
                      {hoursForSelectedDate.map(({ hour, slot_id }) => {
                        const isSelected = form.selected_hour === hour && form.selected_slot_id === slot_id;
                        return (
                          <button
                            key={`${slot_id}-${hour}`}
                            type="button"
                            onClick={() => setForm({ ...form, selected_hour: hour, selected_slot_id: slot_id })}
                            className={`p-2 text-sm rounded-lg border-2 transition-all ${
                              isSelected
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border hover:border-primary/50 bg-background"
                            }`}
                          >
                            {hour}
                          </button>
                        );
                      })}
                    </div>
                  )}
                  {form.selected_hour && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Atendimento agendado das <strong>{form.selected_hour}</strong> às{" "}
                      <strong>{String(parseInt(form.selected_hour) + 1).padStart(2, "0")}:00</strong>.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

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
