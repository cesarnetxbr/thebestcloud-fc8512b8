import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Search, ArrowLeft, Pencil, Trash2, Users, Ban, Power } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Customer {
  id: string;
  name: string;
  cnpj: string | null;
  razao_social: string | null;
  nome_fantasia: string | null;
  email: string | null;
  phone: string | null;
  cep: string | null;
  endereco: string | null;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;
  cidade: string | null;
  estado: string | null;
  plan: string | null;
  status: string | null;
  notes: string | null;
  monthly_revenue: number | null;
  exclude_auto_invoice: boolean;
  exclude_auto_email: boolean;
  exclude_auto_crm: boolean;
  created_at: string;
  updated_at: string;
}

const emptyForm = {
  cnpj: "",
  razao_social: "",
  nome_fantasia: "",
  email: "",
  phone: "",
  cep: "",
  endereco: "",
  numero: "",
  complemento: "",
  bairro: "",
  cidade: "",
  estado: "",
  exclude_auto_invoice: false,
  exclude_auto_email: false,
  exclude_auto_crm: false,
};

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  inactive: "bg-gray-100 text-gray-800",
  trial: "bg-blue-100 text-blue-800",
  suspended: "bg-red-100 text-red-800",
};
const statusLabels: Record<string, string> = {
  active: "Ativo",
  inactive: "Inativo",
  trial: "Trial",
  suspended: "Suspenso",
};

const Customers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"list" | "form">("list");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchCustomers = async () => {
    const { data } = await supabase
      .from("customers")
      .select("*")
      .order("created_at", { ascending: false });
    setCustomers((data as Customer[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.razao_social?.toLowerCase().includes(search.toLowerCase()) ||
      c.nome_fantasia?.toLowerCase().includes(search.toLowerCase()) ||
      c.cnpj?.includes(search)
  );

  const openNew = () => {
    setEditingId(null);
    setForm(emptyForm);
    setView("form");
  };

  const openEdit = (c: Customer) => {
    setEditingId(c.id);
    setForm({
      cnpj: c.cnpj || "",
      razao_social: c.razao_social || "",
      nome_fantasia: c.nome_fantasia || "",
      email: c.email || "",
      phone: c.phone || "",
      cep: c.cep || "",
      endereco: c.endereco || "",
      numero: c.numero || "",
      complemento: c.complemento || "",
      bairro: c.bairro || "",
      cidade: c.cidade || "",
      estado: c.estado || "",
      exclude_auto_invoice: c.exclude_auto_invoice ?? false,
      exclude_auto_email: c.exclude_auto_email ?? false,
      exclude_auto_crm: c.exclude_auto_crm ?? false,
    });
    setView("form");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este cliente? Esta ação é irreversível.")) return;
    const { error } = await supabase.from("customers").delete().eq("id", id);
    if (error) {
      toast({ title: "Erro ao excluir", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Cliente excluído" });
      fetchCustomers();
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    const { error } = await supabase.from("customers").update({ status: newStatus }).eq("id", id);
    if (error) {
      toast({ title: "Erro ao alterar status", description: error.message, variant: "destructive" });
    } else {
      toast({ title: newStatus === "active" ? "Cliente ativado" : "Cliente desativado" });
      fetchCustomers();
    }
  };

  const handleSave = async () => {
    if (!form.cnpj || !form.razao_social) {
      toast({ title: "Campos obrigatórios", description: "CNPJ e Razão Social são obrigatórios.", variant: "destructive" });
      return;
    }
    setSaving(true);

    const payload = {
      name: form.razao_social,
      cnpj: form.cnpj,
      razao_social: form.razao_social,
      nome_fantasia: form.nome_fantasia || null,
      email: form.email || null,
      phone: form.phone || null,
      cep: form.cep || null,
      endereco: form.endereco || null,
      numero: form.numero || null,
      complemento: form.complemento || null,
      bairro: form.bairro || null,
      cidade: form.cidade || null,
      estado: form.estado || null,
      exclude_auto_invoice: form.exclude_auto_invoice,
      exclude_auto_email: form.exclude_auto_email,
      exclude_auto_crm: form.exclude_auto_crm,
    };

    let error;
    if (editingId) {
      ({ error } = await supabase.from("customers").update(payload).eq("id", editingId));
    } else {
      ({ error } = await supabase.from("customers").insert(payload));
    }

    if (error) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    } else {
      toast({ title: editingId ? "Cliente atualizado" : "Cliente cadastrado" });
      setView("list");
      fetchCustomers();
    }
    setSaving(false);
  };

  const updateField = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const buildAddress = (c: Customer) => {
    const parts = [c.endereco, c.numero, c.bairro, c.cidade, c.estado].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : "—";
  };

  if (view === "form") {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => setView("list")}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
          </Button>
          <h2 className="text-2xl font-bold">
            {editingId ? "Editar Cliente" : "Cadastrar Cliente"}
          </h2>
        </div>

        <Card className="shadow-soft">
          <CardContent className="pt-6 space-y-8">
            {/* Informações do cliente */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Informações do cliente</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>CNPJ *</Label>
                  <Input
                    placeholder="00.000.000/0000-00"
                    value={form.cnpj}
                    onChange={(e) => updateField("cnpj", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Razão Social *</Label>
                  <Input
                    placeholder="Razão Social da empresa"
                    value={form.razao_social}
                    onChange={(e) => updateField("razao_social", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Nome Fantasia</Label>
                  <Input
                    placeholder="Nome Fantasia"
                    value={form.nome_fantasia}
                    onChange={(e) => updateField("nome_fantasia", e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <Label>E-mail(s)</Label>
                  <Input
                    placeholder="email@empresa.com"
                    value={form.email}
                    onChange={(e) => updateField("email", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Telefone</Label>
                  <Input
                    placeholder="(00) 00000-0000"
                    value={form.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Endereço da empresa */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Endereço da empresa</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>CEP</Label>
                  <Input
                    placeholder="00000-000"
                    value={form.cep}
                    onChange={(e) => updateField("cep", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Endereço</Label>
                  <Input
                    placeholder="Rua, Avenida..."
                    value={form.endereco}
                    onChange={(e) => updateField("endereco", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Número</Label>
                  <Input
                    placeholder="Nº"
                    value={form.numero}
                    onChange={(e) => updateField("numero", e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="space-y-2">
                  <Label>Complemento</Label>
                  <Input
                    placeholder="Sala, Andar..."
                    value={form.complemento}
                    onChange={(e) => updateField("complemento", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Bairro</Label>
                  <Input
                    placeholder="Bairro"
                    value={form.bairro}
                    onChange={(e) => updateField("bairro", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Cidade</Label>
                  <Input
                    placeholder="Cidade"
                    value={form.cidade}
                    onChange={(e) => updateField("cidade", e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="space-y-2">
                  <Label>Estado</Label>
                  <Input
                    placeholder="UF"
                    value={form.estado}
                    onChange={(e) => updateField("estado", e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Configurações de faturamento automático */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Configurações de faturamento automático</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Excluir da geração automática de faturas</p>
                    <p className="text-sm text-muted-foreground">
                      Quando ativado, este cliente não terá faturas geradas automaticamente
                    </p>
                  </div>
                  <Switch
                    checked={form.exclude_auto_invoice}
                    onCheckedChange={(v) => updateField("exclude_auto_invoice", v)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Excluir do envio automático de e-mails</p>
                    <p className="text-sm text-muted-foreground">
                      Quando ativado, os e-mails de faturas não serão enviados automaticamente para este cliente
                    </p>
                  </div>
                  <Switch
                    checked={form.exclude_auto_email}
                    onCheckedChange={(v) => updateField("exclude_auto_email", v)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Excluir da sincronização automática com CRM</p>
                    <p className="text-sm text-muted-foreground">
                      Quando ativado, as faturas deste cliente não serão sincronizadas automaticamente com o CRM
                    </p>
                  </div>
                  <Switch
                    checked={form.exclude_auto_crm}
                    onCheckedChange={(v) => updateField("exclude_auto_crm", v)}
                  />
                </div>
              </div>
            </div>

            {/* Botões */}
            <div className="flex gap-4">
              <Button variant="outline" onClick={() => setView("list")}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Salvando..." : "Salvar dados"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com ícone e descrição */}
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-full bg-primary/10">
          <Users className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Gerencie seus clientes</h2>
          <p className="text-muted-foreground">
            Vincule-os aos tenants da Acronis e tenha uma visão completa de cada um, facilitando o controle e a organização da sua base.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar clientes"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={openNew}>
          <Plus className="h-4 w-4 mr-2" /> Cadastrar Clientes
        </Button>
      </div>

      <Card className="shadow-soft">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {search ? "Nenhum resultado encontrado." : "Nenhum cliente cadastrado ainda."}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>CNPJ</TableHead>
                  <TableHead>Razão Social</TableHead>
                  <TableHead>Nome Fantasia</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Endereço</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell>{c.cnpj || "—"}</TableCell>
                    <TableCell>{c.razao_social || "—"}</TableCell>
                    <TableCell>{c.nome_fantasia || "—"}</TableCell>
                    <TableCell>
                      <Badge className={statusColors[c.status || "active"]} variant="secondary">
                        {statusLabels[c.status || "active"]}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">{buildAddress(c)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(c)} title="Editar">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleStatus(c.id, c.status || "active")}
                          title={c.status === "active" ? "Desativar" : "Ativar"}
                        >
                          <Power className={`h-4 w-4 ${c.status === "active" ? "text-orange-500" : "text-green-500"}`} />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(c.id)} title="Excluir">
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
    </div>
  );
};

export default Customers;
