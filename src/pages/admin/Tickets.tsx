import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { Plus, MessageSquare, Eye, Search } from "lucide-react";
import { format } from "date-fns";

const statusColors: Record<string, string> = {
  aberto: "bg-blue-100 text-blue-800",
  em_andamento: "bg-yellow-100 text-yellow-800",
  aguardando_cliente: "bg-orange-100 text-orange-800",
  resolvido: "bg-green-100 text-green-800",
  fechado: "bg-gray-100 text-gray-800",
};

const priorityColors: Record<string, string> = {
  baixa: "bg-gray-100 text-gray-700",
  media: "bg-blue-100 text-blue-700",
  alta: "bg-orange-100 text-orange-700",
  urgente: "bg-red-100 text-red-700",
};

const Tickets = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [detailTicket, setDetailTicket] = useState<any>(null);
  const [replyMsg, setReplyMsg] = useState("");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [form, setForm] = useState({ subject: "", description: "", priority: "media", category_id: "", customer_id: "" });

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ["tickets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tickets")
        .select("*, ticket_categories(name, color), customers(name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["ticket_categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("ticket_categories").select("*").eq("is_active", true);
      if (error) throw error;
      return data;
    },
  });

  const { data: customers = [] } = useQuery({
    queryKey: ["customers_list"],
    queryFn: async () => {
      const { data, error } = await supabase.from("customers").select("id, name").order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: messages = [], refetch: refetchMessages } = useQuery({
    queryKey: ["ticket_messages", detailTicket?.id],
    queryFn: async () => {
      if (!detailTicket) return [];
      const { data, error } = await supabase
        .from("ticket_messages")
        .select("*")
        .eq("ticket_id", detailTicket.id)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!detailTicket,
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ["all_profiles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("user_id, full_name");
      if (error) return [];
      return data;
    },
  });

  const createTicket = useMutation({
    mutationFn: async () => {
      const num = `CHM-${Date.now().toString().slice(-6)}`;
      const { error } = await supabase.from("tickets").insert({
        ticket_number: num,
        subject: form.subject,
        description: form.description,
        priority: form.priority,
        category_id: form.category_id || null,
        customer_id: form.customer_id || null,
        created_by: user!.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      setOpen(false);
      setForm({ subject: "", description: "", priority: "media", category_id: "", customer_id: "" });
      toast({ title: "Chamado criado com sucesso" });
    },
    onError: (e: any) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const updates: any = { status };
      if (status === "fechado") updates.closed_at = new Date().toISOString();
      const { error } = await supabase.from("tickets").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      if (detailTicket) setDetailTicket((prev: any) => prev);
      toast({ title: "Status atualizado" });
    },
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
      toast({ title: "Mensagem enviada" });
    },
  });

  const getProfileName = (uid: string) => {
    const p = profiles.find((pr: any) => pr.user_id === uid);
    return p?.full_name || uid?.slice(0, 8);
  };

  const filtered = tickets.filter((t: any) => {
    const matchSearch = t.subject.toLowerCase().includes(search.toLowerCase()) || t.ticket_number.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || t.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Chamados</h2>
          <p className="text-muted-foreground">Gestão de tickets de suporte</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Novo Chamado</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Novo Chamado</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <Input placeholder="Assunto" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} />
              <Textarea placeholder="Descrição" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              <Select value={form.priority} onValueChange={v => setForm({ ...form, priority: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="baixa">Baixa</SelectItem>
                  <SelectItem value="media">Média</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="urgente">Urgente</SelectItem>
                </SelectContent>
              </Select>
              <Select value={form.category_id} onValueChange={v => setForm({ ...form, category_id: v })}>
                <SelectTrigger><SelectValue placeholder="Categoria" /></SelectTrigger>
                <SelectContent>
                  {categories.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={form.customer_id} onValueChange={v => setForm({ ...form, customer_id: v })}>
                <SelectTrigger><SelectValue placeholder="Cliente (opcional)" /></SelectTrigger>
                <SelectContent>
                  {customers.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button onClick={() => createTicket.mutate()} disabled={!form.subject} className="w-full">Criar Chamado</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar chamados..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="aberto">Aberto</SelectItem>
            <SelectItem value="em_andamento">Em Andamento</SelectItem>
            <SelectItem value="aguardando_cliente">Aguardando Cliente</SelectItem>
            <SelectItem value="resolvido">Resolvido</SelectItem>
            <SelectItem value="fechado">Fechado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nº</TableHead>
                <TableHead>Assunto</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Prioridade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((t: any) => (
                <TableRow key={t.id}>
                  <TableCell className="font-mono text-sm">{t.ticket_number}</TableCell>
                  <TableCell className="font-medium">{t.subject}</TableCell>
                  <TableCell>{t.customers?.name || "—"}</TableCell>
                  <TableCell>
                    {t.ticket_categories ? (
                      <Badge variant="outline" style={{ borderColor: t.ticket_categories.color }}>{t.ticket_categories.name}</Badge>
                    ) : "—"}
                  </TableCell>
                  <TableCell><span className={`px-2 py-1 rounded text-xs font-medium ${priorityColors[t.priority]}`}>{t.priority}</span></TableCell>
                  <TableCell><span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[t.status]}`}>{t.status.replace("_", " ")}</span></TableCell>
                  <TableCell className="text-sm">{format(new Date(t.created_at), "dd/MM/yyyy")}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => setDetailTicket(t)}><Eye className="h-4 w-4" /></Button>
                      <Select onValueChange={v => updateStatus.mutate({ id: t.id, status: v })}>
                        <SelectTrigger className="w-auto h-8 text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="aberto">Aberto</SelectItem>
                          <SelectItem value="em_andamento">Em Andamento</SelectItem>
                          <SelectItem value="aguardando_cliente">Aguardando</SelectItem>
                          <SelectItem value="resolvido">Resolvido</SelectItem>
                          <SelectItem value="fechado">Fechado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!detailTicket} onOpenChange={o => !o && setDetailTicket(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              {detailTicket?.ticket_number} — {detailTicket?.subject}
            </DialogTitle>
          </DialogHeader>
          {detailTicket && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><strong>Status:</strong> <span className={`px-2 py-1 rounded text-xs ${statusColors[detailTicket.status]}`}>{detailTicket.status}</span></div>
                <div><strong>Prioridade:</strong> <span className={`px-2 py-1 rounded text-xs ${priorityColors[detailTicket.priority]}`}>{detailTicket.priority}</span></div>
                <div><strong>Cliente:</strong> {detailTicket.customers?.name || "—"}</div>
                <div><strong>Categoria:</strong> {detailTicket.ticket_categories?.name || "—"}</div>
              </div>
              {detailTicket.description && <p className="text-sm bg-muted p-3 rounded">{detailTicket.description}</p>}

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Mensagens</h4>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {messages.map((m: any) => (
                    <div key={m.id} className={`p-3 rounded-lg text-sm ${m.sender_id === user?.id ? "bg-primary/10 ml-8" : "bg-muted mr-8"}`}>
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span className="font-medium">{getProfileName(m.sender_id)}</span>
                        <span>{format(new Date(m.created_at), "dd/MM HH:mm")}</span>
                      </div>
                      <p>{m.message}</p>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 mt-3">
                  <Textarea placeholder="Responder..." value={replyMsg} onChange={e => setReplyMsg(e.target.value)} className="flex-1" rows={2} />
                  <Button onClick={() => sendMessage.mutate()} disabled={!replyMsg}>Enviar</Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Tickets;
