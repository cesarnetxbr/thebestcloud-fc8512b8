import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

const LgpdConsents = () => {
  const { data: consents, isLoading } = useQuery({
    queryKey: ["lgpd-consents"],
    queryFn: async () => {
      const { data, error } = await supabase.from("lgpd_consent_records").select("*").order("created_at", { ascending: false }).limit(200);
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Registros de Consentimento</h2>
        <p className="text-muted-foreground text-sm">Log de consentimentos de cookies e dados pessoais</p>
      </div>

      <div className="border rounded-lg overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Consentiu</TableHead>
              <TableHead>Detalhes</TableHead>
              <TableHead>User Agent</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Carregando...</TableCell></TableRow>
            ) : !consents?.length ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Nenhum consentimento registrado</TableCell></TableRow>
            ) : consents.map((c: any) => (
              <TableRow key={c.id}>
                <TableCell className="text-sm">{format(new Date(c.created_at), "dd/MM/yyyy HH:mm")}</TableCell>
                <TableCell><Badge variant="outline">{c.consent_type}</Badge></TableCell>
                <TableCell>{c.granted ? <Badge className="bg-green-100 text-green-800">Sim</Badge> : <Badge variant="secondary">Não</Badge>}</TableCell>
                <TableCell className="text-xs max-w-48 truncate">{c.details ? JSON.stringify(c.details) : "—"}</TableCell>
                <TableCell className="text-xs max-w-48 truncate">{c.user_agent || "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default LgpdConsents;
