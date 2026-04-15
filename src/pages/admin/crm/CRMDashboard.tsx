import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Target, TrendingUp, DollarSign, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const CRMDashboard = () => {
  const { data: leads = [] } = useQuery({
    queryKey: ["crm_leads_summary"],
    queryFn: async () => {
      const { data } = await supabase.from("crm_leads").select("id, status, created_at");
      return data || [];
    },
  });

  const { data: deals = [] } = useQuery({
    queryKey: ["crm_deals_summary"],
    queryFn: async () => {
      const { data } = await supabase.from("crm_deals").select("id, status, value, stage_id, created_at");
      return data || [];
    },
  });

  const { data: stages = [] } = useQuery({
    queryKey: ["crm_pipeline_stages"],
    queryFn: async () => {
      const { data } = await supabase.from("crm_pipeline_stages").select("*").eq("is_active", true).order("position");
      return data || [];
    },
  });

  const { data: recentActivities = [] } = useQuery({
    queryKey: ["crm_recent_activities"],
    queryFn: async () => {
      const { data } = await supabase.from("crm_activities").select("*").order("created_at", { ascending: false }).limit(10);
      return data || [];
    },
  });

  const totalLeads = leads.length;
  const newLeads = leads.filter((l: any) => l.status === "novo").length;
  const openDeals = deals.filter((d: any) => d.status === "aberto").length;
  const totalPipeline = deals
    .filter((d: any) => d.status === "aberto")
    .reduce((sum: number, d: any) => sum + (Number(d.value) || 0), 0);
  const wonDeals = deals.filter((d: any) => d.status === "ganho").length;
  const conversionRate = deals.length > 0 ? ((wonDeals / deals.length) * 100).toFixed(1) : "0";

  const activityTypeLabels: Record<string, string> = {
    nota: "📝 Nota",
    ligacao: "📞 Ligação",
    email: "✉️ E-mail",
    reuniao: "📅 Reunião",
  };

  // Deals per stage
  const dealsPerStage = stages.map((s: any) => ({
    ...s,
    count: deals.filter((d: any) => d.stage_id === s.id && d.status === "aberto").length,
    value: deals
      .filter((d: any) => d.stage_id === s.id && d.status === "aberto")
      .reduce((sum: number, d: any) => sum + (Number(d.value) || 0), 0),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">CRM</h2>
          <p className="text-muted-foreground">Visão geral do relacionamento com clientes</p>
        </div>
        <div className="flex gap-2">
          <Link to="/admin/crm/leads">
            <Button variant="outline" size="sm">Leads <ArrowRight className="ml-1 h-4 w-4" /></Button>
          </Link>
          <Link to="/admin/crm/pipeline">
            <Button size="sm">Pipeline <ArrowRight className="ml-1 h-4 w-4" /></Button>
          </Link>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLeads}</div>
            <p className="text-xs text-muted-foreground">{newLeads} novos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Negócios Abertos</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{openDeals}</div>
            <p className="text-xs text-muted-foreground">em andamento</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pipeline Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalPipeline.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </div>
            <p className="text-xs text-muted-foreground">valor em negociação</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Taxa de Conversão</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversionRate}%</div>
            <p className="text-xs text-muted-foreground">{wonDeals} ganhos de {deals.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Funil visual */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Funil de Vendas</CardTitle>
        </CardHeader>
        <CardContent>
          {dealsPerStage.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma etapa configurada</p>
          ) : (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {dealsPerStage.map((s: any) => (
                <div
                  key={s.id}
                  className="flex-1 min-w-[140px] rounded-lg p-3 border"
                  style={{ borderColor: s.color }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
                    <span className="text-sm font-medium truncate">{s.name}</span>
                  </div>
                  <div className="text-xl font-bold">{s.count}</div>
                  <div className="text-xs text-muted-foreground">
                    {s.value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Atividades recentes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Atividades Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          {recentActivities.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma atividade registrada</p>
          ) : (
            <div className="space-y-3">
              {recentActivities.map((a: any) => (
                <div key={a.id} className="flex items-start gap-3 text-sm">
                  <span>{activityTypeLabels[a.type] || a.type}</span>
                  <span className="flex-1 text-muted-foreground">{a.description}</span>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(a.created_at).toLocaleDateString("pt-BR")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CRMDashboard;
