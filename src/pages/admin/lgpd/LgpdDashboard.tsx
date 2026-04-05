import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Database, FileText, AlertTriangle, Users } from "lucide-react";
import { Link } from "react-router-dom";

const LgpdDashboard = () => {
  const { data: mappingCount } = useQuery({
    queryKey: ["lgpd-mapping-count"],
    queryFn: async () => {
      const { count } = await supabase.from("lgpd_data_mapping").select("*", { count: "exact", head: true });
      return count || 0;
    },
  });

  const { data: requestCount } = useQuery({
    queryKey: ["lgpd-requests-count"],
    queryFn: async () => {
      const { count } = await supabase.from("lgpd_data_requests").select("*", { count: "exact", head: true });
      return count || 0;
    },
  });

  const { data: pendingRequests } = useQuery({
    queryKey: ["lgpd-pending-requests"],
    queryFn: async () => {
      const { count } = await supabase.from("lgpd_data_requests").select("*", { count: "exact", head: true }).eq("status", "pendente");
      return count || 0;
    },
  });

  const { data: incidentCount } = useQuery({
    queryKey: ["lgpd-incidents-count"],
    queryFn: async () => {
      const { count } = await supabase.from("lgpd_incidents").select("*", { count: "exact", head: true });
      return count || 0;
    },
  });

  const { data: consentCount } = useQuery({
    queryKey: ["lgpd-consent-count"],
    queryFn: async () => {
      const { count } = await supabase.from("lgpd_consent_records").select("*", { count: "exact", head: true });
      return count || 0;
    },
  });

  const cards = [
    { title: "Mapeamento de Dados", value: mappingCount ?? 0, subtitle: "Operações registradas (ROPA)", icon: Database, path: "/admin/lgpd/ropa", color: "text-blue-600" },
    { title: "Consentimentos", value: consentCount ?? 0, subtitle: "Registros de consentimento", icon: Users, path: "/admin/lgpd/consents", color: "text-green-600" },
    { title: "Solicitações", value: requestCount ?? 0, subtitle: `${pendingRequests ?? 0} pendente(s)`, icon: FileText, path: "/admin/lgpd/requests", color: "text-orange-600" },
    { title: "Incidentes", value: incidentCount ?? 0, subtitle: "Registros de incidentes", icon: AlertTriangle, path: "/admin/lgpd/incidents", color: "text-red-600" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">LGPD — Conformidade</h2>
        <p className="text-muted-foreground text-sm">Painel de controle de proteção de dados pessoais</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Link key={c.path} to={c.path}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{c.title}</CardTitle>
                <c.icon className={`h-5 w-5 ${c.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{c.value}</div>
                <p className="text-xs text-muted-foreground">{c.subtitle}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" /> Encarregado de Dados (DPO)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          <p><strong>Nome:</strong> César Augusto Cavalcante Valente</p>
          <p><strong>E-mail:</strong> <a href="mailto:dpo@thebestcloud.com.br" className="text-primary hover:underline">dpo@thebestcloud.com.br</a></p>
        </CardContent>
      </Card>
    </div>
  );
};

export default LgpdDashboard;
