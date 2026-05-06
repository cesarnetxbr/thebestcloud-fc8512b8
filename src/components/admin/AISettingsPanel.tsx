import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { Brain, Save, Info } from "lucide-react";

interface LeadClassificationCfg {
  deal_threshold: number;
  tag_threshold: number;
  tag_name: string;
  tag_color: string;
  enabled: boolean;
}

const DEFAULTS: LeadClassificationCfg = {
  deal_threshold: 40,
  tag_threshold: 75,
  tag_name: "Alta Probabilidade",
  tag_color: "#16a34a",
  enabled: true,
};

const AISettingsPanel = () => {
  const [cfg, setCfg] = useState<LeadClassificationCfg>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("ai_settings")
        .select("value")
        .eq("key", "lead_classification")
        .maybeSingle();
      if (error) {
        console.error(error);
      } else if (data?.value) {
        setCfg({ ...DEFAULTS, ...(data.value as Partial<LeadClassificationCfg>) });
      }
      setLoading(false);
    })();
  }, []);

  const handleSave = async () => {
    if (cfg.deal_threshold < 0 || cfg.deal_threshold > 100 ||
        cfg.tag_threshold < 0 || cfg.tag_threshold > 100) {
      toast.error("Os limiares devem estar entre 0 e 100.");
      return;
    }
    if (cfg.tag_threshold < cfg.deal_threshold) {
      toast.error("O limiar da tag deve ser maior ou igual ao limiar do deal.");
      return;
    }
    if (!cfg.tag_name.trim()) {
      toast.error("Informe um nome para a tag.");
      return;
    }

    setSaving(true);
    const { data: userData } = await supabase.auth.getUser();
    const { error } = await supabase
      .from("ai_settings")
      .upsert({
        key: "lead_classification",
        value: cfg as any,
        updated_by: userData.user?.id ?? null,
        updated_at: new Date().toISOString(),
      }, { onConflict: "key" });

    if (error) {
      toast.error("Erro ao salvar: " + error.message);
    } else {
      toast.success("Configurações da IA salvas com sucesso!");
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                Classificação Automática de Leads
              </CardTitle>
              <CardDescription className="mt-1">
                Defina os limiares de probabilidade que a IA usa para qualificar conversas vindas do site
                e movê-las automaticamente ao Pipeline comercial.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="ai-enabled" className="text-sm">Ativa</Label>
              <Switch
                id="ai-enabled"
                checked={cfg.enabled}
                onCheckedChange={(v) => setCfg(c => ({ ...c, enabled: v }))}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-8">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              A IA analisa as mensagens do cliente e atribui uma probabilidade (0–100) de fechamento.
              Acima do <strong>limiar do deal</strong>, um card é criado no Pipeline.
              Acima do <strong>limiar da tag</strong>, a tag colorida é aplicada ao card.
            </AlertDescription>
          </Alert>

          {/* Limiar Deal */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base">Limiar para criar card no Pipeline</Label>
              <Badge variant="secondary" className="text-base font-mono">
                ≥ {cfg.deal_threshold}
              </Badge>
            </div>
            <Slider
              value={[cfg.deal_threshold]}
              onValueChange={([v]) => setCfg(c => ({ ...c, deal_threshold: v }))}
              min={0}
              max={100}
              step={5}
              disabled={!cfg.enabled}
            />
            <p className="text-xs text-muted-foreground">
              Recomendado: 40 (equilíbrio). Valores menores capturam mais leads, maiores filtram só oportunidades fortes.
            </p>
          </div>

          {/* Limiar Tag */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base">Limiar para aplicar tag de alta probabilidade</Label>
              <Badge
                className="text-base font-mono"
                style={{ backgroundColor: cfg.tag_color, color: "#fff" }}
              >
                ≥ {cfg.tag_threshold}
              </Badge>
            </div>
            <Slider
              value={[cfg.tag_threshold]}
              onValueChange={([v]) => setCfg(c => ({ ...c, tag_threshold: v }))}
              min={0}
              max={100}
              step={5}
              disabled={!cfg.enabled}
            />
            <p className="text-xs text-muted-foreground">
              Deve ser maior ou igual ao limiar do deal. Recomendado: 75.
            </p>
          </div>

          {/* Tag config */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t">
            <div>
              <Label htmlFor="tag-name">Nome da tag</Label>
              <Input
                id="tag-name"
                value={cfg.tag_name}
                onChange={(e) => setCfg(c => ({ ...c, tag_name: e.target.value }))}
                disabled={!cfg.enabled}
                placeholder="Alta Probabilidade"
              />
            </div>
            <div>
              <Label htmlFor="tag-color">Cor da tag</Label>
              <div className="flex gap-2">
                <input
                  id="tag-color"
                  type="color"
                  value={cfg.tag_color}
                  onChange={(e) => setCfg(c => ({ ...c, tag_color: e.target.value }))}
                  disabled={!cfg.enabled}
                  className="h-10 w-16 rounded cursor-pointer border-0"
                />
                <Input
                  value={cfg.tag_color}
                  onChange={(e) => setCfg(c => ({ ...c, tag_color: e.target.value }))}
                  disabled={!cfg.enabled}
                  className="flex-1 font-mono"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Salvando..." : "Salvar configurações"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AISettingsPanel;
