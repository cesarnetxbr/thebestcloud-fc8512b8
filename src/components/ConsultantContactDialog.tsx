import { useState } from "react";
import { z } from "zod";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, MessageCircle } from "lucide-react";

const schema = z.object({
  name: z.string().trim().min(2, "Informe seu nome").max(120),
  phone: z.string().trim().min(10, "Telefone inválido (com DDD)").max(20),
  email: z.string().trim().email("E-mail inválido").max(180),
  company: z.string().trim().min(2, "Informe a empresa").max(160),
});

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  origin?: string;
}

const OFFICIAL_WHATSAPP = "5591981317645";

const ConsultantContactDialog = ({ open, onOpenChange, origin = "landing" }: Props) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", company: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast({
        title: "Verifique os dados",
        description: parsed.error.issues[0]?.message ?? "Campos inválidos",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("consultant-lead", {
        body: { ...parsed.data, origin },
      });
      if (error) throw error;

      toast({
        title: "Tudo pronto! 🎉",
        description: "Em breve nosso consultor entrará em contato. Vamos abrir o WhatsApp para você.",
      });

      const greetingText = encodeURIComponent(
        `Olá! Sou ${parsed.data.name} da empresa ${parsed.data.company}. Gostaria de falar com um consultor da The Best Cloud.`
      );
      const waUrl = `https://api.whatsapp.com/send/?phone=${OFFICIAL_WHATSAPP}&text=${greetingText}&type=phone_number&app_absent=0`;
      window.open(waUrl, "_blank", "noopener,noreferrer");

      onOpenChange(false);
      setForm({ name: "", phone: "", email: "", company: "" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao enviar";
      toast({ title: "Não foi possível enviar", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            Falar com um Consultor
          </DialogTitle>
          <DialogDescription>
            Preencha seus dados e iniciaremos o atendimento via WhatsApp.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="cl-name">Nome completo *</Label>
            <Input
              id="cl-name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Seu nome"
              maxLength={120}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cl-phone">Telefone (WhatsApp) *</Label>
            <Input
              id="cl-phone"
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="(11) 91234-5678"
              maxLength={20}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cl-email">E-mail *</Label>
            <Input
              id="cl-email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="voce@empresa.com.br"
              maxLength={180}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cl-company">Nome da empresa *</Label>
            <Input
              id="cl-company"
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
              placeholder="Sua empresa"
              maxLength={160}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading} variant="cta">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Iniciando...
              </>
            ) : (
              <>
                <MessageCircle className="mr-2 h-4 w-4" />
                Iniciar conversa
              </>
            )}
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            Ao enviar, você concorda com nossa Política de Privacidade (LGPD).
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ConsultantContactDialog;
