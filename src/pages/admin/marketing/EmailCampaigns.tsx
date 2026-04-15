import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Mail, Send, Clock, CheckCircle, XCircle, BarChart3 } from "lucide-react";
import { toast } from "sonner";

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  draft: { label: "Rascunho", variant: "secondary" },
  scheduled: { label: "Agendada", variant: "outline" },
  sending: { label: "Enviando", variant: "default" },
  sent: { label: "Enviada", variant: "default" },
  cancelled: { label: "Cancelada", variant: "destructive" },
};

const EmailCampaigns = () => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [listId, setListId] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const queryClient = useQueryClient();

  const { data: campaigns, isLoading } = useQuery({
    queryKey: ["email-campaigns"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("email_marketing_campaigns")
        .select("*, email_marketing_templates(name), email_marketing_lists(name, contact_count)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: templates } = useQuery({
    queryKey: ["email-templates"],
    queryFn: async () => {
      const { data, error } = await supabase.from("email_marketing_templates").select("id, name").eq("is_active", true);
      if (error) throw error;
      return data;
    },
  });

  const { data: lists } = useQuery({
    queryKey: ["email-lists"],
    queryFn: async () => {
      const { data, error } = await supabase.from("email_marketing_lists").select("id, name, contact_count");
      if (error) throw error;
      return data;
    },
  });

  const createCampaign = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("email_marketing_campaigns").insert({
        name,
        subject,
        template_id: templateId || null,
        list_id: listId || null,
        scheduled_at: scheduledAt ? new Date(scheduledAt).toISOString() : null,
        status: scheduledAt ? "scheduled" : "draft",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-campaigns"] });
      toast.success("Campanha criada com sucesso!");
      setOpen(false);
      setName("");
      setSubject("");
      setTemplateId("");
      setListId("");
      setScheduledAt("");
    },
    onError: () => toast.error("Erro ao criar campanha"),
  });

  const stats = {
    total: campaigns?.length || 0,
    draft: campaigns?.filter(c => c.status === "draft").length || 0,
    sent: campaigns?.filter(c => c.status === "sent").length || 0,
    scheduled: campaigns?.filter(c => c.status === "scheduled").length || 0,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Campanhas de E-mail</h2>
          <p className="text-muted-foreground">Gerencie e acompanhe suas campanhas de e-mail marketing</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> Nova Campanha</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Campanha</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Nome da Campanha</Label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Black Friday 2026" />
              </div>
              <div>
                <Label>Assunto do E-mail</Label>
                <Input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Ex: Ofertas imperdíveis!" />
              </div>
              <div>
                <Label>Template</Label>
                <Select value={templateId} onValueChange={setTemplateId}>
                  <SelectTrigger><SelectValue placeholder="Selecione um template" /></SelectTrigger>
                  <SelectContent>
                    {templates?.map(t => (
                      <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Lista de Contatos</Label>
                <Select value={listId} onValueChange={setListId}>
                  <SelectTrigger><SelectValue placeholder="Selecione uma lista" /></SelectTrigger>
                  <SelectContent>
                    {lists?.map(l => (
                      <SelectItem key={l.id} value={l.id}>{l.name} ({l.contact_count} contatos)</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Agendar Disparo (opcional)</Label>
                <Input type="datetime-local" value={scheduledAt} onChange={e => setScheduledAt(e.target.value)} />
                {scheduledAt && <p className="text-xs text-muted-foreground mt-1">A campanha será marcada como "Agendada"</p>}
              </div>
              <Button onClick={() => createCampaign.mutate()} disabled={!name || !subject} className="w-full">
                {scheduledAt ? "Agendar Campanha" : "Criar Campanha"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><Mail className="h-8 w-8 text-primary" /><div><p className="text-2xl font-bold">{stats.total}</p><p className="text-xs text-muted-foreground">Total</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><Clock className="h-8 w-8 text-muted-foreground" /><div><p className="text-2xl font-bold">{stats.draft}</p><p className="text-xs text-muted-foreground">Rascunhos</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><Send className="h-8 w-8 text-accent" /><div><p className="text-2xl font-bold">{stats.scheduled}</p><p className="text-xs text-muted-foreground">Agendadas</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><CheckCircle className="h-8 w-8 text-green-600" /><div><p className="text-2xl font-bold">{stats.sent}</p><p className="text-xs text-muted-foreground">Enviadas</p></div></div></CardContent></Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campanha</TableHead>
                <TableHead>Assunto</TableHead>
                <TableHead>Lista</TableHead>
                <TableHead>Template</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Criada em</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Carregando...</TableCell></TableRow>
              ) : !campaigns?.length ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Nenhuma campanha criada</TableCell></TableRow>
              ) : campaigns.map(c => {
                const st = statusConfig[c.status] || statusConfig.draft;
                return (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell>{c.subject}</TableCell>
                    <TableCell>{(c as any).email_marketing_lists?.name || "—"}</TableCell>
                    <TableCell>{(c as any).email_marketing_templates?.name || "—"}</TableCell>
                    <TableCell><Badge variant={st.variant}>{st.label}</Badge></TableCell>
                    <TableCell>{new Date(c.created_at).toLocaleDateString("pt-BR")}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="border-dashed border-2">
        <CardContent className="py-8 text-center">
          <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
          <h3 className="font-semibold text-foreground mb-1">Integração com Provedor Externo</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Para enviar campanhas em massa, conecte um provedor de e-mail marketing (Brevo, SendGrid, Mailchimp).
            A infraestrutura está pronta para integração futura.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailCampaigns;
