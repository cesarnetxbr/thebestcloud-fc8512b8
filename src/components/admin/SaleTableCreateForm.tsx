import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Minus, GripVertical, Globe, ArrowRight, ShoppingCart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CostTable {
  id: string;
  name: string;
  version: string | null;
  total_value: number | null;
  is_default: boolean | null;
}

interface SaleItemRow {
  item_name: string;
  sku_code: string;
  currency: string;
  cost_value: number;
  percentage: string;
  sale_value: string;
  variation: "fixed" | "percentage";
}

interface SaleTableCreateFormProps {
  onCreated: () => void;
  onCancel: () => void;
}

const SaleTableCreateForm = ({ onCreated, onCancel }: SaleTableCreateFormProps) => {
  const [tableName, setTableName] = useState("");
  const [costTables, setCostTables] = useState<CostTable[]>([]);
  const [selectedCostTableId, setSelectedCostTableId] = useState<string>("");
  const [selectedCostTableInfo, setSelectedCostTableInfo] = useState<string>("");
  const [rows, setRows] = useState<SaleItemRow[]>([]);
  const [bulkPercentage, setBulkPercentage] = useState("");
  const [saving, setSaving] = useState(false);
  const [loadingTiers, setLoadingTiers] = useState(true);
  const [loadingItems, setLoadingItems] = useState(false);
  const [pricingMode, setPricingMode] = useState<"percentage" | "sale_value">("percentage");
  const { toast } = useToast();

  // Load all cost tables (tiers)
  useEffect(() => {
    const loadCostTables = async () => {
      const { data } = await supabase
        .from("price_tables")
        .select("*")
        .eq("type", "cost")
        .order("name");
      const tables = (data || []) as CostTable[];
      setCostTables(tables);

      // Auto-select default tier
      const defaultTable = tables.find((t) => t.is_default);
      if (defaultTable) {
        setSelectedCostTableId(defaultTable.id);
      }
      setLoadingTiers(false);
    };
    loadCostTables();
  }, []);

  // Load items when cost table changes
  useEffect(() => {
    if (!selectedCostTableId) return;
    loadCostItems(selectedCostTableId);
  }, [selectedCostTableId]);

  const loadCostItems = async (costTableId: string) => {
    setLoadingItems(true);
    const table = costTables.find((t) => t.id === costTableId);
    if (table) {
      const totalFormatted = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(table.total_value || 0);
      setSelectedCostTableInfo(`${table.name} - ${totalFormatted} - ${table.version || "v1"}`);
    }

    const { data: items } = await supabase
      .from("price_table_items")
      .select("*")
      .eq("price_table_id", costTableId)
      .order("item_name");

    if (items && items.length > 0) {
      setRows(
        items.map((item: any) => ({
          item_name: item.item_name,
          sku_code: item.sku_code,
          currency: item.currency,
          cost_value: Number(item.unit_value),
          percentage: "0",
          sale_value: String(item.unit_value),
          variation: "fixed" as const,
        }))
      );
    } else {
      setRows([]);
    }
    setLoadingItems(false);
  };

  const applyBulkPercentage = () => {
    const pct = parseFloat(bulkPercentage);
    if (isNaN(pct)) return;
    setRows((prev) =>
      prev.map((row) => {
        const saleVal = row.cost_value * (1 + pct / 100);
        return {
          ...row,
          percentage: String(pct),
          sale_value: saleVal.toFixed(2),
          variation: "percentage" as const,
        };
      })
    );
    toast({ title: "Aplicado", description: `Porcentagem de ${pct}% aplicada a todos os itens.` });
  };

  const updateRowPercentage = (index: number, pctStr: string) => {
    const updated = [...rows];
    const pct = parseFloat(pctStr) || 0;
    const saleVal = updated[index].cost_value * (1 + pct / 100);
    updated[index] = {
      ...updated[index],
      percentage: pctStr,
      sale_value: saleVal.toFixed(2),
      variation: "percentage",
    };
    setRows(updated);
  };

  const updateRowSaleValue = (index: number, valStr: string) => {
    const updated = [...rows];
    const saleVal = parseFloat(valStr) || 0;
    const costVal = updated[index].cost_value;
    const pct = costVal > 0 ? ((saleVal - costVal) / costVal) * 100 : 0;
    updated[index] = {
      ...updated[index],
      sale_value: valStr,
      percentage: pct.toFixed(2),
      variation: "fixed",
    };
    setRows(updated);
  };

  const updateRowVariation = (index: number, variation: string) => {
    const updated = [...rows];
    updated[index] = { ...updated[index], variation: variation as "fixed" | "percentage" };
    setRows(updated);
  };

  const addRow = () => {
    setRows([...rows, { item_name: "", sku_code: "", currency: "BRL", cost_value: 0, percentage: "0", sale_value: "0", variation: "fixed" }]);
  };

  const removeRow = (index: number) => {
    if (rows.length <= 1) return;
    setRows(rows.filter((_, i) => i !== index));
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
      .insert({ name: tableName, type: "sale", version: "v1" })
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
      unit_value: parseFloat(r.sale_value) || 0,
    }));

    const { error: itemsError } = await supabase.from("price_table_items").insert(items);

    if (itemsError) {
      toast({ title: "Erro", description: itemsError.message, variant: "destructive" });
      setSaving(false);
      return;
    }

    toast({ title: "Sucesso", description: `Tabela de venda criada com ${validRows.length} itens.` });
    setSaving(false);
    onCreated();
  };

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <ShoppingCart className="h-10 w-10 text-primary" />
        <div>
          <h2 className="text-2xl font-bold">Tabela de venda</h2>
          {selectedCostTableInfo && (
            <p className="text-sm text-muted-foreground">
              Base: tabela de custo — <span className="font-medium text-foreground">{selectedCostTableInfo}</span>
            </p>
          )}
        </div>
      </div>

      {/* Table Name */}
      <div className="flex items-center gap-4">
        <Input
          value={tableName}
          onChange={(e) => setTableName(e.target.value)}
          placeholder="Digite o nome da tabela"
          className="text-base flex-1"
        />
        {selectedCostTableInfo && (
          <span className="text-xs text-muted-foreground whitespace-nowrap hidden lg:block">
            Base: tabela de custo — {selectedCostTableInfo}
          </span>
        )}
      </div>

      {/* Tier Selector */}
      <div className="flex items-center gap-3">
        <Select value={selectedCostTableId} onValueChange={setSelectedCostTableId}>
          <SelectTrigger className="w-[300px]">
            <SelectValue placeholder={loadingTiers ? "Carregando tiers..." : "Selecione o Tier de custo"} />
          </SelectTrigger>
          <SelectContent>
            {costTables.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.name} {t.is_default ? "(Padrão)" : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Bulk Percentage */}
      <div className="flex items-center gap-2">
        <Globe className="h-5 w-5 text-primary" />
        <Input
          type="number"
          value={bulkPercentage}
          onChange={(e) => setBulkPercentage(e.target.value)}
          placeholder="% para todos"
          className="w-32"
        />
        <Button
          size="icon"
          onClick={applyBulkPercentage}
          className="bg-primary hover:bg-primary/90"
          disabled={!bulkPercentage}
        >
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Items Table */}
      {loadingItems ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
        </div>
      ) : rows.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          {selectedCostTableId ? "Nenhum item encontrado neste tier." : "Selecione um Tier de custo para carregar os itens."}
        </div>
      ) : (
        <div className="border rounded-lg overflow-x-auto">
          {/* Header */}
          <div className="grid grid-cols-[40px_1fr_140px_100px_140px_140px_140px_100px_80px] gap-0 bg-muted/50 px-2 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b min-w-[1000px]">
            <div></div>
            <div className="px-2">Nome do item</div>
            <div className="px-2">SKU</div>
            <div className="px-2">Moeda</div>
            <div className="px-2">Valor de custo</div>
            <div className="px-2 flex items-center gap-1">
              Porcentagem
              <button
                onClick={() => setPricingMode("percentage")}
                className={`ml-1 w-4 h-4 rounded-full border-2 flex items-center justify-center ${pricingMode === "percentage" ? "border-primary" : "border-muted-foreground/40"}`}
              >
                {pricingMode === "percentage" && <div className="w-2 h-2 rounded-full bg-primary" />}
              </button>
            </div>
            <div className="px-2 flex items-center gap-1">
              Valor de venda
              <button
                onClick={() => setPricingMode("sale_value")}
                className={`ml-1 w-4 h-4 rounded-full border-2 flex items-center justify-center ${pricingMode === "sale_value" ? "border-primary" : "border-muted-foreground/40"}`}
              >
                {pricingMode === "sale_value" && <div className="w-2 h-2 rounded-full bg-primary" />}
              </button>
            </div>
            <div className="px-2">Variação</div>
            <div></div>
          </div>

          {/* Rows */}
          {rows.map((row, index) => (
            <div
              key={index}
              className="grid grid-cols-[40px_1fr_140px_100px_140px_140px_140px_100px_80px] gap-0 items-center px-2 py-2 border-b last:border-b-0 hover:bg-muted/30 min-w-[1000px]"
            >
              <div className="flex items-center justify-center text-muted-foreground cursor-grab">
                <GripVertical className="h-4 w-4" />
              </div>
              <div className="px-1">
                <span className="text-sm truncate block" title={row.item_name}>{row.item_name}</span>
              </div>
              <div className="px-1">
                <span className="text-sm font-mono text-muted-foreground">{row.sku_code}</span>
              </div>
              <div className="px-1">
                <Select value={row.currency} onValueChange={(v) => {
                  const updated = [...rows];
                  updated[index] = { ...updated[index], currency: v };
                  setRows(updated);
                }}>
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
              <div className="px-1">
                <span className="text-sm text-muted-foreground">{formatCurrency(row.cost_value)}</span>
              </div>
              <div className="px-1 flex items-center gap-1">
                <Input
                  type="number"
                  step="0.01"
                  value={row.percentage}
                  onChange={(e) => updateRowPercentage(index, e.target.value)}
                  className="h-9 text-sm border-0 bg-transparent focus-visible:ring-1"
                  disabled={pricingMode !== "percentage"}
                />
                <span className="text-xs text-muted-foreground">%</span>
              </div>
              <div className="px-1 flex items-center gap-1">
                <span className="text-xs text-muted-foreground">R$</span>
                <Input
                  type="number"
                  step="0.01"
                  value={row.sale_value}
                  onChange={(e) => updateRowSaleValue(index, e.target.value)}
                  placeholder="Valor de venda"
                  className="h-9 text-sm border-0 bg-transparent focus-visible:ring-1"
                  disabled={pricingMode !== "sale_value"}
                />
              </div>
              <div className="px-1">
                <Select value={row.variation} onValueChange={(v) => updateRowVariation(index, v)}>
                  <SelectTrigger className="h-9 text-sm border-0 bg-transparent">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Fixo</SelectItem>
                    <SelectItem value="percentage">%</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-center gap-1">
                <Button variant="ghost" size="icon" onClick={() => removeRow(index)} className="h-7 w-7 text-destructive hover:text-destructive" disabled={rows.length <= 1}>
                  <Minus className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={addRow} className="h-7 w-7 text-primary hover:text-primary">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onCancel} disabled={saving}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit} disabled={saving} className="bg-primary hover:bg-primary/90">
          {saving ? "Criando..." : "Criar tabela de venda"}
        </Button>
      </div>
    </div>
  );
};

export default SaleTableCreateForm;
