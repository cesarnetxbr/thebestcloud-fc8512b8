import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Globe, Search, Home, Link2, LinkIcon, Unlink, RefreshCw, X, Download, Eye, Save, AlertTriangle } from "lucide-react";
import TrialBadge from "@/components/admin/TrialBadge";

interface TenantForm {
  name: string;
  external_id: string;
  connection_id: string;
  customer_id: string;
  sale_table_id: string;
  notes: string;
}

const emptyForm: TenantForm = {
  name: "",
  external_id: "",
  connection_id: "",
  customer_id: "",
  sale_table_id: "",
  notes: "",
};

const formatCurrency = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

const Tenants = () => {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const connectionFilter = searchParams.get("connection") || "";

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<TenantForm>(emptyForm);
  const [search, setSearch] = useState("");
  const [selectedTenant, setSelectedTenant] = useState<any | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [realtimeOpen, setRealtimeOpen] = useState(false);
  const [selectedUsageDate, setSelectedUsageDate] = useState<string | null>(null);
  const [enableBilling, setEnableBilling] = useState(true);
  const [enableRealtime, setEnableRealtime] = useState(true);

  const syncAllTenants = async () => {
    setSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke("sync-all-tenants");
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const totalSynced = data.results?.reduce((sum: number, r: any) => sum + (r.synced || 0), 0) || 0;
      toast.success(`Sincronização concluída: ${totalSynced} clientes atualizados`);
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
    } catch (e: any) {
      toast.error(`Erro na sincronização: ${e.message}`);
    } finally {
      setSyncing(false);
    }
  };

  const { data: tenants, isLoading } = useQuery({
    queryKey: ["tenants"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tenants")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: connections } = useQuery({
    queryKey: ["connections"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("connections")
        .select("id, name")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: customers } = useQuery({
    queryKey: ["customers-full"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customers")
        .select("id, name, cnpj, email, phone, razao_social, nome_fantasia")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: saleTables } = useQuery({
    queryKey: ["sale-tables"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("price_tables")
        .select("id, name")
        .eq("type", "sale")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  // Fetch usage dates for selected tenant
  const { data: usageDates } = useQuery({
    queryKey: ["tenant-usage-dates", selectedTenant?.id],
    queryFn: async () => {
      if (!selectedTenant?.id) return [];
      const { data, error } = await supabase
        .from("tenant_usage")
        .select("usage_date")
        .eq("tenant_id", selectedTenant.id)
        .order("usage_date", { ascending: false });
      if (error) throw error;
      const uniqueDates = [...new Set(data.map((d: any) => d.usage_date))];
      return uniqueDates as string[];
    },
    enabled: !!selectedTenant?.id && (detailOpen || realtimeOpen),
  });

  // Fetch usage data for selected date
  const { data: usageItems } = useQuery({
    queryKey: ["tenant-usage-items", selectedTenant?.id, selectedUsageDate],
    queryFn: async () => {
      if (!selectedTenant?.id || !selectedUsageDate) return [];
      const { data, error } = await supabase
        .from("tenant_usage")
        .select("*")
        .eq("tenant_id", selectedTenant.id)
        .eq("usage_date", selectedUsageDate)
        .order("sku_name");
      if (error) throw error;
      return data;
    },
    enabled: !!selectedTenant?.id && !!selectedUsageDate,
  });

  const linkedCount = tenants?.filter((t) => t.customer_id).length || 0;
  const billingCount = tenants?.filter((t) => t.customer_id && t.sale_table_id).length || 0;
  const realtimeCount = usageDates?.length ? tenants?.filter((t) => t.customer_id).length || 0 : 0;
  const bothCount = Math.min(billingCount, realtimeCount);
  const totalCount = tenants?.length || 0;

  // Trial expiry notifications
  useEffect(() => {
    if (!tenants) return;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const expiringTrials = tenants.filter(t => {
      if (!t.trial_end_date) return false;
      const end = new Date(t.trial_end_date + "T00:00:00");
      const daysLeft = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return daysLeft <= 5 && daysLeft >= 0;
    });

    const expiredTrials = tenants.filter(t => {
      if (!t.trial_end_date) return false;
      const end = new Date(t.trial_end_date + "T00:00:00");
      return end < today;
    });

    if (expiredTrials.length > 0) {
      toast.error(
        `⚠️ ${expiredTrials.length} tenant(s) com trial EXPIRADO: ${expiredTrials.map(t => t.name).join(", ")}. Altere a tabela de venda!`,
        { duration: 10000 }
      );
    }

    if (expiringTrials.length > 0) {
      toast.warning(
        `🔔 ${expiringTrials.length} tenant(s) com trial expirando em breve: ${expiringTrials.map(t => t.name).join(", ")}`,
        { duration: 8000 }
      );
    }
  }, [tenants]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload: any = {
        name: form.name,
        external_id: form.external_id || null,
        connection_id: form.connection_id || null,
        customer_id: form.customer_id || null,
        sale_table_id: form.sale_table_id || null,
        notes: form.notes || null,
      };
      if (editingId) {
        const { error } = await supabase.from("tenants").update(payload).eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("tenants").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
      toast.success(editingId ? "Tenant atualizado" : "Tenant criado");
      closeDialog();
    },
    onError: (e: any) => toast.error(e.message),
  });

  const linkMutation = useMutation({
    mutationFn: async ({ tenantId, updates }: { tenantId: string; updates: Record<string, any> }) => {
      const { error } = await supabase.from("tenants").update(updates).eq("id", tenantId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
      toast.success("Tenant atualizado com sucesso");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tenants").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
      toast.success("Tenant excluído");
      setDetailOpen(false);
      setSelectedTenant(null);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const openEdit = (tenant: any) => {
    setEditingId(tenant.id);
    setForm({
      name: tenant.name,
      external_id: tenant.external_id || "",
      connection_id: tenant.connection_id || "",
      customer_id: tenant.customer_id || "",
      sale_table_id: tenant.sale_table_id || "",
      notes: tenant.notes || "",
    });
    setDialogOpen(true);
    setDetailOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) {
      toast.error("Nome é obrigatório");
      return;
    }
    saveMutation.mutate();
  };

  const openDetail = (tenant: any) => {
    setSelectedTenant(tenant);
    setDetailOpen(true);
    setSelectedUsageDate(null);
  };

  const openRealtimeView = () => {
    setRealtimeOpen(true);
    if (usageDates && usageDates.length > 0 && !selectedUsageDate) {
      setSelectedUsageDate(usageDates[0]);
    }
  };

  let filtered = tenants;
  if (connectionFilter) {
    filtered = filtered?.filter((t) => t.connection_id === connectionFilter);
  }
  if (search) {
    filtered = filtered?.filter((t) =>
      t.name.toLowerCase().includes(search.toLowerCase())
    );
  }

  const getCustomer = (customerId: string | null) =>
    customers?.find((c) => c.id === customerId);
  const getCustomerName = (customerId: string | null) =>
    getCustomer(customerId)?.name || "-";
  const getConnectionName = (connectionId: string | null) =>
    connections?.find((c) => c.id === connectionId)?.name || "-";
  const getSaleTableName = (saleTableId: string | null) =>
    saleTables?.find((s) => s.id === saleTableId)?.name || "-";

  const connectionName = connectionFilter ? getConnectionName(connectionFilter) : null;
  const selectedCustomer = selectedTenant ? getCustomer(selectedTenant.customer_id) : null;
  const isConnected = selectedTenant?.customer_id != null;

  const totalUsageCost = usageItems?.reduce((s, i) => s + Number(i.total_cost), 0) || 0;
  const totalUsageSale = usageItems?.reduce((s, i) => s + Number(i.total_price), 0) || 0;

  const exportUsageCSV = () => {
    if (!usageItems || usageItems.length === 0) return;
    const header = "Nome,SKU,Qtd.,Custo Unit.,Total Custo,Venda Unit.,Total Venda\n";
    const csv = usageItems.map((i) =>
      `"${i.sku_name}",${i.sku_code},${i.quantity},${formatCurrency(Number(i.unit_cost))},${formatCurrency(Number(i.total_cost))},${formatCurrency(Number(i.unit_price))},${formatCurrency(Number(i.total_price))}`
    ).join("\n");
    const blob = new Blob([header + csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `consumo-${selectedTenant?.name}-${selectedUsageDate}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="text-sm text-muted-foreground">
        Produtos &gt; Acronis Cloud &gt; Tenants
      </div>

      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="p-3 bg-primary/10 rounded-lg">
          <Globe className="h-8 w-8 text-primary" />
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold">Tenants</h2>
          <p className="text-muted-foreground mt-1">
            Aqui você acompanha a estrutura completa da sua base Acronis e
            visualiza o impacto financeiro com precisão.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={syncAllTenants} disabled={syncing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Sincronizando..." : "Sincronizar agora"}
          </Button>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo tenant
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar tenant"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Stats */}
      <Card>
        <CardContent className="py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Clientes vinculados</p>
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-lg font-bold">{linkedCount} de {totalCount}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Clientes vinculados</p>
              <p className="text-xs text-muted-foreground">Faturamento</p>
              <p className="text-lg font-bold">{billingCount} de {totalCount}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Clientes vinculados</p>
              <p className="text-xs text-muted-foreground">Realtime view</p>
              <p className="text-lg font-bold">{realtimeCount} de {totalCount}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Clientes vinculados</p>
              <p className="text-xs text-muted-foreground">Faturamento + Realtime</p>
              <p className="text-lg font-bold">{bothCount} de {totalCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Connection section header */}
      {connectionName && (
        <div>
          <h3 className="text-lg font-bold">{connectionName}</h3>
          <Separator className="mt-2 bg-primary h-0.5" />
        </div>
      )}

      {/* List */}
      {isLoading ? (
        <p className="text-muted-foreground">Carregando...</p>
      ) : filtered && filtered.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome do tenant</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Nome do cliente</TableHead>
                  <TableHead>Tabela de venda</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((tenant) => (
                  <TableRow
                    key={tenant.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => openDetail(tenant)}
                  >
                    <TableCell className="font-medium">{tenant.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Home className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>Cliente</span>
                      </div>
                    </TableCell>
                    <TableCell>{getCustomerName(tenant.customer_id)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getSaleTableName(tenant.sale_table_id)}
                        <TrialBadge trialStartDate={tenant.trial_start_date} trialEndDate={tenant.trial_end_date} compact />
                      </div>
                    </TableCell>
                    <TableCell>
                      {tenant.customer_id ? (
                        <Badge className="gap-1 bg-green-600/20 text-green-400 border-green-600/30 hover:bg-green-600/30">
                          <LinkIcon className="h-3 w-3" />
                          Conectado
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="gap-1">
                          <Link2 className="h-3 w-3" />
                          Sem Conexão
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Nenhum tenant encontrado
          </CardContent>
        </Card>
      )}

      {/* Realtime View Modal */}
      <Dialog open={realtimeOpen} onOpenChange={setRealtimeOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Realtime View</span>
            </DialogTitle>
          </DialogHeader>

          <div className="flex gap-6">
            {/* Left: Usage History */}
            <div className="w-48 shrink-0 space-y-2">
              <h4 className="text-sm font-semibold">Histórico de Consumo</h4>
              {usageDates && usageDates.length > 0 ? (
                <div className="space-y-1">
                  {usageDates.map((date) => (
                    <button
                      key={date}
                      onClick={() => setSelectedUsageDate(date)}
                      className={`w-full text-left rounded-md px-3 py-2 text-sm border transition-colors ${
                        selectedUsageDate === date
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:bg-muted/50"
                      }`}
                    >
                      <div className="font-medium">{date}</div>
                      <div className="text-xs text-muted-foreground">Consumo diário</div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium">Nenhum relatório de realtime disponível ainda.</p>
                  <p className="text-xs mt-1">
                    Os relatórios são gerados diariamente quando o Realtime View está ativo. Ative-o para começar a coletar dados.
                  </p>
                </div>
              )}
            </div>

            {/* Right: Usage Details */}
            <div className="flex-1 min-w-0">
              {selectedUsageDate && usageItems && usageItems.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-lg">{selectedUsageDate}</h3>
                      <p className="text-xs text-muted-foreground">
                        TABELA DE VENDA: {getSaleTableName(selectedTenant?.sale_table_id)}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={exportUsageCSV}>
                      <Download className="h-4 w-4 mr-2" /> Baixar
                    </Button>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead className="text-right">Qtd.</TableHead>
                        <TableHead className="text-right">Custo Unit.</TableHead>
                        <TableHead className="text-right">Total Custo</TableHead>
                        <TableHead className="text-right">Venda Unit.</TableHead>
                        <TableHead className="text-right">Total Venda</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {usageItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="text-sm truncate max-w-[200px]">{item.sku_name}</TableCell>
                          <TableCell className="font-mono text-xs">{item.sku_code}</TableCell>
                          <TableCell className="text-right">{Number(item.quantity).toLocaleString("pt-BR")}</TableCell>
                          <TableCell className="text-right">{formatCurrency(Number(item.unit_cost))}</TableCell>
                          <TableCell className="text-right">{formatCurrency(Number(item.total_cost))}</TableCell>
                          <TableCell className="text-right">{formatCurrency(Number(item.unit_price))}</TableCell>
                          <TableCell className="text-right">{formatCurrency(Number(item.total_price))}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  <div className="flex items-center justify-between bg-muted/50 rounded-lg p-4">
                    <div>
                      <p className="text-xs text-muted-foreground">TOTAL DE CUSTO</p>
                      <p className="text-lg font-bold">{formatCurrency(totalUsageCost)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">TOTAL DE VENDA</p>
                      <p className="text-lg font-bold">{formatCurrency(totalUsageSale)}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <p className="font-semibold">Nenhum relatório disponível</p>
                  <p className="text-sm mt-2">
                    Os relatórios de realtime são gerados automaticamente quando o Realtime View está ativo. Ative o Realtime View para começar a coletar dados de consumo diário.
                  </p>
                  {!selectedUsageDate && (
                    <p className="text-sm mt-2">Nenhum SKU com consumo encontrado para este dia.</p>
                  )}
                  <div className="flex items-center justify-between bg-muted/50 rounded-lg p-4 mt-4">
                    <div>
                      <p className="text-xs text-muted-foreground">TOTAL DE CUSTO</p>
                      <p className="text-lg font-bold">{formatCurrency(0)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">TOTAL DE VENDA</p>
                      <p className="text-lg font-bold">{formatCurrency(0)}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Detail sidebar */}
      <Sheet open={detailOpen} onOpenChange={setDetailOpen}>
        <SheetContent className="sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Detalhes do Tenant</SheetTitle>
          </SheetHeader>
          {selectedTenant && (
            <div className="mt-6 space-y-6">
              {/* Avatar + Name */}
              <div className="flex flex-col items-center gap-3">
                <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center text-2xl font-bold text-primary">
                  {selectedTenant.name.charAt(0).toUpperCase()}
                </div>
                <h3 className="text-xl font-bold">{selectedTenant.name}</h3>
              </div>

              <Separator />

              {/* Tenant Info */}
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">ID do Tenant</p>
                  <p className="text-sm font-mono break-all">{selectedTenant.external_id || selectedTenant.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tipo</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Home className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Cliente</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Modo de Precificação</p>
                  <p className="text-sm">production</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <p className="text-sm">{selectedTenant.status === "active" ? "Ativo" : "Inativo"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status MFA</p>
                  <p className="text-sm">Habilitado</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Idioma</p>
                  <p className="text-sm">pt-BR</p>
                </div>
              </div>

              <Separator />

              {/* Connection Status Banner */}
              {isConnected ? (
                <div className="rounded-lg bg-green-600/10 border border-green-600/30 p-3">
                  <div className="flex items-center gap-2 text-green-400">
                    <LinkIcon className="h-4 w-4" />
                    <span className="text-sm font-semibold">Cliente Conectado</span>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg bg-muted/50 border border-border p-3">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Link2 className="h-4 w-4" />
                    <span className="text-sm font-semibold">Sem Cliente Conectado</span>
                  </div>
                </div>
              )}

              {/* Customer Selector */}
              <Select
                value={selectedTenant.customer_id || ""}
                onValueChange={(v) => {
                  linkMutation.mutate({
                    tenantId: selectedTenant.id,
                    updates: { customer_id: v || null },
                  });
                  setSelectedTenant({ ...selectedTenant, customer_id: v });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pesquise por um cliente..." />
                </SelectTrigger>
                <SelectContent>
                  {customers?.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.razao_social || c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Sale Table Selector */}
              <Select
                value={selectedTenant.sale_table_id || ""}
                onValueChange={async (v) => {
                  const newTableId = v || null;
                  const selectedSaleTable = saleTables?.find(s => s.id === v);
                  const isFreeTrial = selectedSaleTable?.name?.toLowerCase().includes("30 dias free");
                  
                  const trialUpdates: Record<string, any> = {};
                  if (isFreeTrial) {
                    const startDate = new Date().toISOString().split("T")[0];
                    const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
                    trialUpdates.trial_start_date = startDate;
                    trialUpdates.trial_end_date = endDate;
                    trialUpdates.trial_notified = false;
                    toast.info(`Trial de 30 dias ativado: ${startDate} → ${endDate}`);
                  } else {
                    trialUpdates.trial_start_date = null;
                    trialUpdates.trial_end_date = null;
                    trialUpdates.trial_notified = false;
                  }

                  linkMutation.mutate({
                    tenantId: selectedTenant.id,
                    updates: { sale_table_id: newTableId, ...trialUpdates },
                  });
                  setSelectedTenant({ ...selectedTenant, sale_table_id: v, ...trialUpdates });

                  // Recalculate sale prices in tenant_usage and draft invoices
                  if (newTableId) {
                    try {
                      // 1. Fetch new sale table prices
                      const { data: saleItems } = await supabase
                        .from("price_table_items")
                        .select("sku_code, unit_value")
                        .eq("price_table_id", newTableId);

                      const priceMap: Record<string, number> = {};
                      if (saleItems) {
                        for (const si of saleItems) {
                          priceMap[si.sku_code] = Number(si.unit_value);
                        }
                      }

                      // 2. Update tenant_usage with new sale prices
                      const { data: usageRows } = await supabase
                        .from("tenant_usage")
                        .select("id, sku_code, quantity")
                        .eq("tenant_id", selectedTenant.id);

                      if (usageRows && usageRows.length > 0) {
                        for (const row of usageRows) {
                          const newUnitPrice = priceMap[row.sku_code] || 0;
                          const newTotalPrice = newUnitPrice * Number(row.quantity);
                          await supabase
                            .from("tenant_usage")
                            .update({ unit_price: newUnitPrice, total_price: newTotalPrice })
                            .eq("id", row.id);
                        }
                      }

                      // 3. Recalculate draft invoices for this tenant's customer
                      if (selectedTenant.customer_id) {
                        const { data: draftInvoices } = await supabase
                          .from("invoices")
                          .select("id")
                          .eq("customer_id", selectedTenant.customer_id)
                          .eq("status", "draft");

                        if (draftInvoices && draftInvoices.length > 0) {
                          for (const inv of draftInvoices) {
                            // Fetch invoice items and recalculate
                            const { data: items } = await supabase
                              .from("invoice_items")
                              .select("id, sku_id, quantity, unit_cost")
                              .eq("invoice_id", inv.id);

                            if (items && items.length > 0) {
                              // Get SKU codes for these items
                              const skuIds = items.map(i => i.sku_id);
                              const { data: skus } = await supabase
                                .from("skus")
                                .select("id, code")
                                .in("id", skuIds);

                              const skuCodeMap: Record<string, string> = {};
                              if (skus) {
                                for (const s of skus) skuCodeMap[s.id] = s.code;
                              }

                              let totalCost = 0;
                              let totalSale = 0;

                              for (const item of items) {
                                const code = skuCodeMap[item.sku_id];
                                const newUnitPrice = code ? (priceMap[code] || 0) : 0;
                                const qty = Number(item.quantity);
                                const itemTotalCost = Number(item.unit_cost) * qty;
                                const itemTotalPrice = newUnitPrice * qty;
                                totalCost += itemTotalCost;
                                totalSale += itemTotalPrice;

                                await supabase
                                  .from("invoice_items")
                                  .update({ unit_price: newUnitPrice })
                                  .eq("id", item.id);
                              }

                              await supabase
                                .from("invoices")
                                .update({
                                  total_sale: totalSale,
                                  total_cost: totalCost,
                                  margin: totalSale - totalCost,
                                  updated_at: new Date().toISOString(),
                                })
                                .eq("id", inv.id);
                            }
                          }
                        }
                        toast.success("Preços de venda recalculados com sucesso");
                      }
                    } catch (err: any) {
                      console.error("Erro ao recalcular preços:", err);
                      toast.error("Erro ao recalcular preços de venda");
                    }
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione tabela de venda..." />
                </SelectTrigger>
                <SelectContent>
                  {saleTables?.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Trial Badge */}
              <TrialBadge
                trialStartDate={selectedTenant.trial_start_date}
                trialEndDate={selectedTenant.trial_end_date}
              />

              {/* Billing & Realtime Toggles */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Faturamento</span>
                  <Switch checked={enableBilling} onCheckedChange={setEnableBilling} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Realtime View</span>
                  <Switch checked={enableRealtime} onCheckedChange={setEnableRealtime} />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  size="sm"
                  onClick={() => {
                    toast.success("Configurações salvas");
                  }}
                >
                  <Save className="h-4 w-4 mr-2" /> Salvar
                </Button>
                {isConnected && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 border-destructive text-destructive hover:bg-destructive/10"
                    onClick={() => {
                      linkMutation.mutate({
                        tenantId: selectedTenant.id,
                        updates: { customer_id: null },
                      });
                      setSelectedTenant({ ...selectedTenant, customer_id: null });
                    }}
                  >
                    <Unlink className="h-4 w-4 mr-2" /> Desconectar
                  </Button>
                )}
              </div>

              {/* Realtime View Button */}
              {isConnected && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={openRealtimeView}
                >
                  <Eye className="h-4 w-4 mr-2" /> Abrir Realtime View
                </Button>
              )}

              <Separator />

              {/* Customer Info (when connected) */}
              {isConnected && selectedCustomer && (
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold">Informações de Contato do Tenant</h4>
                  <Card>
                    <CardContent className="p-4 space-y-3">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Nome do Cliente</p>
                        <p className="text-sm font-semibold">{selectedCustomer.razao_social || selectedCustomer.name}</p>
                      </div>
                      {selectedCustomer.cnpj && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">CNPJ</p>
                          <p className="text-sm">{selectedCustomer.cnpj}</p>
                        </div>
                      )}
                      {selectedCustomer.email && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">E-mail</p>
                          <p className="text-sm">{selectedCustomer.email}</p>
                        </div>
                      )}
                      {selectedCustomer.phone && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Telefone</p>
                          <p className="text-sm">{selectedCustomer.phone}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Edit/Delete Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEdit(selectedTenant)}
                  className="flex-1"
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Editar
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteMutation.mutate(selectedTenant.id)}
                  className="flex-1"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(o) => !o && closeDialog()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Editar tenant" : "Novo tenant"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Nome</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Nome do tenant"
              />
            </div>
            <div>
              <Label>ID Externo</Label>
              <Input
                value={form.external_id}
                onChange={(e) => setForm({ ...form, external_id: e.target.value })}
                placeholder="Identificador externo (opcional)"
              />
            </div>
            <div>
              <Label>Conexão</Label>
              <Select
                value={form.connection_id}
                onValueChange={(v) => setForm({ ...form, connection_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma conexão" />
                </SelectTrigger>
                <SelectContent>
                  {connections?.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Cliente vinculado</Label>
              <Select
                value={form.customer_id}
                onValueChange={(v) => setForm({ ...form, customer_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Vincular a um cliente (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  {customers?.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tabela de venda</Label>
              <Select
                value={form.sale_table_id}
                onValueChange={(v) => setForm({ ...form, sale_table_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Vincular tabela de venda (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  {saleTables?.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Observações</Label>
              <Input
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Notas (opcional)"
              />
            </div>
            <div className="flex gap-3">
              <Button type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? "Salvando..." : "Confirmar"}
              </Button>
              <Button type="button" variant="outline" onClick={closeDialog}>
                Cancelar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Tenants;
