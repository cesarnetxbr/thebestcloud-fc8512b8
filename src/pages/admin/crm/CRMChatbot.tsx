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
import { Plus, Bot, Zap, Brain, Trash2, ArrowUpDown } from "lucide-react";
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

const CRMChatbot = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [openNew, setOpenNew] = useState(false);
  const [name, setName] = useState("");
  const [triggerType, setTriggerType] = useState("keyword");
  const [triggerValue, setTriggerValue] = useState("");
  const [responseType, setResponseType] = useState("text");
  const [responseContent, setResponseContent] = useState("");
  const [priority, setPriority] = useState(0);

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
        name,
        trigger_type: triggerType,
        trigger_value: triggerValue || null,
        response_type: responseType,
        response_content: responseContent,
        priority,
        created_by: user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chatbot-rules"] });
      setOpenNew(false);
      resetForm();
      toast.success("Regra criada!");
    },
    onError: () => toast.error("Erro ao criar regra"),
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

  const resetForm = () => {
    setName("");
    setTriggerType("keyword");
    setTriggerValue("");
    setResponseType("text");
    setResponseContent("");
    setPriority(0);
  };

  const activeCount = rules?.filter(r => r.is_active).length || 0;
  const aiCount = rules?.filter(r => r.response_type === "ai" && r.is_active).length || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Bot className="h-6 w-6 text-purple-500" />
            Chatbot & Inteligência Artificial
          </h2>
          <p className="text-muted-foreground">Configure automações de resposta e agentes de IA para atendimento 24h</p>
        </div>
        <Dialog open={openNew} onOpenChange={setOpenNew}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> Nova Regra</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Nova Regra de Automação</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Nome da Regra</Label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Saudação inicial" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Tipo de Gatilho</Label>
                  <Select value={triggerType} onValueChange={setTriggerType}>
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
                  <Input type="number" value={priority} onChange={e => setPriority(Number(e.target.value))} min={0} />
                </div>
              </div>
              {triggerType === "keyword" && (
                <div>
                  <Label>Palavra(s)-chave (separadas por vírgula)</Label>
                  <Input value={triggerValue} onChange={e => setTriggerValue(e.target.value)} placeholder="Ex: preço, valor, cotação" />
                </div>
              )}
              <div>
                <Label>Tipo de Resposta</Label>
                <Select value={responseType} onValueChange={setResponseType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Texto fixo</SelectItem>
                    <SelectItem value="ai">Resposta via IA</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{responseType === "ai" ? "Prompt / Instruções para a IA" : "Conteúdo da Resposta"}</Label>
                <Textarea
                  value={responseContent}
                  onChange={e => setResponseContent(e.target.value)}
                  placeholder={responseType === "ai" ? "Ex: Você é um assistente da The Best Cloud. Responda perguntas sobre nossos serviços de backup e segurança." : "Ex: Olá! Seja bem-vindo. Como posso ajudá-lo?"}
                  rows={4}
                />
              </div>
              <Button onClick={() => createRule.mutate()} disabled={!name || !responseContent} className="w-full">
                Criar Regra
              </Button>
            </div>
          </DialogContent>
        </Dialog>
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
                <TableHead>Valor</TableHead>
                <TableHead>Resposta</TableHead>
                <TableHead><ArrowUpDown className="h-3 w-3 inline mr-1" />Prioridade</TableHead>
                <TableHead>Ativo</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rules?.map(rule => (
                <TableRow key={rule.id}>
                  <TableCell className="font-medium">{rule.name}</TableCell>
                  <TableCell>
                    <Badge variant={rule.trigger_type === "ai" ? "default" : "outline"} className="text-xs">
                      {rule.trigger_type === "ai" && <Brain className="h-3 w-3 mr-1" />}
                      {triggerTypes[rule.trigger_type] || rule.trigger_type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-[120px] truncate">
                    {rule.trigger_value || "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={rule.response_type === "ai" ? "default" : "secondary"} className="text-xs">
                      {responseTypes[rule.response_type] || rule.response_type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">{rule.priority}</TableCell>
                  <TableCell>
                    <Switch
                      checked={rule.is_active}
                      onCheckedChange={(checked) => toggleRule.mutate({ id: rule.id, active: checked })}
                    />
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" className="text-destructive" onClick={() => deleteRule.mutate(rule.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {!rules?.length && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    Nenhuma regra configurada. Crie regras para automatizar o atendimento.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default CRMChatbot;
