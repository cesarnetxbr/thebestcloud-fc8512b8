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
import { Plus, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";

const legalBases = [
  "Consentimento", "Execução de contrato", "Obrigação legal", "Legítimo interesse",
  "Proteção da vida", "Tutela da saúde", "Proteção do crédito", "Exercício de direitos",
];

const LgpdRopa = () => {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    data_category: "", personal_data_types: "", purpose: "",
    legal_basis: "Execução de contrato", storage_location: "Lovable Cloud",
    retention_period: "5 anos", third_parties: "", is_sensitive: false,
    data_subjects: "Clientes", notes: "",
  });

  const { data: mappings, isLoading } = useQuery({
    queryKey: ["lgpd-ropa"],
    queryFn: async () => {
      const { data, error } = await supabase.from("lgpd_data_mapping").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("lgpd_data_mapping").insert(form as any);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["lgpd-ropa"] }); setOpen(false); toast({ title: "Registro criado" }); },
    onError: (e: any) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("lgpd_data_mapping").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["lgpd-ropa"] }); toast({ title: "Registro removido" }); },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Mapeamento de Dados (ROPA)</h2>
          <p className="text-muted-foreground text-sm">Registro de operações de tratamento de dados pessoais</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Novo Registro</Button></DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Nova Operação de Tratamento</DialogTitle></DialogHeader>
            <form onSubmit={e => { e.preventDefault(); create.mutate(); }} className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div><Label>Categoria de Dados *</Label><Input value={form.data_category} onChange={e => setForm(f => ({ ...f, data_category: e.target.value }))} required placeholder="Ex: Dados cadastrais" /></div>
                <div><Label>Titulares dos Dados</Label><Input value={form.data_subjects} onChange={e => setForm(f => ({ ...f, data_subjects: e.target.value }))} placeholder="Ex: Clientes, Funcionários" /></div>
              </div>
              <div><Label>Tipos de Dados Pessoais *</Label><Input value={form.personal_data_types} onChange={e => setForm(f => ({ ...f, personal_data_types: e.target.value }))} required placeholder="Ex: Nome, CPF, e-mail, telefone" /></div>
              <div><Label>Finalidade *</Label><Input value={form.purpose} onChange={e => setForm(f => ({ ...f, purpose: e.target.value }))} required placeholder="Ex: Prestação de serviço" /></div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label>Base Legal *</Label>
                  <Select value={form.legal_basis} onValueChange={v => setForm(f => ({ ...f, legal_basis: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{legalBases.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Local de Armazenamento</Label><Input value={form.storage_location} onChange={e => setForm(f => ({ ...f, storage_location: e.target.value }))} /></div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div><Label>Período de Retenção</Label><Input value={form.retention_period} onChange={e => setForm(f => ({ ...f, retention_period: e.target.value }))} /></div>
                <div><Label>Terceiros Envolvidos</Label><Input value={form.third_parties} onChange={e => setForm(f => ({ ...f, third_parties: e.target.value }))} placeholder="Ex: Provedor de nuvem" /></div>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.is_sensitive} onCheckedChange={v => setForm(f => ({ ...f, is_sensitive: v }))} />
                <Label>Dados sensíveis (Art. 11 LGPD)</Label>
              </div>
              <div><Label>Observações</Label><Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></div>
              <Button type="submit" disabled={create.isPending} className="w-full">{create.isPending ? "Salvando..." : "Salvar"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Categoria</TableHead>
              <TableHead>Finalidade</TableHead>
              <TableHead>Base Legal</TableHead>
              <TableHead>Retenção</TableHead>
              <TableHead>Sensível</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Carregando...</TableCell></TableRow>
            ) : !mappings?.length ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Nenhum registro de tratamento cadastrado</TableCell></TableRow>
            ) : mappings.map((m: any) => (
              <TableRow key={m.id}>
                <TableCell className="font-medium">{m.data_category}</TableCell>
                <TableCell>{m.purpose}</TableCell>
                <TableCell><Badge variant="outline">{m.legal_basis}</Badge></TableCell>
                <TableCell>{m.retention_period}</TableCell>
                <TableCell>{m.is_sensitive ? <Badge variant="destructive">Sim</Badge> : "Não"}</TableCell>
                <TableCell><Button size="icon" variant="ghost" onClick={() => remove.mutate(m.id)}><Trash2 className="h-4 w-4" /></Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default LgpdRopa;
