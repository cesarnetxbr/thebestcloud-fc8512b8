import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Shield, Users, Search, Settings2, Clock, CalendarDays, UserPlus, Pencil } from "lucide-react";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrador",
  manager: "Gerente",
  supervisor: "Supervisor",
  operador: "Operador",
  client: "Cliente",
  viewer: "Visualizador",
};

const ROLE_COLORS: Record<string, string> = {
  admin: "bg-red-100 text-red-800",
  manager: "bg-blue-100 text-blue-800",
  supervisor: "bg-purple-100 text-purple-800",
  operador: "bg-green-100 text-green-800",
  client: "bg-gray-100 text-gray-800",
  viewer: "bg-yellow-100 text-yellow-800",
};

const MODULES = [
  { key: "dashboard", label: "Dashboard", desc: "Acesso ao painel principal" },
  { key: "usuarios", label: "Usuários", desc: "Gestão de usuários do sistema" },
  { key: "clientes", label: "Clientes", desc: "Cadastro de clientes" },
  { key: "conexoes", label: "Conexões", desc: "Gerenciar conexões Acronis" },
  { key: "tenants", label: "Tenants", desc: "Gerenciar tenants" },
  { key: "skus", label: "SKUs / Produtos", desc: "Cadastro de produtos" },
  { key: "tabelas_custo", label: "Tabelas de Custo", desc: "Gerenciar tabelas de custo" },
  { key: "tabelas_venda", label: "Tabelas de Venda", desc: "Gerenciar tabelas de venda" },
  { key: "financeiro", label: "Gestão Financeira", desc: "Módulo financeiro completo" },
  { key: "faturamento", label: "Faturamento", desc: "Faturas de custo e venda" },
  { key: "comercial", label: "Solicitações Comerciais", desc: "Kanban comercial" },
  { key: "chamados", label: "Chamados", desc: "Sistema de suporte" },
  { key: "auditoria", label: "Auditoria", desc: "Logs de auditoria" },
  { key: "configuracoes", label: "Configurações", desc: "Configurações do sistema" },
];

interface UserWithRole {
  user_id: string;
  email: string;
  full_name: string | null;
  role: string;
  role_id: string;
  last_login_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  created_by_name: string | null;
}

const formatDate = (date: string | null) => {
  if (!date) return "—";
  return format(new Date(date), "dd/MM/yyyy HH:mm", { locale: ptBR });
};

const Users_Page = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserWithRole | null>(null);
  const [permissions, setPermissions] = useState<Record<string, { can_view: boolean; can_create: boolean; can_edit: boolean; can_delete: boolean }>>({});
  const [presets, setPresets] = useState<any[]>([]);
  const [permDialogOpen, setPermDialogOpen] = useState(false);
  const [detailUser, setDetailUser] = useState<UserWithRole | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    const { data: roles } = await supabase.from("user_roles").select("*");
    const { data: profiles } = await supabase.from("profiles").select("*");

    if (roles && profiles) {
      const merged = roles.map((r) => {
        const profile = profiles.find((p) => p.user_id === r.user_id);
        return {
          user_id: r.user_id,
          email: profile?.full_name || r.user_id,
          full_name: profile?.full_name || null,
          role: r.role,
          role_id: r.id,
          last_login_at: (profile as any)?.last_login_at || null,
          created_at: profile?.created_at || null,
          updated_at: profile?.updated_at || null,
          created_by_name: (profile as any)?.created_by_name || null,
        };
      });
      setUsers(merged);
    }
    setLoading(false);
  };

  const fetchPresets = async () => {
    const { data } = await supabase.from("role_permission_presets").select("*");
    if (data) setPresets(data);
  };

  useEffect(() => {
    fetchUsers();
    fetchPresets();
  }, []);

  const changeRole = async (userId: string, newRole: string) => {
    const { error } = await supabase.from("user_roles").update({ role: newRole as any }).eq("user_id", userId);
    if (error) {
      toast({ title: "Erro ao alterar role", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Role atualizada com sucesso" });
      fetchUsers();
    }
  };

  const openPermissions = async (u: UserWithRole) => {
    setSelectedUser(u);
    const { data } = await supabase.from("user_permissions").select("*").eq("user_id", u.user_id);
    const perms: Record<string, any> = {};
    MODULES.forEach((m) => {
      const existing = data?.find((d) => d.module === m.key);
      perms[m.key] = existing
        ? { can_view: existing.can_view, can_create: existing.can_create, can_edit: existing.can_edit, can_delete: existing.can_delete }
        : { can_view: false, can_create: false, can_edit: false, can_delete: false };
    });
    setPermissions(perms);
    setPermDialogOpen(true);
  };

  const applyPreset = (roleName: string) => {
    const rolePresets = presets.filter((p) => p.role_name === roleName);
    const newPerms: Record<string, any> = {};
    MODULES.forEach((m) => {
      const preset = rolePresets.find((p: any) => p.module === m.key);
      newPerms[m.key] = preset
        ? { can_view: preset.can_view, can_create: preset.can_create, can_edit: preset.can_edit, can_delete: preset.can_delete }
        : { can_view: false, can_create: false, can_edit: false, can_delete: false };
    });
    setPermissions(newPerms);
  };

  const toggleAll = (value: boolean) => {
    const newPerms: Record<string, any> = {};
    MODULES.forEach((m) => {
      newPerms[m.key] = { can_view: value, can_create: value, can_edit: value, can_delete: value };
    });
    setPermissions(newPerms);
  };

  const savePermissions = async () => {
    if (!selectedUser) return;
    for (const mod of MODULES) {
      const perm = permissions[mod.key];
      const { error } = await supabase.from("user_permissions").upsert(
        { user_id: selectedUser.user_id, module: mod.key, ...perm },
        { onConflict: "user_id,module" }
      );
      if (error) {
        toast({ title: "Erro ao salvar permissão", description: error.message, variant: "destructive" });
        return;
      }
    }
    toast({ title: "Permissões salvas com sucesso" });
    setPermDialogOpen(false);
  };

  const activeCount = Object.values(permissions).reduce((acc, p) => {
    return acc + (p.can_view ? 1 : 0) + (p.can_create ? 1 : 0) + (p.can_edit ? 1 : 0) + (p.can_delete ? 1 : 0);
  }, 0);

  const filtered = users.filter(
    (u) =>
      u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      ROLE_LABELS[u.role]?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6" /> Gestão de Usuários
          </h2>
          <p className="text-muted-foreground">Gerencie usuários, roles e permissões específicas</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar por nome, email ou role..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Último Login</TableHead>
                  <TableHead>Cadastrado em</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((u) => (
                  <TableRow key={u.user_id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{u.full_name || "Sem nome"}</p>
                        <p className="text-xs text-muted-foreground">{u.user_id.slice(0, 8)}...</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select value={u.role} onValueChange={(val) => changeRole(u.user_id, val)}>
                        <SelectTrigger className="w-[160px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(ROLE_LABELS).map(([key, label]) => (
                            <SelectItem key={key} value={key}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        {formatDate(u.last_login_at)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {formatDate(u.created_at)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="outline" size="sm" onClick={() => setDetailUser(u)} title="Detalhes">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => openPermissions(u)}>
                          <Settings2 className="h-4 w-4 mr-1" /> Permissões
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!detailUser} onOpenChange={(open) => !open && setDetailUser(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Detalhes do Usuário</DialogTitle>
          </DialogHeader>
          {detailUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">{detailUser.full_name || "Sem nome"}</p>
                  <Badge className={ROLE_COLORS[detailUser.role]}>{ROLE_LABELS[detailUser.role]}</Badge>
                </div>
              </div>

              <div className="grid gap-3 text-sm">
                <div className="flex items-start gap-2 p-2 border rounded">
                  <Clock className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Último Login</p>
                    <p className="text-muted-foreground">{formatDate(detailUser.last_login_at)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 p-2 border rounded">
                  <CalendarDays className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Cadastrado em</p>
                    <p className="text-muted-foreground">{formatDate(detailUser.created_at)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 p-2 border rounded">
                  <UserPlus className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Cadastrado por</p>
                    <p className="text-muted-foreground">{detailUser.created_by_name || "Sistema (auto-cadastro)"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 p-2 border rounded">
                  <Pencil className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Última alteração de perfil</p>
                    <p className="text-muted-foreground">{formatDate(detailUser.updated_at)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Permissions Dialog */}
      <Dialog open={permDialogOpen} onOpenChange={setPermDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" /> Permissões Específicas
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              Configure as permissões de acesso para <strong>{selectedUser?.full_name || selectedUser?.user_id}</strong>
            </p>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge variant="secondary">{activeCount}/{MODULES.length * 4} permissões ativas</Badge>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => toggleAll(true)}>Marcar Todas</Button>
                <Button variant="outline" size="sm" onClick={() => toggleAll(false)}>Desmarcar Todas</Button>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <Shield className="h-5 w-5 text-primary" />
              <div className="flex-1">
                <p className="font-medium text-sm">Aplicar Preset de Perfil</p>
                <p className="text-xs text-muted-foreground">Carrega um conjunto pré-definido de permissões</p>
              </div>
              <Select onValueChange={applyPreset}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Selecionar preset..." />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ROLE_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Módulo</TableHead>
                    <TableHead className="text-center w-20">Ver</TableHead>
                    <TableHead className="text-center w-20">Criar</TableHead>
                    <TableHead className="text-center w-20">Editar</TableHead>
                    <TableHead className="text-center w-20">Excluir</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MODULES.map((mod) => (
                    <TableRow key={mod.key}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{mod.label}</p>
                          <p className="text-xs text-muted-foreground">{mod.desc}</p>
                        </div>
                      </TableCell>
                      {(["can_view", "can_create", "can_edit", "can_delete"] as const).map((action) => (
                        <TableCell key={action} className="text-center">
                          <Switch
                            checked={permissions[mod.key]?.[action] || false}
                            onCheckedChange={(val) =>
                              setPermissions((prev) => ({
                                ...prev,
                                [mod.key]: { ...prev[mod.key], [action]: val },
                              }))
                            }
                          />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setPermDialogOpen(false)}>Cancelar</Button>
              <Button onClick={savePermissions}>Salvar Permissões</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Users_Page;
