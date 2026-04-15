import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Eye, MousePointerClick, Users, Activity, TrendingUp, Globe, Monitor, Smartphone } from "lucide-react";

const AnalyticsDashboard = () => {
  const [pageviews, setPageviews] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [emailMetrics, setEmailMetrics] = useState<any[]>([]);
  const [smsMetrics, setSmsMetrics] = useState<any[]>([]);
  const [auditCount, setAuditCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();

      const [pvRes, evRes, emRes, smRes, auRes] = await Promise.all([
        supabase.from("analytics_pageviews").select("*").gte("created_at", thirtyDaysAgo).order("created_at", { ascending: false }).limit(500),
        supabase.from("analytics_events").select("*").gte("created_at", thirtyDaysAgo).order("created_at", { ascending: false }).limit(500),
        supabase.from("email_marketing_campaign_metrics").select("*"),
        supabase.from("sms_marketing_campaign_metrics").select("*"),
        supabase.from("audit_logs").select("id", { count: "exact", head: true }).gte("created_at", thirtyDaysAgo),
      ]);

      setPageviews(pvRes.data || []);
      setEvents(evRes.data || []);
      setEmailMetrics(emRes.data || []);
      setSmsMetrics(smRes.data || []);
      setAuditCount(auRes.count || 0);
      setLoading(false);
    };
    load();
  }, []);

  const uniqueSessions = new Set(pageviews.map(p => p.session_id)).size;
  const totalEvents = events.length;
  const conversions = events.filter(e => e.category === "conversion").length;
  const totalEmailSent = emailMetrics.reduce((s, m) => s + (m.total_sent || 0), 0);
  const totalSmsSent = smsMetrics.reduce((s, m) => s + (m.total_sent || 0), 0);

  const topPages = Object.entries(
    pageviews.reduce((acc: Record<string, number>, p) => {
      acc[p.page_path] = (acc[p.page_path] || 0) + 1;
      return acc;
    }, {})
  ).sort((a, b) => b[1] - a[1]).slice(0, 10);

  const deviceBreakdown = pageviews.reduce((acc: Record<string, number>, p) => {
    acc[p.device_type || "desktop"] = (acc[p.device_type || "desktop"] || 0) + 1;
    return acc;
  }, {});

  const eventsByCategory = Object.entries(
    events.reduce((acc: Record<string, number>, e) => {
      acc[e.category || "general"] = (acc[e.category || "general"] || 0) + 1;
      return acc;
    }, {})
  ).sort((a, b) => b[1] - a[1]);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Tracking & Analytics</h2>
        <p className="text-muted-foreground">Visão consolidada de visitantes, marketing e uso interno — últimos 30 dias</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 text-blue-600"><Eye className="h-5 w-5" /></div>
              <div>
                <p className="text-sm text-muted-foreground">Pageviews</p>
                <p className="text-2xl font-bold">{pageviews.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 text-green-600"><Users className="h-5 w-5" /></div>
              <div>
                <p className="text-sm text-muted-foreground">Sessões Únicas</p>
                <p className="text-2xl font-bold">{uniqueSessions}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-100 text-orange-600"><MousePointerClick className="h-5 w-5" /></div>
              <div>
                <p className="text-sm text-muted-foreground">Eventos</p>
                <p className="text-2xl font-bold">{totalEvents}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100 text-purple-600"><TrendingUp className="h-5 w-5" /></div>
              <div>
                <p className="text-sm text-muted-foreground">Conversões</p>
                <p className="text-2xl font-bold">{conversions}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="site" className="space-y-4">
        <TabsList>
          <TabsTrigger value="site">Site & Visitantes</TabsTrigger>
          <TabsTrigger value="marketing">Marketing</TabsTrigger>
          <TabsTrigger value="usage">Uso Interno</TabsTrigger>
        </TabsList>

        {/* Site Tab */}
        <TabsContent value="site" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-base">Páginas Mais Visitadas</CardTitle></CardHeader>
              <CardContent>
                {topPages.length === 0 ? (
                  <p className="text-muted-foreground text-sm">Nenhum dado ainda. O tracker registra visitas ao site público automaticamente.</p>
                ) : (
                  <div className="space-y-2">
                    {topPages.map(([path, count]) => (
                      <div key={path} className="flex justify-between items-center">
                        <span className="text-sm truncate max-w-[200px]">{path}</span>
                        <Badge variant="secondary">{count as number}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">Dispositivos</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { key: "desktop", icon: Monitor, label: "Desktop" },
                    { key: "mobile", icon: Smartphone, label: "Mobile" },
                    { key: "tablet", icon: Globe, label: "Tablet" },
                  ].map(({ key, icon: Icon, label }) => {
                    const count = deviceBreakdown[key] || 0;
                    const pct = pageviews.length ? Math.round((count / pageviews.length) * 100) : 0;
                    return (
                      <div key={key} className="flex items-center gap-3">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm w-16">{label}</span>
                        <div className="flex-1 bg-secondary rounded-full h-2">
                          <div className="bg-primary rounded-full h-2" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-sm text-muted-foreground w-12 text-right">{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader><CardTitle className="text-base">Eventos por Categoria</CardTitle></CardHeader>
            <CardContent>
              {eventsByCategory.length === 0 ? (
                <p className="text-muted-foreground text-sm">Nenhum evento registrado ainda. Use <code>trackEvent()</code> para registrar conversões e interações.</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {eventsByCategory.map(([cat, count]) => (
                    <div key={cat} className="p-3 rounded-lg bg-secondary text-center">
                      <p className="text-lg font-bold">{count as number}</p>
                      <p className="text-xs text-muted-foreground capitalize">{cat}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Marketing Tab */}
        <TabsContent value="marketing" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-base">📧 E-mail Marketing</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between"><span className="text-sm text-muted-foreground">Total Enviados</span><span className="font-bold">{totalEmailSent}</span></div>
                  <div className="flex justify-between"><span className="text-sm text-muted-foreground">Taxa Abertura Média</span><span className="font-bold">{emailMetrics.length ? (emailMetrics.reduce((s, m) => s + (m.open_rate || 0), 0) / emailMetrics.length).toFixed(1) : 0}%</span></div>
                  <div className="flex justify-between"><span className="text-sm text-muted-foreground">Taxa Clique Média</span><span className="font-bold">{emailMetrics.length ? (emailMetrics.reduce((s, m) => s + (m.click_rate || 0), 0) / emailMetrics.length).toFixed(1) : 0}%</span></div>
                  <div className="flex justify-between"><span className="text-sm text-muted-foreground">Campanhas Medidas</span><span className="font-bold">{emailMetrics.length}</span></div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">📱 SMS Marketing</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between"><span className="text-sm text-muted-foreground">Total Enviados</span><span className="font-bold">{totalSmsSent}</span></div>
                  <div className="flex justify-between"><span className="text-sm text-muted-foreground">Taxa Entrega Média</span><span className="font-bold">{smsMetrics.length ? (smsMetrics.reduce((s, m) => s + (m.delivery_rate || 0), 0) / smsMetrics.length).toFixed(1) : 0}%</span></div>
                  <div className="flex justify-between"><span className="text-sm text-muted-foreground">Taxa Resposta Média</span><span className="font-bold">{smsMetrics.length ? (smsMetrics.reduce((s, m) => s + (m.reply_rate || 0), 0) / smsMetrics.length).toFixed(1) : 0}%</span></div>
                  <div className="flex justify-between"><span className="text-sm text-muted-foreground">Campanhas Medidas</span><span className="font-bold">{smsMetrics.length}</span></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Usage Tab */}
        <TabsContent value="usage" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-indigo-100 text-indigo-600"><Activity className="h-5 w-5" /></div>
                  <div>
                    <p className="text-sm text-muted-foreground">Ações Registradas</p>
                    <p className="text-2xl font-bold">{auditCount}</p>
                    <p className="text-xs text-muted-foreground">via Auditoria (30 dias)</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader><CardTitle className="text-base">Uso Interno</CardTitle></CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                O módulo de auditoria já registra todas as ações dos usuários internos (criação, atualização, exclusão).
                Acesse <strong>Auditoria</strong> no menu para detalhes completos. Aqui exibimos o resumo consolidado.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsDashboard;
