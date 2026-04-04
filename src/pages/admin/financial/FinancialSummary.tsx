import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from "recharts";

const formatCurrency = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

const COLORS = ["#22c55e", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899", "#14b8a6"];

const FinancialSummary = () => {
  const [totals, setTotals] = useState({ receitas: 0, despesas: 0, comissoes: 0 });
  const [monthlyData, setMonthlyData] = useState<{ month: string; receitas: number; despesas: number }[]>([]);
  const [categoryData, setCategoryData] = useState<{ name: string; value: number }[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: transactions } = await supabase
        .from("financial_transactions")
        .select("*, financial_categories(name)")
        .order("date", { ascending: false });

      const { data: commissions } = await supabase
        .from("financial_commissions")
        .select("*");

      if (transactions) {
        const receitas = transactions.filter(t => t.type === "receita").reduce((s, t) => s + Number(t.amount), 0);
        const despesas = transactions.filter(t => t.type === "despesa").reduce((s, t) => s + Number(t.amount), 0);
        const comissoes = (commissions || []).reduce((s, c) => s + Number(c.amount), 0);
        setTotals({ receitas, despesas, comissoes });

        // Monthly aggregation (last 6 months)
        const months: Record<string, { receitas: number; despesas: number }> = {};
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const key = d.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });
          months[key] = { receitas: 0, despesas: 0 };
        }
        transactions.forEach(t => {
          const d = new Date(t.date);
          const key = d.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });
          if (months[key]) {
            if (t.type === "receita") months[key].receitas += Number(t.amount);
            else months[key].despesas += Number(t.amount);
          }
        });
        setMonthlyData(Object.entries(months).map(([month, v]) => ({ month, ...v })));

        // Category distribution (despesas)
        const catMap: Record<string, number> = {};
        transactions.filter(t => t.type === "despesa").forEach((t: any) => {
          const name = t.financial_categories?.name || "Sem categoria";
          catMap[name] = (catMap[name] || 0) + Number(t.amount);
        });
        setCategoryData(Object.entries(catMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 8));

        setRecentTransactions(transactions.slice(0, 5));
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const saldo = totals.receitas - totals.despesas - totals.comissoes;

  if (loading) {
    return <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Receitas</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totals.receitas)}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <ArrowUpRight className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Despesas</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(totals.despesas)}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                <ArrowDownRight className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Comissões</p>
                <p className="text-2xl font-bold text-orange-600">{formatCurrency(totals.comissoes)}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Saldo</p>
                <p className={`text-2xl font-bold ${saldo >= 0 ? "text-green-600" : "text-red-600"}`}>{formatCurrency(saldo)}</p>
              </div>
              <div className={`h-10 w-10 rounded-full ${saldo >= 0 ? "bg-green-100" : "bg-red-100"} flex items-center justify-center`}>
                {saldo >= 0 ? <TrendingUp className="h-5 w-5 text-green-600" /> : <TrendingDown className="h-5 w-5 text-red-600" />}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Receitas vs Despesas (últimos 6 meses)</CardTitle></CardHeader>
          <CardContent>
            {monthlyData.some(d => d.receitas > 0 || d.despesas > 0) ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="month" fontSize={11} />
                  <YAxis tickFormatter={v => formatCurrency(v)} fontSize={10} />
                  <Tooltip formatter={(v: number) => formatCurrency(v)} />
                  <Bar dataKey="receitas" fill="#22c55e" radius={[4, 4, 0, 0]} name="Receitas" />
                  <Bar dataKey="despesas" fill="#ef4444" radius={[4, 4, 0, 0]} name="Despesas" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-center py-12">Nenhum dado disponível</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Despesas por categoria</CardTitle></CardHeader>
          <CardContent>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={100} paddingAngle={2}>
                    {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => formatCurrency(v)} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-center py-12">Nenhum dado disponível</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader><CardTitle className="text-base">Últimas movimentações</CardTitle></CardHeader>
        <CardContent>
          {recentTransactions.length > 0 ? (
            <div className="space-y-3">
              {recentTransactions.map((t: any) => (
                <div key={t.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${t.type === "receita" ? "bg-green-100" : "bg-red-100"}`}>
                      {t.type === "receita" ? <ArrowUpRight className="h-4 w-4 text-green-600" /> : <ArrowDownRight className="h-4 w-4 text-red-600" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{t.description}</p>
                      <p className="text-xs text-muted-foreground">{new Date(t.date).toLocaleDateString("pt-BR")}</p>
                    </div>
                  </div>
                  <span className={`font-semibold ${t.type === "receita" ? "text-green-600" : "text-red-600"}`}>
                    {t.type === "receita" ? "+" : "-"}{formatCurrency(Number(t.amount))}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">Nenhuma movimentação registrada.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialSummary;
