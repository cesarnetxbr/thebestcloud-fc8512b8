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
import { Plus, Send, MessageCircle, Archive, User, Building2, Search, XCircle, RotateCcw, Bell } from "lucide-react";
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
  const [openNew, setOpenNew] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newChannel, setNewChannel] = useState("chat");
  const [newCustomerId, setNewCustomerId] = useState("");
  const [newLeadId, setNewLeadId] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  // Realtime subscription
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

  const createConversation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.from("chat_conversations").insert({
        title: newTitle,
        channel: newChannel,
        customer_id: newCustomerId || null,
        lead_id: newLeadId || null,
        created_by: user?.id,
      }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["chat-conversations"] });
      setSelectedId(data.id);
      setOpenNew(false);
      setNewTitle("");
      setNewChannel("chat");
      setNewCustomerId("");
      setNewLeadId("");
      toast.success("Conversa criada!");
    },
    onError: () => toast.error("Erro ao criar conversa"),
  });

  const sendMessage = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("chat_messages").insert({
        conversation_id: selectedId!,
        sender_type: "agent",
        sender_name: user?.email?.split("@")[0] || "Agente",
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
      // Add system message
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

  // Unread count per conversation
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

  // Mark messages as read when selecting a conversation
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

  // Global realtime for unread notifications
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && newMessage.trim()) {
      e.preventDefault();
      sendMessage.mutate();
    }
  };

  const filtered = conversations?.filter(c =>
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c as any).customers?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c as any).crm_leads?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selected = conversations?.find(c => c.id === selectedId);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Central de Chat</h2>
          <p className="text-muted-foreground">Conversas centralizadas com leads e clientes</p>
        </div>
        <Dialog open={openNew} onOpenChange={setOpenNew}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> Nova Conversa</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nova Conversa</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Título</Label><Input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Ex: Negociação Projeto X" /></div>
              <div>
                <Label>Canal</Label>
                <Select value={newChannel} onValueChange={setNewChannel}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="chat">Chat</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="email">E-mail</SelectItem>
                    <SelectItem value="telefone">Telefone</SelectItem>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-220px)]">
        {/* Conversation list */}
        <Card className="lg:col-span-1 flex flex-col">
          <CardHeader className="pb-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar conversas..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-9" />
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-0 overflow-hidden">
            <ScrollArea className="h-full">
              {!filtered?.length ? (
                <div className="p-6 text-center text-muted-foreground text-sm">Nenhuma conversa encontrada</div>
              ) : filtered.map(conv => {
                const st = statusLabels[conv.status] || statusLabels.ativa;
                return (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedId(conv.id)}
                    className={cn(
                      "w-full text-left px-4 py-3 border-b border-border hover:bg-muted/50 transition-colors",
                      selectedId === conv.id && "bg-muted"
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm text-foreground truncate">{conv.title}</span>
                      <Badge variant={st.variant} className="text-[10px] shrink-0 ml-2">{st.label}</Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="bg-muted px-1.5 py-0.5 rounded text-[10px]">{channelLabels[conv.channel] || conv.channel}</span>
                      {(conv as any).customers?.name && (
                        <span className="flex items-center gap-1 truncate"><Building2 className="h-3 w-3" />{(conv as any).customers.name}</span>
                      )}
                      {(conv as any).crm_leads?.name && (
                        <span className="flex items-center gap-1 truncate"><User className="h-3 w-3" />{(conv as any).crm_leads.name}</span>
                      )}
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-1">
                      {conv.last_message_at ? new Date(conv.last_message_at).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) : ""}
                    </div>
                  </button>
                );
              })}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chat area */}
        <Card className="lg:col-span-2 flex flex-col">
          {!selectedId ? (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>Selecione uma conversa ou crie uma nova</p>
              </div>
            </div>
          ) : (
            <>
              <CardHeader className="pb-2 border-b border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">{selected?.title}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs bg-muted px-2 py-0.5 rounded">{channelLabels[selected?.channel || "chat"]}</span>
                      {(selected as any)?.customers?.name && <span className="text-xs text-muted-foreground">{(selected as any).customers.name}</span>}
                      {(selected as any)?.crm_leads?.name && <span className="text-xs text-muted-foreground">{(selected as any).crm_leads.name}</span>}
                    </div>
                  </div>
                  <Badge variant={statusLabels[selected?.status || "ativa"].variant}>
                    {statusLabels[selected?.status || "ativa"].label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-1 p-0 overflow-hidden flex flex-col">
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
                  <div className="p-3 border-t border-border flex gap-2">
                    <Textarea
                      value={newMessage}
                      onChange={e => setNewMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Digite sua mensagem... (Enter para enviar)"
                      rows={1}
                      className="resize-none min-h-[40px]"
                    />
                    <Button size="icon" onClick={() => newMessage.trim() && sendMessage.mutate()} disabled={!newMessage.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
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
