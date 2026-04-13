import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, Search, ChevronLeft, ChevronRight, Calendar, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface InvoiceRow {
  id: string;
  invoice_number: string;
  customer_name: string;
  product: string;
  due_date: string | null;
  period_start: string;
  period_end: string;
  created_at: string;
  synced_at: string | null;
  total_cost: number;
  status: string;
}

const PAGE_SIZE = 15;

const formatCurrency = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
const formatDate = (d: string | null) => {
  if (!d) return "—";
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
};
const formatDateTime = (d: string | null) =>
  d ? new Date(d).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

const InvoiceCost = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState<InvoiceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  // Column filters
  const [filterInvoice, setFilterInvoice] = useState("");
  const [filterClient, setFilterClient] = useState("");
  const [filterProduct, setFilterProduct] = useState("");
  const [filterValue, setFilterValue] = useState("");
  const [filterMonth, setFilterMonth] = useState("all");
  useEffect(() => {
    const fetch = async () => {
      const { data: invoices } = await supabase
        .from("invoices")
        .select("id, invoice_number, period_start, period_end, total_cost, due_date, created_at, synced_at, status, customers(name)")
        .like("invoice_number", "COST-%")
        .order("created_at", { ascending: false });

      if (invoices) {
        const mapped: InvoiceRow[] = invoices.map((inv: any) => ({
          id: inv.id,
          invoice_number: inv.invoice_number,
          customer_name: inv.customers?.name || "—",
          product: "Acronis Cloud",
          due_date: inv.due_date,
          period_start: inv.period_start,
          period_end: inv.period_end,
          created_at: inv.created_at,
          synced_at: inv.synced_at || null,
          total_cost: Number(inv.total_cost) || 0,
          status: inv.status || "draft",
        }));
        setRows(mapped);
      }
      setLoading(false);
    };
    fetch();
  }, []);

  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    rows.forEach(r => {
      const d = new Date(r.period_start);
      months.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
    });
    return Array.from(months).sort().reverse();
  }, [rows]);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (filterMonth && filterMonth !== "all") {
        const d = new Date(r.period_start);
        const m = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        if (m !== filterMonth) return false;
      }
      if (filterInvoice && !r.invoice_number.toLowerCase().includes(filterInvoice.toLowerCase())) return false;
      if (filterClient && !r.customer_name.toLowerCase().includes(filterClient.toLowerCase())) return false;
      if (filterProduct && !r.product.toLowerCase().includes(filterProduct.toLowerCase())) return false;
      if (filterValue && !formatCurrency(r.total_cost).includes(filterValue)) return false;
      return true;
    });
  }, [rows, filterInvoice, filterClient, filterProduct, filterValue, filterMonth]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const exportCSV = () => {
    const header = "Nº Fatura,Cliente,Produto,Vencimento,Período,Emissão,Valor Total\n";
    const csv = filtered.map((r) =>
      `${r.invoice_number},${r.customer_name},${r.product},${formatDate(r.due_date)},${formatDate(r.period_start)} - ${formatDate(r.period_end)},${formatDate(r.created_at)},${r.total_cost}`
    ).join("\n");
    const blob = new Blob([header + csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "faturamento-custo.csv"; a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/admin/invoices")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-xl font-semibold">Custo</h2>
          <p className="text-muted-foreground text-sm">
            Acompanhe o que você está pagando por cada serviço.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <Select value={filterMonth} onValueChange={(v) => { setFilterMonth(v); setPage(1); }}>
            <SelectTrigger className="w-[180px] h-9">
              <SelectValue placeholder="Todos os meses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os meses</SelectItem>
              {availableMonths.map(m => {
                const [y, mo] = m.split("-");
                const label = new Date(Number(y), Number(mo) - 1).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
                return <SelectItem key={m} value={m}>{label}</SelectItem>;
              })}
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" size="sm" onClick={exportCSV}>
          <Download className="h-4 w-4 mr-2" /> Baixar CSV
        </Button>
      </div>

      <Card className="shadow-soft">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="min-w-[140px]">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold">Nº da Fatura</span>
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                      <Input placeholder="Buscar fatura..." className="h-7 text-xs pl-7" value={filterInvoice} onChange={e => setFilterInvoice(e.target.value)} />
                    </div>
                  </div>
                </TableHead>
                <TableHead className="min-w-[160px]">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold">Nome do cliente</span>
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                      <Input placeholder="Buscar cliente..." className="h-7 text-xs pl-7" value={filterClient} onChange={e => setFilterClient(e.target.value)} />
                    </div>
                  </div>
                </TableHead>
                <TableHead className="min-w-[120px]">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold">Produto</span>
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                      <Input placeholder="Buscar produto..." className="h-7 text-xs pl-7" value={filterProduct} onChange={e => setFilterProduct(e.target.value)} />
                    </div>
                  </div>
                </TableHead>
                <TableHead><span className="text-xs font-semibold">Vencimento</span></TableHead>
                <TableHead><span className="text-xs font-semibold">Período faturamento</span></TableHead>
                <TableHead><span className="text-xs font-semibold">Emissão</span></TableHead>
                <TableHead className="text-right min-w-[120px]">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold">Valor Total</span>
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                      <Input placeholder="Buscar valor..." className="h-7 text-xs pl-7" value={filterValue} onChange={e => setFilterValue(e.target.value)} />
                    </div>
                  </div>
                </TableHead>
                <TableHead><span className="text-xs font-semibold">Status</span></TableHead>
                <TableHead><span className="text-xs font-semibold">Sincronizado em</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto" />
                  </TableCell>
                </TableRow>
              ) : paginated.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    Nenhum resultado encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map((r) => (
                  <TableRow key={r.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/admin/invoices/custo/${r.id}`)}>
                    <TableCell className="font-mono text-sm">{r.invoice_number}</TableCell>
                    <TableCell className="font-medium">{r.customer_name}</TableCell>
                    <TableCell>{r.product}</TableCell>
                    <TableCell>{formatDate(r.due_date)}</TableCell>
                    <TableCell>{formatDate(r.period_start)} — {formatDate(r.period_end)}</TableCell>
                    <TableCell>{formatDate(r.created_at)}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(r.total_cost)}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={r.status === "closed" ? "bg-green-100 text-green-800" : "bg-muted text-muted-foreground"}>
                        {r.status === "closed" ? "Encerrada" : "Rascunho"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{formatDateTime(r.synced_at)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {!loading && filtered.length === 0 && (
        <p className="text-center text-muted-foreground text-sm">Nenhum registro encontrado para este filtro.</p>
      )}

      <div className="flex items-center justify-end gap-2">
        <Button variant="outline" size="icon" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm text-muted-foreground">Página {page} de {totalPages}</span>
        <Button variant="outline" size="icon" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default InvoiceCost;
