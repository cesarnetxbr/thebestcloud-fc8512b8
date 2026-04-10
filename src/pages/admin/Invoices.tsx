import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Trash2, Lock } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface InvoiceWithCustomer {
  id: string;
  invoice_number: string;
  period_start: string;
  period_end: string;
  total_cost: number | null;
  total_sale: number | null;
  margin: number | null;
  status: string | null;
  due_date: string | null;
  customers: { name: string } | null;
}

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  closed: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
  paid: "bg-green-100 text-green-800",
  overdue: "bg-red-100 text-red-800",
  cancelled: "bg-muted text-muted-foreground",
};
const statusLabels: Record<string, string> = {
  draft: "Rascunho",
  closed: "Encerrada",
  pending: "Pendente",
  paid: "Pago",
  overdue: "Vencido",
  cancelled: "Cancelado",
};

const Invoices = () => {
  const [invoices, setInvoices] = useState<InvoiceWithCustomer[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchInvoices = async () => {
    const { data } = await supabase
      .from("invoices")
      .select("id, invoice_number, period_start, period_end, total_cost, total_sale, margin, status, due_date, customers(name)")
      .order("created_at", { ascending: false });
    setInvoices((data as unknown as InvoiceWithCustomer[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleDelete = async (inv: InvoiceWithCustomer) => {
    await supabase.from("invoice_items").delete().eq("invoice_id", inv.id);
    const { error } = await supabase.from("invoices").delete().eq("id", inv.id);
    if (error) { toast.error("Erro ao excluir fatura"); return; }
    toast.success(`Fatura ${inv.invoice_number} excluída`);
    setInvoices(prev => prev.filter(i => i.id !== inv.id));
  };

  const handleClose = async (inv: InvoiceWithCustomer) => {
    const { error } = await supabase.from("invoices").update({ status: "closed" }).eq("id", inv.id);
    if (error) { toast.error("Erro ao encerrar fatura"); return; }
    toast.success(`Fatura ${inv.invoice_number} encerrada`);
    setInvoices(prev => prev.map(i => i.id === inv.id ? { ...i, status: "closed" } : i));
  };

  const filtered = invoices.filter(
    (i) =>
      i.invoice_number.toLowerCase().includes(search.toLowerCase()) ||
      i.customers?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const formatCurrency = (v: number | null) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v || 0);

  const formatDate = (d: string | null) =>
    d ? new Date(d).toLocaleDateString("pt-BR") : "—";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por número ou cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" /> Nova Fatura
        </Button>
      </div>

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-lg">Faturamento ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {search ? "Nenhuma fatura encontrada." : "Nenhuma fatura cadastrada ainda."}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nº Fatura</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Período</TableHead>
                  <TableHead className="text-right">Custo</TableHead>
                  <TableHead className="text-right">Venda</TableHead>
                  <TableHead className="text-right">Margem</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((inv) => {
                  const isDraft = !inv.status || inv.status === "draft";
                  return (
                    <TableRow key={inv.id}>
                      <TableCell className="font-mono text-sm">{inv.invoice_number}</TableCell>
                      <TableCell className="font-medium">{inv.customers?.name || "—"}</TableCell>
                      <TableCell>{formatDate(inv.period_start)} — {formatDate(inv.period_end)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(inv.total_cost)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(inv.total_sale)}</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(inv.margin)}</TableCell>
                      <TableCell>{formatDate(inv.due_date)}</TableCell>
                      <TableCell>
                        <Badge className={statusColors[inv.status || "draft"]} variant="secondary">
                          {statusLabels[inv.status || "draft"]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {isDraft && (
                          <div className="flex items-center justify-center gap-1">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Excluir fatura?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    A fatura <strong>{inv.invoice_number}</strong> e todos os seus itens serão removidos permanentemente.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(inv)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                    Excluir
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600 hover:text-green-700">
                                  <Lock className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Encerrar fatura?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Ao encerrar, a fatura <strong>{inv.invoice_number}</strong> não poderá mais ser excluída.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleClose(inv)}>Encerrar</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Invoices;