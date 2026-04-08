import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { AlertTriangle, ThumbsUp, ThumbsDown, Lightbulb, Search, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const reportTypes = [
  { value: "denuncia", label: "Denúncia", icon: AlertTriangle, color: "bg-red-500", description: "Comunique um ato ilícito ou irregular" },
  { value: "elogio", label: "Elogio", icon: ThumbsUp, color: "bg-green-500", description: "Expresse sua satisfação com nosso atendimento" },
  { value: "reclamacao", label: "Reclamação", icon: ThumbsDown, color: "bg-yellow-600", description: "Manifeste sua insatisfação com um serviço" },
  { value: "sugestao", label: "Sugestão", icon: Lightbulb, color: "bg-blue-500", description: "Sugira melhorias para nossos serviços" },
];

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pendente: { label: "Pendente", variant: "secondary" },
  em_analise: { label: "Em Análise", variant: "default" },
  respondido: { label: "Respondido", variant: "outline" },
  arquivado: { label: "Arquivado", variant: "destructive" },
};

const PublicOmbudsman = () => {
  const [open, setOpen] = useState(false);
  const [selectedType, setSelectedType] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [requesterName, setRequesterName] = useState("");
  const [requesterEmail, setRequesterEmail] = useState("");
  const [searchProtocol, setSearchProtocol] = useState("");
  const [foundReport, setFoundReport] = useState<any>(null);
  const [searching, setSearching] = useState(false);

  const createMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("ombudsman_reports").insert({
        type: selectedType,
        subject,
        description,
        created_by: "00000000-0000-0000-0000-000000000000",
        protocol_number: "temp",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Manifestação registrada com sucesso! Guarde o protocolo para acompanhamento.");
      setOpen(false);
      setSelectedType("");
      setSubject("");
      setDescription("");
      setRequesterName("");
      setRequesterEmail("");
    },
    onError: () => toast.error("Erro ao registrar manifestação"),
  });

  const handleSearch = async () => {
    if (!searchProtocol.trim()) return;
    setSearching(true);
    setFoundReport(null);
    const { data, error } = await supabase
      .from("ombudsman_reports")
      .select("*")
      .ilike("protocol_number", `%${searchProtocol.trim()}%`)
      .limit(1)
      .maybeSingle();
    setSearching(false);
    if (error || !data) {
      toast.error("Protocolo não encontrado");
      return;
    }
    setFoundReport(data);
  };

  const handleTypeSelect = (type: string) => {
    setSelectedType(type);
    setOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">
        <div className="flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Ouvidoria</h1>
            <p className="text-muted-foreground">Selecione o tipo de manifestação que deseja registrar</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {reportTypes.map((type) => {
            const Icon = type.icon;
            return (
              <Card key={type.value} className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-primary/50" onClick={() => handleTypeSelect(type.value)}>
                <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                  <div className={`${type.color} p-4 rounded-full`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-bold text-lg uppercase">{type.label}</h3>
                  <p className="text-sm text-muted-foreground">{type.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Search className="h-5 w-5" />
              Consultar Protocolo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Digite o número do protocolo (ex: OUV-2026-00001)"
                value={searchProtocol}
                onChange={(e) => setSearchProtocol(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <Button onClick={handleSearch} disabled={searching}>
                {searching ? "Buscando..." : "Buscar"}
              </Button>
            </div>
            {foundReport && (
              <div className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge className={reportTypes.find(t => t.value === foundReport.type)?.color + " text-white"}>
                      {reportTypes.find(t => t.value === foundReport.type)?.label}
                    </Badge>
                    <span className="text-sm font-mono text-muted-foreground">{foundReport.protocol_number}</span>
                  </div>
                  <Badge variant={statusMap[foundReport.status]?.variant || "secondary"}>
                    {statusMap[foundReport.status]?.label || foundReport.status}
                  </Badge>
                </div>
                <p className="font-medium">{foundReport.subject}</p>
                <p className="text-sm text-muted-foreground">{foundReport.description}</p>
                {foundReport.admin_response && (
                  <div className="bg-muted p-3 rounded-md mt-2">
                    <p className="text-xs font-semibold text-muted-foreground mb-1">Resposta da Ouvidoria:</p>
                    <p className="text-sm">{foundReport.admin_response}</p>
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  {new Date(foundReport.created_at).toLocaleDateString("pt-BR")}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Nova {reportTypes.find(t => t.value === selectedType)?.label}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Seu Nome</label>
                <Input value={requesterName} onChange={(e) => setRequesterName(e.target.value)} placeholder="Nome completo" />
              </div>
              <div>
                <label className="text-sm font-medium">Seu E-mail</label>
                <Input type="email" value={requesterEmail} onChange={(e) => setRequesterEmail(e.target.value)} placeholder="email@exemplo.com" />
              </div>
              <div>
                <label className="text-sm font-medium">Assunto</label>
                <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Descreva brevemente" />
              </div>
              <div>
                <label className="text-sm font-medium">Descrição detalhada</label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={5} placeholder="Forneça todos os detalhes relevantes..." />
              </div>
              <Button
                onClick={() => createMutation.mutate()}
                disabled={!subject || !description || !requesterName || !requesterEmail || createMutation.isPending}
                className="w-full"
              >
                {createMutation.isPending ? "Enviando..." : "Enviar Manifestação"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default PublicOmbudsman;
