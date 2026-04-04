import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

const formatCurrency = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
const formatDate = (d: string | null) => d ? new Date(d).toLocaleDateString("pt-BR") : "—";

const statusColors: Record<string, string> = {
  pendente: "bg-yellow-100 text-yellow-800",
  pago: "bg-green-100 text-green-800",
  cancelado: "bg-gray-100 text-gray-500",
};

const Commissions = () => {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ description: "", beneficiary: "", amount: "", percentage: "", date: "", status: "pendente", notes: "" });

  const fetchData = async () => {
    const { data } = await supabase.from("financial_commissions").select("*").order("date", { ascending: false });
    setRows(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async () => {
    if (!form.description || !form.beneficiary || !form.amount) { toast.error("Preencha campos obrigatórios"); return; }
    const { error } = await supabase.from("financial_commissions").insert({
      description: form.description,
      beneficiary: form.beneficiary,
      amount: parseFloat(form.amount),
      percentage: form.percentage ? parseFloat(form.percentage) : 0,
      date: form.date || new Date().toISOString().split("T")[0],
      status: form.status,
      notes: form.notes || null,
    });
    if (error) { toast.error("Erro ao salvar"); return; }
    toast.success("Comissão adicionada!");
    setDialogOpen(false);
    setForm({ description: "", beneficiary: "", amount: "", percentage: "", date: "", status: "pendente", notes: "" });
    fetchData();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("financial_commissions").delete().eq("id", id);
    toast.success("Removida!");
    fetchData();
  };

  const filtered = rows.filter(r =>
    r.description.toLowerCase().includes(search.toLowerCase()) ||
    r.beneficiary.toLowerCase().includes(search.toLowerCase())
  );
  const total = filtered.reduce((s, r) => s + Number(r.amount), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar comissão..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-orange-600">Total: {formatCurrency(total)}</span>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" /> Nova Comissão</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Nova Comissão</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div><Label>Descrição *</Label><Input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
                <div><Label>Beneficiário *</Label><Input value={form.beneficiary} onChange={e => setForm({ ...form, beneficiary: e.target.value })} /></div>
                <div className="grid grid-cols-3 gap-4">
                  <div><Label>Valor (R$) *</Label><Input type="number" step="0.01" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} /></div>
                  <div><Label>Percentual (%)</Label><Input type="number" step="0.1" value={form.percentage} onChange={e => setForm({ ...form, percentage: e.target.value })} /></div>
                  <div><Label>Data</Label><Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
                </div>
                <div>
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pendente">Pendente</SelectItem>
                      <SelectItem value="pago">Pago</SelectItem>
                      <SelectItem value="cancelado">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Observações</Label><Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
                <Button className="w-full" onClick={handleSubmit}>Salvar</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="shadow-soft">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descrição</TableHead>
                <TableHead>Beneficiário</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="text-right">%</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto" /></TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Nenhuma comissão encontrada.</TableCell></TableRow>
              ) : filtered.map(r => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.description}</TableCell>
                  <TableCell>{r.beneficiary}</TableCell>
                  <TableCell>{formatDate(r.date)}</TableCell>
                  <TableCell className="text-right">{Number(r.percentage) > 0 ? `${r.percentage}%` : "—"}</TableCell>
                  <TableCell className="text-right font-medium text-orange-600">{formatCurrency(Number(r.amount))}</TableCell>
                  <TableCell><Badge className={statusColors[r.status]} variant="secondary">{r.status}</Badge></TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(r.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Commissions;
