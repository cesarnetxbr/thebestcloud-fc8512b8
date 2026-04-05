import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";

const severityColors: Record<string, string> = {
  baixa: "bg-green-100 text-green-800",
  media: "bg-yellow-100 text-yellow-800",
  alta: "bg-orange-100 text-orange-800",
  critica: "bg-red-100 text-red-800",
};

const LgpdIncidents = () => {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", severity: "media",
    affected_data: "", affected_count: 0,
    notified_anpd: false, resolution: "",
  });

  const { data: incidents, isLoading } = useQuery({
    queryKey: ["lgpd-incidents"],
    queryFn: async () => {
      const { data, error } = await supabase.from("lgpd_incidents").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("lgpd_incidents").insert(form as any);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["lgpd-incidents"] }); setOpen(false); toast({ title: "Incidente registrado" }); },
    onError: (e: any) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("lgpd_incidents").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["lgpd-incidents"] }); toast({ title: "Incidente removido" }); },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Incidentes de Segurança</h2>
          <p className="text-muted-foreground text-sm">Registro e acompanhamento de incidentes envolvendo dados pessoais</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Registrar Incidente</Button></DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Novo Incidente</DialogTitle></DialogHeader>
            <form onSubmit={e => { e.preventDefault(); create.mutate(); }} className="space-y-4">
              <div><Label>Título *</Label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required /></div>
              <div><Label>Descrição *</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required rows={3} /></div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label>Severidade</Label>
                  <Select value={form.severity} onValueChange={v => setForm(f => ({ ...f, severity: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="baixa">Baixa</SelectItem>
                      <SelectItem value="media">Média</SelectItem>
                      <SelectItem value="alta">Alta</SelectItem>
                      <SelectItem value="critica">Crítica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Titulares Afetados</Label><Input type="number" value={form.affected_count} onChange={e => setForm(f => ({ ...f, affected_count: parseInt(e.target.value) || 0 }))} /></div>
              </div>
              <div><Label>Dados Afetados</Label><Input value={form.affected_data} onChange={e => setForm(f => ({ ...f, affected_data: e.target.value }))} placeholder="Ex: Nomes, e-mails de clientes" /></div>
              <div className="flex items-center gap-2">
                <Switch checked={form.notified_anpd} onCheckedChange={v => setForm(f => ({ ...f, notified_anpd: v }))} />
                <Label>ANPD notificada</Label>
              </div>
              <div><Label>Resolução</Label><Textarea value={form.resolution} onChange={e => setForm(f => ({ ...f, resolution: e.target.value }))} rows={2} /></div>
              <Button type="submit" disabled={create.isPending} className="w-full">{create.isPending ? "Salvando..." : "Registrar"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Severidade</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>ANPD</TableHead>
              <TableHead>Data</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Carregando...</TableCell></TableRow>
            ) : !incidents?.length ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Nenhum incidente registrado</TableCell></TableRow>
            ) : incidents.map((i: any) => (
              <TableRow key={i.id}>
                <TableCell className="font-medium">{i.title}</TableCell>
                <TableCell><Badge className={severityColors[i.severity] || ""}>{i.severity}</Badge></TableCell>
                <TableCell><Badge variant="outline">{i.status}</Badge></TableCell>
                <TableCell>{i.notified_anpd ? "✅" : "❌"}</TableCell>
                <TableCell className="text-sm">{format(new Date(i.created_at), "dd/MM/yyyy")}</TableCell>
                <TableCell><Button size="icon" variant="ghost" onClick={() => remove.mutate(i.id)}><Trash2 className="h-4 w-4" /></Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default LgpdIncidents;
