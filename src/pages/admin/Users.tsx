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
import { Shield, Users, Search, Settings2, Clock, CalendarDays, UserPlus, Pencil, Trash2, Power } from "lucide-react";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const ROLE_LABELS: Record<string, string> = {
  pending: "⏳ Pendente",
  admin: "Administrador",
  manager: "Gerente",
  supervisor: "Supervisor",
  operador: "Operador",
  client: "Cliente",
  viewer: "Visualizador",
};

const ROLE_COLORS: Record<string, string> = {
  pending: "bg-orange-100 text-orange-800",
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
  is_active: boolean;
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
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newUser, setNewUser] = useState({ email: "", password: "", full_name: "", role: "viewer" });

  const handleCreateUser = async () => {
    if (!newUser.email || !newUser.password) {
      toast({ title: "Email e senha são obrigatórios", variant: "destructive" });
      return;
    }
    if (newUser.password.length < 6) {
      toast({ title: "A senha deve ter pelo menos 6 caracteres", variant: "destructive" });
      return;
    }
    setCreating(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-user", {
        body: { email: newUser.email, password: newUser.password, full_name: newUser.full_name, role: newUser.role },
      });
      const errorMsg = data?.error || error?.message;
      if (errorMsg) {
        const friendlyMsg = errorMsg.includes("already been registered") || errorMsg.includes("email_exists")
          ? "Este email já está cadastrado no sistema"
          : errorMsg;
        toast({ title: "Erro ao criar usuário", description: friendlyMsg, variant: "destructive" });
      } else {
        toast({ title: "Usuário criado com sucesso" });
        setCreateDialogOpen(false);
        setNewUser({ email: "", password: "", full_name: "", role: "viewer" });
        fetchUsers();
      }
    } catch (err: any) {
      toast({ title: "Erro ao criar usuário", description: err.message, variant: "destructive" });
    }
    setCreating(false);
  };

  const handleManageUser = async (userId: string, action: "deactivate" | "activate" | "delete") => {
    const actionLabels = { deactivate: "desativar", activate: "ativar", delete: "excluir permanentemente" };
    if (!confirm(`Tem certeza que deseja ${actionLabels[action]} este usuário?`)) return;

    const { data, error } = await supabase.functions.invoke("admin-manage-user", {
      body: { action, user_id: userId },
    });
    const errorMsg = data?.error || error?.message;
    if (errorMsg) {
      toast({ title: "Erro", description: errorMsg, variant: "destructive" });
    } else {
      toast({ title: data?.message || "Ação realizada com sucesso" });
      fetchUsers();
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase.functions.invoke("admin-list-users");

    if (error || data?.error) {
      toast({
        title: "Erro ao carregar usuários",
        description: data?.error || error?.message,
        variant: "destructive",
      });
      setUsers([]);
      setLoading(false);
      return;
    }

    const loadedUsers = Array.isArray(data?.users) ? (data.users as UserWithRole[]) : [];
    setUsers(loadedUsers);
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

  const changeRole = async (userId: string, currentRole: string, newRole: string) => {
    if (newRole === "pending") return;
    let error;
    if (currentRole === "pending") {
      // User has no role yet — insert
      const result = await supabase.from("user_roles").insert({ user_id: userId, role: newRole as any });
      error = result.error;
    } else {
      // Update existing role
      const result = await supabase.from("user_roles").update({ role: newRole as any }).eq("user_id", userId);
      error = result.error;
    }
    if (error) {
      toast({ title: "Erro ao alterar role", description: error.message, variant: "destructive" });
    } else {
      toast({ title: currentRole === "pending" ? "Perfil atribuído com sucesso! O usuário agora pode acessar o sistema." : "Role atualizada com sucesso" });
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
        <Button onClick={() => setCreateDialogOpen(true)}>
          <UserPlus className="h-4 w-4 mr-2" /> Novo Usuário
        </Button>
      </div>

      {/* Create User Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" /> Cadastrar Novo Usuário
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nome Completo</label>
              <Input placeholder="Nome do usuário" value={newUser.full_name} onChange={(e) => setNewUser((p) => ({ ...p, full_name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email *</label>
              <Input type="email" placeholder="email@exemplo.com" value={newUser.email} onChange={(e) => setNewUser((p) => ({ ...p, email: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Senha *</label>
              <Input type="password" placeholder="Mínimo 6 caracteres" value={newUser.password} onChange={(e) => setNewUser((p) => ({ ...p, password: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Perfil (Role)</label>
              <Select value={newUser.role} onValueChange={(val) => setNewUser((p) => ({ ...p, role: val }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ROLE_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleCreateUser} disabled={creating}>
                {creating ? "Criando..." : "Criar Usuário"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
                  <TableHead>Status</TableHead>
                  <TableHead>Último Login</TableHead>
                  <TableHead>Cadastrado em</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((u) => (
                  <TableRow key={u.user_id} className={!u.is_active ? "opacity-60" : ""}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{u.full_name || "Sem nome"}</p>
                        <p className="text-xs text-muted-foreground">{u.email || `${u.user_id.slice(0, 8)}...`}</p>
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
                      <Badge variant="secondary" className={u.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                        {u.is_active ? "Ativo" : "Inativo"}
                      </Badge>
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
                        <Button variant="outline" size="sm" onClick={() => openPermissions(u)} title="Permissões">
                          <Settings2 className="h-4 w-4" />
                        </Button>
                        {u.is_active ? (
                          <Button variant="outline" size="sm" onClick={() => handleManageUser(u.user_id, "deactivate")} title="Desativar">
                            <Power className="h-4 w-4 text-orange-500" />
                          </Button>
                        ) : (
                          <Button variant="outline" size="sm" onClick={() => handleManageUser(u.user_id, "activate")} title="Ativar">
                            <Power className="h-4 w-4 text-green-500" />
                          </Button>
                        )}
                        <Button variant="outline" size="sm" onClick={() => handleManageUser(u.user_id, "delete")} title="Excluir">
                          <Trash2 className="h-4 w-4 text-destructive" />
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
                  <p className="text-sm text-muted-foreground">{detailUser.email || `${detailUser.user_id.slice(0, 8)}...`}</p>
                  <div className="flex gap-2 mt-1">
                    <Badge className={ROLE_COLORS[detailUser.role]}>{ROLE_LABELS[detailUser.role]}</Badge>
                    <Badge variant="secondary" className={detailUser.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                      {detailUser.is_active ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
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
