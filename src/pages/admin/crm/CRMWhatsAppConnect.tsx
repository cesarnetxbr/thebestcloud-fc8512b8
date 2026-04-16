import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { QrCode, Smartphone, Wifi, WifiOff, RefreshCw, Trash2, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const PROJECT_ID = import.meta.env.VITE_SUPABASE_PROJECT_ID;
const FUNCTIONS_URL = `https://${PROJECT_ID}.supabase.co/functions/v1`;

async function callZApi(action: string, body?: Record<string, unknown>) {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  const params = new URLSearchParams({ action });

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
  if (!res.ok) throw new Error(data.error || "Erro na Z-API");
  return data;
}

type ConnectionStatus = "disconnected" | "connecting" | "connected" | "error";

const CRMWhatsAppConnect = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showQr, setShowQr] = useState(false);
  const [qrBase64, setQrBase64] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("disconnected");
  const [statusMessage, setStatusMessage] = useState("");
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Check current connection status
  const { data: statusData, refetch: refetchStatus } = useQuery({
    queryKey: ["zapi-status"],
    queryFn: async () => {
      try {
        const result = await callZApi("status");
        return result;
      } catch {
        return null;
      }
    },
    refetchInterval: 30000, // check every 30s
  });

  // Update connection status from query
  useEffect(() => {
    if (statusData) {
      const connected = statusData.connected === true;
      const smartPhone = statusData.smartphoneConnected === true;
      if (connected && smartPhone) {
        setConnectionStatus("connected");
        setStatusMessage("WhatsApp conectado e funcionando");
      } else if (connected) {
        setConnectionStatus("connected");
        setStatusMessage("Conectado (verificando smartphone...)");
      } else {
        setConnectionStatus("disconnected");
        setStatusMessage("Desconectado");
      }
    }
  }, [statusData]);

  // Polling for QR + status during connection
  const startPolling = useCallback(() => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    setConnectionStatus("connecting");
    setStatusMessage("Gerando QR Code...");

    const poll = async () => {
      try {
        // Check if already connected
        const statusRes = await callZApi("status");
        const isConnected = statusRes?.connected === true;

        if (isConnected) {
          setConnectionStatus("connected");
          setStatusMessage("WhatsApp conectado com sucesso!");
          setQrBase64(null);
          if (pollingRef.current) clearInterval(pollingRef.current);

          // Update DB
          await supabase
            .from("whatsapp_instances")
            .update({ status: "connected" })
            .eq("instance_name", "zapi-principal");
          queryClient.invalidateQueries({ queryKey: ["whatsapp-instances"] });
          queryClient.invalidateQueries({ queryKey: ["zapi-status"] });
          toast.success("WhatsApp conectado com sucesso!");
          return;
        }

        // Get QR code
        const qrRes = await callZApi("qrcode");
        if (qrRes?.value) {
          // Z-API returns { value: "base64..." }
          const base64Value = qrRes.value;
          if (base64Value.startsWith("data:")) {
            setQrBase64(base64Value);
          } else {
            setQrBase64(`data:image/png;base64,${base64Value}`);
          }
          setConnectionStatus("connecting");
          setStatusMessage("QR Code disponível - escaneie com seu WhatsApp");
        } else {
          setStatusMessage("Aguardando QR Code...");
        }
      } catch (err) {
        console.error("Polling error:", err);
        setStatusMessage("Tentando gerar QR Code...");
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

  const handleConnect = () => {
    setShowQr(true);
    setQrBase64(null);
    startPolling();
  };

  const handleCloseQr = () => {
    setShowQr(false);
    setQrBase64(null);
    setConnectionStatus("disconnected");
    setStatusMessage("");
    if (pollingRef.current) clearInterval(pollingRef.current);
    refetchStatus();
  };

  const handleDisconnect = async () => {
    try {
      await callZApi("disconnect");
      setConnectionStatus("disconnected");
      setStatusMessage("Desconectado");
      await supabase
        .from("whatsapp_instances")
        .update({ status: "disconnected" })
        .eq("instance_name", "zapi-principal");
      queryClient.invalidateQueries({ queryKey: ["zapi-status"] });
      queryClient.invalidateQueries({ queryKey: ["whatsapp-instances"] });
      toast.success("WhatsApp desconectado");
    } catch (err) {
      toast.error("Erro ao desconectar");
    }
  };

  const handleRestart = async () => {
    try {
      await callZApi("restart");
      toast.success("Sessão reiniciada. Aguarde alguns segundos...");
      setTimeout(() => refetchStatus(), 5000);
    } catch {
      toast.error("Erro ao reiniciar sessão");
    }
  };

  const statusConfig = {
    connected: { label: "Conectado", variant: "default" as const, icon: Wifi, color: "text-green-500" },
    connecting: { label: "Conectando...", variant: "secondary" as const, icon: Loader2, color: "text-yellow-500" },
    disconnected: { label: "Desconectado", variant: "destructive" as const, icon: WifiOff, color: "text-red-500" },
    error: { label: "Erro", variant: "destructive" as const, icon: WifiOff, color: "text-red-500" },
  };

  const currentConfig = statusConfig[connectionStatus];
  const StatusIcon = currentConfig.icon;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Smartphone className="h-6 w-6 text-green-500" />
            WhatsApp Connect
          </h2>
          <p className="text-muted-foreground">Conecte seu WhatsApp Business via QR Code (Z-API)</p>
        </div>
      </div>

      {/* Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <StatusIcon className={`h-5 w-5 ${currentConfig.color} ${connectionStatus === "connecting" ? "animate-spin" : ""}`} />
            Status da Conexão
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <Badge variant={currentConfig.variant} className="mb-2">
                {currentConfig.label}
              </Badge>
              {statusMessage && (
                <p className="text-sm text-muted-foreground">{statusMessage}</p>
              )}
            </div>
            <div className="flex gap-2">
              {connectionStatus === "disconnected" && (
                <Button onClick={handleConnect}>
                  <QrCode className="h-4 w-4 mr-2" /> Conectar via QR Code
                </Button>
              )}
              {connectionStatus === "connected" && (
                <>
                  <Button variant="outline" size="sm" onClick={handleRestart}>
                    <RefreshCw className="h-4 w-4 mr-1" /> Reiniciar
                  </Button>
                  <Button variant="destructive" size="sm" onClick={handleDisconnect}>
                    <WifiOff className="h-4 w-4 mr-1" /> Desconectar
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

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
                <p className="font-medium text-sm">Clique em Conectar</p>
                <p className="text-xs text-muted-foreground">Um QR Code será gerado automaticamente</p>
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

      {/* Features */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recursos disponíveis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>Sessão persistente (não precisa reconectar)</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>Reconexão automática em caso de queda</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>Multi-atendimento com vários agentes</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>Envio e recebimento em tempo real</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* QR Code Dialog */}
      <Dialog open={showQr} onOpenChange={(open) => !open && handleCloseQr()}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Escaneie o QR Code</DialogTitle></DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            <Badge variant={connectionStatus === "connected" ? "default" : "secondary"} className="text-xs">
              {statusMessage || "Aguardando..."}
            </Badge>

            <div className="w-64 h-64 border-2 border-dashed border-muted-foreground/30 rounded-lg flex items-center justify-center bg-muted/20 overflow-hidden">
              {connectionStatus === "connected" ? (
                <div className="text-center">
                  <Wifi className="h-16 w-16 mx-auto text-green-500 mb-2" />
                  <p className="text-sm font-medium text-green-600">Conectado!</p>
                </div>
              ) : qrBase64 ? (
                <img
                  src={qrBase64}
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

            {connectionStatus !== "connected" && (
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
