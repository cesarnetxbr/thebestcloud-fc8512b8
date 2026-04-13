import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { DollarSign, TrendingUp, Receipt, CalendarDays, Play, RefreshCw, Loader2 } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const formatCurrency = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

const InvoiceDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalCost: 0, totalSale: 0, totalMargin: 0 });
  const [topInvoices, setTopInvoices] = useState<{ name: string; value: number }[]>([]);
  const [skuDistribution, setSkuDistribution] = useState<{ name: string; value: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);
  const [executionStep, setExecutionStep] = useState("");
  const [topViewMode, setTopViewMode] = useState<"sale" | "cost">("sale");
  const [skuViewMode, setSkuViewMode] = useState<"sku" | "name">("sku");

  // Monthly consumption trend
  const [monthlyTrend, setMonthlyTrend] = useState<{ month: string; cost: number; sale: number }[]>([]);
  const [trendPeriod, setTrendPeriod] = useState<"year" | "6m">("year");

  const now = new Date();
  // Billing period selection
  const [selectedMonth, setSelectedMonth] = useState(String(now.getMonth()));
  const [selectedYear, setSelectedYear] = useState(String(now.getFullYear()));

  const periodStart = new Date(Number(selectedYear), Number(selectedMonth), 1);
  const periodEnd = new Date(Number(selectedYear), Number(selectedMonth) + 1, 0);
  const periodLabel = `${periodStart.toLocaleDateString("pt-BR")} – ${periodEnd.toLocaleDateString("pt-BR")}`;

  const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  const availableYears = Array.from({ length: 3 }, (_, i) => String(now.getFullYear() - i));

  const [projectionStats, setProjectionStats] = useState({ totalCost: 0, totalSale: 0, totalMargin: 0 });

  const fetchData = async () => {
    setLoading(true);
    const { data: invoices } = await supabase
      .from("invoices")
      .select("id, invoice_number, total_cost, total_sale, margin, period_start, period_end, status, customers(name)")
      .order("total_sale", { ascending: false });

    if (invoices) {
      // Separate COST and SALE invoices
      const costInvoices = invoices.filter((i: any) => i.invoice_number?.startsWith("COST-"));
      const saleInvoices = invoices.filter((i: any) => i.invoice_number?.startsWith("SALE-"));

      // Separate closed (real) vs draft (projection)
      const closedCost = costInvoices.filter((i: any) => i.status === "closed");
      const closedSale = saleInvoices.filter((i: any) => i.status === "closed");
      const draftCost = costInvoices.filter((i: any) => i.status !== "closed");
      const draftSale = saleInvoices.filter((i: any) => i.status !== "closed");

      const totalCost = closedCost.reduce((s, i) => s + (Number(i.total_cost) || 0), 0);
      const totalSale = closedSale.reduce((s, i) => s + (Number(i.total_sale) || 0), 0);
      const totalMargin = totalSale - totalCost;
      setStats({ totalCost, totalSale, totalMargin });

      const projCost = draftCost.reduce((s, i) => s + (Number(i.total_cost) || 0), 0);
      const projSale = draftSale.reduce((s, i) => s + (Number(i.total_sale) || 0), 0);
      const projMargin = projSale - projCost;
      setProjectionStats({ totalCost: projCost, totalSale: projSale, totalMargin: projMargin });

      // Top invoices by sale or cost
      const sorted = [...invoices].sort((a, b) =>
        topViewMode === "sale"
          ? (Number(b.total_sale) || 0) - (Number(a.total_sale) || 0)
          : (Number(b.total_cost) || 0) - (Number(a.total_cost) || 0)
      );
      const topItems = sorted.slice(0, 10).map((inv: any) => ({
        name: inv.customers?.name?.substring(0, 15) || "—",
        value: topViewMode === "sale" ? (Number(inv.total_sale) || 0) : (Number(inv.total_cost) || 0),
      }));
      setTopInvoices(topItems);

      // Monthly trend
      const monthMap: Record<string, { cost: number; sale: number }> = {};
      invoices.forEach((inv: any) => {
        const d = new Date(inv.period_start);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        if (!monthMap[key]) monthMap[key] = { cost: 0, sale: 0 };
        monthMap[key].cost += Number(inv.total_cost) || 0;
        monthMap[key].sale += Number(inv.total_sale) || 0;
      });
      const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
      const trend = Object.entries(monthMap)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, v]) => ({
          month: months[parseInt(key.split("-")[1]) - 1],
          cost: v.cost,
          sale: v.sale,
        }));
      setMonthlyTrend(trendPeriod === "6m" ? trend.slice(-6) : trend.slice(-12));
    }

    // SKU distribution
    const { data: items } = await supabase
      .from("invoice_items")
      .select("sku_id, quantity, skus(name, code)");

    if (items) {
      const skuMap: Record<string, number> = {};
      items.forEach((item: any) => {
        const name = skuViewMode === "sku" ? (item.skus?.code || item.sku_id) : (item.skus?.name || item.sku_id);
        skuMap[name] = (skuMap[name] || 0) + Number(item.quantity);
      });
      const dist = Object.entries(skuMap)
        .map(([name, value]) => ({ name: name.substring(0, 15), value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 8);
      setSkuDistribution(dist);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [topViewMode, skuViewMode, trendPeriod]);

  const handleExecute = async () => {
    setExecuting(true);
    try {
      // Step 1: Sync usage from Acronis
      setExecutionStep("Sincronizando consumo da Acronis...");
      const { data: syncData, error: syncError } = await supabase.functions.invoke("sync-tenant-usage");
      if (syncError) throw syncError;
      if (syncData?.error) throw new Error(syncData.error);

      const totalSynced = syncData.results?.reduce((sum: number, r: any) => sum + (r.usage_items_synced || 0), 0) || 0;
      toast.info(`Consumo sincronizado: ${totalSynced} itens`);

      // Step 2: Generate invoices
      setExecutionStep("Gerando faturas de custo e venda...");
      const { data: genData, error: genError } = await supabase.functions.invoke("generate-invoices", {
        body: {
          period_start: periodStart.toISOString().split("T")[0],
          period_end: periodEnd.toISOString().split("T")[0],
        },
      });
      if (genError) throw genError;
      if (genData?.error) throw new Error(genData.error);

      toast.success(
        `Faturamento concluído! ${genData.cost_invoices || 0} faturas de custo e ${genData.sale_invoices || 0} faturas de venda geradas.`
      );

      // Refresh dashboard
      await fetchData();
    } catch (err: any) {
      toast.error(`Erro no faturamento: ${err.message}`);
    } finally {
      setExecuting(false);
      setExecutionStep("");
    }
  };

  const COLORS = ["#22c55e", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899", "#14b8a6"];

  const cycleDay = now.getDate();
  const cycleProgress = Math.min((cycleDay / 30) * 100, 100);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const hasClosedData = stats.totalCost > 0 || stats.totalSale > 0;
  const hasProjection = projectionStats.totalCost > 0 || projectionStats.totalSale > 0;
  const displayStats = hasClosedData ? stats : projectionStats;
  const isProjection = !hasClosedData && hasProjection;

  return (
    <div className="space-y-6">
      {/* Projection notice */}
      {isProjection && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-lg px-4 py-3 text-sm flex items-center gap-2">
          <CalendarDays className="h-4 w-4" />
          <span><strong>Projeção:</strong> Os valores abaixo são baseados em faturas em rascunho. Encerre o faturamento para exibir valores reais.</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-soft">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-2">
              <Receipt className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-base">Margem total</h3>
              {isProjection && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Projeção</span>}
            </div>
            <p className="text-3xl font-bold">{formatCurrency(displayStats.totalMargin)}</p>
            <p className="text-sm text-muted-foreground mt-1">{isProjection ? "Rascunho" : "Encerrado"}: {periodLabel}</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={() => navigate("/admin/invoices")}>
              Ver o faturamento
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="h-5 w-5 text-destructive" />
              <h3 className="font-semibold text-base">Valores de custo</h3>
              {isProjection && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Projeção</span>}
            </div>
            <p className="text-3xl font-bold">{formatCurrency(displayStats.totalCost)}</p>
            <p className="text-sm text-destructive mt-1">{isProjection ? "Rascunho" : "Encerrado"}: {periodLabel}</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={() => navigate("/admin/invoices/custo")}>
              Ver tabela de custos
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-base">Valores de venda</h3>
              {isProjection && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Projeção</span>}
            </div>
            <p className="text-3xl font-bold">{formatCurrency(displayStats.totalSale)}</p>
            <p className="text-sm text-primary mt-1">{isProjection ? "Rascunho" : "Encerrado"}: {periodLabel}</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={() => navigate("/admin/invoices/venda")}>
              Ver tabela de venda
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Billing Cycle + Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-soft">
          <CardContent className="pt-6">
             <div className="flex items-center gap-3 mb-4">
              <CalendarDays className="h-6 w-6 text-primary" />
              <h3 className="font-semibold text-lg">Ciclo de faturamento</h3>
              <span className="ml-auto text-sm text-muted-foreground">Dia 10</span>
            </div>

            {/* Period Selection */}
            <div className="flex gap-3 mb-4">
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="flex-1 h-9">
                  <SelectValue placeholder="Mês" />
                </SelectTrigger>
                <SelectContent>
                  {monthNames.map((name, i) => (
                    <SelectItem key={i} value={String(i)}>{name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-24 h-9">
                  <SelectValue placeholder="Ano" />
                </SelectTrigger>
                <SelectContent>
                  {availableYears.map(y => (
                    <SelectItem key={y} value={y}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-full bg-muted rounded-full h-3 mb-4">
              <div className="bg-primary h-3 rounded-full transition-all" style={{ width: `${cycleProgress}%` }} />
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Período selecionado: {periodLabel}
            </p>
            <Button
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              onClick={handleExecute}
              disabled={executing}
            >
              {executing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {executionStep || "Processando..."}
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" /> Executar Agora
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Ao clicar, você irá sincronizar o consumo e gerar faturas de {monthNames[Number(selectedMonth)].toLowerCase()} de {selectedYear}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-base">Tendência de Consumo</h3>
              <Select value={trendPeriod} onValueChange={(v) => setTrendPeriod(v as any)}>
                <SelectTrigger className="w-24 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="year">Ano</SelectItem>
                  <SelectItem value="6m">6 meses</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {monthlyTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="month" fontSize={11} />
                  <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} fontSize={11} />
                  <Tooltip formatter={(v: number) => formatCurrency(v)} />
                  <Legend />
                  <Bar dataKey="cost" name="Custo" fill="#f59e0b" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="sale" name="Venda" fill="#22c55e" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-center py-8">Nenhum dado disponível</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-soft">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-base">Top 10 faturamentos</h3>
              <Select value={topViewMode} onValueChange={(v) => setTopViewMode(v as any)}>
                <SelectTrigger className="w-24 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sale">Venda</SelectItem>
                  <SelectItem value="cost">Custo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {topInvoices.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topInvoices} layout="vertical" margin={{ left: 80 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis type="number" tickFormatter={(v) => formatCurrency(v)} fontSize={11} />
                  <YAxis type="category" dataKey="name" width={75} fontSize={11} />
                  <Tooltip formatter={(v: number) => formatCurrency(v)} />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-center py-8">Nenhum dado disponível</p>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-base">Itens mais consumidos</h3>
              <Select value={skuViewMode} onValueChange={(v) => setSkuViewMode(v as any)}>
                <SelectTrigger className="w-32 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sku">SKU do item</SelectItem>
                  <SelectItem value="name">Nome do item</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {skuDistribution.length > 0 ? (
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="60%" height={300}>
                  <PieChart>
                    <Pie data={skuDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={110} paddingAngle={2}>
                      {skuDistribution.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-col gap-1.5 text-xs">
                  {skuDistribution.map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-muted-foreground truncate max-w-[120px]">{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">Nenhum dado disponível</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InvoiceDashboard;
