import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Plus, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, MapPin, Trash2, Edit } from "lucide-react";
import { cn } from "@/lib/utils";

interface Appointment {
  id: string;
  title: string;
  description: string | null;
  start_at: string;
  end_at: string;
  location: string | null;
  type: string;
  status: string;
  customer_id: string | null;
  lead_id: string | null;
  deal_id: string | null;
  created_by: string | null;
}

const typeLabels: Record<string, string> = {
  reuniao: "Reunião",
  ligacao: "Ligação",
  visita: "Visita",
  outro: "Outro",
};

const statusColors: Record<string, string> = {
  agendado: "bg-blue-100 text-blue-700",
  concluido: "bg-green-100 text-green-700",
  cancelado: "bg-red-100 text-red-700",
};

const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

const monthNames = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

const CRMAgenda = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [customers, setCustomers] = useState<{ id: string; name: string }[]>([]);

  const [form, setForm] = useState({
    title: "",
    description: "",
    start_at: "",
    end_at: "",
    location: "",
    type: "reuniao",
    status: "agendado",
    customer_id: "",
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const fetchAppointments = async () => {
    setLoading(true);
    const startOfMonth = new Date(year, month, 1).toISOString();
    const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59).toISOString();

    const { data } = await supabase
      .from("crm_appointments")
      .select("*")
      .gte("start_at", startOfMonth)
      .lte("start_at", endOfMonth)
      .order("start_at");

    setAppointments((data as Appointment[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchAppointments();
  }, [year, month]);

  useEffect(() => {
    supabase.from("customers").select("id, name").order("name").then(({ data }) => {
      setCustomers(data || []);
    });
  }, []);

  const resetForm = () => {
    setForm({ title: "", description: "", start_at: "", end_at: "", location: "", type: "reuniao", status: "agendado", customer_id: "" });
    setEditingId(null);
  };

  const openNewForDate = (dateStr: string) => {
    resetForm();
    setForm(f => ({
      ...f,
      start_at: `${dateStr}T09:00`,
      end_at: `${dateStr}T10:00`,
    }));
    setDialogOpen(true);
  };

  const openEdit = (apt: Appointment) => {
    setEditingId(apt.id);
    setForm({
      title: apt.title,
      description: apt.description || "",
      start_at: apt.start_at.slice(0, 16),
      end_at: apt.end_at.slice(0, 16),
      location: apt.location || "",
      type: apt.type,
      status: apt.status,
      customer_id: apt.customer_id || "",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.start_at || !form.end_at) {
      toast({ title: "Preencha título, início e fim", variant: "destructive" });
      return;
    }

    const payload = {
      title: form.title,
      description: form.description || null,
      start_at: new Date(form.start_at).toISOString(),
      end_at: new Date(form.end_at).toISOString(),
      location: form.location || null,
      type: form.type,
      status: form.status,
      customer_id: form.customer_id || null,
      created_by: user?.id || null,
    };

    let error;
    if (editingId) {
      ({ error } = await supabase.from("crm_appointments").update(payload).eq("id", editingId));
    } else {
      ({ error } = await supabase.from("crm_appointments").insert(payload));
    }

    if (error) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    } else {
      toast({ title: editingId ? "Compromisso atualizado" : "Compromisso criado" });
      setDialogOpen(false);
      resetForm();
      fetchAppointments();
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("crm_appointments").delete().eq("id", id);
    if (error) {
      toast({ title: "Erro ao excluir", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Compromisso excluído" });
      fetchAppointments();
    }
  };

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToday = () => setCurrentDate(new Date());

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const getAppointmentsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return appointments.filter(a => a.start_at.startsWith(dateStr));
  };

  const selectedAppointments = selectedDate
    ? appointments.filter(a => a.start_at.startsWith(selectedDate))
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Agenda CRM</h2>
          <p className="text-muted-foreground">Reuniões e compromissos com clientes</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) resetForm(); }}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Novo Compromisso</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingId ? "Editar Compromisso" : "Novo Compromisso"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Título *</Label>
                <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Reunião com cliente X" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Início *</Label>
                  <Input type="datetime-local" value={form.start_at} onChange={e => setForm(f => ({ ...f, start_at: e.target.value }))} />
                </div>
                <div>
                  <Label>Fim *</Label>
                  <Input type="datetime-local" value={form.end_at} onChange={e => setForm(f => ({ ...f, end_at: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Tipo</Label>
                  <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="reuniao">Reunião</SelectItem>
                      <SelectItem value="ligacao">Ligação</SelectItem>
                      <SelectItem value="visita">Visita</SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="agendado">Agendado</SelectItem>
                      <SelectItem value="concluido">Concluído</SelectItem>
                      <SelectItem value="cancelado">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Local</Label>
                <Input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="Google Meet, Escritório..." />
              </div>
              <div>
                <Label>Cliente</Label>
                <Select value={form.customer_id} onValueChange={v => setForm(f => ({ ...f, customer_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Selecionar cliente (opcional)" /></SelectTrigger>
                  <SelectContent>
                    {customers.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Descrição</Label>
                <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} />
              </div>
              <Button onClick={handleSave} className="w-full">{editingId ? "Atualizar" : "Criar Compromisso"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="icon" onClick={prevMonth}><ChevronLeft className="h-4 w-4" /></Button>
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg">{monthNames[month]} {year}</CardTitle>
                <Button variant="outline" size="sm" onClick={goToday}>Hoje</Button>
              </div>
              <Button variant="ghost" size="icon" onClick={nextMonth}><ChevronRight className="h-4 w-4" /></Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-px">
              {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map(d => (
                <div key={d} className="text-center text-xs font-medium text-muted-foreground py-2">{d}</div>
              ))}
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} className="h-20" />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                const dayAppointments = getAppointmentsForDay(day);
                const isToday = dateStr === todayStr;
                const isSelected = dateStr === selectedDate;

                return (
                  <div
                    key={day}
                    onClick={() => setSelectedDate(dateStr)}
                    onDoubleClick={() => openNewForDate(dateStr)}
                    className={cn(
                      "h-20 p-1 border rounded-md cursor-pointer transition-colors hover:bg-accent/50",
                      isToday && "border-primary",
                      isSelected && "bg-accent"
                    )}
                  >
                    <div className={cn("text-xs font-medium mb-0.5", isToday && "text-primary font-bold")}>{day}</div>
                    <div className="space-y-0.5 overflow-hidden">
                      {dayAppointments.slice(0, 2).map(a => (
                        <div
                          key={a.id}
                          className="text-[10px] leading-tight px-1 py-0.5 rounded bg-primary/10 text-primary truncate"
                          title={a.title}
                        >
                          {new Date(a.start_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })} {a.title}
                        </div>
                      ))}
                      {dayAppointments.length > 2 && (
                        <div className="text-[10px] text-muted-foreground px-1">+{dayAppointments.length - 2} mais</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Day detail */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              {selectedDate
                ? new Date(selectedDate + "T12:00:00").toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })
                : "Selecione um dia"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedDate ? (
              <p className="text-sm text-muted-foreground">Clique em um dia no calendário para ver os compromissos. Dê duplo-clique para criar.</p>
            ) : selectedAppointments.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-sm text-muted-foreground mb-3">Nenhum compromisso neste dia</p>
                <Button variant="outline" size="sm" onClick={() => openNewForDate(selectedDate)}>
                  <Plus className="h-3 w-3 mr-1" />Criar
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedAppointments.map(apt => (
                  <div key={apt.id} className="p-3 rounded-lg border space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="font-medium text-sm">{apt.title}</div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => openEdit(apt)}>
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => handleDelete(apt.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {new Date(apt.start_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                      {" - "}
                      {new Date(apt.end_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                    </div>
                    {apt.location && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />{apt.location}
                      </div>
                    )}
                    <div className="flex gap-1">
                      <Badge variant="outline" className="text-[10px]">{typeLabels[apt.type] || apt.type}</Badge>
                      <Badge className={cn("text-[10px]", statusColors[apt.status])}>{apt.status}</Badge>
                    </div>
                    {apt.description && <p className="text-xs text-muted-foreground">{apt.description}</p>}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CRMAgenda;
