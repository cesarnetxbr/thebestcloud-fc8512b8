import { useState, useEffect, useRef, useCallback } from "react";
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
import { Plus, QrCode, Smartphone, Wifi, WifiOff, RefreshCw, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

const PROJECT_ID = import.meta.env.VITE_SUPABASE_PROJECT_ID;
const FUNCTIONS_URL = `https://${PROJECT_ID}.supabase.co/functions/v1`;

async function callEvolution(action: string, instance?: string, body?: Record<string, unknown>) {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  const params = new URLSearchParams({ action });
  if (instance) params.set("instance", instance);

  const res = await fetch(`${FUNCTIONS_URL}/whatsapp-evolution?${params}`, {
    method: body ? "POST" : "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Erro na Evolution API");
  return data;
}

type SessionStatus = "INITIALIZING" | "QRCODE" | "CONNECTED" | "DISCONNECTED" | "pending";

const CRMWhatsAppConnect = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [openNew, setOpenNew] = useState(false);
  const [instanceName, setInstanceName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showQr, setShowQr] = useState<string | null>(null);
  const [qrBase64, setQrBase64] = useState<string | null>(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [sessionStatus, setSessionStatus] = useState<SessionStatus | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

  // Polling for QR + status
  const startPolling = useCallback((instName: string) => {
    if (pollingRef.current) clearInterval(pollingRef.current);

    const poll = async () => {
      try {
        const statusRes = await callEvolution("status", instName);
        const state = statusRes?.instance?.state || statusRes?.state;

        if (state === "open" || state === "connected") {
          setSessionStatus("CONNECTED");
          setQrBase64(null);
          if (pollingRef.current) clearInterval(pollingRef.current);

          await supabase
            .from("whatsapp_instances")
            .update({ status: "connected" })
            .eq("instance_name", instName);
          queryClient.invalidateQueries({ queryKey: ["whatsapp-instances"] });
          toast.success("WhatsApp conectado com sucesso!");
          return;
        }

        // Try to get QR code
        const connectRes = await callEvolution("connect", instName);
        const base64 = connectRes?.base64 || connectRes?.qrcode?.base64;
        if (base64) {
          setQrBase64(base64);
          setSessionStatus("QRCODE");
        } else {
          setSessionStatus("INITIALIZING");
        }
      } catch {
        // Silently retry
      }
    };

    poll();
    pollingRef.current = setInterval(poll, 5000);
  }, [queryClient]);

  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  const createInstance = useMutation({
    mutationFn: async () => {
      // Create on Evolution API
      await callEvolution("create", undefined, { instanceName });

      // Save to DB
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
      setPhoneNumber("");
      // Open QR dialog immediately
      setShowQr(instanceName);
      setQrLoading(true);
      setSessionStatus("INITIALIZING");
      startPolling(instanceName);
      setInstanceName("");
      toast.success("Instância criada! Escaneie o QR Code para conectar.");
    },
    onError: (err: Error) => toast.error(err.message || "Erro ao criar instância"),
  });

  const deleteInstance = useMutation({
    mutationFn: async (inst: { id: string; instance_name: string }) => {
      try {
        await callEvolution("delete", inst.instance_name);
      } catch {
        // Instance may not exist on Evolution, continue
      }
      const { error } = await supabase.from("whatsapp_instances").delete().eq("id", inst.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["whatsapp-instances"] });
      toast.success("Instância removida");
    },
    onError: () => toast.error("Erro ao remover instância"),
  });

  const handleShowQr = (instName: string) => {
    setShowQr(instName);
    setQrBase64(null);
    setQrLoading(true);
    setSessionStatus("INITIALIZING");
    startPolling(instName);
  };

  const handleCloseQr = () => {
    setShowQr(null);
    setQrBase64(null);
    setQrLoading(false);
    setSessionStatus(null);
    if (pollingRef.current) clearInterval(pollingRef.current);
  };

  const reconnectInstance = useMutation({
    mutationFn: async (inst: { id: string; instance_name: string }) => {
      const { error } = await supabase
        .from("whatsapp_instances")
        .update({ status: "pending" })
        .eq("id", inst.id);
      if (error) throw error;
      handleShowQr(inst.instance_name);
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

  const statusLabel = sessionStatus === "CONNECTED" ? "Conectado ✓" :
    sessionStatus === "QRCODE" ? "QR Code disponível" :
    sessionStatus === "INITIALIZING" ? "Inicializando..." :
    "Aguardando...";

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
                <Input value={instanceName} onChange={e => setInstanceName(e.target.value.replace(/\s/g, '-').toLowerCase())} placeholder="Ex: atendimento-principal" />
                <p className="text-xs text-muted-foreground mt-1">Sem espaços, apenas letras minúsculas e hífens</p>
              </div>
              <div>
                <Label>Número do WhatsApp (opcional)</Label>
                <Input value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} placeholder="Ex: 5511999999999" />
              </div>
              <Button onClick={() => createInstance.mutate()} disabled={!instanceName || createInstance.isPending} className="w-full">
                {createInstance.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
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
                          <Button variant="outline" size="sm" onClick={() => handleShowQr(inst.instance_name)}>
                            <QrCode className="h-4 w-4 mr-1" /> QR Code
                          </Button>
                        )}
                        {inst.status === "disconnected" && (
                          <Button variant="outline" size="sm" onClick={() => reconnectInstance.mutate({ id: inst.id, instance_name: inst.instance_name })}>
                            <RefreshCw className="h-4 w-4 mr-1" /> Reconectar
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" className="text-destructive" onClick={() => deleteInstance.mutate({ id: inst.id, instance_name: inst.instance_name })}>
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
      <Dialog open={!!showQr} onOpenChange={(open) => !open && handleCloseQr()}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Escaneie o QR Code</DialogTitle></DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            <Badge variant={sessionStatus === "CONNECTED" ? "default" : "secondary"} className="text-xs">
              {statusLabel}
            </Badge>

            <div className="w-64 h-64 border-2 border-dashed border-muted-foreground/30 rounded-lg flex items-center justify-center bg-muted/20 overflow-hidden">
              {sessionStatus === "CONNECTED" ? (
                <div className="text-center">
                  <Wifi className="h-16 w-16 mx-auto text-green-500 mb-2" />
                  <p className="text-sm font-medium text-green-600">Conectado!</p>
                </div>
              ) : qrBase64 ? (
                <img
                  src={qrBase64.startsWith("data:") ? qrBase64 : `data:image/png;base64,${qrBase64}`}
                  alt="QR Code WhatsApp"
                  className="w-full h-full object-contain p-2"
                />
              ) : (
                <div className="text-center">
                  <Loader2 className="h-10 w-10 mx-auto text-muted-foreground/40 mb-2 animate-spin" />
                  <p className="text-sm text-muted-foreground">Gerando QR Code...</p>
                  <p className="text-xs text-muted-foreground mt-1">Aguarde alguns segundos</p>
                </div>
              )}
            </div>

            {sessionStatus !== "CONNECTED" && (
              <div className="text-center">
                <p className="text-sm font-medium">Abra o WhatsApp no seu celular</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Vá em Configurações → Dispositivos Conectados → Conectar um dispositivo
                </p>
                {qrBase64 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    O QR Code atualiza automaticamente a cada 5 segundos
                  </p>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CRMWhatsAppConnect;
