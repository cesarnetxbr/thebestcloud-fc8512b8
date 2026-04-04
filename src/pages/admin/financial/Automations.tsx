import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Zap, CalendarDays, Mail, Bell } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const Automations = () => {
  const [settings, setSettings] = useState({
    autoRecurrence: true,
    autoOverdue: true,
    overdueGraceDays: "5",
    emailOnOverdue: false,
    billingCycleDay: "3",
    autoInvoiceGeneration: false,
  });

  const handleSave = () => {
    toast.success("Configurações de automação salvas!");
  };

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">Configure automações financeiras para otimizar processos recorrentes.</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Zap className="h-5 w-5 text-primary" /> Recorrências
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Gerar lançamentos recorrentes automaticamente</Label>
                <p className="text-xs text-muted-foreground">Receitas e despesas com recorrência serão geradas no início de cada período.</p>
              </div>
              <Switch checked={settings.autoRecurrence} onCheckedChange={v => setSettings({ ...settings, autoRecurrence: v })} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarDays className="h-5 w-5 text-primary" /> Vencimentos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Marcar como atrasado automaticamente</Label>
                <p className="text-xs text-muted-foreground">Transações pendentes serão marcadas como atrasadas após o vencimento.</p>
              </div>
              <Switch checked={settings.autoOverdue} onCheckedChange={v => setSettings({ ...settings, autoOverdue: v })} />
            </div>
            <div>
              <Label>Dias de tolerância</Label>
              <Input type="number" className="w-24 mt-1" value={settings.overdueGraceDays} onChange={e => setSettings({ ...settings, overdueGraceDays: e.target.value })} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Mail className="h-5 w-5 text-primary" /> Notificações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>E-mail em caso de atraso</Label>
                <p className="text-xs text-muted-foreground">Enviar notificação quando uma transação estiver vencida.</p>
              </div>
              <Switch checked={settings.emailOnOverdue} onCheckedChange={v => setSettings({ ...settings, emailOnOverdue: v })} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Bell className="h-5 w-5 text-primary" /> Faturamento automático
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Gerar faturas automaticamente</Label>
                <p className="text-xs text-muted-foreground">Faturas serão geradas no dia do ciclo de faturamento.</p>
              </div>
              <Switch checked={settings.autoInvoiceGeneration} onCheckedChange={v => setSettings({ ...settings, autoInvoiceGeneration: v })} />
            </div>
            <div>
              <Label>Dia do ciclo</Label>
              <Select value={settings.billingCycleDay} onValueChange={v => setSettings({ ...settings, billingCycleDay: v })}>
                <SelectTrigger className="w-24 mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 28 }, (_, i) => (
                    <SelectItem key={i + 1} value={String(i + 1)}>{i + 1}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      <Button onClick={handleSave}>Salvar configurações</Button>
    </div>
  );
};

export default Automations;
