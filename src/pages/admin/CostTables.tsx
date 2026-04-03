import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Search, Tag, ArrowLeft, Trash2, Pencil } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import PriceTableCreateForm from "@/components/admin/PriceTableCreateForm";

interface PriceTable {
  id: string;
  name: string;
  type: string;
  total_value: number | null;
  version: string | null;
  is_default: boolean | null;
  created_at: string;
}

interface PriceTableItem {
  id: string;
  price_table_id: string;
  item_name: string;
  sku_code: string;
  currency: string;
  unit_value: number;
}

const CostTables = () => {
  const [tables, setTables] = useState<PriceTable[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedTable, setSelectedTable] = useState<PriceTable | null>(null);
  const [items, setItems] = useState<PriceTableItem[]>([]);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [itemSearch, setItemSearch] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [addItemOpen, setAddItemOpen] = useState(false);
  const [newItem, setNewItem] = useState({ item_name: "", sku_code: "", currency: "BRL", unit_value: "" });
  const { toast } = useToast();

  const fetchTables = async () => {
    const { data } = await supabase
      .from("price_tables")
      .select("*")
      .eq("type", "cost")
      .order("created_at", { ascending: false });
    setTables((data as PriceTable[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchTables(); }, []);

  const fetchItems = async (tableId: string) => {
    setItemsLoading(true);
    const { data } = await supabase
      .from("price_table_items")
      .select("*")
      .eq("price_table_id", tableId)
      .order("item_name");
    setItems((data as PriceTableItem[]) || []);
    setItemsLoading(false);
  };

  const handleSelectTable = (table: PriceTable) => {
    setSelectedTable(table);
    setItemSearch("");
    fetchItems(table.id);
  };

  const handleAddItem = async () => {
    if (!selectedTable || !newItem.item_name.trim()) return;
    const { error } = await supabase.from("price_table_items").insert({
      price_table_id: selectedTable.id,
      item_name: newItem.item_name,
      sku_code: newItem.sku_code,
      currency: newItem.currency,
      unit_value: parseFloat(newItem.unit_value) || 0,
    });
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Sucesso", description: "Item adicionado." });
      setAddItemOpen(false);
      setNewItem({ item_name: "", sku_code: "", currency: "BRL", unit_value: "" });
      fetchItems(selectedTable.id);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!selectedTable) return;
    const { error } = await supabase.from("price_table_items").delete().eq("id", itemId);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      fetchItems(selectedTable.id);
    }
  };

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

  const filtered = tables.filter((t) => t.name.toLowerCase().includes(search.toLowerCase()));
  const filteredItems = items.filter(
    (i) =>
      i.item_name.toLowerCase().includes(itemSearch.toLowerCase()) ||
      i.sku_code.toLowerCase().includes(itemSearch.toLowerCase())
  );

  // Create form view
  if (showCreateForm) {
    return (
      <PriceTableCreateForm
        type="cost"
        onCreated={() => {
          setShowCreateForm(false);
          fetchTables();
        }}
        onCancel={() => setShowCreateForm(false)}
      />
    );
  }

  // Detail view
  if (selectedTable) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <button onClick={() => setSelectedTable(null)} className="hover:text-foreground transition-colors">
            Financeiro
          </button>
          <span>›</span>
          <button onClick={() => setSelectedTable(null)} className="hover:text-foreground transition-colors">
            Tabela de Custo
          </button>
          <span>›</span>
          <span className="text-foreground font-medium">Visualizar</span>
          <span>›</span>
          <span className="text-foreground">{selectedTable.name}</span>
        </div>

        <div className="flex items-start gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Tag className="h-10 w-10 text-primary" />
              <div>
                <h2 className="text-2xl font-bold">{selectedTable.name}</h2>
                <p className="text-sm text-muted-foreground">
                  {items.length} itens
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setSelectedTable(null)}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
            </Button>
            <Button variant="outline" className="text-primary border-primary hover:bg-primary/10">
              <Pencil className="h-4 w-4 mr-2" /> Editar
            </Button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, SKU, moeda ou valor..."
              value={itemSearch}
              onChange={(e) => setItemSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Dialog open={addItemOpen} onOpenChange={setAddItemOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" /> Adicionar Item</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Novo Item de Custo</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label>Nome do Item</Label>
                  <Input value={newItem.item_name} onChange={(e) => setNewItem({ ...newItem, item_name: e.target.value })} placeholder="Ex: Security + RMM - WL - Endpoint" />
                </div>
                <div>
                  <Label>Código SKU</Label>
                  <Input value={newItem.sku_code} onChange={(e) => setNewItem({ ...newItem, sku_code: e.target.value })} placeholder="Ex: SESDMSENS" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Moeda</Label>
                    <Input value={newItem.currency} onChange={(e) => setNewItem({ ...newItem, currency: e.target.value })} placeholder="BRL" />
                  </div>
                  <div>
                    <Label>Valor Unitário</Label>
                    <Input type="number" step="0.0001" value={newItem.unit_value} onChange={(e) => setNewItem({ ...newItem, unit_value: e.target.value })} placeholder="0.00" />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAddItemOpen(false)}>Cancelar</Button>
                <Button onClick={handleAddItem}>Salvar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="shadow-soft">
          <CardContent className="p-0">
            {itemsLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                {itemSearch ? "Nenhum item encontrado." : "Nenhum item cadastrado nesta tabela."}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="uppercase text-xs font-semibold">Nome do Item</TableHead>
                    <TableHead className="uppercase text-xs font-semibold">SKU</TableHead>
                    <TableHead className="uppercase text-xs font-semibold">Moeda</TableHead>
                    <TableHead className="text-right uppercase text-xs font-semibold">Valor</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.item_name}</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">{item.sku_code}</TableCell>
                      <TableCell>{item.currency}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.unit_value)}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteItem(item.id)} className="h-8 w-8 text-muted-foreground hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // List view
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
        <span>Financeiro</span>
        <span>›</span>
        <span className="text-foreground font-medium">Tabela de Custo</span>
      </div>

      <div className="flex items-center gap-3 mb-2">
        <Tag className="h-10 w-10 text-primary" />
        <div>
          <h2 className="text-2xl font-bold">Tabela de custo</h2>
          <p className="text-muted-foreground text-sm">
            Estruture seus custos com precisão, aqui você configura os valores de base da sua operação para manter a precificação sob controle.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar tabela..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="cursor-pointer">Padrão</Badge>
          <Button variant="outline" onClick={() => setShowCreateForm(true)}>
            <Plus className="h-4 w-4 mr-2" /> Criar nova tabela
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground text-lg font-medium">
          Nenhuma tabela encontrada.
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((table) => (
            <Card
              key={table.id}
              className="cursor-pointer hover:bg-muted/50 transition-colors shadow-soft"
              onClick={() => handleSelectTable(table)}
            >
              <CardContent className="py-4 px-6">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{table.name}</span>
                  {table.is_default && <Badge variant="secondary">Padrão</Badge>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CostTables;
