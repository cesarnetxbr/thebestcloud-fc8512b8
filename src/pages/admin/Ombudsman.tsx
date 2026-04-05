import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { AlertTriangle, ThumbsUp, ThumbsDown, Lightbulb, Eye } from "lucide-react";

const reportTypes: Record<string, { label: string; icon: any; color: string }> = {
  denuncia: { label: "Denúncia", icon: AlertTriangle, color: "bg-red-500" },
  elogio: { label: "Elogio", icon: ThumbsUp, color: "bg-green-500" },
  reclamacao: { label: "Reclamação", icon: ThumbsDown, color: "bg-yellow-600" },
  sugestao: { label: "Sugestão", icon: Lightbulb, color: "bg-blue-500" },
};

const statusOptions = [
  { value: "pendente", label: "Pendente" },
  { value: "em_analise", label: "Em Análise" },
  { value: "respondido", label: "Respondido" },
  { value: "arquivado", label: "Arquivado" },
];

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pendente: { label: "Pendente", variant: "secondary" },
  em_analise: { label: "Em Análise", variant: "default" },
  respondido: { label: "Respondido", variant: "outline" },
  arquivado: { label: "Arquivado", variant: "destructive" },
};

const AdminOmbudsman = () => {
  const queryClient = useQueryClient();
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [response, setResponse] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const { data: reports = [], isLoading } = useQuery({
    queryKey: ["admin_ombudsman_reports"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ombudsman_reports")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      const updates: any = { status: newStatus };
      if (response) {
        updates.admin_response = response;
        updates.responded_at = new Date().toISOString();
      }
      const { error } = await supabase
        .from("ombudsman_reports")
        .update(updates)
        .eq("id", selectedReport.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Manifestação atualizada com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["admin_ombudsman_reports"] });
      setSelectedReport(null);
      setResponse("");
      setNewStatus("");
    },
    onError: () => toast.error("Erro ao atualizar"),
  });

  const filtered = reports.filter((r: any) => {
    if (filterType !== "all" && r.type !== filterType) return false;
    if (filterStatus !== "all" && r.status !== filterStatus) return false;
    return true;
  });

  const counts = {
    total: reports.length,
    pendente: reports.filter((r: any) => r.status === "pendente").length,
    em_analise: reports.filter((r: any) => r.status === "em_analise").length,
    respondido: reports.filter((r: any) => r.status === "respondido").length,
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Ouvidoria — Gestão</h2>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold">{counts.total}</p><p className="text-xs text-muted-foreground">Total</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-yellow-600">{counts.pendente}</p><p className="text-xs text-muted-foreground">Pendentes</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-blue-600">{counts.em_analise}</p><p className="text-xs text-muted-foreground">Em Análise</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-green-600">{counts.respondido}</p><p className="text-xs text-muted-foreground">Respondidos</p></CardContent></Card>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Tipo" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            <SelectItem value="denuncia">Denúncia</SelectItem>
            <SelectItem value="elogio">Elogio</SelectItem>
            <SelectItem value="reclamacao">Reclamação</SelectItem>
            <SelectItem value="sugestao">Sugestão</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            {statusOptions.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <p className="p-6 text-muted-foreground">Carregando...</p>
          ) : filtered.length === 0 ? (
            <p className="p-6 text-muted-foreground">Nenhuma manifestação encontrada</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-3">Protocolo</th>
                    <th className="text-left p-3">Tipo</th>
                    <th className="text-left p-3">Assunto</th>
                    <th className="text-left p-3">Status</th>
                    <th className="text-left p-3">Data</th>
                    <th className="text-left p-3">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((report: any) => {
                    const typeInfo = reportTypes[report.type];
                    const status = statusMap[report.status] || statusMap.pendente;
                    return (
                      <tr key={report.id} className="border-b hover:bg-muted/30">
                        <td className="p-3 font-mono text-xs">{report.protocol_number}</td>
                        <td className="p-3"><Badge className={typeInfo?.color + " text-white"}>{typeInfo?.label}</Badge></td>
                        <td className="p-3 max-w-[200px] truncate">{report.subject}</td>
                        <td className="p-3"><Badge variant={status.variant}>{status.label}</Badge></td>
                        <td className="p-3 text-xs">{new Date(report.created_at).toLocaleDateString("pt-BR")}</td>
                        <td className="p-3">
                          <Button size="sm" variant="outline" onClick={() => { setSelectedReport(report); setNewStatus(report.status); setResponse(report.admin_response || ""); }}>
                            <Eye className="h-4 w-4 mr-1" /> Analisar
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!selectedReport} onOpenChange={(o) => !o && setSelectedReport(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Analisar Manifestação</DialogTitle>
          </DialogHeader>
          {selectedReport && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge className={reportTypes[selectedReport.type]?.color + " text-white"}>
                  {reportTypes[selectedReport.type]?.label}
                </Badge>
                <span className="font-mono text-sm">{selectedReport.protocol_number}</span>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Assunto</p>
                <p className="font-medium">{selectedReport.subject}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Descrição</p>
                <p className="text-sm">{selectedReport.description}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Data</p>
                <p className="text-sm">{new Date(selectedReport.created_at).toLocaleString("pt-BR")}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {statusOptions.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Resposta da Ouvidoria</label>
                <Textarea value={response} onChange={(e) => setResponse(e.target.value)} rows={4} placeholder="Escreva a resposta ao solicitante..." />
              </div>
              <Button onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending} className="w-full">
                {updateMutation.isPending ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminOmbudsman;
