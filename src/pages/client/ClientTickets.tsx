import { useState } from "react";
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
import { Plus, MessageSquare } from "lucide-react";
import { format } from "date-fns";

const statusLabels: Record<string, string> = {
  aberto: "Aberto", em_andamento: "Em Andamento", aguardando_cliente: "Aguardando", resolvido: "Resolvido", fechado: "Fechado",
};

const ClientTickets = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [detailTicket, setDetailTicket] = useState<any>(null);
  const [replyMsg, setReplyMsg] = useState("");
  const [form, setForm] = useState({ subject: "", description: "", priority: "media", category_id: "" });

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
      const { error } = await supabase.from("tickets").insert({
        ticket_number: num,
        subject: form.subject,
        description: form.description,
        priority: form.priority,
        category_id: form.category_id || null,
        created_by: user!.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client_tickets"] });
      setOpen(false);
      setForm({ subject: "", description: "", priority: "media", category_id: "" });
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Meus Chamados</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Abrir Chamado</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Novo Chamado</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <Input placeholder="Assunto" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} />
              <Textarea placeholder="Descreva seu problema ou solicitação..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={4} />
              <Select value={form.category_id} onValueChange={v => setForm({ ...form, category_id: v })}>
                <SelectTrigger><SelectValue placeholder="Categoria" /></SelectTrigger>
                <SelectContent>
                  {categories.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={form.priority} onValueChange={v => setForm({ ...form, priority: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="baixa">Baixa</SelectItem>
                  <SelectItem value="media">Média</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="urgente">Urgente</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={() => createTicket.mutate()} disabled={!form.subject} className="w-full">Abrir Chamado</Button>
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
              {detailTicket.description && <p className="text-sm bg-muted p-3 rounded">{detailTicket.description}</p>}
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
