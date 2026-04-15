import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, MessageSquare, Users, Send, CheckCircle, Clock, TrendingUp, Phone, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const CRMMarketingDashboard = () => {
  const { data: emailCampaigns } = useQuery({
    queryKey: ["mkt-email-campaigns"],
    queryFn: async () => {
      const { data, error } = await supabase.from("email_marketing_campaigns").select("id, status, sent_at, scheduled_at");
      if (error) throw error;
      return data || [];
    },
  });

  const { data: smsCampaigns } = useQuery({
    queryKey: ["mkt-sms-campaigns"],
    queryFn: async () => {
      const { data, error } = await supabase.from("sms_marketing_campaigns").select("id, status, sent_at, scheduled_at");
      if (error) throw error;
      return data || [];
    },
  });

  const { data: emailLists } = useQuery({
    queryKey: ["mkt-email-lists"],
    queryFn: async () => {
      const { data, error } = await supabase.from("email_marketing_lists").select("contact_count");
      if (error) throw error;
      return data || [];
    },
  });

  const { data: smsContacts } = useQuery({
    queryKey: ["mkt-sms-contacts"],
    queryFn: async () => {
      const { data, error } = await supabase.from("sms_marketing_contacts").select("id, status");
      if (error) throw error;
      return data || [];
    },
  });

  const { data: emailMetrics } = useQuery({
    queryKey: ["mkt-email-metrics"],
    queryFn: async () => {
      const { data, error } = await supabase.from("email_marketing_campaign_metrics").select("total_sent, total_opened, total_clicked, total_bounced");
      if (error) throw error;
      return data || [];
    },
  });

  const { data: smsMetrics } = useQuery({
    queryKey: ["mkt-sms-metrics"],
    queryFn: async () => {
      const { data, error } = await supabase.from("sms_marketing_campaign_metrics").select("total_sent, total_delivered, total_failed");
      if (error) throw error;
      return data || [];
    },
  });

  // Email stats
  const emailTotal = emailCampaigns?.length || 0;
  const emailSent = emailCampaigns?.filter(c => c.status === "sent").length || 0;
  const emailScheduled = emailCampaigns?.filter(c => c.status === "scheduled").length || 0;
  const emailContacts = emailLists?.reduce((s, l) => s + (l.contact_count || 0), 0) || 0;

  // SMS stats
  const smsTotal = smsCampaigns?.length || 0;
  const smsSent = smsCampaigns?.filter(c => c.status === "sent").length || 0;
  const smsScheduled = smsCampaigns?.filter(c => c.status === "scheduled").length || 0;
  const smsContactsActive = smsContacts?.filter(c => c.status === "active").length || 0;

  // Aggregated metrics
  const totalEmailsSent = emailMetrics?.reduce((s, m) => s + (m.total_sent || 0), 0) || 0;
  const totalEmailsOpened = emailMetrics?.reduce((s, m) => s + (m.total_opened || 0), 0) || 0;
  const totalSmsSent = smsMetrics?.reduce((s, m) => s + (m.total_sent || 0), 0) || 0;
  const totalSmsDelivered = smsMetrics?.reduce((s, m) => s + (m.total_delivered || 0), 0) || 0;

  const avgOpenRate = totalEmailsSent > 0 ? ((totalEmailsOpened / totalEmailsSent) * 100).toFixed(1) : "0";
  const smsDeliveryRate = totalSmsSent > 0 ? ((totalSmsDelivered / totalSmsSent) * 100).toFixed(1) : "0";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Marketing Unificado</h2>
          <p className="text-muted-foreground">Visão consolidada de E-mail e SMS Marketing</p>
        </div>
        <div className="flex gap-2">
          <Link to="/admin/marketing/campaigns"><Button variant="outline" size="sm"><Mail className="h-4 w-4 mr-1" /> E-mail</Button></Link>
          <Link to="/admin/sms/campaigns"><Button variant="outline" size="sm"><MessageSquare className="h-4 w-4 mr-1" /> SMS</Button></Link>
        </div>
      </div>

      {/* KPIs gerais */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary"><Users className="h-5 w-5 text-primary" /></div>
              <div>
                <p className="text-2xl font-bold">{emailContacts + smsContactsActive}</p>
                <p className="text-xs text-muted-foreground">Total Contatos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary"><Send className="h-5 w-5 text-primary" /></div>
              <div>
                <p className="text-2xl font-bold">{emailTotal + smsTotal}</p>
                <p className="text-xs text-muted-foreground">Campanhas Criadas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary"><CheckCircle className="h-5 w-5 text-primary" /></div>
              <div>
                <p className="text-2xl font-bold">{emailSent + smsSent}</p>
                <p className="text-xs text-muted-foreground">Enviadas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary"><Clock className="h-5 w-5 text-accent" /></div>
              <div>
                <p className="text-2xl font-bold">{emailScheduled + smsScheduled}</p>
                <p className="text-xs text-muted-foreground">Agendadas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detalhes por canal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* E-mail */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" /> E-mail Marketing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-secondary rounded-lg p-3">
                <p className="text-lg font-bold">{emailTotal}</p>
                <p className="text-xs text-muted-foreground">Campanhas</p>
              </div>
              <div className="bg-secondary rounded-lg p-3">
                <p className="text-lg font-bold">{emailContacts}</p>
                <p className="text-xs text-muted-foreground">Contatos</p>
              </div>
              <div className="bg-secondary rounded-lg p-3">
                <p className="text-lg font-bold">{totalEmailsSent}</p>
                <p className="text-xs text-muted-foreground">E-mails Enviados</p>
              </div>
              <div className="bg-secondary rounded-lg p-3">
                <p className="text-lg font-bold">{avgOpenRate}%</p>
                <p className="text-xs text-muted-foreground">Taxa de Abertura</p>
              </div>
            </div>
            <div className="flex gap-2">
              {emailScheduled > 0 && <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />{emailScheduled} agendadas</Badge>}
              {emailSent > 0 && <Badge><CheckCircle className="h-3 w-3 mr-1" />{emailSent} enviadas</Badge>}
            </div>
          </CardContent>
        </Card>

        {/* SMS */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" /> SMS Marketing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-secondary rounded-lg p-3">
                <p className="text-lg font-bold">{smsTotal}</p>
                <p className="text-xs text-muted-foreground">Campanhas</p>
              </div>
              <div className="bg-secondary rounded-lg p-3">
                <p className="text-lg font-bold">{smsContactsActive}</p>
                <p className="text-xs text-muted-foreground">Contatos Ativos</p>
              </div>
              <div className="bg-secondary rounded-lg p-3">
                <p className="text-lg font-bold">{totalSmsSent}</p>
                <p className="text-xs text-muted-foreground">SMS Enviados</p>
              </div>
              <div className="bg-secondary rounded-lg p-3">
                <p className="text-lg font-bold">{smsDeliveryRate}%</p>
                <p className="text-xs text-muted-foreground">Taxa de Entrega</p>
              </div>
            </div>
            <div className="flex gap-2">
              {smsScheduled > 0 && <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />{smsScheduled} agendadas</Badge>}
              {smsSent > 0 && <Badge><CheckCircle className="h-3 w-3 mr-1" />{smsSent} enviadas</Badge>}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Integration hint */}
      <Card className="border-dashed border-2">
        <CardContent className="py-6 text-center">
          <BarChart3 className="h-10 w-10 mx-auto text-muted-foreground/40 mb-2" />
          <h3 className="font-semibold text-foreground mb-1">Métricas em Tempo Real</h3>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto">
            Conecte provedores externos (Brevo, SendGrid, Twilio, Zenvia) para métricas de abertura, clique e entrega em tempo real.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default CRMMarketingDashboard;
