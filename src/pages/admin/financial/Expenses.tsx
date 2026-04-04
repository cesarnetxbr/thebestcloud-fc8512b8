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
  atrasado: "bg-red-100 text-red-800",
  cancelado: "bg-gray-100 text-gray-500",
};

const Expenses = () => {
  const [rows, setRows] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ description: "", amount: "", date: "", due_date: "", category_id: "", status: "pendente", recurrence: "none", notes: "" });

  const fetchData = async () => {
    const [{ data: txns }, { data: cats }] = await Promise.all([
      supabase.from("financial_transactions").select("*, financial_categories(name)").eq("type", "despesa").order("date", { ascending: false }),
      supabase.from("financial_categories").select("*").eq("type", "despesa").eq("is_active", true),
    ]);
    setRows(txns || []);
    setCategories(cats || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async () => {
    if (!form.description || !form.amount) { toast.error("Preencha descrição e valor"); return; }
    const { error } = await supabase.from("financial_transactions").insert({
      type: "despesa",
      description: form.description,
      amount: parseFloat(form.amount),
      date: form.date || new Date().toISOString().split("T")[0],
      due_date: form.due_date || null,
      category_id: form.category_id || null,
      status: form.status,
      recurrence: form.recurrence,
      notes: form.notes || null,
    });
    if (error) { toast.error("Erro ao salvar"); return; }
    toast.success("Despesa adicionada!");
    setDialogOpen(false);
    setForm({ description: "", amount: "", date: "", due_date: "", category_id: "", status: "pendente", recurrence: "none", notes: "" });
    fetchData();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("financial_transactions").delete().eq("id", id);
    toast.success("Removida!");
    fetchData();
  };

  const filtered = rows.filter(r => r.description.toLowerCase().includes(search.toLowerCase()));
  const total = filtered.reduce((s, r) => s + Number(r.amount), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar despesa..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-red-600">Total: {formatCurrency(total)}</span>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" /> Nova Despesa</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Nova Despesa</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div><Label>Descrição *</Label><Input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Valor (R$) *</Label><Input type="number" step="0.01" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} /></div>
                  <div><Label>Data</Label><Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Vencimento</Label><Input type="date" value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })} /></div>
                  <div>
                    <Label>Status</Label>
                    <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pendente">Pendente</SelectItem>
                        <SelectItem value="pago">Pago</SelectItem>
                        <SelectItem value="atrasado">Atrasado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Categoria</Label>
                    <Select value={form.category_id} onValueChange={v => setForm({ ...form, category_id: v })}>
                      <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Recorrência</Label>
                    <Select value={form.recurrence} onValueChange={v => setForm({ ...form, recurrence: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Nenhuma</SelectItem>
                        <SelectItem value="monthly">Mensal</SelectItem>
                        <SelectItem value="quarterly">Trimestral</SelectItem>
                        <SelectItem value="yearly">Anual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
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
                <TableHead>Categoria</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Recorrência</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={8} className="text-center py-8"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto" /></TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Nenhuma despesa encontrada.</TableCell></TableRow>
              ) : filtered.map(r => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.description}</TableCell>
                  <TableCell>{(r.financial_categories as any)?.name || "—"}</TableCell>
                  <TableCell>{formatDate(r.date)}</TableCell>
                  <TableCell>{formatDate(r.due_date)}</TableCell>
                  <TableCell>{r.recurrence === "none" ? "—" : r.recurrence === "monthly" ? "Mensal" : r.recurrence === "quarterly" ? "Trimestral" : "Anual"}</TableCell>
                  <TableCell className="text-right font-medium text-red-600">{formatCurrency(Number(r.amount))}</TableCell>
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

export default Expenses;
