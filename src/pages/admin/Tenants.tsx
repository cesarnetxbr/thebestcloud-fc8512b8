import { useState } from "react";
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
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Globe, Search, Home, Link2 } from "lucide-react";

interface TenantForm {
  name: string;
  external_id: string;
  connection_id: string;
  customer_id: string;
  notes: string;
}

const emptyForm: TenantForm = {
  name: "",
  external_id: "",
  connection_id: "",
  customer_id: "",
  notes: "",
};

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
    queryKey: ["customers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customers")
        .select("id, name")
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

  const linkedCount = tenants?.filter((t) => t.customer_id).length || 0;
  const totalCount = tenants?.length || 0;

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload: any = {
        name: form.name,
        external_id: form.external_id || null,
        connection_id: form.connection_id || null,
        customer_id: form.customer_id || null,
        notes: form.notes || null,
      };
      if (editingId) {
        const { error } = await supabase
          .from("tenants")
          .update(payload)
          .eq("id", editingId);
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

  const linkCustomerMutation = useMutation({
    mutationFn: async ({ tenantId, customerId }: { tenantId: string; customerId: string | null }) => {
      const { error } = await supabase
        .from("tenants")
        .update({ customer_id: customerId })
        .eq("id", tenantId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
      toast.success("Cliente vinculado com sucesso");
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
  };

  // Filter by connection (from URL param) and search
  let filtered = tenants;
  if (connectionFilter) {
    filtered = filtered?.filter((t) => t.connection_id === connectionFilter);
  }
  if (search) {
    filtered = filtered?.filter((t) =>
      t.name.toLowerCase().includes(search.toLowerCase())
    );
  }

  const getCustomerName = (customerId: string | null) =>
    customers?.find((c) => c.id === customerId)?.name || "-";

  const getConnectionName = (connectionId: string | null) =>
    connections?.find((c) => c.id === connectionId)?.name || "-";

  const connectionName = connectionFilter
    ? getConnectionName(connectionFilter)
    : null;

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
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo tenant
        </Button>
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
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-sm text-muted-foreground">Clientes vinculados</p>
              <p className="text-lg font-bold">
                {linkedCount} de {totalCount}
              </p>
            </div>
            <span className="text-sm text-muted-foreground">
              {totalCount > 0
                ? Math.round((linkedCount / totalCount) * 100)
                : 0}
              % utilizado
            </span>
          </div>
          <Progress
            value={totalCount > 0 ? (linkedCount / totalCount) * 100 : 0}
          />
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
                    <TableCell>
                      {getCustomerName(tenant.customer_id)}
                    </TableCell>
                    <TableCell>-</TableCell>
                    <TableCell>
                      {tenant.customer_id ? (
                        <Badge
                          variant={tenant.status === "active" ? "default" : "secondary"}
                        >
                          {tenant.status === "active" ? "Ativo" : "Inativo"}
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

              {/* Info fields */}
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
                  <p className="text-sm font-medium text-muted-foreground">Conexão</p>
                  <p className="text-sm">{getConnectionName(selectedTenant.connection_id)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <p className="text-sm">{selectedTenant.status === "active" ? "Ativo" : "Inativo"}</p>
                </div>
                {selectedTenant.notes && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Observações</p>
                    <p className="text-sm">{selectedTenant.notes}</p>
                  </div>
                )}
              </div>

              <Separator />

              {/* Connect Customer */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold">Conectar Cliente</h4>
                <p className="text-xs text-muted-foreground">
                  Selecione um cliente para vincular a este tenant Acronis:
                </p>
                <Select
                  value={selectedTenant.customer_id || ""}
                  onValueChange={(v) => {
                    linkCustomerMutation.mutate({
                      tenantId: selectedTenant.id,
                      customerId: v || null,
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
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Actions */}
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
                onChange={(e) =>
                  setForm({ ...form, external_id: e.target.value })
                }
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
