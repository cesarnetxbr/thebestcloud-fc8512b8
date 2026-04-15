import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, MessageSquare, Users, Send, CheckCircle, Clock, TrendingUp, Phone, BarChart3, Download, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

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

  const exportCSV = () => {
    const rows = [
      ["Relatório de Marketing - The Best Cloud"],
      ["Gerado em", new Date().toLocaleString("pt-BR")],
      [],
      ["RESUMO GERAL"],
      ["Métrica", "Valor"],
      ["Total de Contatos", String(emailContacts + smsContactsActive)],
      ["Campanhas Criadas", String(emailTotal + smsTotal)],
      ["Campanhas Enviadas", String(emailSent + smsSent)],
      ["Campanhas Agendadas", String(emailScheduled + smsScheduled)],
      [],
      ["E-MAIL MARKETING"],
      ["Campanhas", String(emailTotal)],
      ["Contatos", String(emailContacts)],
      ["E-mails Enviados", String(totalEmailsSent)],
      ["Taxa de Abertura", avgOpenRate + "%"],
      ["Enviadas", String(emailSent)],
      ["Agendadas", String(emailScheduled)],
      [],
      ["SMS MARKETING"],
      ["Campanhas", String(smsTotal)],
      ["Contatos Ativos", String(smsContactsActive)],
      ["SMS Enviados", String(totalSmsSent)],
      ["Taxa de Entrega", smsDeliveryRate + "%"],
      ["Enviadas", String(smsSent)],
      ["Agendadas", String(smsScheduled)],
    ];
    const csv = rows.map(r => r.join(";")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `relatorio-marketing-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Relatório CSV exportado!");
  };

  const exportPDF = () => {
    const content = `
RELATÓRIO DE MARKETING - THE BEST CLOUD
Gerado em: ${new Date().toLocaleString("pt-BR")}
${"=".repeat(50)}

RESUMO GERAL
• Total de Contatos: ${emailContacts + smsContactsActive}
• Campanhas Criadas: ${emailTotal + smsTotal}
• Campanhas Enviadas: ${emailSent + smsSent}
• Campanhas Agendadas: ${emailScheduled + smsScheduled}

${"─".repeat(50)}

E-MAIL MARKETING
• Campanhas: ${emailTotal}
• Contatos: ${emailContacts}
• E-mails Enviados: ${totalEmailsSent}
• Taxa de Abertura: ${avgOpenRate}%
• Enviadas: ${emailSent}
• Agendadas: ${emailScheduled}

${"─".repeat(50)}

SMS MARKETING
• Campanhas: ${smsTotal}
• Contatos Ativos: ${smsContactsActive}
• SMS Enviados: ${totalSmsSent}
• Taxa de Entrega: ${smsDeliveryRate}%
• Enviadas: ${smsSent}
• Agendadas: ${smsScheduled}
    `.trim();

    // Generate printable HTML as PDF
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html><head><title>Relatório Marketing</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; color: #1a1a2e; }
          h1 { color: #0f3460; font-size: 20px; border-bottom: 2px solid #0f3460; padding-bottom: 10px; }
          .section { margin: 20px 0; }
          .section h2 { color: #16213e; font-size: 16px; margin-bottom: 8px; }
          .metric { display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid #eee; }
          .metric-label { color: #555; }
          .metric-value { font-weight: bold; }
          .date { color: #888; font-size: 12px; }
          @media print { body { padding: 20px; } }
        </style></head><body>
        <h1>Relatório de Marketing — The Best Cloud</h1>
        <p class="date">Gerado em: ${new Date().toLocaleString("pt-BR")}</p>

        <div class="section">
          <h2>Resumo Geral</h2>
          <div class="metric"><span class="metric-label">Total de Contatos</span><span class="metric-value">${emailContacts + smsContactsActive}</span></div>
          <div class="metric"><span class="metric-label">Campanhas Criadas</span><span class="metric-value">${emailTotal + smsTotal}</span></div>
          <div class="metric"><span class="metric-label">Campanhas Enviadas</span><span class="metric-value">${emailSent + smsSent}</span></div>
          <div class="metric"><span class="metric-label">Campanhas Agendadas</span><span class="metric-value">${emailScheduled + smsScheduled}</span></div>
        </div>

        <div class="section">
          <h2>📧 E-mail Marketing</h2>
          <div class="metric"><span class="metric-label">Campanhas</span><span class="metric-value">${emailTotal}</span></div>
          <div class="metric"><span class="metric-label">Contatos</span><span class="metric-value">${emailContacts}</span></div>
          <div class="metric"><span class="metric-label">E-mails Enviados</span><span class="metric-value">${totalEmailsSent}</span></div>
          <div class="metric"><span class="metric-label">Taxa de Abertura</span><span class="metric-value">${avgOpenRate}%</span></div>
        </div>

        <div class="section">
          <h2>📱 SMS Marketing</h2>
          <div class="metric"><span class="metric-label">Campanhas</span><span class="metric-value">${smsTotal}</span></div>
          <div class="metric"><span class="metric-label">Contatos Ativos</span><span class="metric-value">${smsContactsActive}</span></div>
          <div class="metric"><span class="metric-label">SMS Enviados</span><span class="metric-value">${totalSmsSent}</span></div>
          <div class="metric"><span class="metric-label">Taxa de Entrega</span><span class="metric-value">${smsDeliveryRate}%</span></div>
        </div>
        </body></html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
    toast.success("Relatório PDF gerado!");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Marketing Unificado</h2>
          <p className="text-muted-foreground">Visão consolidada de E-mail e SMS Marketing</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportCSV}><Download className="h-4 w-4 mr-1" /> CSV</Button>
          <Button variant="outline" size="sm" onClick={exportPDF}><FileText className="h-4 w-4 mr-1" /> PDF</Button>
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
