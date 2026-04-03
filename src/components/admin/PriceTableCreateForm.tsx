import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Minus, GripVertical } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ItemRow {
  item_name: string;
  sku_code: string;
  currency: string;
  unit_value: string;
}

interface PriceTableCreateFormProps {
  type: "cost" | "sale";
  onCreated: () => void;
  onCancel: () => void;
}

const PriceTableCreateForm = ({ type, onCreated, onCancel }: PriceTableCreateFormProps) => {
  const [tableName, setTableName] = useState("");
  const [rows, setRows] = useState<ItemRow[]>([
    { item_name: "", sku_code: "", currency: "BRL", unit_value: "" },
  ]);
  const [saving, setSaving] = useState(false);
  const [loadingDefault, setLoadingDefault] = useState(false);
  const [defaultCostTableName, setDefaultCostTableName] = useState<string | null>(null);
  const { toast } = useToast();

  // For sale tables, auto-load items from default cost table
  useEffect(() => {
    if (type === "sale") {
      loadDefaultCostItems();
    }
  }, [type]);

  const loadDefaultCostItems = async () => {
    setLoadingDefault(true);
    // Find default cost table
    const { data: defaultTable } = await supabase
      .from("price_tables")
      .select("*")
      .eq("type", "cost")
      .eq("is_default", true)
      .single();

    if (defaultTable) {
      setDefaultCostTableName(defaultTable.name);
      // Load its items
      const { data: items } = await supabase
        .from("price_table_items")
        .select("*")
        .eq("price_table_id", defaultTable.id)
        .order("item_name");

      if (items && items.length > 0) {
        setRows(
          items.map((item: any) => ({
            item_name: item.item_name,
            sku_code: item.sku_code,
            currency: item.currency,
            unit_value: String(item.unit_value),
          }))
        );
      }
    }
    setLoadingDefault(false);
  };

  const addRow = () => {
    setRows([...rows, { item_name: "", sku_code: "", currency: "BRL", unit_value: "" }]);
  };

  const removeRow = (index: number) => {
    if (rows.length <= 1) return;
    setRows(rows.filter((_, i) => i !== index));
  };

  const updateRow = (index: number, field: keyof ItemRow, value: string) => {
    const updated = [...rows];
    updated[index] = { ...updated[index], [field]: value };
    setRows(updated);
  };

  const handleSubmit = async () => {
    if (!tableName.trim()) {
      toast({ title: "Erro", description: "Informe o nome da tabela.", variant: "destructive" });
      return;
    }

    const validRows = rows.filter((r) => r.item_name.trim());
    if (validRows.length === 0) {
      toast({ title: "Erro", description: "Adicione pelo menos um item.", variant: "destructive" });
      return;
    }

    setSaving(true);

    const { data: tableData, error: tableError } = await supabase
      .from("price_tables")
      .insert({ name: tableName, type, version: "v1" })
      .select("id")
      .single();

    if (tableError || !tableData) {
      toast({ title: "Erro", description: tableError?.message || "Erro ao criar tabela.", variant: "destructive" });
      setSaving(false);
      return;
    }

    const items = validRows.map((r) => ({
      price_table_id: tableData.id,
      item_name: r.item_name,
      sku_code: r.sku_code,
      currency: r.currency,
      unit_value: parseFloat(r.unit_value) || 0,
    }));

    const { error: itemsError } = await supabase.from("price_table_items").insert(items);

    if (itemsError) {
      toast({ title: "Erro", description: itemsError.message, variant: "destructive" });
      setSaving(false);
      return;
    }

    toast({ title: "Sucesso", description: `Tabela de ${type === "cost" ? "custo" : "venda"} criada com ${validRows.length} itens.` });
    setSaving(false);
    onCreated();
  };

  const label = type === "cost" ? "custo" : "venda";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
          <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </div>
        <div>
          <h2 className="text-2xl font-bold">Tabela de {label}</h2>
          {type === "sale" && defaultCostTableName && (
            <p className="text-sm text-muted-foreground">
              Itens carregados da tabela de custo padrão: <span className="font-medium text-foreground">{defaultCostTableName}</span>
            </p>
          )}
          {type === "sale" && !defaultCostTableName && !loadingDefault && (
            <p className="text-sm text-amber-600">
              Nenhuma tabela de custo padrão definida. Defina uma em Tabela de Custo.
            </p>
          )}
        </div>
      </div>

      <div>
        <Input
          value={tableName}
          onChange={(e) => setTableName(e.target.value)}
          placeholder="Digite o nome da tabela"
          className="text-base"
        />
      </div>

      {loadingDefault ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <div className="grid grid-cols-[40px_1fr_160px_120px_160px_80px] gap-0 bg-muted/50 px-2 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b">
            <div></div>
            <div className="px-2">Nome do item</div>
            <div className="px-2">SKU</div>
            <div className="px-2">Moeda</div>
            <div className="px-2">Valor de {label}</div>
            <div></div>
          </div>

          {rows.map((row, index) => (
            <div
              key={index}
              className="grid grid-cols-[40px_1fr_160px_120px_160px_80px] gap-0 items-center px-2 py-2 border-b last:border-b-0 hover:bg-muted/30"
            >
              <div className="flex items-center justify-center text-muted-foreground cursor-grab">
                <GripVertical className="h-4 w-4" />
              </div>
              <div className="px-1">
                <Input
                  value={row.item_name}
                  onChange={(e) => updateRow(index, "item_name", e.target.value)}
                  placeholder="Nome do item"
                  className="h-9 text-sm border-0 bg-transparent focus-visible:ring-1"
                />
              </div>
              <div className="px-1">
                <Input
                  value={row.sku_code}
                  onChange={(e) => updateRow(index, "sku_code", e.target.value)}
                  placeholder="SKU"
                  className="h-9 text-sm font-mono border-0 bg-transparent focus-visible:ring-1"
                />
              </div>
              <div className="px-1">
                <Select value={row.currency} onValueChange={(v) => updateRow(index, "currency", v)}>
                  <SelectTrigger className="h-9 text-sm border-0 bg-transparent">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BRL">BRL</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="px-1 flex items-center gap-1">
                <span className="text-xs text-muted-foreground">R$</span>
                <Input
                  type="number"
                  step="0.0001"
                  value={row.unit_value}
                  onChange={(e) => updateRow(index, "unit_value", e.target.value)}
                  placeholder={`Valor de ${label}`}
                  className="h-9 text-sm border-0 bg-transparent focus-visible:ring-1"
                />
              </div>
              <div className="flex items-center justify-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeRow(index)}
                  className="h-7 w-7 text-destructive hover:text-destructive"
                  disabled={rows.length <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={addRow}
                  className="h-7 w-7 text-primary hover:text-primary"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onCancel} disabled={saving}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit} disabled={saving} className="bg-primary hover:bg-primary/90">
          {saving ? "Criando..." : `Criar tabela de ${label}`}
        </Button>
      </div>
    </div>
  );
};

export default PriceTableCreateForm;
