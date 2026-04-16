import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Plus, Send, MessageCircle, Archive, User, Building2, Search,
  XCircle, RotateCcw, ArrowRightLeft, Zap, Users, Phone, Kanban,
  ChevronLeft,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const channelLabels: Record<string, string> = {
  chat: "Chat",
  whatsapp: "WhatsApp",
  email: "E-mail",
  telefone: "Telefone",
};

const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  ativa: { label: "Ativa", variant: "default" },
  arquivada: { label: "Arquivada", variant: "secondary" },
  encerrada: { label: "Encerrada", variant: "outline" },
};

const CRMChat = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todas");
  const [channelFilter, setChannelFilter] = useState<string>("todos");
  const [openNew, setOpenNew] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newChannel, setNewChannel] = useState("whatsapp");
  const [newCustomerId, setNewCustomerId] = useState("");
  const [newLeadId, setNewLeadId] = useState("");
  const [newDepartmentId, setNewDepartmentId] = useState("");
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ── Queries ──
  const { data: conversations } = useQuery({
    queryKey: ["chat-conversations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chat_conversations")
        .select("*, customers(name), crm_leads(name)")
        .order("last_message_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: messages } = useQuery({
    queryKey: ["chat-messages", selectedId],
    queryFn: async () => {
      if (!selectedId) return [];
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("conversation_id", selectedId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!selectedId,
  });

  const { data: customers } = useQuery({
    queryKey: ["customers-for-chat"],
    queryFn: async () => {
      const { data, error } = await supabase.from("customers").select("id, name").order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: leads } = useQuery({
    queryKey: ["leads-for-chat"],
    queryFn: async () => {
      const { data, error } = await supabase.from("crm_leads").select("id, name").order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: departments } = useQuery({
    queryKey: ["chat-departments"],
    queryFn: async () => {
      const { data, error } = await supabase.from("chat_departments").select("*").eq("is_active", true).order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: profiles } = useQuery({
    queryKey: ["profiles-for-chat"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("user_id, full_name").eq("is_active", true);
      if (error) throw error;
      return data;
    },
  });

  const { data: quickReplies } = useQuery({
    queryKey: ["chat-quick-replies"],
    queryFn: async () => {
      const { data, error } = await supabase.from("chat_quick_replies").select("*").eq("is_active", true).order("title");
      if (error) throw error;
      return data;
    },
  });

  const { data: unreadCounts } = useQuery({
    queryKey: ["chat-unread-counts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("conversation_id")
        .eq("is_read", false)
        .neq("sender_type", "agent");
      if (error) throw error;
      const counts: Record<string, number> = {};
      data?.forEach(m => { counts[m.conversation_id] = (counts[m.conversation_id] || 0) + 1; });
      return counts;
    },
  });

  // ── Realtime ──
  useEffect(() => {
    if (!selectedId) return;
    const channel = supabase
      .channel(`chat-${selectedId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages", filter: `conversation_id=eq.${selectedId}` }, () => {
        queryClient.invalidateQueries({ queryKey: ["chat-messages", selectedId] });
        queryClient.invalidateQueries({ queryKey: ["chat-conversations"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [selectedId, queryClient]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Mark as read
  useEffect(() => {
    if (!selectedId) return;
    supabase.from("chat_messages")
      .update({ is_read: true })
      .eq("conversation_id", selectedId)
      .eq("is_read", false)
      .neq("sender_type", "agent")
      .then(() => {
        queryClient.invalidateQueries({ queryKey: ["chat-unread-counts"] });
      });
  }, [selectedId, queryClient]);

  // Global notifications
  useEffect(() => {
    const channel = supabase
      .channel("chat-global-notifications")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages" }, (payload) => {
        const msg = payload.new as any;
        if (msg.sender_type !== "agent" && msg.conversation_id !== selectedId) {
          toast.info(`Nova mensagem: ${msg.content?.substring(0, 50)}...`, { duration: 4000 });
        }
        queryClient.invalidateQueries({ queryKey: ["chat-unread-counts"] });
        queryClient.invalidateQueries({ queryKey: ["chat-conversations"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [selectedId, queryClient]);

  // ── Mutations ──
  const createConversation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.from("chat_conversations").insert({
        title: newTitle,
        channel: newChannel,
        customer_id: newCustomerId || null,
        lead_id: newLeadId || null,
        department_id: newDepartmentId || null,
        assigned_to: user?.id,
        created_by: user?.id,
      }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["chat-conversations"] });
      setSelectedId(data.id);
      setOpenNew(false);
      setNewTitle(""); setNewChannel("whatsapp"); setNewCustomerId(""); setNewLeadId(""); setNewDepartmentId("");
      toast.success("Conversa criada!");
    },
    onError: () => toast.error("Erro ao criar conversa"),
  });

  const sendMessage = useMutation({
    mutationFn: async () => {
      const agentName = profiles?.find(p => p.user_id === user?.id)?.full_name || user?.email?.split("@")[0] || "Agente";
      
      // If WhatsApp conversation with phone, send via Z-API
      const conv = conversations?.find(c => c.id === selectedId);
      if (conv?.channel === "whatsapp" && (conv as any)?.phone) {
        try {
          const PROJECT_ID = import.meta.env.VITE_SUPABASE_PROJECT_ID;
          const FUNCTIONS_URL = `https://${PROJECT_ID}.supabase.co/functions/v1`;
          const { data: { session } } = await supabase.auth.getSession();
          const res = await fetch(`${FUNCTIONS_URL}/whatsapp-evolution?action=send-text`, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${session?.access_token}`,
              "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ phone: (conv as any).phone, message: newMessage }),
          });
          if (!res.ok) {
            const err = await res.json();
            console.error("Z-API send error:", err);
            // Still save to DB even if Z-API fails
          }
        } catch (err) {
          console.error("Z-API send failed:", err);
        }
      }

      const { error } = await supabase.from("chat_messages").insert({
        conversation_id: selectedId!,
        sender_type: "agent",
        sender_name: agentName,
        content: newMessage,
      });
      if (error) throw error;
      await supabase.from("chat_conversations").update({ last_message_at: new Date().toISOString() }).eq("id", selectedId!);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat-messages", selectedId] });
      queryClient.invalidateQueries({ queryKey: ["chat-conversations"] });
      setNewMessage("");
    },
    onError: () => toast.error("Erro ao enviar mensagem"),
  });

  const updateConversationStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("chat_conversations").update({ status }).eq("id", id);
      if (error) throw error;
      await supabase.from("chat_messages").insert({
        conversation_id: id,
        sender_type: "system",
        sender_name: "Sistema",
        content: status === "arquivada" ? "Conversa arquivada" : status === "encerrada" ? "Conversa encerrada" : "Conversa reaberta",
      });
    },
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ["chat-conversations"] });
      queryClient.invalidateQueries({ queryKey: ["chat-messages", selectedId] });
      const labels: Record<string, string> = { arquivada: "Conversa arquivada", encerrada: "Conversa encerrada", ativa: "Conversa reaberta" };
      toast.success(labels[status] || "Status atualizado");
    },
    onError: () => toast.error("Erro ao atualizar conversa"),
  });

  const transferConversation = useMutation({
    mutationFn: async ({ id, agentId, agentName }: { id: string; agentId: string; agentName: string }) => {
      const { error } = await supabase.from("chat_conversations").update({ assigned_to: agentId }).eq("id", id);
      if (error) throw error;
      const myName = profiles?.find(p => p.user_id === user?.id)?.full_name || "Agente";
      await supabase.from("chat_messages").insert({
        conversation_id: id,
        sender_type: "system",
        sender_name: "Sistema",
        content: `Conversa transferida de ${myName} para ${agentName}`,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat-conversations"] });
      queryClient.invalidateQueries({ queryKey: ["chat-messages", selectedId] });
      toast.success("Conversa transferida!");
    },
    onError: () => toast.error("Erro ao transferir conversa"),
  });

  const assignDepartment = useMutation({
    mutationFn: async ({ id, departmentId, departmentName }: { id: string; departmentId: string; departmentName: string }) => {
      const { error } = await supabase.from("chat_conversations").update({ department_id: departmentId }).eq("id", id);
      if (error) throw error;
      await supabase.from("chat_messages").insert({
        conversation_id: id,
        sender_type: "system",
        sender_name: "Sistema",
        content: `Conversa movida para o departamento: ${departmentName}`,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat-conversations"] });
      queryClient.invalidateQueries({ queryKey: ["chat-messages", selectedId] });
      toast.success("Departamento atualizado!");
    },
    onError: () => toast.error("Erro ao mover conversa"),
  });

  const convertToPipeline = useMutation({
    mutationFn: async (conv: any) => {
      // Fetch default first stage
      const { data: stages } = await supabase
        .from("crm_pipeline_stages")
        .select("id")
        .eq("is_active", true)
        .order("position", { ascending: true })
        .limit(1);
      const stageId = stages?.[0]?.id || null;
      const title = conv.title || "Deal do Chat";
      const { data, error } = await supabase.from("crm_deals").insert({
        title,
        lead_id: conv.lead_id || null,
        stage_id: stageId,
        created_by: user?.id,
        notes: `Convertido da conversa: ${conv.title}`,
      }).select().single();
      if (error) throw error;
      // Link conversation to deal
      await supabase.from("chat_conversations").update({ deal_id: data.id }).eq("id", conv.id);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["chat-conversations"] });
      toast.success("Conversa convertida em deal no Pipeline!", {
        action: { label: "Ver Pipeline", onClick: () => window.location.href = "/admin/crm/pipeline" },
      });
    },
    onError: () => toast.error("Erro ao converter para Pipeline"),
  });

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && newMessage.trim()) {
      e.preventDefault();
      sendMessage.mutate();
    }
  };

  const useQuickReply = (content: string) => {
    setNewMessage(content);
    setShowQuickReplies(false);
  };

  // ── Filters ──
  const filtered = conversations?.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c as any).customers?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c as any).crm_leads?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "todas" || c.status === statusFilter;
    const matchesChannel = channelFilter === "todos" || c.channel === channelFilter;
    return matchesSearch && matchesStatus && matchesChannel;
  });

  const selected = conversations?.find(c => c.id === selectedId);
  const assignedAgent = profiles?.find(p => p.user_id === selected?.assigned_to);
  const assignedDept = departments?.find(d => d.id === (selected as any)?.department_id);

  // Counts
  const myConversations = conversations?.filter(c => c.assigned_to === user?.id && c.status === "ativa").length || 0;
  const whatsappConversations = conversations?.filter(c => c.channel === "whatsapp" && c.status === "ativa").length || 0;
  const waitingConversations = conversations?.filter(c => !c.assigned_to && c.status === "ativa").length || 0;

  // Mobile: show chat area when a conversation is selected
  const showChatOnMobile = !!selectedId;

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="min-w-0">
          <h2 className="text-lg sm:text-2xl font-bold text-foreground flex items-center gap-2">
            <Phone className="h-5 w-5 sm:h-6 sm:w-6 text-green-500 shrink-0" />
            <span className="truncate">Multi-atendimento WhatsApp</span>
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">Central de conversas com múltiplos atendentes</p>
        </div>
        <Dialog open={openNew} onOpenChange={setOpenNew}>
          <DialogTrigger asChild>
            <Button size="sm" className="w-full sm:w-auto"><Plus className="h-4 w-4 mr-2" /> Nova Conversa</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nova Conversa</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Título</Label><Input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Ex: Atendimento João Silva" /></div>
              <div>
                <Label>Canal</Label>
                <Select value={newChannel} onValueChange={setNewChannel}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="chat">Chat</SelectItem>
                    <SelectItem value="email">E-mail</SelectItem>
                    <SelectItem value="telefone">Telefone</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Departamento (opcional)</Label>
                <Select value={newDepartmentId} onValueChange={setNewDepartmentId}>
                  <SelectTrigger><SelectValue placeholder="Selecionar departamento" /></SelectTrigger>
                  <SelectContent>
                    {departments?.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Cliente (opcional)</Label>
                <Select value={newCustomerId} onValueChange={setNewCustomerId}>
                  <SelectTrigger><SelectValue placeholder="Vincular cliente" /></SelectTrigger>
                  <SelectContent>
                    {customers?.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Lead (opcional)</Label>
                <Select value={newLeadId} onValueChange={setNewLeadId}>
                  <SelectTrigger><SelectValue placeholder="Vincular lead" /></SelectTrigger>
                  <SelectContent>
                    {leads?.map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={() => createConversation.mutate()} disabled={!newTitle} className="w-full">Criar Conversa</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        <Card className="p-2 sm:p-3">
          <div className="text-[10px] sm:text-xs text-muted-foreground">Meus atendimentos</div>
          <div className="text-xl sm:text-2xl font-bold">{myConversations}</div>
        </Card>
        <Card className="p-2 sm:p-3">
          <div className="text-[10px] sm:text-xs text-muted-foreground">WhatsApp ativos</div>
          <div className="text-xl sm:text-2xl font-bold text-green-500">{whatsappConversations}</div>
        </Card>
        <Card className="p-2 sm:p-3">
          <div className="text-[10px] sm:text-xs text-muted-foreground">Aguardando agente</div>
          <div className="text-xl sm:text-2xl font-bold text-amber-500">{waitingConversations}</div>
        </Card>
        <Card className="p-2 sm:p-3">
          <div className="text-[10px] sm:text-xs text-muted-foreground">Total conversas</div>
          <div className="text-xl sm:text-2xl font-bold">{conversations?.filter(c => c.status === "ativa").length || 0}</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 h-[calc(100vh-380px)] sm:h-[calc(100vh-340px)]">
        {/* Conversation list — hidden on mobile when a chat is open */}
        <Card className={cn("lg:col-span-1 flex flex-col", showChatOnMobile ? "hidden lg:flex" : "flex")}>
          <CardHeader className="pb-2 space-y-2 px-3 sm:px-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar conversas..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-9 h-9" />
            </div>
            <div className="flex gap-1 flex-wrap">
              {[
                { value: "todas", label: "Todas" },
                { value: "ativa", label: "Ativas" },
                { value: "arquivada", label: "Arquiv." },
                { value: "encerrada", label: "Encerr." },
              ].map(f => (
                <Button key={f.value} variant={statusFilter === f.value ? "default" : "ghost"} size="sm" className="text-xs h-7 px-2" onClick={() => setStatusFilter(f.value)}>
                  {f.label}
                </Button>
              ))}
            </div>
            <div className="flex gap-1 flex-wrap">
              {[
                { value: "todos", label: "Todos" },
                { value: "whatsapp", label: "WhatsApp" },
                { value: "chat", label: "Chat" },
                { value: "email", label: "E-mail" },
              ].map(f => (
                <Button key={f.value} variant={channelFilter === f.value ? "secondary" : "ghost"} size="sm" className="text-xs h-6 px-2" onClick={() => setChannelFilter(f.value)}>
                  {f.label}
                </Button>
              ))}
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-0 overflow-hidden">
            <ScrollArea className="h-full">
              {!filtered?.length ? (
                <div className="p-6 text-center text-muted-foreground text-sm">Nenhuma conversa encontrada</div>
              ) : filtered.map(conv => {
                const st = statusLabels[conv.status] || statusLabels.ativa;
                const agent = profiles?.find(p => p.user_id === conv.assigned_to);
                return (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedId(conv.id)}
                    className={cn(
                      "w-full text-left px-3 sm:px-4 py-3 border-b border-border hover:bg-muted/50 transition-colors",
                      selectedId === conv.id && "bg-muted"
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-medium text-sm text-foreground truncate">{conv.title}</span>
                        {(unreadCounts?.[conv.id] || 0) > 0 && (
                          <span className="bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full h-5 min-w-[20px] flex items-center justify-center px-1 shrink-0">
                            {unreadCounts![conv.id]}
                          </span>
                        )}
                      </div>
                      <Badge variant={st.variant} className="text-[10px] shrink-0 ml-2">{st.label}</Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className={cn("px-1.5 py-0.5 rounded text-[10px]", conv.channel === "whatsapp" ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" : "bg-muted")}>
                        {channelLabels[conv.channel] || conv.channel}
                      </span>
                      {(conv as any).customers?.name && (
                        <span className="flex items-center gap-1 truncate"><Building2 className="h-3 w-3" />{(conv as any).customers.name}</span>
                      )}
                      {(conv as any).crm_leads?.name && (
                        <span className="flex items-center gap-1 truncate"><User className="h-3 w-3" />{(conv as any).crm_leads.name}</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[10px] text-muted-foreground">
                        {conv.last_message_at ? new Date(conv.last_message_at).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) : ""}
                      </span>
                      {agent && (
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <User className="h-3 w-3" />{agent.full_name?.split(" ")[0]}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chat area — full width on mobile when open */}
        <Card className={cn("lg:col-span-2 flex flex-col", showChatOnMobile ? "flex" : "hidden lg:flex")}>
          {!selectedId ? (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>Selecione uma conversa ou crie uma nova</p>
              </div>
            </div>
          ) : (
            <>
              <CardHeader className="pb-2 border-b border-border px-3 sm:px-6">
                <div className="flex items-center gap-2">
                  {/* Back button — mobile only */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0 lg:hidden"
                    onClick={() => setSelectedId(null)}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-sm sm:text-base truncate">{selected?.title}</CardTitle>
                    <div className="flex items-center gap-1 sm:gap-2 mt-1 flex-wrap">
                      <span className={cn("text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded", selected?.channel === "whatsapp" ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" : "bg-muted")}>
                        {channelLabels[selected?.channel || "chat"]}
                      </span>
                      {(selected as any)?.customers?.name && <span className="text-[10px] sm:text-xs text-muted-foreground hidden sm:inline">{(selected as any).customers.name}</span>}
                      {assignedAgent && (
                        <span className="text-[10px] sm:text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 px-1.5 sm:px-2 py-0.5 rounded flex items-center gap-1">
                          <User className="h-3 w-3" /> <span className="hidden sm:inline">{assignedAgent.full_name}</span><span className="sm:hidden">{assignedAgent.full_name?.split(" ")[0]}</span>
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-0.5 sm:gap-1 items-center shrink-0">
                    <Badge variant={statusLabels[selected?.status || "ativa"].variant} className="text-[10px] hidden sm:inline-flex">
                      {statusLabels[selected?.status || "ativa"].label}
                    </Badge>

                    {/* Transfer agent */}
                    {selected?.status === "ativa" && (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8" title="Transferir atendente">
                            <ArrowRightLeft className="h-4 w-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-56 p-2" align="end">
                          <p className="text-xs font-medium mb-2 text-muted-foreground">Transferir para:</p>
                          {profiles?.filter(p => p.user_id !== selected.assigned_to).map(p => (
                            <Button
                              key={p.user_id}
                              variant="ghost"
                              size="sm"
                              className="w-full justify-start text-xs h-8"
                              onClick={() => transferConversation.mutate({ id: selected.id, agentId: p.user_id, agentName: p.full_name || "Agente" })}
                            >
                              <User className="h-3 w-3 mr-2" />{p.full_name}
                            </Button>
                          ))}
                          {departments && departments.length > 0 && (
                            <>
                              <div className="border-t border-border my-1" />
                              <p className="text-xs font-medium mb-1 text-muted-foreground">Mover para departamento:</p>
                              {departments.map(d => (
                                <Button
                                  key={d.id}
                                  variant="ghost"
                                  size="sm"
                                  className="w-full justify-start text-xs h-8"
                                  onClick={() => assignDepartment.mutate({ id: selected.id, departmentId: d.id, departmentName: d.name })}
                                >
                                  <Users className="h-3 w-3 mr-2" />{d.name}
                                </Button>
                              ))}
                            </>
                          )}
                        </PopoverContent>
                      </Popover>
                    )}

                    {selected?.status === "ativa" && (
                      <>
                        {!selected?.deal_id && (
                          <Button variant="ghost" size="icon" className="h-8 w-8" title="Converter em Pipeline" onClick={() => convertToPipeline.mutate(selected)}>
                            <Kanban className="h-4 w-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" className="h-8 w-8" title="Arquivar" onClick={() => updateConversationStatus.mutate({ id: selected.id, status: "arquivada" })}>
                          <Archive className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" title="Encerrar" onClick={() => updateConversationStatus.mutate({ id: selected.id, status: "encerrada" })}>
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    {(selected?.status === "arquivada" || selected?.status === "encerrada") && (
                      <Button variant="ghost" size="icon" className="h-8 w-8" title="Reabrir" onClick={() => updateConversationStatus.mutate({ id: selected.id, status: "ativa" })}>
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 p-0 overflow-hidden flex flex-col min-h-0">
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-3">
                    {!messages?.length ? (
                      <div className="text-center text-muted-foreground text-sm py-8">Nenhuma mensagem ainda. Inicie a conversa!</div>
                    ) : messages.map(msg => (
                      <div key={msg.id} className={cn("flex", msg.sender_type === "agent" ? "justify-end" : "justify-start")}>
                        <div className={cn(
                          "max-w-[70%] rounded-lg px-3 py-2 text-sm",
                          msg.sender_type === "agent"
                            ? "bg-primary text-primary-foreground"
                            : msg.sender_type === "system"
                            ? "bg-muted text-muted-foreground italic text-center w-full max-w-full text-xs"
                            : "bg-muted text-foreground"
                        )}>
                          {msg.sender_type !== "system" && (
                            <div className={cn("text-[10px] mb-0.5 font-medium", msg.sender_type === "agent" ? "text-primary-foreground/70" : "text-muted-foreground")}>
                              {msg.sender_name || (msg.sender_type === "agent" ? "Agente" : "Cliente")}
                            </div>
                          )}
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                          <div className={cn("text-[10px] mt-1", msg.sender_type === "agent" ? "text-primary-foreground/50" : "text-muted-foreground/70")}>
                            {new Date(msg.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
                {selected?.status === "ativa" && (
                  <div className="border-t border-border">
                    {/* Quick replies */}
                    {showQuickReplies && quickReplies && quickReplies.length > 0 && (
                      <div className="p-2 border-b border-border bg-muted/30 max-h-32 overflow-y-auto">
                        <div className="flex flex-wrap gap-1">
                          {quickReplies.map(qr => (
                            <Button key={qr.id} variant="outline" size="sm" className="text-xs h-7" onClick={() => useQuickReply(qr.content)} title={qr.content}>
                              {qr.title}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="p-3 flex gap-2 items-end">
                      <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0" title="Respostas rápidas" onClick={() => setShowQuickReplies(!showQuickReplies)}>
                        <Zap className="h-4 w-4" />
                      </Button>
                      <Textarea
                        value={newMessage}
                        onChange={e => setNewMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Digite sua mensagem... (Enter para enviar)"
                        rows={1}
                        className="resize-none min-h-[40px]"
                      />
                      <Button size="icon" className="h-9 w-9 shrink-0" onClick={() => newMessage.trim() && sendMessage.mutate()} disabled={!newMessage.trim()}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  );
};

export default CRMChat;
