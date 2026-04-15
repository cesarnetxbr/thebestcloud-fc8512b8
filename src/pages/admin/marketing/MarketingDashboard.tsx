import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Users, FileText, Send, TrendingUp, BarChart3 } from "lucide-react";

const MarketingDashboard = () => {
  const { data: campaigns } = useQuery({
    queryKey: ["email-campaigns-stats"],
    queryFn: async () => {
      const { data, error } = await supabase.from("email_marketing_campaigns").select("status");
      if (error) throw error;
      return data;
    },
  });

  const { data: lists } = useQuery({
    queryKey: ["email-lists-stats"],
    queryFn: async () => {
      const { data, error } = await supabase.from("email_marketing_lists").select("contact_count");
      if (error) throw error;
      return data;
    },
  });

  const { data: templates } = useQuery({
    queryKey: ["email-templates-stats"],
    queryFn: async () => {
      const { data, error } = await supabase.from("email_marketing_templates").select("id, is_active");
      if (error) throw error;
      return data;
    },
  });

  const totalContacts = lists?.reduce((sum, l) => sum + (l.contact_count || 0), 0) || 0;
  const totalCampaigns = campaigns?.length || 0;
  const sentCampaigns = campaigns?.filter(c => c.status === "sent").length || 0;
  const activeTemplates = templates?.filter(t => t.is_active).length || 0;

  const kpis = [
    { label: "Total de Contatos", value: totalContacts, icon: Users, color: "text-primary" },
    { label: "Campanhas Criadas", value: totalCampaigns, icon: Mail, color: "text-accent" },
    { label: "Campanhas Enviadas", value: sentCampaigns, icon: Send, color: "text-green-600" },
    { label: "Templates Ativos", value: activeTemplates, icon: FileText, color: "text-primary" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">E-mail Marketing</h2>
        <p className="text-muted-foreground">Visão geral do módulo de e-mail marketing</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(k => {
          const Icon = k.icon;
          return (
            <Card key={k.label}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg bg-secondary`}>
                    <Icon className={`h-6 w-6 ${k.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{k.value}</p>
                    <p className="text-xs text-muted-foreground">{k.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" /> Próximos Passos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <span className="h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center mt-0.5">1</span>
                <span>Crie <strong>listas de contatos</strong> para segmentar seu público</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center mt-0.5">2</span>
                <span>Monte <strong>templates de e-mail</strong> com a identidade da sua marca</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center mt-0.5">3</span>
                <span>Crie <strong>campanhas</strong> vinculando templates e listas</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="h-5 w-5 rounded-full bg-accent text-accent-foreground text-xs flex items-center justify-center mt-0.5">4</span>
                <span>Conecte um <strong>provedor externo</strong> (Brevo, SendGrid) para envio em massa</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-dashed border-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-muted-foreground" /> Integração Futura
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              O módulo está preparado para integração com provedores de e-mail marketing. 
              Quando conectado, você poderá:
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Enviar campanhas em massa diretamente da plataforma</li>
              <li>• Acompanhar métricas de abertura e clique em tempo real</li>
              <li>• Gerenciar descadastros automaticamente</li>
              <li>• Sincronizar listas com provedores externos</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MarketingDashboard;
