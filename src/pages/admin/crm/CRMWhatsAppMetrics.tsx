import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, MessageCircle, TrendingUp, Clock, Target } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  BarChart,
  Bar,
} from "recharts";
import { Link } from "react-router-dom";

interface Metrics {
  period_days: number;
  kpis: {
    total_leads: number;
    total_deals: number;
    total_ganho: number;
    conversion_rate: number;
    avg_time_to_proposal_hours: number;
  };
  top_services: { service: string; count: number }[];
  series: { date: string; leads: number; deals: number }[];
  recent_deals: any[];
}

const PERIODS = [7, 30, 90];

export default function CRMWhatsAppMetrics() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    supabase.functions
      .invoke("crm-whatsapp-metrics", { method: "GET" as any, body: undefined as any })
      .then(async () => {
        // supabase-js não passa query string facilmente; usa fetch direto
      });
    (async () => {
      try {
        const { data: sess } = await supabase.auth.getSession();
        const token = sess.session?.access_token;
        const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
        const res = await fetch(
          `https://${projectId}.supabase.co/functions/v1/crm-whatsapp-metrics?days=${days}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        const json = await res.json();
        if (active) setData(json);
      } catch (e) {
        console.error(e);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [days]);

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <MessageCircle className="h-6 w-6 text-primary" /> Métricas WhatsApp
          </h1>
          <p className="text-sm text-muted-foreground">
            Acompanhamento dos atendimentos qualificados via WhatsApp
          </p>
        </div>
        <div className="flex gap-2">
          {PERIODS.map((d) => (
            <Button
              key={d}
              size="sm"
              variant={days === d ? "default" : "outline"}
              onClick={() => setDays(d)}
            >
              {d} dias
            </Button>
          ))}
        </div>
      </div>

      {loading || !data ? (
        <div className="flex items-center justify-center h-60">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <KpiCard
              icon={<MessageCircle className="h-5 w-5 text-primary" />}
              label="Leads qualificados"
              value={data.kpis.total_leads}
            />
            <KpiCard
              icon={<Clock className="h-5 w-5 text-primary" />}
              label="Tempo médio até proposta"
              value={`${data.kpis.avg_time_to_proposal_hours}h`}
            />
            <KpiCard
              icon={<Target className="h-5 w-5 text-primary" />}
              label="Taxa de conversão"
              value={`${data.kpis.conversion_rate}%`}
            />
            <KpiCard
              icon={<TrendingUp className="h-5 w-5 text-primary" />}
              label="Negócios ganhos"
              value={data.kpis.total_ganho}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Leads x Negócios por dia</CardTitle>
              </CardHeader>
              <CardContent className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.series}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="leads" stroke="hsl(var(--primary))" name="Leads" />
                    <Line type="monotone" dataKey="deals" stroke="hsl(24 95% 53%)" name="Negócios" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Principais serviços solicitados</CardTitle>
              </CardHeader>
              <CardContent className="h-72">
                {data.top_services.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                    Nenhum serviço identificado no período
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.top_services}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="service" tick={{ fontSize: 11 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="count" fill="hsl(var(--primary))" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Últimos negócios WhatsApp</CardTitle>
            </CardHeader>
            <CardContent>
              {data.recent_deals.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum negócio no período.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Título</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Probabilidade</TableHead>
                      <TableHead>Criado em</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.recent_deals.map((d) => (
                      <TableRow key={d.id}>
                        <TableCell>
                          <Link to="/admin/crm/pipeline" className="hover:underline">
                            {d.title}
                          </Link>
                        </TableCell>
                        <TableCell>
                          {Number(d.value || 0).toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })}
                        </TableCell>
                        <TableCell>
                          <Badge variant={d.status === "ganho" ? "default" : "secondary"}>
                            {d.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{d.probability ?? "-"}%</TableCell>
                        <TableCell>
                          {new Date(d.created_at).toLocaleDateString("pt-BR")}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

function KpiCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">{icon}</div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
