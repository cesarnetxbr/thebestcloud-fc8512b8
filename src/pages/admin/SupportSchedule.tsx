import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { CalendarDays, Plus, Trash2, Clock, User, Pencil } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const statusColors: Record<string, string> = {
  disponivel: "bg-green-100 text-green-800",
  reservado: "bg-blue-100 text-blue-800",
  cancelado: "bg-gray-100 text-gray-800",
};

const statusLabels: Record<string, string> = {
  disponivel: "Disponível",
  reservado: "Reservado",
  cancelado: "Cancelado",
};

const SupportSchedule = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [filterDate, setFilterDate] = useState("");
  const [form, setForm] = useState({
    slot_date: "",
    start_time: "",
    end_time: "",
    notes: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ slot_date: "", start_time: "", end_time: "", notes: "" });

  const { data: profile } = useQuery({
    queryKey: ["profile-me", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("user_id", user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const { data: slots = [], isLoading } = useQuery({
    queryKey: ["support-slots", filterDate],
    queryFn: async () => {
      let q = supabase.from("support_schedule_slots").select("*").order("slot_date", { ascending: true }).order("start_time", { ascending: true });
      if (filterDate) q = q.eq("slot_date", filterDate);
      const { data, error } = await q;
      if (error) throw error;
      return data || [];
    },
  });

  const createSlot = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Não autenticado");
      if (form.start_time >= form.end_time) throw new Error("Horário final deve ser maior que o inicial");
      const { error } = await supabase.from("support_schedule_slots").insert({
        operator_id: user.id,
        operator_name: profile?.full_name || user.email || "Operador",
        slot_date: form.slot_date,
        start_time: form.start_time,
        end_time: form.end_time,
        notes: form.notes || null,
        status: "disponivel",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Horário cadastrado!" });
      setOpen(false);
      setForm({ slot_date: "", start_time: "", end_time: "", notes: "" });
      qc.invalidateQueries({ queryKey: ["support-slots"] });
    },
    onError: (e: any) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const deleteSlot = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("support_schedule_slots").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Horário removido" });
      qc.invalidateQueries({ queryKey: ["support-slots"] });
    },
  });

  const updateSlot = useMutation({
    mutationFn: async () => {
      if (!editingId) throw new Error("Slot inválido");
      if (editForm.start_time >= editForm.end_time) throw new Error("Horário final deve ser maior que o inicial");
      const { error } = await supabase.from("support_schedule_slots").update({
        slot_date: editForm.slot_date,
        start_time: editForm.start_time,
        end_time: editForm.end_time,
        notes: editForm.notes || null,
      }).eq("id", editingId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Horário atualizado!" });
      setEditingId(null);
      qc.invalidateQueries({ queryKey: ["support-slots"] });
    },
    onError: (e: any) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const startEdit = (s: any) => {
    setEditForm({
      slot_date: s.slot_date,
      start_time: s.start_time?.slice(0, 5) || "",
      end_time: s.end_time?.slice(0, 5) || "",
      notes: s.notes || "",
    });
    setEditingId(s.id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <CalendarDays className="h-7 w-7 text-primary" />
            Agenda Técnica de Suporte
          </h1>
          <p className="text-muted-foreground mt-1">
            Disponibilize dias e horários vagos para atendimento de novos testes grátis
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Horário
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Disponibilizar Horário</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Data *</label>
                <Input
                  type="date"
                  value={form.slot_date}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setForm({ ...form, slot_date: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium mb-1 block">Início *</label>
                  <Input type="time" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Fim *</label>
                  <Input type="time" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Observações</label>
                <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Opcional" />
              </div>
              <Button
                className="w-full"
                onClick={() => createSlot.mutate()}
                disabled={!form.slot_date || !form.start_time || !form.end_time || createSlot.isPending}
              >
                Cadastrar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Horários Cadastrados</span>
            <Input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-48"
              placeholder="Filtrar por data"
            />
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center text-muted-foreground py-8">Carregando...</p>
          ) : slots.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhum horário cadastrado{filterDate ? " para esta data" : ""}.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Horário</TableHead>
                  <TableHead>Operador</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reservado por</TableHead>
                  <TableHead>Observações</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {slots.map((s: any) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">
                      {format(new Date(s.slot_date + "T00:00:00"), "dd/MM/yyyy (EEE)", { locale: ptBR })}
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {s.start_time?.slice(0, 5)} - {s.end_time?.slice(0, 5)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1 text-sm">
                        <User className="h-3 w-3" />
                        {s.operator_name}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[s.status] || ""}>{statusLabels[s.status] || s.status}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {s.reserved_by_name ? (
                        <div>
                          <div>{s.reserved_by_name}</div>
                          <div className="text-xs text-muted-foreground">{s.reserved_by_email}</div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{s.notes || "—"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEdit(s)}
                          title="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (confirm("Remover este horário?")) deleteSlot.mutate(s.id);
                          }}
                          title="Remover"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SupportSchedule;
