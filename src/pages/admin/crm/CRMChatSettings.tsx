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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Edit, Users, Zap, Settings, Brain } from "lucide-react";
import { toast } from "sonner";
import AISettingsPanel from "@/components/admin/AISettingsPanel";

const CRMChatSettings = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Departments
  const [deptName, setDeptName] = useState("");
  const [deptDesc, setDeptDesc] = useState("");
  const [deptColor, setDeptColor] = useState("#3b82f6");
  const [openDept, setOpenDept] = useState(false);

  const { data: departments } = useQuery({
    queryKey: ["chat-departments-all"],
    queryFn: async () => {
      const { data, error } = await supabase.from("chat_departments").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  const createDept = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("chat_departments").insert({ name: deptName, description: deptDesc || null, color: deptColor });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat-departments-all"] });
      setOpenDept(false); setDeptName(""); setDeptDesc(""); setDeptColor("#3b82f6");
      toast.success("Departamento criado!");
    },
    onError: () => toast.error("Erro ao criar departamento"),
  });

  const toggleDept = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase.from("chat_departments").update({ is_active: active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat-departments-all"] });
      toast.success("Status atualizado");
    },
  });

  // Quick Replies
  const [qrTitle, setQrTitle] = useState("");
  const [qrContent, setQrContent] = useState("");
  const [qrCategory, setQrCategory] = useState("geral");
  const [qrDeptId, setQrDeptId] = useState("");
  const [openQr, setOpenQr] = useState(false);

  const { data: quickReplies } = useQuery({
    queryKey: ["chat-quick-replies-all"],
    queryFn: async () => {
      const { data, error } = await supabase.from("chat_quick_replies").select("*, chat_departments(name)").order("title");
      if (error) throw error;
      return data;
    },
  });

  const createQr = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("chat_quick_replies").insert({
        title: qrTitle,
        content: qrContent,
        category: qrCategory,
        department_id: qrDeptId || null,
        created_by: user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat-quick-replies-all"] });
      setOpenQr(false); setQrTitle(""); setQrContent(""); setQrCategory("geral"); setQrDeptId("");
      toast.success("Resposta rápida criada!");
    },
    onError: () => toast.error("Erro ao criar resposta rápida"),
  });

  const toggleQr = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase.from("chat_quick_replies").update({ is_active: active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat-quick-replies-all"] });
      toast.success("Status atualizado");
    },
  });

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Settings className="h-6 w-6" />
          Configurações do Chat
        </h2>
        <p className="text-muted-foreground">Gerencie departamentos e respostas rápidas</p>
      </div>

      <Tabs defaultValue="departments">
        <TabsList>
          <TabsTrigger value="departments"><Users className="h-4 w-4 mr-1" /> Departamentos</TabsTrigger>
          <TabsTrigger value="quick-replies"><Zap className="h-4 w-4 mr-1" /> Respostas Rápidas</TabsTrigger>
          <TabsTrigger value="ai"><Brain className="h-4 w-4 mr-1" /> IA Comercial</TabsTrigger>
        </TabsList>

        <TabsContent value="departments">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Departamentos</CardTitle>
              <Dialog open={openDept} onOpenChange={setOpenDept}>
                <DialogTrigger asChild>
                  <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Novo</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Novo Departamento</DialogTitle></DialogHeader>
                  <div className="space-y-4">
                    <div><Label>Nome</Label><Input value={deptName} onChange={e => setDeptName(e.target.value)} placeholder="Ex: Suporte Técnico" /></div>
                    <div><Label>Descrição</Label><Input value={deptDesc} onChange={e => setDeptDesc(e.target.value)} placeholder="Descrição opcional" /></div>
                    <div><Label>Cor</Label><Input type="color" value={deptColor} onChange={e => setDeptColor(e.target.value)} className="h-10 w-20" /></div>
                    <Button onClick={() => createDept.mutate()} disabled={!deptName} className="w-full">Criar</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {departments?.map(d => (
                    <TableRow key={d.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color || "#3b82f6" }} />
                          {d.name}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">{d.description || "—"}</TableCell>
                      <TableCell>
                        <Badge variant={d.is_active ? "default" : "secondary"}>{d.is_active ? "Ativo" : "Inativo"}</Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => toggleDept.mutate({ id: d.id, active: !d.is_active })}>
                          {d.is_active ? "Desativar" : "Ativar"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!departments?.length && (
                    <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">Nenhum departamento cadastrado</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quick-replies">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Respostas Rápidas</CardTitle>
              <Dialog open={openQr} onOpenChange={setOpenQr}>
                <DialogTrigger asChild>
                  <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Nova</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Nova Resposta Rápida</DialogTitle></DialogHeader>
                  <div className="space-y-4">
                    <div><Label>Título</Label><Input value={qrTitle} onChange={e => setQrTitle(e.target.value)} placeholder="Ex: Saudação inicial" /></div>
                    <div><Label>Conteúdo</Label><Textarea value={qrContent} onChange={e => setQrContent(e.target.value)} placeholder="Olá! Como posso ajudá-lo?" rows={3} /></div>
                    <div>
                      <Label>Categoria</Label>
                      <Select value={qrCategory} onValueChange={setQrCategory}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="geral">Geral</SelectItem>
                          <SelectItem value="saudacao">Saudação</SelectItem>
                          <SelectItem value="suporte">Suporte</SelectItem>
                          <SelectItem value="vendas">Vendas</SelectItem>
                          <SelectItem value="encerramento">Encerramento</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Departamento (opcional)</Label>
                      <Select value={qrDeptId} onValueChange={setQrDeptId}>
                        <SelectTrigger><SelectValue placeholder="Todos" /></SelectTrigger>
                        <SelectContent>
                          {departments?.filter(d => d.is_active).map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={() => createQr.mutate()} disabled={!qrTitle || !qrContent} className="w-full">Criar</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Conteúdo</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Departamento</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quickReplies?.map(qr => (
                    <TableRow key={qr.id}>
                      <TableCell className="font-medium">{qr.title}</TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">{qr.content}</TableCell>
                      <TableCell><Badge variant="outline" className="text-xs">{qr.category}</Badge></TableCell>
                      <TableCell className="text-sm">{(qr as any).chat_departments?.name || "Todos"}</TableCell>
                      <TableCell>
                        <Badge variant={qr.is_active ? "default" : "secondary"}>{qr.is_active ? "Ativa" : "Inativa"}</Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => toggleQr.mutate({ id: qr.id, active: !qr.is_active })}>
                          {qr.is_active ? "Desativar" : "Ativar"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!quickReplies?.length && (
                    <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">Nenhuma resposta rápida cadastrada</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CRMChatSettings;
