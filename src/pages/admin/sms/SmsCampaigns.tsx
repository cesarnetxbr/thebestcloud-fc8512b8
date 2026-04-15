import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, MessageSquare, Send, Clock, CheckCircle, BarChart3 } from "lucide-react";
import { toast } from "sonner";

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  draft: { label: "Rascunho", variant: "secondary" },
  scheduled: { label: "Agendada", variant: "outline" },
  sending: { label: "Enviando", variant: "default" },
  sent: { label: "Enviada", variant: "default" },
  cancelled: { label: "Cancelada", variant: "destructive" },
};

const SmsCampaigns = () => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [templateId, setTemplateId] = useState("");
  const queryClient = useQueryClient();

  const { data: campaigns, isLoading } = useQuery({
    queryKey: ["sms-campaigns"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sms_marketing_campaigns")
        .select("*, sms_marketing_templates(name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: templates } = useQuery({
    queryKey: ["sms-templates-list"],
    queryFn: async () => {
      const { data, error } = await supabase.from("sms_marketing_templates").select("id, name, content").eq("is_active", true);
      if (error) throw error;
      return data;
    },
  });

  const createCampaign = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("sms_marketing_campaigns").insert({
        name,
        message,
        template_id: templateId || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sms-campaigns"] });
      toast.success("Campanha SMS criada!");
      setOpen(false);
      setName("");
      setMessage("");
      setTemplateId("");
    },
    onError: () => toast.error("Erro ao criar campanha"),
  });

  const handleTemplateSelect = (id: string) => {
    setTemplateId(id);
    const tpl = templates?.find(t => t.id === id);
    if (tpl) setMessage(tpl.content);
  };

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
          <h2 className="text-2xl font-bold text-foreground">Campanhas SMS</h2>
          <p className="text-muted-foreground">Gerencie campanhas de SMS marketing</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> Nova Campanha</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nova Campanha SMS</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Nome</Label><Input value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Promoção Verão" /></div>
              <div>
                <Label>Template (opcional)</Label>
                <Select value={templateId} onValueChange={handleTemplateSelect}>
                  <SelectTrigger><SelectValue placeholder="Usar template" /></SelectTrigger>
                  <SelectContent>
                    {templates?.map(t => (<SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <div className="flex justify-between">
                  <Label>Mensagem</Label>
                  <span className={`text-xs ${message.length > 160 ? "text-destructive" : "text-muted-foreground"}`}>{message.length}/160</span>
                </div>
                <Textarea value={message} onChange={e => setMessage(e.target.value)} rows={4} placeholder="Digite a mensagem SMS..." />
              </div>
              <Button onClick={() => createCampaign.mutate()} disabled={!name || !message} className="w-full">Criar Campanha</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><MessageSquare className="h-8 w-8 text-primary" /><div><p className="text-2xl font-bold">{stats.total}</p><p className="text-xs text-muted-foreground">Total</p></div></div></CardContent></Card>
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
                <TableHead>Mensagem</TableHead>
                <TableHead>Template</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Criada em</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Carregando...</TableCell></TableRow>
              ) : !campaigns?.length ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Nenhuma campanha SMS criada</TableCell></TableRow>
              ) : campaigns.map(c => {
                const st = statusConfig[c.status] || statusConfig.draft;
                return (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{c.message}</TableCell>
                    <TableCell>{(c as any).sms_marketing_templates?.name || "—"}</TableCell>
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
          <h3 className="font-semibold text-foreground mb-1">Integração com Provedor SMS</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Para enviar campanhas SMS, conecte um provedor (Twilio, Vonage, Zenvia).
            A infraestrutura está pronta para integração.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SmsCampaigns;
