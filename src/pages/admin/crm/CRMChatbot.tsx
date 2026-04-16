import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Bot, Zap, Brain, Trash2, ArrowUpDown, Pencil, Sparkles } from "lucide-react";
import { toast } from "sonner";

const triggerTypes: Record<string, string> = {
  keyword: "Palavra-chave",
  greeting: "Saudação",
  fallback: "Fallback (sem resposta)",
  ai: "Inteligência Artificial",
};

const responseTypes: Record<string, string> = {
  text: "Texto fixo",
  ai: "Resposta via IA",
};

type RuleForm = {
  id?: string;
  name: string;
  triggerType: string;
  triggerValue: string;
  responseType: string;
  responseContent: string;
  priority: number;
};

const emptyForm: RuleForm = {
  name: "",
  triggerType: "keyword",
  triggerValue: "",
  responseType: "text",
  responseContent: "",
  priority: 0,
};

const suggestedRules: Omit<RuleForm, "id">[] = [
  {
    name: "Saudação Inicial",
    triggerType: "greeting",
    triggerValue: "",
    responseType: "text",
    responseContent:
      "Olá! 👋 Bem-vindo à The Best Cloud!\n\nSomos especialistas em Ciberproteção com IA: backup, antivírus, anti-ransomware e muito mais em uma plataforma única.\n\nComo posso ajudá-lo hoje?",
    priority: 10,
  },
  {
    name: "Nossos Serviços",
    triggerType: "keyword",
    triggerValue: "serviços, serviço, soluções, produtos, catálogo, o que vocês fazem",
    responseType: "text",
    responseContent:
      "📋 *Nossos Serviços – The Best Cloud*\n\nOferecemos soluções completas organizadas em 3 pilares:\n\n🔐 *Segurança* – XDR, EDR, MDR, DLP, Segurança de E-mail, SAT\n🛡️ *Proteção* – Backup em Nuvem, Anti-Ransomware, Disaster Recovery\n⚙️ *Operações* – RMM, Monitoramento 24/7, Automação de TI\n\n🌐 thebestcloud.com.br",
    priority: 6,
  },
  {
    name: "Backup / Ciberproteção",
    triggerType: "keyword",
    triggerValue: "backup, ciberproteção, nuvem, cloud, armazenamento, dados",
    responseType: "text",
    responseContent:
      "☁️ *Backup em Nuvem – The Best Cloud*\n\nNossa solução de backup é potencializada por IA para garantir:\n\n✅ Backup automático e contínuo\n✅ Recuperação granular de arquivos\n✅ Criptografia AES-256\n✅ Proteção contra ransomware integrada\n✅ Monitoramento 24/7",
    priority: 5,
  },
  {
    name: "Ransomware / Segurança",
    triggerType: "keyword",
    triggerValue: "ransomware, vírus, malware, ataque, segurança, antivírus, proteção",
    responseType: "text",
    responseContent:
      "🛡️ *Proteção Anti-Ransomware – The Best Cloud*\n\nNossa plataforma usa inteligência artificial para:\n\n✅ Detectar e bloquear ransomware em tempo real\n✅ Reverter alterações maliciosas automaticamente\n✅ Antivírus gerenciado com atualizações contínuas\n✅ Firewall e filtragem de URLs\n✅ Relatórios de vulnerabilidade",
    priority: 5,
  },
  {
    name: "Disaster Recovery",
    triggerType: "keyword",
    triggerValue: "disaster recovery, recuperação, desastre, continuidade, RTO, RPO",
    responseType: "text",
    responseContent:
      "🔄 *Disaster Recovery – The Best Cloud*\n\nGaranta a continuidade do seu negócio com:\n\n✅ Failover automático para a nuvem\n✅ RTO/RPO configuráveis\n✅ Testes de recuperação agendados\n✅ Recuperação completa de servidores\n✅ Orquestração de runbooks",
    priority: 5,
  },
  {
    name: "Suporte / Ajuda",
    triggerType: "keyword",
    triggerValue: "suporte, ajuda, problema, erro, ticket, chamado, help",
    responseType: "text",
    responseContent:
      "🎧 *Suporte The Best Cloud*\n\nEstou aqui para ajudar! Para agilizar seu atendimento:\n\n1️⃣ Descreva o problema brevemente\n2️⃣ Informe o nome da sua empresa\n3️⃣ Se possível, envie um print do erro\n\nNossa equipe técnica responderá em breve!\n\n⏰ Atendimento: Seg-Sex, 8h às 18h\n📧 suporte@thebestcloud.com.br",
    priority: 3,
  },
  {
    name: "Fallback Inteligente",
    triggerType: "fallback",
    triggerValue: "",
    responseType: "text",
    responseContent:
      "Obrigado pela sua mensagem! 😊\n\nNão encontrei uma resposta automática para sua pergunta, mas um dos nossos consultores será notificado e responderá em breve.\n\n🌐 thebestcloud.com.br",
    priority: 0,
  },
];

const RuleFormDialog = ({
  form,
  setForm,
  onSubmit,
  isEditing,
  isPending,
}: {
  form: RuleForm;
  setForm: (f: RuleForm) => void;
  onSubmit: () => void;
  isEditing: boolean;
  isPending: boolean;
}) => (
  <div className="space-y-4">
    <div>
      <Label>Nome da Regra</Label>
      <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: Saudação inicial" />
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label>Tipo de Gatilho</Label>
        <Select value={form.triggerType} onValueChange={(v) => setForm({ ...form, triggerType: v })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="keyword">Palavra-chave</SelectItem>
            <SelectItem value="greeting">Saudação (1ª mensagem)</SelectItem>
            <SelectItem value="fallback">Fallback</SelectItem>
            <SelectItem value="ai">IA Automática</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Prioridade</Label>
        <Input type="number" value={form.priority} onChange={(e) => setForm({ ...form, priority: Number(e.target.value) })} min={0} />
      </div>
    </div>
    {form.triggerType === "keyword" && (
      <div>
        <Label>Palavra(s)-chave (separadas por vírgula)</Label>
        <Input value={form.triggerValue} onChange={(e) => setForm({ ...form, triggerValue: e.target.value })} placeholder="Ex: preço, valor, cotação" />
      </div>
    )}
    <div>
      <Label>Tipo de Resposta</Label>
      <Select value={form.responseType} onValueChange={(v) => setForm({ ...form, responseType: v })}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="text">Texto fixo</SelectItem>
          <SelectItem value="ai">Resposta via IA</SelectItem>
        </SelectContent>
      </Select>
    </div>
    <div>
      <Label>{form.responseType === "ai" ? "Prompt / Instruções para a IA" : "Conteúdo da Resposta"}</Label>
      <Textarea
        value={form.responseContent}
        onChange={(e) => setForm({ ...form, responseContent: e.target.value })}
        placeholder={
          form.responseType === "ai"
            ? "Ex: Você é um assistente da The Best Cloud. Responda perguntas sobre nossos serviços de backup e segurança."
            : "Ex: Olá! Seja bem-vindo. Como posso ajudá-lo?"
        }
        rows={5}
      />
    </div>
    <Button onClick={onSubmit} disabled={!form.name || !form.responseContent || isPending} className="w-full">
      {isEditing ? "Salvar Alterações" : "Criar Regra"}
    </Button>
  </div>
);

const CRMChatbot = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [openNew, setOpenNew] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [form, setForm] = useState<RuleForm>(emptyForm);

  const { data: rules } = useQuery({
    queryKey: ["chatbot-rules"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chatbot_rules")
        .select("*")
        .order("priority", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const createRule = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("chatbot_rules").insert({
        name: form.name,
        trigger_type: form.triggerType,
        trigger_value: form.triggerValue || null,
        response_type: form.responseType,
        response_content: form.responseContent,
        priority: form.priority,
        created_by: user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chatbot-rules"] });
      setOpenNew(false);
      setForm(emptyForm);
      toast.success("Regra criada!");
    },
    onError: () => toast.error("Erro ao criar regra"),
  });

  const updateRule = useMutation({
    mutationFn: async () => {
      if (!form.id) return;
      const { error } = await supabase
        .from("chatbot_rules")
        .update({
          name: form.name,
          trigger_type: form.triggerType,
          trigger_value: form.triggerValue || null,
          response_type: form.responseType,
          response_content: form.responseContent,
          priority: form.priority,
        })
        .eq("id", form.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chatbot-rules"] });
      setOpenEdit(false);
      setForm(emptyForm);
      toast.success("Regra atualizada!");
    },
    onError: () => toast.error("Erro ao atualizar regra"),
  });

  const toggleRule = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase.from("chatbot_rules").update({ is_active: active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chatbot-rules"] });
      toast.success("Status atualizado");
    },
  });

  const deleteRule = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("chatbot_rules").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chatbot-rules"] });
      toast.success("Regra removida");
    },
    onError: () => toast.error("Erro ao remover regra"),
  });

  const bulkInsert = useMutation({
    mutationFn: async () => {
      const existingNames = rules?.map((r) => r.name) || [];
      const toInsert = suggestedRules
        .filter((s) => !existingNames.includes(s.name))
        .map((s) => ({
          name: s.name,
          trigger_type: s.triggerType,
          trigger_value: s.triggerValue || null,
          response_type: s.responseType,
          response_content: s.responseContent,
          priority: s.priority,
          created_by: user?.id,
        }));
      if (toInsert.length === 0) {
        toast.info("Todas as sugestões já existem.");
        return;
      }
      const { error } = await supabase.from("chatbot_rules").insert(toInsert);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chatbot-rules"] });
      toast.success("Sugestões importadas com sucesso!");
    },
    onError: () => toast.error("Erro ao importar sugestões"),
  });

  const openEditDialog = (rule: any) => {
    setForm({
      id: rule.id,
      name: rule.name,
      triggerType: rule.trigger_type,
      triggerValue: rule.trigger_value || "",
      responseType: rule.response_type,
      responseContent: rule.response_content,
      priority: rule.priority,
    });
    setOpenEdit(true);
  };

  const activeCount = rules?.filter((r) => r.is_active).length || 0;
  const aiCount = rules?.filter((r) => r.response_type === "ai" && r.is_active).length || 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Bot className="h-6 w-6 text-purple-500" />
            Chatbot & Inteligência Artificial
          </h2>
          <p className="text-muted-foreground text-sm">Configure automações de resposta e agentes de IA para atendimento 24h via WhatsApp</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => bulkInsert.mutate()} disabled={bulkInsert.isPending}>
            <Sparkles className="h-4 w-4 mr-2" /> Importar Sugestões
          </Button>
          <Dialog open={openNew} onOpenChange={(o) => { setOpenNew(o); if (!o) setForm(emptyForm); }}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" /> Nova Regra</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>Nova Regra de Automação</DialogTitle></DialogHeader>
              <RuleFormDialog form={form} setForm={setForm} onSubmit={() => createRule.mutate()} isEditing={false} isPending={createRule.isPending} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-3">
          <div className="text-xs text-muted-foreground">Total de regras</div>
          <div className="text-2xl font-bold">{rules?.length || 0}</div>
        </Card>
        <Card className="p-3">
          <div className="text-xs text-muted-foreground">Regras ativas</div>
          <div className="text-2xl font-bold text-green-500">{activeCount}</div>
        </Card>
        <Card className="p-3">
          <div className="text-xs text-muted-foreground">Agentes IA ativos</div>
          <div className="text-2xl font-bold text-purple-500">{aiCount}</div>
        </Card>
        <Card className="p-3">
          <div className="text-xs text-muted-foreground">Status</div>
          <div className="text-lg font-bold">{activeCount > 0 ? "🟢 Online" : "🔴 Offline"}</div>
        </Card>
      </div>

      {/* Rules table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" /> Regras de Automação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Gatilho</TableHead>
                <TableHead className="hidden sm:table-cell">Valor</TableHead>
                <TableHead>Resposta</TableHead>
                <TableHead className="hidden sm:table-cell"><ArrowUpDown className="h-3 w-3 inline mr-1" />Prioridade</TableHead>
                <TableHead>Ativo</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rules?.map((rule) => (
                <TableRow key={rule.id}>
                  <TableCell className="font-medium">{rule.name}</TableCell>
                  <TableCell>
                    <Badge variant={rule.trigger_type === "ai" ? "default" : "outline"} className="text-xs">
                      {rule.trigger_type === "ai" && <Brain className="h-3 w-3 mr-1" />}
                      {triggerTypes[rule.trigger_type] || rule.trigger_type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-[120px] truncate hidden sm:table-cell">
                    {rule.trigger_value || "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={rule.response_type === "ai" ? "default" : "secondary"} className="text-xs">
                      {responseTypes[rule.response_type] || rule.response_type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center hidden sm:table-cell">{rule.priority}</TableCell>
                  <TableCell>
                    <Switch
                      checked={rule.is_active}
                      onCheckedChange={(checked) => toggleRule.mutate({ id: rule.id, active: checked })}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openEditDialog(rule)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-destructive" onClick={() => deleteRule.mutate(rule.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {!rules?.length && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    Nenhuma regra configurada. Use "Importar Sugestões" para começar rapidamente.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={openEdit} onOpenChange={(o) => { setOpenEdit(o); if (!o) setForm(emptyForm); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Editar Regra de Automação</DialogTitle></DialogHeader>
          <RuleFormDialog form={form} setForm={setForm} onSubmit={() => updateRule.mutate()} isEditing={true} isPending={updateRule.isPending} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CRMChatbot;
