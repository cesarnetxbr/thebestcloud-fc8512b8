import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, FileText, MessageSquare } from "lucide-react";
import { toast } from "sonner";

const SmsTemplates = () => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("geral");
  const queryClient = useQueryClient();

  const { data: templates, isLoading } = useQuery({
    queryKey: ["sms-templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sms_marketing_templates")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const createTemplate = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("sms_marketing_templates").insert({ name, content, category });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sms-templates"] });
      toast.success("Template criado!");
      setOpen(false);
      setName("");
      setContent("");
      setCategory("geral");
    },
    onError: () => toast.error("Erro ao criar template"),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Templates SMS</h2>
          <p className="text-muted-foreground">Crie mensagens reutilizáveis para campanhas</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> Novo Template</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Novo Template SMS</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Nome</Label><Input value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Promoção Mensal" /></div>
              <div>
                <Label>Categoria</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="geral">Geral</SelectItem>
                    <SelectItem value="promocional">Promocional</SelectItem>
                    <SelectItem value="lembrete">Lembrete</SelectItem>
                    <SelectItem value="confirmacao">Confirmação</SelectItem>
                    <SelectItem value="reengajamento">Reengajamento</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <div className="flex justify-between">
                  <Label>Mensagem</Label>
                  <span className={`text-xs ${content.length > 160 ? "text-destructive" : "text-muted-foreground"}`}>{content.length}/160</span>
                </div>
                <Textarea value={content} onChange={e => setContent(e.target.value)} rows={4} placeholder="Digite a mensagem SMS..." />
                {content.length > 160 && (
                  <p className="text-xs text-destructive mt-1">Mensagens acima de 160 caracteres serão divididas em múltiplos SMS</p>
                )}
              </div>
              <Button onClick={() => createTemplate.mutate()} disabled={!name || !content} className="w-full">Criar Template</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <p className="text-muted-foreground col-span-full text-center py-8">Carregando...</p>
        ) : !templates?.length ? (
          <Card className="col-span-full"><CardContent className="py-12 text-center text-muted-foreground">Nenhum template criado</CardContent></Card>
        ) : templates.map(t => (
          <Card key={t.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  <h4 className="font-semibold">{t.name}</h4>
                </div>
                <Badge variant={t.is_active ? "default" : "secondary"}>{t.is_active ? "Ativo" : "Inativo"}</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-2 line-clamp-3">{t.content}</p>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Categoria: {t.category}</span>
                <span className={t.char_count && t.char_count > 160 ? "text-destructive" : ""}>{t.char_count || content.length} chars</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SmsTemplates;
