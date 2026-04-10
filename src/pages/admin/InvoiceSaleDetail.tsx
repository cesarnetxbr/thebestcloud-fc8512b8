import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Download, GitCompareArrows, Mail, RefreshCw, FileSpreadsheet, FileText } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { exportInvoiceXLS, exportInvoicePDF } from "@/utils/invoiceExport";

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
  unit_price: number;
  total_price: number | null;
  sku: {
    name: string;
    code: string;
  };
}

const InvoiceSaleDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [tenantName, setTenantName] = useState<string>("—");

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

        const { data: tenants } = await supabase
          .from("tenants")
          .select("name")
          .eq("customer_id", inv.customer_id)
          .limit(1);
        if (tenants && tenants.length > 0) setTenantName(tenants[0].name);
      }

      const { data: itemsData } = await supabase
        .from("invoice_items")
        .select("id, quantity, unit_price, total_price, skus(name, code)")
        .eq("invoice_id", id);

      if (itemsData) {
        setItems(
          itemsData.map((it: any) => ({
            id: it.id,
            quantity: it.quantity,
            unit_price: it.unit_price,
            total_price: it.total_price,
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
      `"${i.sku.name}",${i.sku.code},${i.quantity},${i.unit_price},${i.total_price || 0}`
    ).join("\n");
    const blob = new Blob([header + csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `pedido-venda-${invoice.invoice_number}.csv`; a.click();
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
        unitValue: i.unit_price,
        totalValue: i.total_price || 0,
      })),
      type: "sale" as const,
    };
  };

  const costInvoiceNumber = invoice?.invoice_number.replace("SALE-", "COST-");

  const goToCostComparison = async () => {
    if (!costInvoiceNumber) return;
    const { data } = await supabase
      .from("invoices")
      .select("id")
      .eq("invoice_number", costInvoiceNumber)
      .single();
    if (data) navigate(`/admin/invoices/custo/${data.id}`);
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
        <Button variant="ghost" onClick={() => navigate("/admin/invoices/venda")}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
        </Button>
        <p className="text-center text-muted-foreground">Pedido não encontrado.</p>
      </div>
    );
  }

  const totalItems = items.reduce((sum, i) => sum + (i.total_price || 0), 0);
  const periodLabel = `${new Date(invoice.period_start).toLocaleDateString("pt-BR", { month: "2-digit", year: "numeric" })} - ${new Date(invoice.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/admin/invoices/venda")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Detalhes do Pedido de Venda</h1>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold">Pedido de Venda Nº {invoice.invoice_number}</h2>
        <p className="text-sm text-muted-foreground">Status: {invoice.status || "DRAFT"}</p>
        <p className="text-sm text-muted-foreground">Período de Faturamento: {periodLabel}</p>
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
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-2">
            <h3 className="font-semibold text-base">Informações do Pedido</h3>
            <Separator />
            <div className="text-sm space-y-1">
              <p><span className="font-medium">Número do Pedido:</span> {invoice.invoice_number}</p>
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
        <Button variant="outline" size="sm" onClick={goToCostComparison}>
          <GitCompareArrows className="h-4 w-4 mr-2" /> Comparar com Custo
        </Button>
        <Button variant="outline" size="sm" onClick={() => toast.info("Funcionalidade em desenvolvimento")}>
          <Mail className="h-4 w-4 mr-2" /> Enviar E-mail
        </Button>
        <Button variant="outline" size="sm" onClick={() => toast.info("Funcionalidade em desenvolvimento")}>
          <RefreshCw className="h-4 w-4 mr-2" /> Sincronizar CRM
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
      </div>

      {/* Items Table */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Itens do Pedido</h2>
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
                        <TableCell className="text-right">{formatCurrency(item.unit_price)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.total_price || 0)}</TableCell>
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

export default InvoiceSaleDetail;
