import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Plus, ShoppingCart, Package } from "lucide-react";
import { format } from "date-fns";

const ClientServices = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ product: "", quantity: "1", notes: "" });

  // Buscar itens da tabela de venda padrão (is_default ou "tabela 100%")
  const { data: saleItems = [] } = useQuery({
    queryKey: ["default_sale_items"],
    queryFn: async () => {
      // Buscar tabela de venda padrão
      const { data: tables } = await supabase
        .from("price_tables")
        .select("id")
        .eq("type", "sale")
        .eq("is_default", true)
        .limit(1);
      
      const tableId = tables?.[0]?.id;
      if (!tableId) return [];

      const { data, error } = await supabase
        .from("price_table_items")
        .select("id, item_name, sku_code, unit_value")
        .eq("price_table_id", tableId)
        .order("item_name");
      if (error) throw error;
      return data || [];
    },
  });

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ["client_commercial_requests", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("commercial_requests")
        .select("*, commercial_request_items(*)")
        .eq("created_by", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const createRequest = useMutation({
    mutationFn: async () => {
      const reqNumber = `SOL-${Date.now().toString(36).toUpperCase()}`;
      const { data: req, error: reqErr } = await supabase
        .from("commercial_requests")
        .insert({
          request_number: reqNumber,
          customer_name: user?.user_metadata?.full_name || user?.email || "Cliente",
          created_by: user!.id,
          status: "aberto",
          priority: "normal",
          notes: form.notes || null,
        })
        .select()
        .single();
      if (reqErr) throw reqErr;

      const { error: itemErr } = await supabase.from("commercial_request_items").insert({
        request_id: req.id,
        item_name: form.product,
        quantity: parseInt(form.quantity) || 1,
      });
      if (itemErr) throw itemErr;
      return req;
    },
    onSuccess: () => {
      toast({ title: "Solicitação enviada com sucesso!" });
      queryClient.invalidateQueries({ queryKey: ["client_commercial_requests"] });
      setDialogOpen(false);
      setForm({ product: "", quantity: "1", notes: "" });
    },
    onError: (err: any) => {
      toast({ title: "Erro ao enviar solicitação", description: err.message, variant: "destructive" });
    },
  });

  const statusLabels: Record<string, string> = {
    aberto: "Enviada",
    em_andamento: "Em Análise",
    fechado: "Concluída",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Solicitar Produtos & Serviços</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> Nova Solicitação</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Solicitação de Serviço</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Produto / Serviço</label>
                <Input
                  placeholder="Ex: Backup Cloud 500GB"
                  value={form.product}
                  onChange={(e) => setForm({ ...form, product: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Quantidade</label>
                <Input
                  type="number"
                  min="1"
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Observações</label>
                <Textarea
                  placeholder="Detalhes adicionais sobre a solicitação..."
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </div>
              <Button
                className="w-full"
                onClick={() => createRequest.mutate()}
                disabled={!form.product || createRequest.isPending}
              >
                {createRequest.isPending ? "Enviando..." : "Enviar Solicitação"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : requests.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12 text-muted-foreground">
            <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">Nenhuma solicitação</p>
            <p className="text-sm">Solicite novos produtos e serviços clicando no botão acima.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {requests.map((r: any) => (
            <Card key={r.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Package className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">{r.request_number}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(r.created_at), "dd/MM/yyyy HH:mm")}
                      </p>
                    </div>
                  </div>
                  <Badge variant={r.status === "aberto" ? "default" : "secondary"}>
                    {statusLabels[r.status] || r.status}
                  </Badge>
                </div>
                {r.commercial_request_items?.length > 0 && (
                  <div className="mt-2 ml-8 text-sm text-muted-foreground">
                    {r.commercial_request_items.map((item: any) => (
                      <span key={item.id}>{item.item_name} (x{item.quantity})</span>
                    ))}
                  </div>
                )}
                {r.notes && <p className="mt-1 ml-8 text-sm text-muted-foreground italic">{r.notes}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClientServices;
