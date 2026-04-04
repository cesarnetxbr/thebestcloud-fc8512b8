import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Plus, Tag, MessageSquare, ArrowRightLeft, GripVertical, X } from "lucide-react";
import { format } from "date-fns";

const CommercialRequests = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [detailReq, setDetailReq] = useState<any>(null);
  const [noteText, setNoteText] = useState("");
  const [tagName, setTagName] = useState("");
  const [tagColor, setTagColor] = useState("#3b82f6");
  const [transferTo, setTransferTo] = useState("");
  const [form, setForm] = useState({ customer_name: "", customer_id: "", items: [{ item_name: "", quantity: 1 }] });

  const { data: stages = [] } = useQuery({
    queryKey: ["kanban_stages"],
    queryFn: async () => {
      const { data, error } = await supabase.from("kanban_stages").select("*").eq("is_active", true).order("position");
      if (error) throw error;
      return data;
    },
  });

  const { data: requests = [] } = useQuery({
    queryKey: ["commercial_requests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("commercial_requests")
        .select("*, kanban_stages(name, color), customers(name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: customers = [] } = useQuery({
    queryKey: ["customers_list"],
    queryFn: async () => {
      const { data, error } = await supabase.from("customers").select("id, name").order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: reqItems = [] } = useQuery({
    queryKey: ["request_items", detailReq?.id],
    queryFn: async () => {
      if (!detailReq) return [];
      const { data, error } = await supabase.from("commercial_request_items").select("*").eq("request_id", detailReq.id);
      if (error) throw error;
      return data;
    },
    enabled: !!detailReq,
  });

  const { data: reqNotes = [], refetch: refetchNotes } = useQuery({
    queryKey: ["request_notes", detailReq?.id],
    queryFn: async () => {
      if (!detailReq) return [];
      const { data, error } = await supabase.from("commercial_request_notes").select("*").eq("request_id", detailReq.id).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!detailReq,
  });

  const { data: reqTags = [], refetch: refetchTags } = useQuery({
    queryKey: ["request_tags", detailReq?.id],
    queryFn: async () => {
      if (!detailReq) return [];
      const { data, error } = await supabase.from("commercial_request_tags").select("*").eq("request_id", detailReq.id);
      if (error) throw error;
      return data;
    },
    enabled: !!detailReq,
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ["all_profiles"],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("user_id, full_name");
      return data || [];
    },
  });

  const createRequest = useMutation({
    mutationFn: async () => {
      const num = `SOL-${Date.now().toString().slice(-6)}`;
      const firstStage = stages[0];
      const { data: req, error } = await supabase.from("commercial_requests").insert({
        request_number: num,
        customer_name: form.customer_name,
        customer_id: form.customer_id || null,
        stage_id: firstStage?.id || null,
        created_by: user!.id,
        assigned_to: user!.id,
        assigned_name: user!.email,
      }).select().single();
      if (error) throw error;

      const validItems = form.items.filter(i => i.item_name.trim());
      if (validItems.length > 0) {
        const { error: itemErr } = await supabase.from("commercial_request_items").insert(
          validItems.map(i => ({ request_id: req.id, item_name: i.item_name, quantity: i.quantity }))
        );
        if (itemErr) throw itemErr;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["commercial_requests"] });
      setCreateOpen(false);
      setForm({ customer_name: "", customer_id: "", items: [{ item_name: "", quantity: 1 }] });
      toast({ title: "Solicitação criada" });
    },
    onError: (e: any) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const moveToStage = useMutation({
    mutationFn: async ({ reqId, stageId }: { reqId: string; stageId: string }) => {
      const { error } = await supabase.from("commercial_requests").update({ stage_id: stageId }).eq("id", reqId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["commercial_requests"] });
      toast({ title: "Movido com sucesso" });
    },
  });

  const addNote = useMutation({
    mutationFn: async () => {
      const profile = profiles.find((p: any) => p.user_id === user?.id);
      const { error } = await supabase.from("commercial_request_notes").insert({
        request_id: detailReq.id,
        author_id: user!.id,
        author_name: profile?.full_name || user!.email,
        content: noteText,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setNoteText("");
      refetchNotes();
      toast({ title: "Anotação adicionada" });
    },
  });

  const addTag = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("commercial_request_tags").insert({
        request_id: detailReq.id,
        tag_name: tagName,
        tag_color: tagColor,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setTagName("");
      refetchTags();
      toast({ title: "Tag adicionada" });
    },
  });

  const transferRequest = useMutation({
    mutationFn: async () => {
      const profile = profiles.find((p: any) => p.user_id === transferTo);
      const { error } = await supabase.from("commercial_requests").update({
        assigned_to: transferTo,
        assigned_name: profile?.full_name || transferTo,
      }).eq("id", detailReq.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["commercial_requests"] });
      setTransferTo("");
      toast({ title: "Responsável transferido" });
    },
  });

  const removeTag = async (tagId: string) => {
    await supabase.from("commercial_request_tags").delete().eq("id", tagId);
    refetchTags();
  };

  const addItem = () => setForm({ ...form, items: [...form.items, { item_name: "", quantity: 1 }] });
  const updateItem = (idx: number, field: string, val: any) => {
    const items = [...form.items];
    (items[idx] as any)[field] = val;
    setForm({ ...form, items });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Solicitações Comerciais</h2>
          <p className="text-muted-foreground">Kanban de negociações</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Nova Solicitação</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nova Solicitação</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <Select value={form.customer_id} onValueChange={v => {
                const c = customers.find((c: any) => c.id === v);
                setForm({ ...form, customer_id: v, customer_name: c?.name || "" });
              }}>
                <SelectTrigger><SelectValue placeholder="Selecione o cliente" /></SelectTrigger>
                <SelectContent>
                  {customers.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <div className="space-y-2">
                <label className="text-sm font-medium">Itens Solicitados</label>
                {form.items.map((item, idx) => (
                  <div key={idx} className="flex gap-2">
                    <Input placeholder="Item" value={item.item_name} onChange={e => updateItem(idx, "item_name", e.target.value)} className="flex-1" />
                    <Input type="number" placeholder="Qtd" value={item.quantity} onChange={e => updateItem(idx, "quantity", parseInt(e.target.value) || 1)} className="w-20" />
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={addItem}>+ Adicionar Item</Button>
              </div>
              <Button onClick={() => createRequest.mutate()} disabled={!form.customer_name} className="w-full">Criar Solicitação</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Status summary */}
      <div className="flex gap-2 flex-wrap">
        {stages.map((s: any) => {
          const count = requests.filter((r: any) => r.stage_id === s.id).length;
          return (
            <Badge key={s.id} variant="outline" style={{ borderColor: s.color, color: s.color }}>
              <span className="w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: s.color }} />
              {s.name}: {count}
            </Badge>
          );
        })}
      </div>

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {stages.map((stage: any) => {
          const stageRequests = requests.filter((r: any) => r.stage_id === stage.id);
          return (
            <div key={stage.id} className="min-w-[300px] flex-shrink-0">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: stage.color }} />
                <h3 className="font-semibold text-sm">{stage.name}</h3>
                <Badge variant="secondary" className="ml-auto">{stageRequests.length}</Badge>
              </div>
              <div className="space-y-3">
                {stageRequests.map((req: any) => (
                  <Card key={req.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setDetailReq(req)}>
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-start justify-between">
                        <p className="font-semibold text-sm">{req.request_number}</p>
                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <p className="text-sm text-muted-foreground">{req.customer_name}</p>
                      {req.assigned_name && (
                        <p className="text-xs text-muted-foreground">👤 Resp: {req.assigned_name}</p>
                      )}
                      <p className="text-xs text-muted-foreground">📅 {format(new Date(req.created_at), "dd/MM/yy HH:mm")}</p>
                    </CardContent>
                  </Card>
                ))}
                {stageRequests.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">Nenhuma solicitação</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!detailReq} onOpenChange={o => !o && setDetailReq(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{detailReq?.request_number} — {detailReq?.customer_name}</DialogTitle>
          </DialogHeader>
          {detailReq && (
            <div className="space-y-4">
              {/* Tags */}
              <div>
                <label className="text-sm font-medium mb-1 block">Tags</label>
                <div className="flex flex-wrap gap-1 mb-2">
                  {reqTags.map((t: any) => (
                    <Badge key={t.id} style={{ backgroundColor: t.tag_color, color: "#fff" }} className="gap-1">
                      {t.tag_name}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => removeTag(t.id)} />
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input placeholder="Nova tag" value={tagName} onChange={e => setTagName(e.target.value)} className="flex-1" />
                  <input type="color" value={tagColor} onChange={e => setTagColor(e.target.value)} className="w-10 h-10 rounded" />
                  <Button size="sm" variant="outline" onClick={() => addTag.mutate()} disabled={!tagName}><Tag className="h-4 w-4" /></Button>
                </div>
              </div>

              {/* Items */}
              <div>
                <label className="text-sm font-medium mb-1 block">Itens Solicitados ({reqItems.length})</label>
                <div className="bg-muted rounded p-3">
                  <div className="grid grid-cols-[1fr_60px] gap-2 text-xs font-medium text-muted-foreground mb-1">
                    <span>Item</span><span className="text-center">Qtd</span>
                  </div>
                  {reqItems.map((item: any) => (
                    <div key={item.id} className="grid grid-cols-[1fr_60px] gap-2 text-sm py-1 border-t border-border/50">
                      <span>{item.item_name}</span>
                      <span className="text-center font-medium">{item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-sm font-medium mb-1 block flex items-center gap-1"><MessageSquare className="h-4 w-4" /> Anotações</label>
                <div className="space-y-2 mb-2 max-h-40 overflow-y-auto">
                  {reqNotes.map((n: any) => (
                    <div key={n.id} className="bg-muted p-2 rounded text-sm">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>{n.author_name}</span>
                        <span>{format(new Date(n.created_at), "dd/MM HH:mm")}</span>
                      </div>
                      <p>{n.content}</p>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Textarea placeholder="Adicionar anotação..." value={noteText} onChange={e => setNoteText(e.target.value)} rows={2} className="flex-1" />
                  <Button onClick={() => addNote.mutate()} disabled={!noteText}>Adicionar</Button>
                </div>
              </div>

              {/* Transfer */}
              <div>
                <label className="text-sm font-medium mb-1 block flex items-center gap-1"><ArrowRightLeft className="h-4 w-4" /> Transferir Responsável</label>
                <div className="flex gap-2">
                  <Select value={transferTo} onValueChange={setTransferTo}>
                    <SelectTrigger><SelectValue placeholder="Selecione membro" /></SelectTrigger>
                    <SelectContent>
                      {profiles.map((p: any) => <SelectItem key={p.user_id} value={p.user_id}>{p.full_name || p.user_id.slice(0, 8)}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Button onClick={() => transferRequest.mutate()} disabled={!transferTo}>Transferir</Button>
                </div>
              </div>

              {/* Move stage */}
              <div>
                <label className="text-sm font-medium mb-1 block">Mover para fase</label>
                <div className="flex gap-2 flex-wrap">
                  {stages.map((s: any) => (
                    <Button key={s.id} variant={detailReq.stage_id === s.id ? "default" : "outline"} size="sm"
                      onClick={() => { moveToStage.mutate({ reqId: detailReq.id, stageId: s.id }); setDetailReq(null); }}
                      style={detailReq.stage_id === s.id ? { backgroundColor: s.color } : { borderColor: s.color, color: s.color }}>
                      {s.name}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CommercialRequests;
