import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, QrCode, Smartphone, Wifi, WifiOff, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";

const CRMWhatsAppConnect = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [openNew, setOpenNew] = useState(false);
  const [instanceName, setInstanceName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showQr, setShowQr] = useState<string | null>(null);

  const { data: instances } = useQuery({
    queryKey: ["whatsapp-instances"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("whatsapp_instances")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const createInstance = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("whatsapp_instances").insert({
        instance_name: instanceName,
        phone_number: phoneNumber || null,
        status: "pending",
        created_by: user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["whatsapp-instances"] });
      setOpenNew(false);
      setInstanceName("");
      setPhoneNumber("");
      toast.success("Instância criada! Escaneie o QR Code para conectar.");
    },
    onError: () => toast.error("Erro ao criar instância"),
  });

  const deleteInstance = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("whatsapp_instances").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["whatsapp-instances"] });
      toast.success("Instância removida");
    },
    onError: () => toast.error("Erro ao remover instância"),
  });

  const reconnectInstance = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("whatsapp_instances")
        .update({ status: "pending" })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["whatsapp-instances"] });
      toast.success("Reconexão iniciada. Escaneie o QR Code novamente.");
    },
  });

  const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: typeof Wifi }> = {
    connected: { label: "Conectado", variant: "default", icon: Wifi },
    disconnected: { label: "Desconectado", variant: "destructive", icon: WifiOff },
    pending: { label: "Aguardando QR", variant: "secondary", icon: QrCode },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Smartphone className="h-6 w-6 text-green-500" />
            WhatsApp Connect
          </h2>
          <p className="text-muted-foreground">Conecte seu WhatsApp Business via QR Code para multi-atendimento</p>
        </div>
        <Dialog open={openNew} onOpenChange={setOpenNew}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> Nova Instância</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Criar Instância WhatsApp</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Nome da Instância</Label>
                <Input value={instanceName} onChange={e => setInstanceName(e.target.value)} placeholder="Ex: Atendimento Principal" />
              </div>
              <div>
                <Label>Número do WhatsApp (opcional)</Label>
                <Input value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} placeholder="Ex: +55 11 99999-9999" />
              </div>
              <Button onClick={() => createInstance.mutate()} disabled={!instanceName} className="w-full">
                Criar e Gerar QR Code
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* How it works */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Como funciona</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-primary/10 p-2 shrink-0">
                <span className="text-primary font-bold text-sm">1</span>
              </div>
              <div>
                <p className="font-medium text-sm">Crie uma instância</p>
                <p className="text-xs text-muted-foreground">Dê um nome e opcionalmente informe o número</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-primary/10 p-2 shrink-0">
                <span className="text-primary font-bold text-sm">2</span>
              </div>
              <div>
                <p className="font-medium text-sm">Escaneie o QR Code</p>
                <p className="text-xs text-muted-foreground">Abra o WhatsApp → Dispositivos Conectados → Conectar</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-primary/10 p-2 shrink-0">
                <span className="text-primary font-bold text-sm">3</span>
              </div>
              <div>
                <p className="font-medium text-sm">Pronto!</p>
                <p className="text-xs text-muted-foreground">Seus atendentes podem gerenciar mensagens no Multi-atendimento</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Instances */}
      <Card>
        <CardHeader>
          <CardTitle>Instâncias</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Número</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {instances?.map(inst => {
                const sc = statusConfig[inst.status] || statusConfig.disconnected;
                const StatusIcon = sc.icon;
                return (
                  <TableRow key={inst.id}>
                    <TableCell className="font-medium">{inst.instance_name}</TableCell>
                    <TableCell className="text-muted-foreground">{inst.phone_number || "—"}</TableCell>
                    <TableCell>
                      <Badge variant={sc.variant} className="flex items-center gap-1 w-fit">
                        <StatusIcon className="h-3 w-3" /> {sc.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(inst.created_at).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {inst.status === "pending" && (
                          <Button variant="outline" size="sm" onClick={() => setShowQr(inst.id)}>
                            <QrCode className="h-4 w-4 mr-1" /> QR Code
                          </Button>
                        )}
                        {inst.status === "disconnected" && (
                          <Button variant="outline" size="sm" onClick={() => reconnectInstance.mutate(inst.id)}>
                            <RefreshCw className="h-4 w-4 mr-1" /> Reconectar
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" className="text-destructive" onClick={() => deleteInstance.mutate(inst.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {!instances?.length && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    Nenhuma instância criada. Clique em "Nova Instância" para começar.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* QR Code Dialog */}
      <Dialog open={!!showQr} onOpenChange={() => setShowQr(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Escaneie o QR Code</DialogTitle></DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="w-64 h-64 border-2 border-dashed border-muted-foreground/30 rounded-lg flex items-center justify-center bg-muted/20">
              <div className="text-center">
                <QrCode className="h-16 w-16 mx-auto text-muted-foreground/40 mb-2" />
                <p className="text-sm text-muted-foreground">QR Code será exibido aqui</p>
                <p className="text-xs text-muted-foreground mt-1">Aguardando integração com API</p>
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium">Abra o WhatsApp no seu celular</p>
              <p className="text-xs text-muted-foreground mt-1">
                Vá em Configurações → Dispositivos Conectados → Conectar um dispositivo
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CRMWhatsAppConnect;
