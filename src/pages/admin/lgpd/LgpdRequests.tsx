import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const typeLabels: Record<string, string> = {
  access: "Acesso", correction: "Correção", deletion: "Exclusão",
  portability: "Portabilidade", revoke_consent: "Revogação", information: "Informação",
};

const statusColors: Record<string, string> = {
  pendente: "bg-yellow-100 text-yellow-800",
  em_andamento: "bg-blue-100 text-blue-800",
  concluido: "bg-green-100 text-green-800",
  recusado: "bg-red-100 text-red-800",
};

const LgpdRequests = () => {
  const qc = useQueryClient();
  const { user } = useAuth();
  const [selected, setSelected] = useState<any>(null);
  const [response, setResponse] = useState("");
  const [status, setStatus] = useState("concluido");

  const { data: requests, isLoading } = useQuery({
    queryKey: ["lgpd-requests"],
    queryFn: async () => {
      const { data, error } = await supabase.from("lgpd_data_requests").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const respond = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("lgpd_data_requests").update({
        status,
        admin_response: response,
        responded_by: user?.id,
        responded_at: new Date().toISOString(),
      }).eq("id", selected.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["lgpd-requests"] });
      setSelected(null);
      setResponse("");
      toast({ title: "Resposta registrada" });
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Solicitações de Titulares</h2>
        <p className="text-muted-foreground text-sm">Gerenciar pedidos de acesso, correção e exclusão de dados</p>
      </div>

      <div className="border rounded-lg overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Protocolo</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Data</TableHead>
              <TableHead className="w-20"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Carregando...</TableCell></TableRow>
            ) : !requests?.length ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Nenhuma solicitação</TableCell></TableRow>
            ) : requests.map((r: any) => (
              <TableRow key={r.id}>
                <TableCell className="font-mono text-sm">{r.protocol_number}</TableCell>
                <TableCell>{r.requester_name}</TableCell>
                <TableCell><Badge variant="outline">{typeLabels[r.request_type] || r.request_type}</Badge></TableCell>
                <TableCell><Badge className={statusColors[r.status] || ""}>{r.status}</Badge></TableCell>
                <TableCell className="text-sm">{format(new Date(r.created_at), "dd/MM/yyyy")}</TableCell>
                <TableCell><Button size="sm" variant="outline" onClick={() => { setSelected(r); setResponse(r.admin_response || ""); setStatus(r.status); }}>Ver</Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Solicitação {selected?.protocol_number}</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><strong>Nome:</strong> {selected.requester_name}</div>
                <div><strong>E-mail:</strong> {selected.requester_email}</div>
                <div><strong>Documento:</strong> {selected.requester_document || "—"}</div>
                <div><strong>Tipo:</strong> {typeLabels[selected.request_type]}</div>
              </div>
              {selected.description && <p className="text-sm bg-secondary p-3 rounded">{selected.description}</p>}
              <div>
                <label className="text-sm font-medium">Status</label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="em_andamento">Em andamento</SelectItem>
                    <SelectItem value="concluido">Concluído</SelectItem>
                    <SelectItem value="recusado">Recusado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Resposta ao titular</label>
                <Textarea value={response} onChange={e => setResponse(e.target.value)} rows={3} />
              </div>
              <Button onClick={() => respond.mutate()} disabled={respond.isPending} className="w-full">
                {respond.isPending ? "Salvando..." : "Salvar Resposta"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LgpdRequests;
