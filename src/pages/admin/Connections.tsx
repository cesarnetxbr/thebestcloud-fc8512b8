import { useState } from "react";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Link2, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ConnectionForm {
  name: string;
  datacenter_url: string;
  api_key: string;
  api_secret: string;
}

const emptyForm: ConnectionForm = {
  name: "",
  datacenter_url: "",
  api_key: "",
  api_secret: "",
};

const Connections = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ConnectionForm>(emptyForm);

  const { data: connections, isLoading } = useQuery({
    queryKey: ["connections"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("connections")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editingId) {
        const { error } = await supabase
          .from("connections")
          .update(form)
          .eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("connections").insert(form);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connections"] });
      toast.success(editingId ? "Conexão atualizada" : "Conexão criada");
      closeDialog();
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("connections").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connections"] });
      toast.success("Conexão excluída");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const [syncingId, setSyncingId] = useState<string | null>(null);

  const syncTenants = async (connectionId: string) => {
    setSyncingId(connectionId);
    try {
      const { data, error } = await supabase.functions.invoke("sync-acronis-tenants", {
        body: { connection_id: connectionId },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast.success(`Sincronização concluída: ${data.synced} tenants sincronizados`);
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
    } catch (e: any) {
      toast.error(`Erro na sincronização: ${e.message}`);
    } finally {
      setSyncingId(null);
    }
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const openEdit = (conn: any) => {
    setEditingId(conn.id);
    setForm({
      name: conn.name,
      datacenter_url: conn.datacenter_url,
      api_key: conn.api_key,
      api_secret: conn.api_secret,
    });
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.datacenter_url || !form.api_key || !form.api_secret) {
      toast.error("Preencha todos os campos");
      return;
    }
    saveMutation.mutate();
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="text-sm text-muted-foreground">
        Produtos &gt; Acronis Cloud &gt; Conexões
      </div>

      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="p-3 bg-primary/10 rounded-lg">
          <Link2 className="h-8 w-8 text-primary" />
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold">Conexão</h2>
          <p className="text-muted-foreground mt-1">
            Sua conexão com o data center Acronis com dados sincronizados
            automaticamente para gestão de custo e faturamento.
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Criar nova conexão
        </Button>
      </div>

      {/* List */}
      {isLoading ? (
        <p className="text-muted-foreground">Carregando...</p>
      ) : connections && connections.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>URL do Data Center</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead className="w-24">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {connections.map((conn) => (
                  <TableRow key={conn.id}>
                    <TableCell
                      className="font-medium cursor-pointer hover:underline text-primary"
                      onClick={() => navigate(`/admin/tenants?connection=${conn.id}`)}
                    >
                      {conn.name}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {conn.datacenter_url}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={conn.status === "active" ? "default" : "secondary"}
                      >
                        {conn.status === "active" ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(conn.created_at).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Sincronizar tenants"
                          disabled={syncingId === conn.id}
                          onClick={() => syncTenants(conn.id)}
                        >
                          <RefreshCw className={`h-4 w-4 ${syncingId === conn.id ? "animate-spin" : ""}`} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(conn)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteMutation.mutate(conn.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
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
            Nenhuma conexão cadastrada. Clique em "Criar nova conexão" para começar.
          </CardContent>
        </Card>
      )}

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(o) => !o && closeDialog()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Editar conexão" : "Inicie uma conexão"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Nome da Conexão</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Nome da Conexão"
              />
            </div>
            <div>
              <Label>URL do data center</Label>
              <Input
                value={form.datacenter_url}
                onChange={(e) =>
                  setForm({ ...form, datacenter_url: e.target.value })
                }
                placeholder="URL do data center"
              />
            </div>
            <div>
              <Label>Chave de API</Label>
              <Input
                value={form.api_key}
                onChange={(e) => setForm({ ...form, api_key: e.target.value })}
                placeholder="Chave de API"
              />
            </div>
            <div>
              <Label>Segredo de API</Label>
              <Input
                type="password"
                value={form.api_secret}
                onChange={(e) =>
                  setForm({ ...form, api_secret: e.target.value })
                }
                placeholder="Segredo de API"
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

export default Connections;
