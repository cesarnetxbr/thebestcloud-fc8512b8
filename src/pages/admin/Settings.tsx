import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CreditCard, ExternalLink, UserPlus } from "lucide-react";

interface CompanyInfo {
  nome_fantasia: string;
  razao_social: string;
  cnpj: string;
  email: string;
  phone: string;
  endereco: string;
  numero: string;
  complemento: string;
  cep: string;
  bairro: string;
  cidade: string;
  estado: string;
}

interface ProfileInfo {
  full_name: string;
  job_title: string;
  phone: string;
}

interface InvoiceTemplate {
  primary_bg: string;
  secondary_bg: string;
  primary_font: string;
  secondary_font: string;
  list_title_bg: string;
}

const defaultTemplate: InvoiceTemplate = {
  primary_bg: "#1a1a2e",
  secondary_bg: "#16a34a",
  primary_font: "#ffffff",
  secondary_font: "#a1a1aa",
  list_title_bg: "#27272a",
};

const integrations = [
  {
    name: "Omie",
    category: "CONTABILIDADE",
    description: "Sistema ERP de gestão empresarial e emissão de notas fiscais",
    color: "#4F46E5",
    icon: "▶",
  },
  {
    name: "SendGrid",
    category: "MENSAGERIA",
    description: "Serviço de envio de e-mails transacionais e marketing",
    color: "#EF4444",
    icon: "◉",
  },
];

const Settings = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileInfo>({ full_name: "", job_title: "", phone: "" });
  const [company, setCompany] = useState<CompanyInfo>({
    nome_fantasia: "", razao_social: "", cnpj: "", email: "", phone: "",
    endereco: "", numero: "", complemento: "", cep: "", bairro: "", cidade: "", estado: "",
  });
  const [template, setTemplate] = useState<InvoiceTemplate>(defaultTemplate);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();
      if (profileData) {
        setProfile({
          full_name: profileData.full_name || "",
          job_title: profileData.job_title || "",
          phone: profileData.phone || "",
        });
      }
      setLoading(false);
    };
    fetchData();
  }, [user]);

  const handleSaveConfig = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update(profile)
      .eq("user_id", user.id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Configurações salvas com sucesso!");
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="config" className="w-full">
        <TabsList className="bg-transparent border-b border-border rounded-none w-full justify-start gap-6 px-0">
          <TabsTrigger
            value="config"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-1 pb-3"
          >
            Configurações
          </TabsTrigger>
          <TabsTrigger
            value="customize"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-1 pb-3"
          >
            Personalizar
          </TabsTrigger>
          <TabsTrigger
            value="integrations"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-1 pb-3"
          >
            Integrações
          </TabsTrigger>
        </TabsList>

        {/* Tab: Configurações */}
        <TabsContent value="config" className="space-y-8 mt-6">
          {/* Sobre sua empresa */}
          <div>
            <h3 className="text-xl font-bold mb-4">Sobre sua empresa</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">Nome da fantasia</Label>
                <Input
                  value={company.nome_fantasia}
                  onChange={(e) => setCompany(c => ({ ...c, nome_fantasia: e.target.value }))}
                  placeholder="Nome da empresa"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Razão social</Label>
                <Input
                  value={company.razao_social}
                  onChange={(e) => setCompany(c => ({ ...c, razao_social: e.target.value }))}
                  placeholder="Razão social"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">CNPJ</Label>
                <Input
                  value={company.cnpj}
                  onChange={(e) => setCompany(c => ({ ...c, cnpj: e.target.value }))}
                  placeholder="00.000.000/0000-00"
                />
              </div>
            </div>
          </div>

          {/* Dados de contato */}
          <div>
            <h3 className="text-xl font-bold mb-4">Dados de contato</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">E-mail da empresa</Label>
                <Input
                  value={company.email}
                  onChange={(e) => setCompany(c => ({ ...c, email: e.target.value }))}
                  placeholder="E-mail da empresa"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">DDD + Telefone</Label>
                <Input
                  value={company.phone}
                  onChange={(e) => setCompany(c => ({ ...c, phone: e.target.value }))}
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>
          </div>

          {/* Local da empresa */}
          <div>
            <h3 className="text-xl font-bold mb-4">Local da empresa</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <Label className="text-xs text-muted-foreground">Endereço</Label>
                <Input
                  value={company.endereco}
                  onChange={(e) => setCompany(c => ({ ...c, endereco: e.target.value }))}
                  placeholder="Endereço"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Número</Label>
                <Input
                  value={company.numero}
                  onChange={(e) => setCompany(c => ({ ...c, numero: e.target.value }))}
                  placeholder="Número"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Complemento</Label>
                <Input
                  value={company.complemento}
                  onChange={(e) => setCompany(c => ({ ...c, complemento: e.target.value }))}
                  placeholder="Complemento"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">CEP</Label>
                <Input
                  value={company.cep}
                  onChange={(e) => setCompany(c => ({ ...c, cep: e.target.value }))}
                  placeholder="00000-000"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Bairro</Label>
                <Input
                  value={company.bairro}
                  onChange={(e) => setCompany(c => ({ ...c, bairro: e.target.value }))}
                  placeholder="Bairro"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Cidade</Label>
                <Input
                  value={company.cidade}
                  onChange={(e) => setCompany(c => ({ ...c, cidade: e.target.value }))}
                  placeholder="Cidade"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Estado</Label>
                <Input
                  value={company.estado}
                  onChange={(e) => setCompany(c => ({ ...c, estado: e.target.value }))}
                  placeholder="UF"
                />
              </div>
            </div>
          </div>

          {/* Assinatura */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <CreditCard className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-semibold">Assinatura</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Gerencie seu método de pagamento, visualize faturas e atualize os dados de cobrança.
                  </p>
                </div>
              </div>
              <Button variant="outline" className="mt-4">
                <CreditCard className="h-4 w-4 mr-2" />
                Gerenciar Pagamento
              </Button>
            </CardContent>
          </Card>

          {/* Perfil do usuário */}
          <div>
            <h3 className="text-xl font-bold mb-4">Seu perfil</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">Email</Label>
                <Input value={user?.email || ""} disabled className="bg-muted" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Nome completo</Label>
                <Input
                  value={profile.full_name}
                  onChange={(e) => setProfile(p => ({ ...p, full_name: e.target.value }))}
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Cargo</Label>
                <Input
                  value={profile.job_title}
                  onChange={(e) => setProfile(p => ({ ...p, job_title: e.target.value }))}
                  placeholder="Ex: Gerente de TI"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Telefone</Label>
                <Input
                  value={profile.phone}
                  onChange={(e) => setProfile(p => ({ ...p, phone: e.target.value }))}
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>
          </div>

          {/* Gerencie seus usuários */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Gerencie seus usuários</h3>
              <Button variant="outline" size="sm">
                <UserPlus className="h-4 w-4 mr-2" />
                Criar novos usuários
              </Button>
            </div>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-sm">
                      {profile.full_name ? profile.full_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "??"}
                    </div>
                    <span className="font-medium">{profile.full_name || user?.email}</span>
                  </div>
                  <Badge variant="default" className="bg-primary">
                    Proprietário
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          <Button onClick={handleSaveConfig} disabled={saving}>
            {saving ? "Salvando..." : "Salvar alterações"}
          </Button>
        </TabsContent>

        {/* Tab: Personalizar */}
        <TabsContent value="customize" className="space-y-6 mt-6">
          <div>
            <Label className="text-xs text-muted-foreground">Selecione o tipo de personalização</Label>
            <div className="mt-1 px-4 py-2.5 bg-muted rounded-md text-sm">
              Personalização do PDF de faturas
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Editor */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold">Personalização da fatura (Template 1)</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Background primário barra superior</Label>
                  <div className="flex gap-2 mt-1">
                    <input
                      type="color"
                      value={template.primary_bg}
                      onChange={(e) => setTemplate(t => ({ ...t, primary_bg: e.target.value }))}
                      className="h-10 w-16 rounded cursor-pointer border-0"
                    />
                    <Input
                      value={template.primary_bg}
                      onChange={(e) => setTemplate(t => ({ ...t, primary_bg: e.target.value }))}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Background secundário barra superior</Label>
                  <div className="flex gap-2 mt-1">
                    <input
                      type="color"
                      value={template.secondary_bg}
                      onChange={(e) => setTemplate(t => ({ ...t, secondary_bg: e.target.value }))}
                      className="h-10 w-16 rounded cursor-pointer border-0"
                    />
                    <Input
                      value={template.secondary_bg}
                      onChange={(e) => setTemplate(t => ({ ...t, secondary_bg: e.target.value }))}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Fontes principais</Label>
                  <div className="flex gap-2 mt-1">
                    <input
                      type="color"
                      value={template.primary_font}
                      onChange={(e) => setTemplate(t => ({ ...t, primary_font: e.target.value }))}
                      className="h-10 w-16 rounded cursor-pointer border-0"
                    />
                    <Input
                      value={template.primary_font}
                      onChange={(e) => setTemplate(t => ({ ...t, primary_font: e.target.value }))}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Fontes secundárias</Label>
                  <div className="flex gap-2 mt-1">
                    <input
                      type="color"
                      value={template.secondary_font}
                      onChange={(e) => setTemplate(t => ({ ...t, secondary_font: e.target.value }))}
                      className="h-10 w-16 rounded cursor-pointer border-0"
                    />
                    <Input
                      value={template.secondary_font}
                      onChange={(e) => setTemplate(t => ({ ...t, secondary_font: e.target.value }))}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Background dos títulos da lista</Label>
                  <div className="flex gap-2 mt-1">
                    <input
                      type="color"
                      value={template.list_title_bg}
                      onChange={(e) => setTemplate(t => ({ ...t, list_title_bg: e.target.value }))}
                      className="h-10 w-16 rounded cursor-pointer border-0"
                    />
                    <Input
                      value={template.list_title_bg}
                      onChange={(e) => setTemplate(t => ({ ...t, list_title_bg: e.target.value }))}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
              <Button variant="outline">Salvar personalização</Button>
            </div>

            {/* Preview */}
            <div>
              <h3 className="text-xl font-bold mb-4">Preview da fatura</h3>
              <Card className="overflow-hidden">
                <div
                  className="p-4 flex items-center justify-between"
                  style={{ background: `linear-gradient(135deg, ${template.primary_bg} 70%, ${template.secondary_bg} 100%)` }}
                >
                  <span style={{ color: template.primary_font }} className="font-bold text-lg">
                    The Best Cloud
                  </span>
                </div>
                <CardContent className="p-4 space-y-3 text-sm">
                  <div>
                    <p style={{ color: template.secondary_font }} className="text-xs">Pedido de venda 0001</p>
                    <p style={{ color: template.primary_font }} className="font-semibold">Empresa de Exemplo Serviços em TI Ltda</p>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs" style={{ color: template.secondary_font }}>
                    <div>
                      <span className="font-medium">Nome fantasia:</span> Empresa Exemplo
                    </div>
                    <div>
                      <span className="font-medium">Tel:</span> (11) 98765-4321
                    </div>
                    <div>
                      <span className="font-medium">Ciclo:</span> 04/2026
                    </div>
                  </div>
                  <div
                    className="p-2 rounded text-xs font-semibold"
                    style={{ background: template.list_title_bg, color: template.primary_font }}
                  >
                    <div className="grid grid-cols-4">
                      <span>Item</span>
                      <span>SKU</span>
                      <span>Qtd</span>
                      <span>Valor</span>
                    </div>
                  </div>
                  <div className="text-xs px-2" style={{ color: template.secondary_font }}>
                    <div className="grid grid-cols-4 py-1 border-b border-border">
                      <span>Storage Cloud</span>
                      <span>STR-001</span>
                      <span>50 GB</span>
                      <span>R$ 250,00</span>
                    </div>
                    <div className="grid grid-cols-4 py-1">
                      <span>Backup Pro</span>
                      <span>BKP-002</span>
                      <span>100 GB</span>
                      <span>R$ 480,00</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Tab: Integrações */}
        <TabsContent value="integrations" className="space-y-6 mt-6">
          <div>
            <h3 className="text-xl font-bold">Integrações de Vendors</h3>
            <p className="text-muted-foreground mt-1">
              Conecte-se a sistemas externos para automatizar processos de faturamento, emissão de notas fiscais e sincronização de dados financeiros.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {integrations.map((integration) => (
              <Card key={integration.name} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3 mb-3">
                    <div
                      className="h-12 w-12 rounded-lg flex items-center justify-center text-white text-xl"
                      style={{ backgroundColor: integration.color }}
                    >
                      {integration.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold">{integration.name}</h4>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">
                        {integration.category}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    {integration.description}
                  </p>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-2 w-2 rounded-full bg-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Não conectado</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button>Conectar</Button>
                    <Button variant="ghost" size="icon">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
