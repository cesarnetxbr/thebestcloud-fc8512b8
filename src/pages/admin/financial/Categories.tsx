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
import { Plus, Search, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";

const Categories = () => {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", type: "despesa", color: "#6366f1", description: "" });

  const fetchData = async () => {
    const { data } = await supabase.from("financial_categories").select("*").order("name");
    setRows(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async () => {
    if (!form.name) { toast.error("Preencha o nome"); return; }
    if (editId) {
      const { error } = await supabase.from("financial_categories").update({
        name: form.name, type: form.type, color: form.color, description: form.description || null,
      }).eq("id", editId);
      if (error) { toast.error("Erro ao atualizar"); return; }
      toast.success("Categoria atualizada!");
    } else {
      const { error } = await supabase.from("financial_categories").insert({
        name: form.name, type: form.type, color: form.color, description: form.description || null,
      });
      if (error) { toast.error("Erro ao salvar"); return; }
      toast.success("Categoria criada!");
    }
    setDialogOpen(false);
    setEditId(null);
    setForm({ name: "", type: "despesa", color: "#6366f1", description: "" });
    fetchData();
  };

  const handleEdit = (row: any) => {
    setEditId(row.id);
    setForm({ name: row.name, type: row.type, color: row.color || "#6366f1", description: row.description || "" });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    await supabase.from("financial_categories").delete().eq("id", id);
    toast.success("Removida!");
    fetchData();
  };

  const filtered = rows.filter(r => r.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">Gerencie as categorias financeiras para organizar receitas e despesas.</p>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar categoria..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Dialog open={dialogOpen} onOpenChange={(v) => { setDialogOpen(v); if (!v) { setEditId(null); setForm({ name: "", type: "despesa", color: "#6366f1", description: "" }); } }}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> Nova Categoria</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editId ? "Editar Categoria" : "Nova Categoria"}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Nome *</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Tipo</Label>
                  <Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="receita">Receita</SelectItem>
                      <SelectItem value="despesa">Despesa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Cor</Label>
                  <Input type="color" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} className="h-10" />
                </div>
              </div>
              <div><Label>Descrição</Label><Input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
              <Button className="w-full" onClick={handleSubmit}>{editId ? "Atualizar" : "Criar"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="shadow-soft">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]">Cor</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto" /></TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Nenhuma categoria encontrada.</TableCell></TableRow>
              ) : filtered.map(r => (
                <TableRow key={r.id}>
                  <TableCell><div className="h-5 w-5 rounded-full" style={{ backgroundColor: r.color || "#6366f1" }} /></TableCell>
                  <TableCell className="font-medium">{r.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={r.type === "receita" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                      {r.type === "receita" ? "Receita" : "Despesa"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{r.description || "—"}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={r.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-500"}>
                      {r.is_active ? "Ativa" : "Inativa"}
                    </Badge>
                  </TableCell>
                  <TableCell className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(r)}><Pencil className="h-4 w-4" /></Button>
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

export default Categories;
