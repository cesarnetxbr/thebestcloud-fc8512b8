import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  Search, Eye, UserCheck, Clock, AlertTriangle, Users, Gift,
  Mail, Calendar, Phone, FileText, TrendingUp, Activity, Pencil, Save,
} from "lucide-react";
import TrialBadge from "@/components/admin/TrialBadge";

const statusMap: Record<string, { label: string; color: string }> = {
  pending: { label: "Pendente", color: "bg-yellow-500/20 text-yellow-500 border-yellow-500/30" },
  active: { label: "Ativo", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  converted: { label: "Convertido", color: "bg-green-500/20 text-green-500 border-green-500/30" },
  expired: { label: "Expirado", color: "bg-destructive/20 text-destructive border-destructive/30" },
};

const TrialClients = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedClient, setSelectedClient] = useState<any | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [convertDialogOpen, setConvertDialogOpen] = useState(false);
  const [editingNotes, setEditingNotes] = useState({ notes: "", commercial_notes: "", technical_notes: "" });

  const { data: trialClients = [], isLoading } = useQuery({
    queryKey: ["trial-clients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trial_clients")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: tenants = [] } = useQuery({
    queryKey: ["tenants-for-trial"],
    queryFn: async () => {
      const { data } = await supabase.from("tenants").select("id, name, status, trial_start_date, trial_end_date, sale_table_id");
      return data || [];
    },
  });

  const { data: tenantUsage = [] } = useQuery({
    queryKey: ["trial-tenant-usage", selectedClient?.tenant_id],
    enabled: !!selectedClient?.tenant_id,
    queryFn: async () => {
      const { data } = await supabase
        .from("tenant_usage")
        .select("*")
        .eq("tenant_id", selectedClient!.tenant_id)
        .order("usage_date", { ascending: false })
        .limit(30);
      return data || [];
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { error } = await supabase.from("trial_clients").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trial-clients"] });
      toast.success("Atualizado com sucesso");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const convertToCustomer = useMutation({
    mutationFn: async (trial: any) => {
      // Create customer record
      const { data: customer, error: custErr } = await supabase.from("customers").insert({
        name: trial.name,
        email: trial.email,
        phone: trial.phone,
        cnpj: trial.cpf_cnpj || null,
        plan: "trial",
        status: "active",
      }).select().single();
      if (custErr) throw custErr;

      // Update trial client
      const { error: upErr } = await supabase.from("trial_clients").update({
        status: "converted",
        customer_id: customer.id,
        converted_at: new Date().toISOString(),
      }).eq("id", trial.id);
      if (upErr) throw upErr;

      // If tenant linked, update customer_id on tenant
      if (trial.tenant_id) {
        await supabase.from("tenants").update({ customer_id: customer.id }).eq("id", trial.tenant_id);
      }

      return customer;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trial-clients"] });
      toast.success("Cliente convertido com sucesso!");
      setConvertDialogOpen(false);
      setDetailOpen(false);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const filtered = trialClients.filter((c: any) => {
    const matchSearch = !search || c.name?.toLowerCase().includes(search.toLowerCase()) || c.email?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const stats = {
    total: trialClients.length,
    pending: trialClients.filter((c: any) => c.status === "pending").length,
    active: trialClients.filter((c: any) => c.status === "active").length,
    converted: trialClients.filter((c: any) => c.status === "converted").length,
    expired: trialClients.filter((c: any) => c.status === "expired").length,
  };

  const openDetail = (client: any) => {
    setSelectedClient(client);
    setEditingNotes({
      notes: client.notes || "",
      commercial_notes: client.commercial_notes || "",
      technical_notes: client.technical_notes || "",
    });
    setDetailOpen(true);
  };

  const saveNotes = () => {
    if (!selectedClient) return;
    updateMutation.mutate({ id: selectedClient.id, updates: editingNotes });
    setSelectedClient({ ...selectedClient, ...editingNotes });
  };

  const getDaysInfo = (client: any) => {
    if (!client.trial_start_date || !client.trial_end_date) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = new Date(client.trial_end_date + "T00:00:00");
    const start = new Date(client.trial_start_date + "T00:00:00");
    const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const daysLeft = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const progress = Math.max(0, Math.min(100, ((totalDays - daysLeft) / totalDays) * 100));
    return { daysLeft, totalDays, progress };
  };

  const formatDate = (d: string | null) => d ? new Date(d + "T00:00:00").toLocaleDateString("pt-BR") : "—";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Gift className="h-6 w-6 text-primary" />
            Clientes Trial — 30 Dias Free
          </h1>
          <p className="text-muted-foreground text-sm">Gestão de clientes temporários em período de teste</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Total", value: stats.total, icon: Users, color: "text-foreground" },
          { label: "Pendentes", value: stats.pending, icon: Clock, color: "text-yellow-500" },
          { label: "Ativos", value: stats.active, icon: Activity, color: "text-blue-400" },
          { label: "Convertidos", value: stats.converted, icon: UserCheck, color: "text-green-500" },
          { label: "Expirados", value: stats.expired, icon: AlertTriangle, color: "text-destructive" },
        ].map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
              <div>
                <p className="text-2xl font-bold">{kpi.value}</p>
                <p className="text-xs text-muted-foreground">{kpi.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por nome ou email..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="pending">Pendentes</SelectItem>
            <SelectItem value="active">Ativos</SelectItem>
            <SelectItem value="converted">Convertidos</SelectItem>
            <SelectItem value="expired">Expirados</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>WhatsApp</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Trial</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Carregando...</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Nenhum cliente trial encontrado</TableCell></TableRow>
              ) : (
                filtered.map((client: any) => {
                  const st = statusMap[client.status] || statusMap.pending;
                  const days = getDaysInfo(client);
                  return (
                    <TableRow key={client.id}>
                      <TableCell className="font-medium">{client.name}</TableCell>
                      <TableCell className="text-sm">{client.email}</TableCell>
                      <TableCell className="text-sm">{client.phone}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={st.color}>{st.label}</Badge>
                      </TableCell>
                      <TableCell>
                        {days ? (
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-medium ${days.daysLeft <= 0 ? "text-destructive" : days.daysLeft <= 5 ? "text-orange-500" : "text-muted-foreground"}`}>
                              {days.daysLeft <= 0 ? "Expirado" : `${days.daysLeft}d`}
                            </span>
                            <Progress value={days.progress} className="w-16 h-1.5" />
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(client.created_at).toLocaleDateString("pt-BR")}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => openDetail(client)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Detail Sheet */}
      <Sheet open={detailOpen} onOpenChange={setDetailOpen}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          {selectedClient && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <Gift className="h-5 w-5 text-primary" />
                  {selectedClient.name}
                </SheetTitle>
              </SheetHeader>

              <div className="mt-4 space-y-4">
                {/* Status + Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={statusMap[selectedClient.status]?.color}>
                      {statusMap[selectedClient.status]?.label}
                    </Badge>
                    <Select
                      value={selectedClient.status}
                      onValueChange={(val) => {
                        const updates: any = { status: val };
                        if (val === "active" && !selectedClient.trial_start_date) {
                          const start = new Date().toISOString().split("T")[0];
                          const end = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
                          updates.trial_start_date = start;
                          updates.trial_end_date = end;
                        }
                        updateMutation.mutate({ id: selectedClient.id, updates });
                        setSelectedClient({ ...selectedClient, ...updates });
                      }}
                    >
                      <SelectTrigger className="w-[140px] h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pendente</SelectItem>
                        <SelectItem value="active">Ativo</SelectItem>
                        <SelectItem value="expired">Expirado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {selectedClient.status !== "converted" && (
                    <Button size="sm" onClick={() => setConvertDialogOpen(true)}>
                      <UserCheck className="h-4 w-4 mr-1" />
                      Converter em Cliente
                    </Button>
                  )}
                </div>

                {/* Trial Badge */}
                <TrialBadge
                  trialStartDate={selectedClient.trial_start_date}
                  trialEndDate={selectedClient.trial_end_date}
                />

                <Separator />

                {/* Tabs */}
                <Tabs defaultValue="cadastro">
                  <TabsList className="w-full">
                    <TabsTrigger value="cadastro" className="flex-1">Cadastro</TabsTrigger>
                    <TabsTrigger value="tecnico" className="flex-1">Técnico</TabsTrigger>
                    <TabsTrigger value="comercial" className="flex-1">Comercial</TabsTrigger>
                    <TabsTrigger value="uso" className="flex-1">Uso</TabsTrigger>
                  </TabsList>

                  {/* Tab: Cadastro */}
                  <TabsContent value="cadastro" className="space-y-4 mt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs text-muted-foreground">Nome</Label>
                        <p className="font-medium">{selectedClient.name}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Email</Label>
                        <p className="font-medium flex items-center gap-1"><Mail className="h-3 w-3" />{selectedClient.email}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">WhatsApp</Label>
                        <p className="font-medium flex items-center gap-1"><Phone className="h-3 w-3" />{selectedClient.phone}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">CPF/CNPJ</Label>
                        <p className="font-medium">{selectedClient.cpf_cnpj || "—"}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Opção de Suporte</Label>
                        <p className="font-medium flex items-center gap-1">
                          {selectedClient.support_option === "email" ? <><Mail className="h-3 w-3" />Por e-mail</> : <><Calendar className="h-3 w-3" />Agendamento</>}
                        </p>
                      </div>
                      {selectedClient.support_option === "agendar" && (
                        <div>
                          <Label className="text-xs text-muted-foreground">Data/Hora Agendada</Label>
                          <p className="font-medium">{formatDate(selectedClient.available_date)} às {selectedClient.available_time || "—"}</p>
                        </div>
                      )}
                      <div>
                        <Label className="text-xs text-muted-foreground">Início Trial</Label>
                        <p className="font-medium">{formatDate(selectedClient.trial_start_date)}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Fim Trial</Label>
                        <p className="font-medium">{formatDate(selectedClient.trial_end_date)}</p>
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs text-muted-foreground">Observações Gerais</Label>
                      <Textarea
                        value={editingNotes.notes}
                        onChange={(e) => setEditingNotes({ ...editingNotes, notes: e.target.value })}
                        placeholder="Observações gerais sobre o cliente trial..."
                        rows={3}
                      />
                    </div>
                    <Button size="sm" variant="outline" onClick={saveNotes}>
                      <Save className="h-4 w-4 mr-1" />Salvar Notas
                    </Button>
                  </TabsContent>

                  {/* Tab: Técnico */}
                  <TabsContent value="tecnico" className="space-y-4 mt-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Acompanhamento Técnico</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <Label className="text-xs text-muted-foreground">Tenant Vinculado</Label>
                          {selectedClient.tenant_id ? (
                            <p className="font-medium text-sm">
                              {tenants.find((t: any) => t.id === selectedClient.tenant_id)?.name || selectedClient.tenant_id}
                            </p>
                          ) : (
                            <div className="space-y-2">
                              <p className="text-sm text-muted-foreground">Nenhum tenant vinculado</p>
                              <Select
                                onValueChange={(tenantId) => {
                                  updateMutation.mutate({ id: selectedClient.id, updates: { tenant_id: tenantId } });
                                  setSelectedClient({ ...selectedClient, tenant_id: tenantId });
                                }}
                              >
                                <SelectTrigger className="w-full h-8 text-xs">
                                  <SelectValue placeholder="Vincular tenant..." />
                                </SelectTrigger>
                                <SelectContent>
                                  {tenants.map((t: any) => (
                                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                        </div>

                        <Separator />

                        <div>
                          <Label className="text-xs text-muted-foreground">Notas Técnicas</Label>
                          <Textarea
                            value={editingNotes.technical_notes}
                            onChange={(e) => setEditingNotes({ ...editingNotes, technical_notes: e.target.value })}
                            placeholder="Ex: Ambiente configurado, agente instalado, backup funcional..."
                            rows={4}
                          />
                        </div>
                        <Button size="sm" variant="outline" onClick={saveNotes}>
                          <Save className="h-4 w-4 mr-1" />Salvar
                        </Button>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Tab: Comercial */}
                  <TabsContent value="comercial" className="space-y-4 mt-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Acompanhamento Comercial</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs text-muted-foreground">Status Comercial</Label>
                            <p className="font-medium text-sm">
                              {selectedClient.status === "converted" ? "✅ Convertido" : selectedClient.status === "active" ? "🔄 Em negociação" : "⏳ Aguardando"}
                            </p>
                          </div>
                          {selectedClient.converted_at && (
                            <div>
                              <Label className="text-xs text-muted-foreground">Convertido em</Label>
                              <p className="font-medium text-sm">{new Date(selectedClient.converted_at).toLocaleDateString("pt-BR")}</p>
                            </div>
                          )}
                        </div>

                        <Separator />

                        <div>
                          <Label className="text-xs text-muted-foreground">Notas Comerciais</Label>
                          <Textarea
                            value={editingNotes.commercial_notes}
                            onChange={(e) => setEditingNotes({ ...editingNotes, commercial_notes: e.target.value })}
                            placeholder="Ex: Interesse em plano avançado, orçamento enviado, follow-up agendado..."
                            rows={4}
                          />
                        </div>
                        <Button size="sm" variant="outline" onClick={saveNotes}>
                          <Save className="h-4 w-4 mr-1" />Salvar
                        </Button>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Tab: Uso */}
                  <TabsContent value="uso" className="space-y-4 mt-4">
                    {!selectedClient.tenant_id ? (
                      <Card>
                        <CardContent className="py-8 text-center text-muted-foreground">
                          <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p>Vincule um tenant para acompanhar o uso.</p>
                        </CardContent>
                      </Card>
                    ) : (
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Consumo Recente (últimos 30 registros)</CardTitle>
                        </CardHeader>
                        <CardContent>
                          {tenantUsage.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">Nenhum consumo registrado</p>
                          ) : (
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Data</TableHead>
                                  <TableHead>SKU</TableHead>
                                  <TableHead className="text-right">Qtd</TableHead>
                                  <TableHead className="text-right">Custo</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {tenantUsage.map((u: any) => (
                                  <TableRow key={u.id}>
                                    <TableCell className="text-sm">{new Date(u.usage_date + "T00:00:00").toLocaleDateString("pt-BR")}</TableCell>
                                    <TableCell className="text-sm">{u.sku_name || u.sku_code}</TableCell>
                                    <TableCell className="text-sm text-right">{u.quantity}</TableCell>
                                    <TableCell className="text-sm text-right">
                                      {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(u.total_cost)}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          )}
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Convert Dialog */}
      <Dialog open={convertDialogOpen} onOpenChange={setConvertDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Converter em Cliente Real</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <p className="text-sm text-muted-foreground">
              Um novo registro de cliente será criado com os dados do trial. O status será atualizado para "Convertido".
            </p>
            {selectedClient && (
              <div className="bg-muted rounded-lg p-3 space-y-1 text-sm">
                <p><strong>Nome:</strong> {selectedClient.name}</p>
                <p><strong>Email:</strong> {selectedClient.email}</p>
                <p><strong>Telefone:</strong> {selectedClient.phone}</p>
                {selectedClient.cpf_cnpj && <p><strong>CPF/CNPJ:</strong> {selectedClient.cpf_cnpj}</p>}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConvertDialogOpen(false)}>Cancelar</Button>
            <Button onClick={() => selectedClient && convertToCustomer.mutate(selectedClient)} disabled={convertToCustomer.isPending}>
              <UserCheck className="h-4 w-4 mr-1" />
              {convertToCustomer.isPending ? "Convertendo..." : "Confirmar Conversão"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TrialClients;
