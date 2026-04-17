import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Save, RotateCcw } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const MODULES = [
  { key: "dashboard", label: "Dashboard" },
  { key: "usuarios", label: "Usuários" },
  { key: "clientes", label: "Clientes" },
  { key: "trial_clients", label: "Clientes Trial" },
  { key: "comercial", label: "CRM / Comercial" },
  { key: "chat", label: "Chat & Atendimento" },
  { key: "chamados", label: "Chamados" },
  { key: "agenda_tecnica", label: "Agenda Técnica" },
  { key: "ouvidoria", label: "Ouvidoria" },
  { key: "analytics", label: "Analytics & Marketing" },
  { key: "marketing_email", label: "E-mail Marketing" },
  { key: "marketing_sms", label: "SMS Marketing" },
  { key: "financeiro", label: "Gestão Financeira" },
  { key: "faturamento", label: "Faturamento" },
  { key: "tabelas_custo", label: "Tabelas de Custo" },
  { key: "tabelas_venda", label: "Tabelas de Venda" },
  { key: "skus", label: "SKUs / Produtos" },
  { key: "conexoes", label: "Conexões Acronis" },
  { key: "tenants", label: "Tenants" },
  { key: "lgpd", label: "LGPD" },
  { key: "auditoria", label: "Auditoria" },
  { key: "configuracoes", label: "Configurações" },
];

const ROLES = [
  { key: "manager", label: "Gerente" },
  { key: "supervisor", label: "Supervisor" },
  { key: "operador", label: "Operador" },
  { key: "viewer", label: "Visualizador" },
];

// Recommended baseline (least-privilege) — used by "Restaurar Sugestão"
const SUGGESTED: Record<string, Record<string, { v: boolean; c: boolean; e: boolean; d: boolean }>> = {
  manager: {
    dashboard: { v: true, c: true, e: true, d: false },
    usuarios: { v: true, c: false, e: false, d: false },
    clientes: { v: true, c: true, e: true, d: false },
    trial_clients: { v: true, c: true, e: true, d: false },
    comercial: { v: true, c: true, e: true, d: false },
    chat: { v: true, c: true, e: true, d: false },
    chamados: { v: true, c: true, e: true, d: false },
    agenda_tecnica: { v: true, c: true, e: true, d: false },
    ouvidoria: { v: true, c: true, e: true, d: false },
    analytics: { v: true, c: false, e: false, d: false },
    marketing_email: { v: true, c: true, e: true, d: false },
    marketing_sms: { v: true, c: true, e: true, d: false },
    financeiro: { v: true, c: true, e: true, d: false },
    faturamento: { v: true, c: true, e: true, d: false },
    tabelas_custo: { v: true, c: true, e: true, d: false },
    tabelas_venda: { v: true, c: true, e: true, d: false },
    skus: { v: true, c: true, e: true, d: false },
    conexoes: { v: true, c: true, e: true, d: false },
    tenants: { v: true, c: true, e: true, d: false },
    lgpd: { v: true, c: false, e: false, d: false },
    auditoria: { v: true, c: false, e: false, d: false },
    configuracoes: { v: true, c: false, e: false, d: false },
  },
  supervisor: {
    dashboard: { v: true, c: false, e: false, d: false },
    clientes: { v: true, c: true, e: true, d: false },
    trial_clients: { v: true, c: false, e: false, d: false },
    comercial: { v: true, c: true, e: true, d: false },
    chat: { v: true, c: true, e: true, d: false },
    chamados: { v: true, c: true, e: true, d: false },
    agenda_tecnica: { v: true, c: true, e: true, d: false },
    ouvidoria: { v: true, c: true, e: false, d: false },
    faturamento: { v: true, c: false, e: false, d: false },
    financeiro: { v: true, c: false, e: false, d: false },
    tenants: { v: true, c: false, e: false, d: false },
  },
  operador: {
    dashboard: { v: true, c: false, e: false, d: false },
    clientes: { v: true, c: false, e: false, d: false },
    trial_clients: { v: true, c: false, e: false, d: false },
    comercial: { v: true, c: true, e: false, d: false },
    chat: { v: true, c: true, e: false, d: false },
    chamados: { v: true, c: true, e: true, d: false },
    agenda_tecnica: { v: true, c: true, e: true, d: false },
  },
  viewer: {
    dashboard: { v: true, c: false, e: false, d: false },
    clientes: { v: true, c: false, e: false, d: false },
    chamados: { v: true, c: false, e: false, d: false },
  },
};

interface PresetRow {
  module: string;
  can_view: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
}

const RolePresetsDialog = ({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) => {
  const [role, setRole] = useState("operador");
  const [perms, setPerms] = useState<Record<string, PresetRow>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = async (r: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("role_permission_presets")
      .select("module, can_view, can_create, can_edit, can_delete")
      .eq("role_name", r);
    if (error) {
      toast({ title: "Erro ao carregar", description: error.message, variant: "destructive" });
    }
    const map: Record<string, PresetRow> = {};
    MODULES.forEach((m) => {
      const row = data?.find((d) => d.module === m.key);
      map[m.key] = {
        module: m.key,
        can_view: row?.can_view ?? false,
        can_create: row?.can_create ?? false,
        can_edit: row?.can_edit ?? false,
        can_delete: row?.can_delete ?? false,
      };
    });
    setPerms(map);
    setLoading(false);
  };

  useEffect(() => {
    if (open) load(role);
  }, [open, role]);

  const toggle = (mod: string, field: keyof PresetRow, val: boolean) => {
    setPerms((prev) => {
      const next = { ...prev[mod], [field]: val };
      // turning off view auto-disables create/edit/delete
      if (field === "can_view" && !val) {
        next.can_create = false;
        next.can_edit = false;
        next.can_delete = false;
      }
      // enabling create/edit/delete forces view on
      if ((field === "can_create" || field === "can_edit" || field === "can_delete") && val) {
        next.can_view = true;
      }
      return { ...prev, [mod]: next };
    });
  };

  const applySuggested = () => {
    const sug = SUGGESTED[role] || {};
    const map: Record<string, PresetRow> = {};
    MODULES.forEach((m) => {
      const s = sug[m.key];
      map[m.key] = {
        module: m.key,
        can_view: s?.v ?? false,
        can_create: s?.c ?? false,
        can_edit: s?.e ?? false,
        can_delete: s?.d ?? false,
      };
    });
    setPerms(map);
    toast({ title: "Sugestão aplicada", description: "Revise e clique em Salvar para confirmar." });
  };

  const save = async () => {
    setSaving(true);
    // Delete existing then insert active ones
    const { error: delErr } = await supabase.from("role_permission_presets").delete().eq("role_name", role);
    if (delErr) {
      toast({ title: "Erro ao limpar presets", description: delErr.message, variant: "destructive" });
      setSaving(false);
      return;
    }
    const rows = MODULES
      .filter((m) => perms[m.key]?.can_view || perms[m.key]?.can_create || perms[m.key]?.can_edit || perms[m.key]?.can_delete)
      .map((m) => ({
        role_name: role,
        module: m.key,
        can_view: perms[m.key].can_view,
        can_create: perms[m.key].can_create,
        can_edit: perms[m.key].can_edit,
        can_delete: perms[m.key].can_delete,
      }));
    if (rows.length > 0) {
      const { error } = await supabase.from("role_permission_presets").insert(rows);
      if (error) {
        toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
        setSaving(false);
        return;
      }
    }
    setSaving(false);
    toast({ title: "Presets salvos", description: `Permissões do perfil "${role}" atualizadas.` });
  };

  const activeCount = Object.values(perms).reduce(
    (acc, p) => acc + (p.can_view ? 1 : 0) + (p.can_create ? 1 : 0) + (p.can_edit ? 1 : 0) + (p.can_delete ? 1 : 0),
    0
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" /> Permissões por Perfil (Presets)
          </DialogTitle>
          <DialogDescription>
            Define o que cada perfil (role) pode ver e fazer por padrão. Sobrescreva por usuário em "Permissões Específicas".
            Admin sempre tem acesso total.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap items-center gap-3 py-3 border-y">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Perfil:</span>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((r) => (
                  <SelectItem key={r.key} value={r.key}>{r.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Badge variant="outline">{activeCount} permissões ativas</Badge>
          <div className="ml-auto flex gap-2">
            <Button size="sm" variant="outline" onClick={applySuggested} disabled={loading}>
              <RotateCcw className="h-4 w-4 mr-2" /> Restaurar Sugestão
            </Button>
            <Button size="sm" onClick={save} disabled={saving || loading}>
              <Save className="h-4 w-4 mr-2" /> {saving ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Módulo</TableHead>
                <TableHead className="text-center">Ver</TableHead>
                <TableHead className="text-center">Criar</TableHead>
                <TableHead className="text-center">Editar</TableHead>
                <TableHead className="text-center">Excluir</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MODULES.map((m) => {
                const p = perms[m.key] || { can_view: false, can_create: false, can_edit: false, can_delete: false };
                return (
                  <TableRow key={m.key}>
                    <TableCell className="font-medium">{m.label}</TableCell>
                    <TableCell className="text-center">
                      <Switch checked={p.can_view} onCheckedChange={(v) => toggle(m.key, "can_view", v)} />
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch checked={p.can_create} onCheckedChange={(v) => toggle(m.key, "can_create", v)} />
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch checked={p.can_edit} onCheckedChange={(v) => toggle(m.key, "can_edit", v)} />
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch checked={p.can_delete} onCheckedChange={(v) => toggle(m.key, "can_delete", v)} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default RolePresetsDialog;
