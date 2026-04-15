import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Users, FileText, Send, TrendingUp, BarChart3 } from "lucide-react";

const SmsDashboard = () => {
  const { data: campaigns } = useQuery({
    queryKey: ["sms-campaigns-stats"],
    queryFn: async () => {
      const { data, error } = await supabase.from("sms_marketing_campaigns").select("status");
      if (error) throw error;
      return data;
    },
  });

  const { data: contacts } = useQuery({
    queryKey: ["sms-contacts-stats"],
    queryFn: async () => {
      const { data, error } = await supabase.from("sms_marketing_contacts").select("id, status");
      if (error) throw error;
      return data;
    },
  });

  const { data: templates } = useQuery({
    queryKey: ["sms-templates-stats"],
    queryFn: async () => {
      const { data, error } = await supabase.from("sms_marketing_templates").select("id, is_active");
      if (error) throw error;
      return data;
    },
  });

  const totalContacts = contacts?.filter(c => c.status === "active").length || 0;
  const totalCampaigns = campaigns?.length || 0;
  const sentCampaigns = campaigns?.filter(c => c.status === "sent").length || 0;
  const activeTemplates = templates?.filter(t => t.is_active).length || 0;

  const kpis = [
    { label: "Contatos Ativos", value: totalContacts, icon: Users, color: "text-primary" },
    { label: "Campanhas Criadas", value: totalCampaigns, icon: MessageSquare, color: "text-accent" },
    { label: "Campanhas Enviadas", value: sentCampaigns, icon: Send, color: "text-green-600" },
    { label: "Templates Ativos", value: activeTemplates, icon: FileText, color: "text-primary" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Chat SMS Marketing</h2>
        <p className="text-muted-foreground">Visão geral do módulo de SMS marketing</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(k => {
          const Icon = k.icon;
          return (
            <Card key={k.label}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-secondary">
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
                <span>Cadastre <strong>contatos</strong> com números de telefone válidos</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center mt-0.5">2</span>
                <span>Crie <strong>templates de mensagem</strong> respeitando o limite de 160 caracteres</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center mt-0.5">3</span>
                <span>Monte <strong>campanhas</strong> segmentadas por tags</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="h-5 w-5 rounded-full bg-accent text-accent-foreground text-xs flex items-center justify-center mt-0.5">4</span>
                <span>Conecte um <strong>provedor SMS</strong> (Twilio, Vonage) para envio em massa</span>
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
              O módulo está preparado para integração com provedores de SMS. Quando conectado, você poderá:
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Enviar campanhas SMS em massa diretamente da plataforma</li>
              <li>• Acompanhar métricas de entrega e resposta em tempo real</li>
              <li>• Gerenciar opt-out automaticamente</li>
              <li>• Segmentar envios por tags de contatos</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SmsDashboard;
