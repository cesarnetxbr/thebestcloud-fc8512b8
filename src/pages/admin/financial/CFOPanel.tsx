import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, Percent, Target } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area } from "recharts";

const formatCurrency = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

const CFOPanel = () => {
  const [data, setData] = useState({ receitas: 0, despesas: 0, comissoes: 0, margemLiquida: 0 });
  const [cashflow, setCashflow] = useState<{ month: string; saldo: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: txns } = await supabase.from("financial_transactions").select("type, amount, date, status");
      const { data: comms } = await supabase.from("financial_commissions").select("amount");

      if (txns) {
        const receitas = txns.filter(t => t.type === "receita").reduce((s, t) => s + Number(t.amount), 0);
        const despesas = txns.filter(t => t.type === "despesa").reduce((s, t) => s + Number(t.amount), 0);
        const comissoes = (comms || []).reduce((s, c) => s + Number(c.amount), 0);
        const margem = receitas > 0 ? ((receitas - despesas - comissoes) / receitas) * 100 : 0;
        setData({ receitas, despesas, comissoes, margemLiquida: margem });

        // Cashflow evolution
        const months: Record<string, number> = {};
        const now = new Date();
        let acc = 0;
        for (let i = 11; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const key = d.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });
          months[key] = 0;
        }
        txns.forEach(t => {
          const d = new Date(t.date);
          const key = d.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });
          if (months[key] !== undefined) {
            months[key] += t.type === "receita" ? Number(t.amount) : -Number(t.amount);
          }
        });
        const flow: { month: string; saldo: number }[] = [];
        Object.entries(months).forEach(([month, val]) => {
          acc += val;
          flow.push({ month, saldo: acc });
        });
        setCashflow(flow);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) return <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  const saldo = data.receitas - data.despesas - data.comissoes;
  const pendentes = 0; // Would need status filter

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">Visão executiva consolidada das finanças da empresa.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: "Receita Bruta", value: formatCurrency(data.receitas), icon: TrendingUp, color: "text-green-600", bg: "bg-green-100" },
          { label: "Despesas Totais", value: formatCurrency(data.despesas), icon: TrendingDown, color: "text-red-600", bg: "bg-red-100" },
          { label: "Comissões", value: formatCurrency(data.comissoes), icon: DollarSign, color: "text-orange-600", bg: "bg-orange-100" },
          { label: "Saldo Líquido", value: formatCurrency(saldo), icon: Target, color: saldo >= 0 ? "text-green-600" : "text-red-600", bg: saldo >= 0 ? "bg-green-100" : "bg-red-100" },
          { label: "Margem Líquida", value: `${data.margemLiquida.toFixed(1)}%`, icon: Percent, color: data.margemLiquida >= 0 ? "text-blue-600" : "text-red-600", bg: "bg-blue-100" },
        ].map((kpi, i) => (
          <Card key={i}>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-1">
                <div className={`h-8 w-8 rounded-full ${kpi.bg} flex items-center justify-center`}>
                  <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
                </div>
                <span className="text-xs text-muted-foreground">{kpi.label}</span>
              </div>
              <p className={`text-xl font-bold ${kpi.color}`}>{kpi.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Evolução do fluxo de caixa (12 meses)</CardTitle></CardHeader>
        <CardContent>
          {cashflow.some(d => d.saldo !== 0) ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={cashflow}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="month" fontSize={11} />
                <YAxis tickFormatter={v => formatCurrency(v)} fontSize={10} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Area type="monotone" dataKey="saldo" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} name="Saldo acumulado" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-center py-12">Nenhum dado disponível</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CFOPanel;
