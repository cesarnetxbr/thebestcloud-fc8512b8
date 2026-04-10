import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search } from "lucide-react";

const formatCurrency = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

interface PriceTable {
  id: string;
  name: string;
  total_value: number | null;
  version: string | null;
}

interface ComparedItem {
  skuName: string;
  skuCode: string;
  quantity: number;
  unitCurrent: number;
  totalCurrent: number;
  unitCompared: number | null;
  totalCompared: number | null;
}

interface InvoiceCompareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "cost" | "sale";
  items: {
    skuName: string;
    skuCode: string;
    quantity: number;
    unitValue: number;
    totalValue: number;
  }[];
}

export function InvoiceCompareDialog({ open, onOpenChange, type, items }: InvoiceCompareDialogProps) {
  const [tables, setTables] = useState<PriceTable[]>([]);
  const [search, setSearch] = useState("");
  const [selectedTable, setSelectedTable] = useState<PriceTable | null>(null);
  const [comparedItems, setComparedItems] = useState<ComparedItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    const fetchTables = async () => {
      const { data } = await supabase
        .from("price_tables")
        .select("id, name, total_value, version")
        .eq("type", type)
        .order("name");
      setTables(data || []);
    };
    fetchTables();
  }, [open, type]);

  const filteredTables = useMemo(() => {
    if (!search) return tables;
    return tables.filter(t => t.name.toLowerCase().includes(search.toLowerCase()));
  }, [tables, search]);

  const handleSelectTable = async (table: PriceTable) => {
    setSelectedTable(table);
    setLoading(true);

    const { data: tableItems } = await supabase
      .from("price_table_items")
      .select("sku_code, unit_value")
      .eq("price_table_id", table.id);

    const priceMap = new Map<string, number>();
    tableItems?.forEach(ti => priceMap.set(ti.sku_code, ti.unit_value));

    const compared: ComparedItem[] = items.map(item => {
      const comparedUnit = priceMap.get(item.skuCode) ?? null;
      return {
        skuName: item.skuName,
        skuCode: item.skuCode,
        quantity: item.quantity,
        unitCurrent: item.unitValue,
        totalCurrent: item.totalValue,
        unitCompared: comparedUnit,
        totalCompared: comparedUnit !== null ? comparedUnit * item.quantity : null,
      };
    });
    setComparedItems(compared);
    setLoading(false);
  };

  const handleBack = () => {
    setSelectedTable(null);
    setComparedItems([]);
  };

  const handleClose = (v: boolean) => {
    if (!v) {
      setSelectedTable(null);
      setComparedItems([]);
      setSearch("");
    }
    onOpenChange(v);
  };

  const totalCurrent = comparedItems.reduce((s, i) => s + i.totalCurrent, 0);
  const totalCompared = comparedItems.reduce((s, i) => s + (i.totalCompared ?? 0), 0);
  const difference = totalCurrent - totalCompared;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        {!selectedTable ? (
          <>
            <DialogHeader>
              <DialogTitle>Comparar em outra tabela</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground mb-3">
              Selecione a tabela de {type === "cost" ? "custo" : "venda"} que deseja utilizar para comparação:
            </p>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={`Buscar tabela de ${type === "cost" ? "custo" : "venda"}...`}
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="space-y-1 max-h-[400px] overflow-y-auto">
              {filteredTables.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">Nenhuma tabela encontrada.</p>
              ) : (
                filteredTables.map(t => (
                  <button
                    key={t.id}
                    onClick={() => handleSelectTable(t)}
                    className="w-full text-left px-4 py-3 rounded-md hover:bg-muted/60 transition-colors text-sm"
                  >
                    {t.name} - {formatCurrency(t.total_value || 0)} - {t.version || "v1"}
                  </button>
                ))
              )}
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-base">
                Comparativo: Tabela Atual × {selectedTable.name} - {formatCurrency(selectedTable.total_value || 0)} - {selectedTable.version || "v1"}
              </DialogTitle>
            </DialogHeader>
            <button onClick={handleBack} className="text-sm text-primary hover:underline mb-2">
              ← Selecionar outra tabela
            </button>

            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>Item</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead className="text-right">Qtd.</TableHead>
                        <TableHead className="text-right">Preço Und. (Tabela Atual)</TableHead>
                        <TableHead className="text-right">Total (Tabela Atual)</TableHead>
                        <TableHead className="text-right">Preço Und. (Tabela Comparada)</TableHead>
                        <TableHead className="text-right">Total (Tabela Comparada)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {comparedItems.map((item, idx) => {
                        const diff = item.totalCompared !== null ? item.totalCurrent - item.totalCompared : null;
                        return (
                          <TableRow key={idx}>
                            <TableCell className="max-w-[200px] text-xs">{item.skuName}</TableCell>
                            <TableCell className="font-mono text-xs">{item.skuCode}</TableCell>
                            <TableCell className="text-right">{item.quantity}</TableCell>
                            <TableCell className="text-right">{formatCurrency(item.unitCurrent)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(item.totalCurrent)}</TableCell>
                            <TableCell className="text-right">
                              {item.unitCompared !== null ? formatCurrency(item.unitCompared) : "—"}
                            </TableCell>
                            <TableCell className={`text-right ${diff && diff > 0 ? "text-red-400" : diff && diff < 0 ? "text-green-400" : ""}`}>
                              {item.totalCompared !== null ? formatCurrency(item.totalCompared) : "—"}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-4 p-4 bg-muted/30 rounded-lg">
                  <div className="text-center">
                    <p className="text-xs font-semibold text-muted-foreground uppercase">Total (Tabela Atual)</p>
                    <p className="text-xl font-bold">{formatCurrency(totalCurrent)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-semibold text-muted-foreground uppercase">Diferença</p>
                    <p className={`text-xl font-bold ${difference > 0 ? "text-red-400" : difference < 0 ? "text-green-400" : ""}`}>
                      {difference > 0 ? `(${formatCurrency(difference)})` : difference < 0 ? formatCurrency(Math.abs(difference)) : formatCurrency(0)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-semibold text-muted-foreground uppercase">Total (Tabela Comparada)</p>
                    <p className="text-xl font-bold">{formatCurrency(totalCompared)}</p>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
