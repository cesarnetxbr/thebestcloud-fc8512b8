import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

interface Booking {
  id: string;
  customer_name: string;
  customer_email: string | null;
  scheduled_at: string | null;
  status: string;
  duration_minutes: number;
}

export default function BookingPage() {
  const { token } = useParams<{ token: string }>();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [slots, setSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Agendar Reunião | The Best Cloud";
  }, []);

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const res = await fetch(`${SUPABASE_URL}/functions/v1/book-consultant-slot?token=${token}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Erro");
        setBooking(json.booking);
        setSlots(json.slots);
        setEmail(json.booking.customer_email ?? "");
        if (json.booking.status === "confirmado") setConfirmed(true);
      } catch (e) { setError((e as Error).message); }
      finally { setLoading(false); }
    })();
  }, [token]);

  const slotsByDay = useMemo(() => {
    const map = new Map<string, string[]>();
    slots.forEach((s) => {
      const d = new Date(s).toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" });
      if (!map.has(d)) map.set(d, []);
      map.get(d)!.push(s);
    });
    return Array.from(map.entries());
  }, [slots]);

  async function confirm() {
    if (!selectedSlot) { toast.error("Selecione um horário"); return; }
    setSubmitting(true);
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/book-consultant-slot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, scheduled_at: selectedSlot, customer_email: email || undefined }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Falha ao confirmar");
      setConfirmed(true);
      toast.success("Reunião confirmada!");
    } catch (e) { toast.error((e as Error).message); }
    finally { setSubmitting(false); }
  }

  if (loading) {
    return <main className="min-h-screen flex items-center justify-center"><p className="text-muted-foreground">Carregando...</p></main>;
  }
  if (error || !booking) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <Card className="max-w-md"><CardHeader><CardTitle>Link inválido</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">{error}</p></CardContent></Card>
      </main>
    );
  }

  if (confirmed) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4 bg-background">
        <Card className="max-w-md text-center">
          <CardHeader>
            <CheckCircle2 className="mx-auto h-12 w-12 text-primary" />
            <CardTitle>Reunião confirmada!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><strong>Cliente:</strong> {booking.customer_name}</p>
            {booking.scheduled_at && (
              <p><strong>Horário:</strong> {new Date(booking.scheduled_at).toLocaleString("pt-BR")}</p>
            )}
            <p className="text-muted-foreground">Você receberá uma confirmação. Nossa equipe entrará em contato no horário marcado.</p>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background py-10 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <header className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Agende sua reunião</h1>
          <p className="text-muted-foreground">Olá {booking.customer_name} — escolha o melhor horário com nosso especialista</p>
        </header>

        <Card>
          <CardHeader><CardTitle>Seus dados</CardTitle></CardHeader>
          <CardContent>
            <Label htmlFor="email">E-mail para confirmação</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Horários disponíveis (30 min)</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {slotsByDay.length === 0 && <p className="text-sm text-muted-foreground">Nenhum horário disponível no momento. Entre em contato pelo WhatsApp.</p>}
            {slotsByDay.map(([day, daySlots]) => (
              <div key={day}>
                <p className="font-medium capitalize mb-2">{day}</p>
                <div className="flex flex-wrap gap-2">
                  {daySlots.map((s) => (
                    <Button
                      key={s}
                      variant={selectedSlot === s ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedSlot(s)}
                    >
                      {new Date(s).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Button onClick={confirm} disabled={!selectedSlot || submitting} className="w-full" size="lg">
          {submitting ? "Confirmando..." : "Confirmar agendamento"}
        </Button>
      </div>
    </main>
  );
}
