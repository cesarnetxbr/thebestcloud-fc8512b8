import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { DollarSign, TrendingUp, Receipt, CalendarDays, Play } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const formatCurrency = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

const InvoiceDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalCost: 0, totalSale: 0, totalMargin: 0 });
  const [topInvoices, setTopInvoices] = useState<{ name: string; value: number }[]>([]);
  const [skuDistribution, setSkuDistribution] = useState<{ name: string; value: number }[]>([]);
  const [loading, setLoading] = useState(true);

  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth() - 1, 3);
  const periodEnd = new Date(now.getFullYear(), now.getMonth(), 3);
  const periodLabel = `${periodStart.toLocaleDateString("pt-BR")} – ${periodEnd.toLocaleDateString("pt-BR")}`;

  useEffect(() => {
    const fetchData = async () => {
      // Fetch invoices with customer names for the period
      const { data: invoices } = await supabase
        .from("invoices")
        .select("id, total_cost, total_sale, margin, customers(name)")
        .order("total_sale", { ascending: false });

      if (invoices) {
        const totalCost = invoices.reduce((s, i) => s + (Number(i.total_cost) || 0), 0);
        const totalSale = invoices.reduce((s, i) => s + (Number(i.total_sale) || 0), 0);
        const totalMargin = invoices.reduce((s, i) => s + (Number(i.margin) || 0), 0);
        setStats({ totalCost, totalSale, totalMargin });

        const top = invoices.slice(0, 10).map((inv: any) => ({
          name: inv.customers?.name || "—",
          value: Number(inv.total_sale) || 0,
        }));
        setTopInvoices(top);
      }

      // Fetch SKU distribution from invoice items
      const { data: items } = await supabase
        .from("invoice_items")
        .select("sku_id, quantity, skus(name)");

      if (items) {
        const skuMap: Record<string, number> = {};
        items.forEach((item: any) => {
          const name = item.skus?.name || item.sku_id;
          skuMap[name] = (skuMap[name] || 0) + Number(item.quantity);
        });
        const dist = Object.entries(skuMap)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 8);
        setSkuDistribution(dist);
      }

      setLoading(false);
    };
    fetchData();
  }, []);

  const COLORS = ["#22c55e", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899", "#14b8a6"];

  const cycleDay = now.getDate();
  const cycleDayTarget = 3;
  const cycleProgress = Math.min((cycleDay / 30) * 100, 100);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-soft">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-2">
              <Receipt className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-base">Faturamento total</h3>
            </div>
            <p className="text-3xl font-bold">{formatCurrency(stats.totalSale)}</p>
            <p className="text-sm text-green-500 mt-1">Último mês: {periodLabel}</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={() => navigate("/admin/invoices")}>
              Ver o faturamento
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="h-5 w-5 text-orange-500" />
              <h3 className="font-semibold text-base">Valores de custo</h3>
            </div>
            <p className="text-3xl font-bold">{formatCurrency(stats.totalCost)}</p>
            <p className="text-sm text-orange-500 mt-1">Último mês: {periodLabel}</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={() => navigate("/admin/invoices/custo")}>
              Ver tabela de custos
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <h3 className="font-semibold text-base">Valores de venda</h3>
            </div>
            <p className="text-3xl font-bold">{formatCurrency(stats.totalMargin > 0 ? stats.totalSale : 0)}</p>
            <p className="text-sm text-green-500 mt-1">Último mês: {periodLabel}</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={() => navigate("/admin/invoices/venda")}>
              Ver tabela de venda
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Billing Cycle */}
      <Card className="shadow-soft">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 mb-4">
            <CalendarDays className="h-6 w-6 text-primary" />
            <h3 className="font-semibold text-lg">Ciclo de faturamento</h3>
            <span className="ml-auto text-sm text-muted-foreground">Dia {String(cycleDayTarget).padStart(2, "0")}</span>
          </div>
          <div className="w-full bg-muted rounded-full h-3 mb-4">
            <div className="bg-primary h-3 rounded-full transition-all" style={{ width: `${cycleProgress}%` }} />
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Ciclo de {now.toLocaleString("pt-BR", { month: "long" })} de {now.getFullYear()} disponível para execução.
          </p>
          <Button className="w-full bg-green-500 hover:bg-green-600 text-white">
            <Play className="h-4 w-4 mr-2" /> Executar Agora
          </Button>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Ao clicar, você irá gerar faturas referentes a {now.toLocaleString("pt-BR", { month: "long" })} de {now.getFullYear()}
          </p>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-soft">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-base mb-4">Top 10 faturamentos</h3>
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
            <h3 className="font-semibold text-base mb-4">Itens mais consumidos</h3>
            {skuDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={skuDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={110} paddingAngle={2}>
                    {skuDistribution.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
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
