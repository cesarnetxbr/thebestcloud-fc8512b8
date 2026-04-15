import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, GripVertical, DollarSign, Calendar, User, Eye } from "lucide-react";

const CRMPipeline = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [detailDeal, setDetailDeal] = useState<any>(null);
  const [form, setForm] = useState({
    title: "",
    value: "",
    lead_id: "",
    stage_id: "",
    expected_close_date: "",
    probability: "50",
    notes: "",
  });

  const { data: stages = [] } = useQuery({
    queryKey: ["crm_pipeline_stages"],
    queryFn: async () => {
      const { data } = await supabase.from("crm_pipeline_stages").select("*").eq("is_active", true).order("position");
      return data || [];
    },
  });

  const { data: deals = [] } = useQuery({
    queryKey: ["crm_deals"],
    queryFn: async () => {
      const { data } = await supabase.from("crm_deals").select("*, crm_leads(name, company)").order("created_at", { ascending: false });
      return data || [];
    },
  });

  const { data: leads = [] } = useQuery({
    queryKey: ["crm_leads_select"],
    queryFn: async () => {
      const { data } = await supabase.from("crm_leads").select("id, name, company").order("name");
      return data || [];
    },
  });

  const createDeal = useMutation({
    mutationFn: async () => {
      const stageId = form.stage_id || stages[0]?.id;
      if (!stageId) throw new Error("Nenhuma etapa disponível");
      const { error } = await supabase.from("crm_deals").insert({
        title: form.title,
        value: Number(form.value) || 0,
        lead_id: form.lead_id || null,
        stage_id: stageId,
        expected_close_date: form.expected_close_date || null,
        probability: Number(form.probability) || 50,
        notes: form.notes || null,
        created_by: user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm_deals"] });
      setCreateOpen(false);
      setForm({ title: "", value: "", lead_id: "", stage_id: "", expected_close_date: "", probability: "50", notes: "" });
      toast.success("Negócio criado com sucesso!");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const moveToStage = useMutation({
    mutationFn: async ({ dealId, stageId }: { dealId: string; stageId: string }) => {
      const { error } = await supabase.from("crm_deals").update({ stage_id: stageId }).eq("id", dealId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm_deals"] });
      toast.success("Negócio movido!");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const updateDealStatus = useMutation({
    mutationFn: async ({ dealId, status }: { dealId: string; status: string }) => {
      const { error } = await supabase.from("crm_deals").update({ status }).eq("id", dealId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm_deals"] });
      queryClient.invalidateQueries({ queryKey: ["crm_deals_summary"] });
      setDetailDeal(null);
      toast.success("Status atualizado!");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const openDeals = deals.filter((d: any) => d.status === "aberto");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Pipeline de Vendas</h2>
          <p className="text-muted-foreground">Gerencie suas oportunidades de negócio</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> Novo Negócio
        </Button>
      </div>

      {/* Kanban board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {stages.map((stage: any) => {
          const stageDeals = openDeals.filter((d: any) => d.stage_id === stage.id);
          return (
            <div key={stage.id} className="min-w-[280px] flex-shrink-0">
              <div className="flex items-center gap-2 mb-3 px-1">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: stage.color }} />
                <span className="font-semibold text-sm">{stage.name}</span>
                <Badge variant="secondary" className="ml-auto text-xs">{stageDeals.length}</Badge>
              </div>
              <div className="space-y-2 min-h-[200px] bg-muted/30 rounded-lg p-2">
                {stageDeals.map((deal: any) => (
                  <Card
                    key={deal.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setDetailDeal(deal)}
                  >
                    <CardContent className="p-3 space-y-2">
                      <div className="font-medium text-sm">{deal.title}</div>
                      {deal.crm_leads && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <User className="h-3 w-3" />
                          {deal.crm_leads.name}
                          {deal.crm_leads.company && ` • ${deal.crm_leads.company}`}
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-primary">
                          {Number(deal.value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </span>
                        {deal.probability != null && (
                          <Badge variant="outline" className="text-xs">{deal.probability}%</Badge>
                        )}
                      </div>
                      {deal.expected_close_date && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {new Date(deal.expected_close_date).toLocaleDateString("pt-BR")}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
                {stageDeals.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-8">Nenhum negócio</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Novo Negócio</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Título *</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Valor (R$)</Label>
                <Input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} />
              </div>
              <div>
                <Label>Probabilidade (%)</Label>
                <Input type="number" min="0" max="100" value={form.probability} onChange={(e) => setForm({ ...form, probability: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>Lead</Label>
              <Select value={form.lead_id} onValueChange={(v) => setForm({ ...form, lead_id: v })}>
                <SelectTrigger><SelectValue placeholder="Selecione um lead" /></SelectTrigger>
                <SelectContent>
                  {leads.map((l: any) => (
                    <SelectItem key={l.id} value={l.id}>{l.name}{l.company ? ` (${l.company})` : ""}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Etapa do Funil</Label>
              <Select value={form.stage_id} onValueChange={(v) => setForm({ ...form, stage_id: v })}>
                <SelectTrigger><SelectValue placeholder="Primeira etapa" /></SelectTrigger>
                <SelectContent>
                  {stages.map((s: any) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Previsão de Fechamento</Label>
              <Input type="date" value={form.expected_close_date} onChange={(e) => setForm({ ...form, expected_close_date: e.target.value })} />
            </div>
            <div>
              <Label>Observações</Label>
              <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
            <Button className="w-full" onClick={() => createDeal.mutate()} disabled={!form.title || createDeal.isPending}>
              Criar Negócio
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Detail dialog */}
      <Dialog open={!!detailDeal} onOpenChange={() => setDetailDeal(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{detailDeal?.title}</DialogTitle>
          </DialogHeader>
          {detailDeal && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Valor:</span>
                  <p className="font-semibold">{Number(detailDeal.value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Probabilidade:</span>
                  <p className="font-semibold">{detailDeal.probability}%</p>
                </div>
                {detailDeal.crm_leads && (
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Lead:</span>
                    <p className="font-semibold">{detailDeal.crm_leads.name} {detailDeal.crm_leads.company && `• ${detailDeal.crm_leads.company}`}</p>
                  </div>
                )}
                {detailDeal.expected_close_date && (
                  <div>
                    <span className="text-muted-foreground">Previsão:</span>
                    <p className="font-semibold">{new Date(detailDeal.expected_close_date).toLocaleDateString("pt-BR")}</p>
                  </div>
                )}
              </div>
              {detailDeal.notes && (
                <div>
                  <span className="text-sm text-muted-foreground">Notas:</span>
                  <p className="text-sm">{detailDeal.notes}</p>
                </div>
              )}

              {/* Move stage */}
              <div>
                <Label>Mover para etapa</Label>
                <Select
                  value={detailDeal.stage_id}
                  onValueChange={(v) => {
                    moveToStage.mutate({ dealId: detailDeal.id, stageId: v });
                    setDetailDeal({ ...detailDeal, stage_id: v });
                  }}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {stages.map((s: any) => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="default"
                  className="flex-1"
                  onClick={() => updateDealStatus.mutate({ dealId: detailDeal.id, status: "ganho" })}
                >
                  ✅ Marcar como Ganho
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => updateDealStatus.mutate({ dealId: detailDeal.id, status: "perdido" })}
                >
                  ❌ Marcar como Perdido
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CRMPipeline;
