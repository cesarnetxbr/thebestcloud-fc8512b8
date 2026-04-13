import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { DollarSign, Users, TrendingUp, AlertTriangle, Gift, FileText } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from "recharts";

const COLORS = ["hsl(215, 70%, 25%)", "hsl(25, 95%, 55%)", "hsl(215, 60%, 55%)", "hsl(25, 95%, 70%)", "hsl(215, 40%, 70%)"];

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalCustomers: 0,
    activeCustomers: 0,
    totalRevenue: 0,
    totalTrialClients: 0,
    pendingInvoices: 0,
    totalMargin: 0,
  });
  const [customersByStatus, setCustomersByStatus] = useState<{ name: string; value: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [customersRes, trialRes, invoicesRes] = await Promise.all([
          supabase.from("customers").select("*"),
          supabase.from("trial_clients").select("id, status"),
          supabase.from("invoices").select("*"),
        ]);

        const customers = customersRes.data || [];
        const trialClients = trialRes.data || [];
        const activeTrials = trialClients.filter((t: any) => t.status === "active" || t.status === "pending").length;
        const invoices = invoicesRes.data || [];

        const active = customers.filter((c) => c.status === "active").length;
        const revenue = customers.reduce((sum, c) => sum + (c.monthly_revenue || 0), 0);
        const pending = invoices.filter((i) => i.status === "pending" || i.status === "draft").length;
        const margin = invoices.reduce((sum, i) => sum + (i.margin || 0), 0);

        setStats({
          totalCustomers: customers.length,
          activeCustomers: active,
          totalRevenue: revenue,
          totalTrialClients: activeTrials,
          pendingInvoices: pending,
          totalMargin: margin,
        });

        // Group customers by status
        const statusMap: Record<string, number> = {};
        customers.forEach((c) => {
          const s = c.status || "unknown";
          statusMap[s] = (statusMap[s] || 0) + 1;
        });
        const statusLabels: Record<string, string> = {
          active: "Ativo",
          inactive: "Inativo",
          trial: "Trial",
          suspended: "Suspenso",
        };
        setCustomersByStatus(
          Object.entries(statusMap).map(([k, v]) => ({ name: statusLabels[k] || k, value: v }))
        );
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Mock monthly data for charts (will be replaced with real data)
  const monthlyData = [
    { month: "Jan", receita: 12400, custo: 8200, margem: 4200 },
    { month: "Fev", receita: 14800, custo: 9100, margem: 5700 },
    { month: "Mar", receita: 16200, custo: 9800, margem: 6400 },
    { month: "Abr", receita: 15900, custo: 9600, margem: 6300 },
    { month: "Mai", receita: 18500, custo: 10400, margem: 8100 },
    { month: "Jun", receita: 21000, custo: 11200, margem: 9800 },
  ];

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const kpiCards = [
    { title: "Receita Mensal", value: formatCurrency(stats.totalRevenue), icon: DollarSign, color: "text-green-600" },
    { title: "Clientes Ativos", value: stats.activeCustomers.toString(), icon: Users, color: "text-primary" },
    { title: "Total de Clientes", value: stats.totalCustomers.toString(), icon: TrendingUp, color: "text-accent" },
    { title: "Clientes Trial", value: stats.totalTrialClients.toString(), icon: Gift, color: "text-orange-500" },
    { title: "Faturas Pendentes", value: stats.pendingInvoices.toString(), icon: FileText, color: "text-yellow-600" },
    { title: "Margem Total", value: formatCurrency(stats.totalMargin), icon: AlertTriangle, color: "text-emerald-600" },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.title} className="shadow-soft hover:shadow-medium transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-secondary ${kpi.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{kpi.title}</p>
                    <p className="text-lg font-bold text-foreground">{kpi.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Revenue & Cost Chart */}
        <Card className="lg:col-span-2 shadow-soft">
          <CardHeader>
            <CardTitle className="text-lg">Receita vs Custo (Últimos 6 meses)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(215, 20%, 88%)" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{ borderRadius: 8, border: "1px solid hsl(215, 20%, 88%)" }}
                  />
                  <Legend />
                  <Bar dataKey="receita" name="Receita" fill="hsl(215, 70%, 25%)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="custo" name="Custo" fill="hsl(25, 95%, 55%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Customers by status */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-lg">Clientes por Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              {customersByStatus.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={customersByStatus}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={90}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {customersByStatus.map((_, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Nenhum cliente cadastrado ainda
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Margin trend */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-lg">Evolução da Margem</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(215, 20%, 88%)" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ borderRadius: 8, border: "1px solid hsl(215, 20%, 88%)" }}
                />
                <Line type="monotone" dataKey="margem" name="Margem" stroke="hsl(25, 95%, 55%)" strokeWidth={3} dot={{ r: 5 }} />
                <Line type="monotone" dataKey="receita" name="Receita" stroke="hsl(215, 70%, 25%)" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
