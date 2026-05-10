import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, Clock, MessageCircle, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TrackingData {
  deal: {
    id: string;
    title: string;
    status: string;
    probability: number | null;
    expected_close_date: string | null;
    created_at: string;
    updated_at: string;
    value: number | null;
  };
  lead: { name: string | null; company: string | null };
  stages: { id: string; name: string; position: number; color: string }[];
  current_stage_id: string | null;
  current_stage_index: number;
  tags: { tag_name: string; tag_color: string }[];
  next_steps: string;
  consultant: { name: string; whatsapp: string; email: string };
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

export default function QuoteTrackingPage() {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Acompanhamento da Cotação | The Best Cloud";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Acompanhe em tempo real o status da sua cotação na The Best Cloud.");
  }, []);

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const res = await fetch(`${SUPABASE_URL}/functions/v1/quote-tracking?token=${encodeURIComponent(token)}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Erro ao carregar cotação");
        setData(json);
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Carregando cotação...</p>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="max-w-md">
          <CardHeader><CardTitle>Cotação não encontrada</CardTitle></CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{error ?? "Verifique o link recebido."}</p>
          </CardContent>
        </Card>
      </main>
    );
  }

  const { deal, lead, stages, current_stage_index, tags, next_steps, consultant } = data;

  return (
    <main className="min-h-screen bg-background py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Acompanhamento da sua Cotação</h1>
          <p className="text-muted-foreground">{deal.title}</p>
          {(lead.company || lead.name) && (
            <p className="text-sm text-muted-foreground">{lead.company ?? lead.name}</p>
          )}
        </header>

        <Card>
          <CardHeader><CardTitle>Etapa atual</CardTitle></CardHeader>
          <CardContent>
            <ol className="space-y-3">
              {stages.map((s, i) => {
                const done = current_stage_index >= 0 && i < current_stage_index;
                const current = i === current_stage_index;
                return (
                  <li key={s.id} className="flex items-center gap-3">
                    {done ? (
                      <CheckCircle2 className="text-primary" />
                    ) : current ? (
                      <Clock className="text-accent" />
                    ) : (
                      <Circle className="text-muted-foreground" />
                    )}
                    <span className={current ? "font-semibold" : done ? "text-muted-foreground line-through" : "text-muted-foreground"}>
                      {s.name}
                    </span>
                    {current && <Badge variant="secondary">Em andamento</Badge>}
                  </li>
                );
              })}
            </ol>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle>Próximos passos</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm">{next_steps}</p>
              {deal.probability != null && (
                <p className="text-xs text-muted-foreground mt-3">Probabilidade estimada: <strong>{deal.probability}%</strong></p>
              )}
              {deal.value != null && (
                <p className="text-xs text-muted-foreground">Valor proposto: <strong>{deal.value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</strong></p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Seu consultor</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="font-medium">{consultant.name}</p>
              <a href={`https://wa.me/${consultant.whatsapp.replace(/\D/g, "")}`} className="flex items-center gap-2 text-primary hover:underline">
                <MessageCircle className="h-4 w-4" /> WhatsApp: {consultant.whatsapp}
              </a>
              <a href={`mailto:${consultant.email}`} className="flex items-center gap-2 text-primary hover:underline">
                <Mail className="h-4 w-4" /> {consultant.email}
              </a>
            </CardContent>
          </Card>
        </div>

        {tags.length > 0 && (
          <Card>
            <CardHeader><CardTitle>Serviços / Tags</CardTitle></CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {tags.map((t) => (
                <Badge key={t.tag_name} style={{ backgroundColor: t.tag_color, color: "#fff" }}>{t.tag_name}</Badge>
              ))}
            </CardContent>
          </Card>
        )}

        <footer className="text-center text-xs text-muted-foreground pt-6">
          Atualizado em {new Date(deal.updated_at).toLocaleString("pt-BR")}
        </footer>
      </div>
    </main>
  );
}
