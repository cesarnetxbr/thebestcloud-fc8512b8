import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Plus, Search, Eye, Trash2, Building2, Mail, Phone } from "lucide-react";

const SOURCE_OPTIONS = [
  { value: "manual", label: "Manual" },
  { value: "site", label: "Site" },
  { value: "indicacao", label: "Indicação" },
  { value: "google", label: "Google" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "evento", label: "Evento" },
];

const STATUS_OPTIONS = [
  { value: "novo", label: "Novo", color: "bg-blue-500" },
  { value: "qualificado", label: "Qualificado", color: "bg-indigo-500" },
  { value: "negociacao", label: "Em Negociação", color: "bg-amber-500" },
  { value: "ganho", label: "Ganho", color: "bg-green-500" },
  { value: "perdido", label: "Perdido", color: "bg-red-500" },
];

const CRMLeads = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [detailLead, setDetailLead] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [form, setForm] = useState({
    name: "", email: "", phone: "", company: "", source: "manual", notes: "",
  });

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ["crm_leads"],
    queryFn: async () => {
      const { data, error } = await supabase.from("crm_leads").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const createLead = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("crm_leads").insert({
        name: form.name,
        email: form.email || null,
        phone: form.phone || null,
        company: form.company || null,
        source: form.source,
        notes: form.notes || null,
        created_by: user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm_leads"] });
      setCreateOpen(false);
      setForm({ name: "", email: "", phone: "", company: "", source: "manual", notes: "" });
      toast.success("Lead criado com sucesso!");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const updateLeadStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("crm_leads").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm_leads"] });
      toast.success("Status atualizado!");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteLead = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("crm_leads").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm_leads"] });
      setDetailLead(null);
      toast.success("Lead removido!");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const filtered = leads.filter((l: any) => {
    const matchSearch = !search || l.name.toLowerCase().includes(search.toLowerCase()) || l.company?.toLowerCase().includes(search.toLowerCase()) || l.email?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || l.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const statusBadge = (status: string) => {
    const s = STATUS_OPTIONS.find((o) => o.value === status);
    return <Badge variant="secondary">{s?.label || status}</Badge>;
  };

  const sourceLabel = (source: string) => SOURCE_OPTIONS.find((o) => o.value === source)?.label || source;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Leads</h2>
          <p className="text-muted-foreground">Gerencie seus contatos e oportunidades</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> Novo Lead
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar leads..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {STATUS_OPTIONS.map((s) => (
              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {STATUS_OPTIONS.map((s) => (
          <Card key={s.value} className="cursor-pointer hover:shadow-md" onClick={() => setFilterStatus(s.value)}>
            <CardContent className="p-3 text-center">
              <div className="text-lg font-bold">{leads.filter((l: any) => l.status === s.value).length}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Fonte</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((lead: any) => (
                <TableRow key={lead.id}>
                  <TableCell className="font-medium">{lead.name}</TableCell>
                  <TableCell>{lead.company || "—"}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
                      {lead.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{lead.email}</span>}
                      {lead.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{lead.phone}</span>}
                    </div>
                  </TableCell>
                  <TableCell><Badge variant="outline" className="text-xs">{sourceLabel(lead.source)}</Badge></TableCell>
                  <TableCell>{statusBadge(lead.status)}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{new Date(lead.created_at).toLocaleDateString("pt-BR")}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => setDetailLead(lead)}><Eye className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">Nenhum lead encontrado</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Novo Lead</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nome *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>E-mail</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div>
                <Label>Telefone</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Empresa</Label>
                <Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
              </div>
              <div>
                <Label>Fonte</Label>
                <Select value={form.source} onValueChange={(v) => setForm({ ...form, source: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SOURCE_OPTIONS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Observações</Label>
              <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
            <Button className="w-full" onClick={() => createLead.mutate()} disabled={!form.name || createLead.isPending}>
              Criar Lead
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Detail dialog */}
      <Dialog open={!!detailLead} onOpenChange={() => setDetailLead(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{detailLead?.name}</DialogTitle></DialogHeader>
          {detailLead && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                {detailLead.company && <div><span className="text-muted-foreground">Empresa:</span><p className="font-semibold">{detailLead.company}</p></div>}
                {detailLead.email && <div><span className="text-muted-foreground">E-mail:</span><p className="font-semibold">{detailLead.email}</p></div>}
                {detailLead.phone && <div><span className="text-muted-foreground">Telefone:</span><p className="font-semibold">{detailLead.phone}</p></div>}
                <div><span className="text-muted-foreground">Fonte:</span><p className="font-semibold">{sourceLabel(detailLead.source)}</p></div>
              </div>
              {detailLead.notes && <div><span className="text-sm text-muted-foreground">Notas:</span><p className="text-sm">{detailLead.notes}</p></div>}
              <div>
                <Label>Status</Label>
                <Select value={detailLead.status} onValueChange={(v) => {
                  updateLeadStatus.mutate({ id: detailLead.id, status: v });
                  setDetailLead({ ...detailLead, status: v });
                }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Button variant="destructive" size="sm" onClick={() => deleteLead.mutate(detailLead.id)}>
                <Trash2 className="h-4 w-4 mr-2" /> Excluir Lead
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CRMLeads;
