import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Download, GitCompareArrows, FileSpreadsheet, FileText, ArrowLeftRight, Trash2, Lock } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { exportInvoiceXLS, exportInvoicePDF } from "@/utils/invoiceExport";
import { InvoiceCompareDialog } from "@/components/admin/InvoiceCompareDialog";
const formatCurrency = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
const formatDate = (d: string | null) =>
  d ? new Date(d).toLocaleDateString("pt-BR") : "—";

interface InvoiceDetail {
  id: string;
  invoice_number: string;
  period_start: string;
  period_end: string;
  total_cost: number;
  total_sale: number;
  due_date: string | null;
  created_at: string;
  updated_at: string;
  status: string | null;
  customer: {
    name: string;
    cnpj: string | null;
    razao_social: string | null;
    nome_fantasia: string | null;
  };
}

interface InvoiceItem {
  id: string;
  quantity: number;
  unit_cost: number;
  total_cost: number | null;
  sku: {
    name: string;
    code: string;
  };
}

const InvoiceCostDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [tenantName, setTenantName] = useState<string>("—");
  const [saleTableName, setSaleTableName] = useState<string>("—");
  const [compareOpen, setCompareOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const isDraft = invoice?.status === "draft" || !invoice?.status;
  const isClosed = invoice?.status === "closed";

  const handleDelete = async () => {
    if (!id) return;
    setActionLoading(true);
    await supabase.from("invoice_items").delete().eq("invoice_id", id);
    const { error } = await supabase.from("invoices").delete().eq("id", id);
    setActionLoading(false);
    if (error) { toast.error("Erro ao excluir fatura"); return; }
    toast.success("Fatura excluída com sucesso");
    navigate("/admin/invoices/custo");
  };

  const handleClose = async () => {
    if (!id) return;
    setActionLoading(true);
    const { error } = await supabase.from("invoices").update({ status: "closed" }).eq("id", id);
    setActionLoading(false);
    if (error) { toast.error("Erro ao encerrar fatura"); return; }
    toast.success("Fatura encerrada com sucesso");
    setInvoice(prev => prev ? { ...prev, status: "closed" } : prev);
  };

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      const { data: inv } = await supabase
        .from("invoices")
        .select("*, customers(name, cnpj, razao_social, nome_fantasia)")
        .eq("id", id)
        .single();

      if (inv) {
        setInvoice({
          id: inv.id,
          invoice_number: inv.invoice_number,
          period_start: inv.period_start,
          period_end: inv.period_end,
          total_cost: Number(inv.total_cost) || 0,
          total_sale: Number(inv.total_sale) || 0,
          due_date: inv.due_date,
          created_at: inv.created_at,
          updated_at: inv.updated_at,
          status: inv.status,
          customer: {
            name: (inv.customers as any)?.name || "—",
            cnpj: (inv.customers as any)?.cnpj || null,
            razao_social: (inv.customers as any)?.razao_social || null,
            nome_fantasia: (inv.customers as any)?.nome_fantasia || null,
          },
        });

        // Find tenant linked to this customer
        const { data: tenants } = await supabase
          .from("tenants")
          .select("name, sale_table_id")
          .eq("customer_id", inv.customer_id)
          .limit(1);
        if (tenants && tenants.length > 0) {
          setTenantName(tenants[0].name);
          if (tenants[0].sale_table_id) {
            const { data: st } = await supabase
              .from("price_tables")
              .select("name")
              .eq("id", tenants[0].sale_table_id)
              .single();
            if (st) setSaleTableName(st.name);
          }
        }
      }

      const { data: itemsData } = await supabase
        .from("invoice_items")
        .select("id, quantity, unit_cost, total_cost, skus(name, code)")
        .eq("invoice_id", id);

      if (itemsData) {
        setItems(
          itemsData.map((it: any) => ({
            id: it.id,
            quantity: it.quantity,
            unit_cost: it.unit_cost,
            total_cost: it.total_cost,
            sku: { name: (it.skus as any)?.name || "—", code: (it.skus as any)?.code || "—" },
          }))
        );
      }
      setLoading(false);
    };
    fetchData();
  }, [id]);

  const exportCSV = () => {
    if (!invoice) return;
    const header = "Item,Código (SKU),Quantidade,Preço Und. (R$),Total (R$)\n";
    const csv = items.map(i =>
      `"${i.sku.name}",${i.sku.code},${i.quantity},${i.unit_cost},${i.total_cost || 0}`
    ).join("\n");
    const blob = new Blob([header + csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `fatura-custo-${invoice.invoice_number}.csv`; a.click();
  };

  const getExportData = () => {
    if (!invoice) return null;
    return {
      invoiceNumber: invoice.invoice_number,
      customerName: invoice.customer.name,
      customerCnpj: invoice.customer.cnpj,
      customerRazaoSocial: invoice.customer.razao_social,
      tenantName,
      periodStart: invoice.period_start,
      periodEnd: invoice.period_end,
      createdAt: invoice.created_at,
      dueDate: invoice.due_date,
      status: invoice.status,
      items: items.map(i => ({
        skuName: i.sku.name,
        skuCode: i.sku.code,
        quantity: i.quantity,
        unitValue: i.unit_cost,
        totalValue: i.total_cost || 0,
      })),
      type: "cost" as const,
    };
  };

  const saleInvoiceNumber = invoice?.invoice_number.replace("COST-", "SALE-");

  const goToSaleComparison = async () => {
    if (!saleInvoiceNumber) return;
    const { data } = await supabase
      .from("invoices")
      .select("id")
      .eq("invoice_number", saleInvoiceNumber)
      .single();
    if (data) navigate(`/admin/invoices/venda/${data.id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => navigate("/admin/invoices/custo")}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
        </Button>
        <p className="text-center text-muted-foreground">Fatura não encontrada.</p>
      </div>
    );
  }

  const totalItems = items.reduce((sum, i) => sum + (i.total_cost || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/admin/invoices/custo")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Detalhes da Fatura de Custo</h1>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 space-y-2">
            <h3 className="font-semibold text-base">Cliente</h3>
            <Separator />
            <div className="text-sm space-y-1">
              <p><span className="font-medium">CNPJ/CPF:</span> {invoice.customer.cnpj || "—"}</p>
              <p><span className="font-medium">Razão Social:</span> {invoice.customer.razao_social || invoice.customer.name}</p>
              <p><span className="font-medium">Nome Fantasia:</span> {invoice.customer.nome_fantasia || invoice.customer.name}</p>
              <p><span className="font-medium">Tenant:</span> {tenantName}</p>
              <p><span className="font-medium">Tabela de Venda:</span> <Badge variant="outline">{saleTableName}</Badge></p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-2">
            <h3 className="font-semibold text-base">Informações da Fatura</h3>
            <Separator />
            <div className="text-sm space-y-1">
              <p><span className="font-medium">Número da Fatura:</span> {invoice.invoice_number}</p>
              <p><span className="font-medium">Status:</span> {invoice.status || "DRAFT"}</p>
              <p><span className="font-medium">Período:</span> {formatDate(invoice.period_start)} — {formatDate(invoice.period_end)}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-2">
            <h3 className="font-semibold text-base">Datas</h3>
            <Separator />
            <div className="text-sm space-y-1">
              <p><span className="font-medium">Criação:</span> {formatDate(invoice.created_at)}</p>
              <p><span className="font-medium">Atualização:</span> {formatDate(invoice.updated_at)}</p>
              {invoice.due_date && <p><span className="font-medium">Vencimento:</span> {formatDate(invoice.due_date)}</p>}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex justify-center gap-3 flex-wrap">
        <Button variant="outline" size="sm" onClick={goToSaleComparison}>
          <GitCompareArrows className="h-4 w-4 mr-2" /> Comparar com Venda
        </Button>
        <Button variant="outline" size="sm" onClick={() => setCompareOpen(true)}>
          <ArrowLeftRight className="h-4 w-4 mr-2" /> Comparar em outra tabela
        </Button>
        <Button variant="outline" size="sm" onClick={exportCSV}>
          <Download className="h-4 w-4 mr-2" /> CSV
        </Button>
        <Button variant="outline" size="sm" onClick={() => { const d = getExportData(); if (d) exportInvoiceXLS(d); }}>
          <FileSpreadsheet className="h-4 w-4 mr-2" /> XLS
        </Button>
        <Button variant="outline" size="sm" onClick={() => { const d = getExportData(); if (d) exportInvoicePDF(d); }}>
          <FileText className="h-4 w-4 mr-2" /> PDF
        </Button>

        {isDraft && !isClosed && (
          <>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-destructive border-destructive hover:bg-destructive/10" disabled={actionLoading}>
                  <Trash2 className="h-4 w-4 mr-2" /> Excluir
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Excluir fatura?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação é irreversível. A fatura <strong>{invoice.invoice_number}</strong> e todos os seus itens serão removidos permanentemente.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Excluir
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="default" size="sm" disabled={actionLoading}>
                  <Lock className="h-4 w-4 mr-2" /> Encerrar Fatura
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Encerrar fatura?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Ao encerrar, a fatura <strong>{invoice.invoice_number}</strong> será marcada como fechada e não poderá mais ser editada ou excluída.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClose}>Encerrar</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        )}

        {isClosed && (
          <Badge variant="secondary" className="bg-green-100 text-green-800 px-3 py-1">
            <Lock className="h-3 w-3 mr-1" /> Fatura Encerrada
          </Badge>
        )}
      </div>

      <InvoiceCompareDialog
        open={compareOpen}
        onOpenChange={setCompareOpen}
        type="cost"
        items={items.map(i => ({
          skuName: i.sku.name,
          skuCode: i.sku.code,
          quantity: i.quantity,
          unitValue: i.unit_cost,
          totalValue: i.total_cost || 0,
        }))}
      />

      {/* Items Table */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Itens da Fatura</h2>
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Item</TableHead>
                  <TableHead>Código (SKU)</TableHead>
                  <TableHead className="text-right">Quantidade</TableHead>
                  <TableHead className="text-right">Preço Und. (R$)</TableHead>
                  <TableHead className="text-right">Total (R$)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                      Nenhum item encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  <>
                    {items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="max-w-[250px]">{item.sku.name}</TableCell>
                        <TableCell className="font-mono text-sm">{item.sku.code}</TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.unit_cost)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.total_cost || 0)}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-muted/30 font-semibold">
                      <TableCell colSpan={4}>Valor total</TableCell>
                      <TableCell className="text-right">{formatCurrency(totalItems)}</TableCell>
                    </TableRow>
                  </>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Financial Summary */}
      <div>
        <h2 className="text-xl font-bold mb-4">Resumo Financeiro</h2>
        <div className="flex justify-between items-center py-2">
          <span className="font-medium">Subtotal</span>
          <span className="text-2xl font-bold">{formatCurrency(totalItems)}</span>
        </div>
      </div>
    </div>
  );
};

export default InvoiceCostDetail;
