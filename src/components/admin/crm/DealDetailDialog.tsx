import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Tag, MessageSquare, Package, X, Plus, Calendar, User } from "lucide-react";
import { format } from "date-fns";

interface DealDetailDialogProps {
  deal: any;
  stages: any[];
  onClose: () => void;
  onMoveStage: (dealId: string, stageId: string) => void;
  onUpdateStatus: (dealId: string, status: string) => void;
}

const DealDetailDialog = ({ deal, stages, onClose, onMoveStage, onUpdateStatus }: DealDetailDialogProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [noteText, setNoteText] = useState("");
  const [tagName, setTagName] = useState("");
  const [tagColor, setTagColor] = useState("#3b82f6");
  const [itemForm, setItemForm] = useState({ item_name: "", quantity: 1, unit_price: 0 });

  // Notes
  const { data: notes = [], refetch: refetchNotes } = useQuery({
    queryKey: ["crm_deal_notes", deal?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("crm_deal_notes")
        .select("*")
        .eq("deal_id", deal.id)
        .order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!deal,
  });

  // Tags
  const { data: tags = [], refetch: refetchTags } = useQuery({
    queryKey: ["crm_deal_tags", deal?.id],
    queryFn: async () => {
      const { data } = await supabase.from("crm_deal_tags").select("*").eq("deal_id", deal.id);
      return data || [];
    },
    enabled: !!deal,
  });

  // Items
  const { data: items = [], refetch: refetchItems } = useQuery({
    queryKey: ["crm_deal_items", deal?.id],
    queryFn: async () => {
      const { data } = await supabase.from("crm_deal_items").select("*").eq("deal_id", deal.id).order("created_at");
      return data || [];
    },
    enabled: !!deal,
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ["all_profiles_deal"],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("user_id, full_name");
      return data || [];
    },
  });

  const addNote = useMutation({
    mutationFn: async () => {
      const profile = profiles.find((p: any) => p.user_id === user?.id);
      const { error } = await supabase.from("crm_deal_notes").insert({
        deal_id: deal.id,
        author_id: user!.id,
        author_name: profile?.full_name || user!.email,
        content: noteText,
      });
      if (error) throw error;
    },
    onSuccess: () => { setNoteText(""); refetchNotes(); toast.success("Anotação adicionada"); },
    onError: (e: any) => toast.error(e.message),
  });

  const addTag = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("crm_deal_tags").insert({
        deal_id: deal.id, tag_name: tagName, tag_color: tagColor,
      });
      if (error) throw error;
    },
    onSuccess: () => { setTagName(""); refetchTags(); toast.success("Tag adicionada"); },
    onError: (e: any) => toast.error(e.message),
  });

  const removeTag = async (tagId: string) => {
    await supabase.from("crm_deal_tags").delete().eq("id", tagId);
    refetchTags();
  };

  const addItem = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("crm_deal_items").insert({
        deal_id: deal.id, ...itemForm,
      });
      if (error) throw error;
    },
    onSuccess: () => { setItemForm({ item_name: "", quantity: 1, unit_price: 0 }); refetchItems(); toast.success("Item adicionado"); },
    onError: (e: any) => toast.error(e.message),
  });

  const removeItem = async (itemId: string) => {
    await supabase.from("crm_deal_items").delete().eq("id", itemId);
    refetchItems();
  };

  const tagColors = ["#3b82f6", "#ef4444", "#22c55e", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4"];

  if (!deal) return null;

  return (
    <Dialog open={!!deal} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {deal.title}
            <Badge variant="outline" className="ml-2">{deal.status}</Badge>
          </DialogTitle>
        </DialogHeader>

        {/* Tags inline */}
        {tags.length > 0 && (
          <div className="flex gap-1 flex-wrap">
            {tags.map((t: any) => (
              <Badge key={t.id} style={{ backgroundColor: t.tag_color, color: "#fff" }} className="text-xs gap-1">
                {t.tag_name}
                <X className="h-3 w-3 cursor-pointer" onClick={() => removeTag(t.id)} />
              </Badge>
            ))}
          </div>
        )}

        {/* Summary */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Valor:</span>
            <p className="font-semibold">{Number(deal.value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Probabilidade:</span>
            <p className="font-semibold">{deal.probability}%</p>
          </div>
          {deal.crm_leads && (
            <div className="col-span-2">
              <span className="text-muted-foreground">Lead:</span>
              <p className="font-semibold">{deal.crm_leads.name} {deal.crm_leads.company && `• ${deal.crm_leads.company}`}</p>
            </div>
          )}
          {deal.expected_close_date && (
            <div>
              <span className="text-muted-foreground">Previsão:</span>
              <p className="font-semibold">{new Date(deal.expected_close_date).toLocaleDateString("pt-BR")}</p>
            </div>
          )}
        </div>

        {/* Move stage */}
        <div>
          <Label>Mover para etapa</Label>
          <Select
            value={deal.stage_id}
            onValueChange={(v) => onMoveStage(deal.id, v)}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {stages.map((s: any) => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="notes" className="w-full">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="notes" className="gap-1"><MessageSquare className="h-3.5 w-3.5" />Anotações</TabsTrigger>
            <TabsTrigger value="tags" className="gap-1"><Tag className="h-3.5 w-3.5" />Tags</TabsTrigger>
            <TabsTrigger value="items" className="gap-1"><Package className="h-3.5 w-3.5" />Itens</TabsTrigger>
          </TabsList>

          {/* Notes tab */}
          <TabsContent value="notes" className="space-y-3 mt-3">
            <div className="flex gap-2">
              <Textarea
                placeholder="Adicionar anotação..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                className="min-h-[60px]"
              />
              <Button size="sm" onClick={() => addNote.mutate()} disabled={!noteText.trim() || addNote.isPending}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {notes.map((n: any) => (
                <div key={n.id} className="border rounded-md p-2 text-sm">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span className="font-medium">{n.author_name}</span>
                    <span>{format(new Date(n.created_at), "dd/MM/yy HH:mm")}</span>
                  </div>
                  <p>{n.content}</p>
                </div>
              ))}
              {notes.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">Nenhuma anotação</p>}
            </div>
          </TabsContent>

          {/* Tags tab */}
          <TabsContent value="tags" className="space-y-3 mt-3">
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <Input placeholder="Nome da tag" value={tagName} onChange={(e) => setTagName(e.target.value)} />
              </div>
              <div className="flex gap-1">
                {tagColors.map(c => (
                  <button
                    key={c}
                    className={`w-6 h-6 rounded-full border-2 ${tagColor === c ? "border-foreground" : "border-transparent"}`}
                    style={{ backgroundColor: c }}
                    onClick={() => setTagColor(c)}
                  />
                ))}
              </div>
              <Button size="sm" onClick={() => addTag.mutate()} disabled={!tagName.trim()}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex gap-1 flex-wrap">
              {tags.map((t: any) => (
                <Badge key={t.id} style={{ backgroundColor: t.tag_color, color: "#fff" }} className="gap-1">
                  {t.tag_name}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => removeTag(t.id)} />
                </Badge>
              ))}
            </div>
          </TabsContent>

          {/* Items tab */}
          <TabsContent value="items" className="space-y-3 mt-3">
            <div className="flex gap-2 items-end">
              <Input placeholder="Nome do item" value={itemForm.item_name} onChange={(e) => setItemForm({ ...itemForm, item_name: e.target.value })} className="flex-1" />
              <Input type="number" placeholder="Qtd" value={itemForm.quantity} onChange={(e) => setItemForm({ ...itemForm, quantity: parseInt(e.target.value) || 1 })} className="w-20" />
              <Input type="number" placeholder="Preço" value={itemForm.unit_price} onChange={(e) => setItemForm({ ...itemForm, unit_price: parseFloat(e.target.value) || 0 })} className="w-24" />
              <Button size="sm" onClick={() => addItem.mutate()} disabled={!itemForm.item_name.trim()}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-1 max-h-[200px] overflow-y-auto">
              {items.map((it: any) => (
                <div key={it.id} className="flex items-center justify-between border rounded-md p-2 text-sm">
                  <div>
                    <span className="font-medium">{it.item_name}</span>
                    <span className="text-muted-foreground ml-2">x{it.quantity}</span>
                    {Number(it.unit_price) > 0 && (
                      <span className="text-muted-foreground ml-2">
                        @ {Number(it.unit_price).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </span>
                    )}
                  </div>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeItem(it.id)}>
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              {items.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">Nenhum item</p>}
            </div>
          </TabsContent>
        </Tabs>

        {/* Actions */}
        {deal.status === "aberto" && (
          <div className="flex gap-2">
            <Button variant="default" className="flex-1" onClick={() => onUpdateStatus(deal.id, "ganho")}>
              ✅ Marcar como Ganho
            </Button>
            <Button variant="destructive" className="flex-1" onClick={() => onUpdateStatus(deal.id, "perdido")}>
              ❌ Marcar como Perdido
            </Button>
          </div>
        )}

        {deal.notes && (
          <div>
            <span className="text-sm text-muted-foreground">Observações gerais:</span>
            <p className="text-sm">{deal.notes}</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DealDetailDialog;
