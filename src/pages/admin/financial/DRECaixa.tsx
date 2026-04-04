import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const formatCurrency = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

interface DRELine {
  label: string;
  value: number;
  bold?: boolean;
  indent?: boolean;
}

const DRECaixa = () => {
  const [lines, setLines] = useState<DRELine[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: txns } = await supabase.from("financial_transactions").select("type, amount, status, financial_categories(name, type)");
      const { data: comms } = await supabase.from("financial_commissions").select("amount, status");

      const receitas = (txns || []).filter(t => t.type === "receita").reduce((s, t) => s + Number(t.amount), 0);
      const receitasPagas = (txns || []).filter(t => t.type === "receita" && t.status === "pago").reduce((s, t) => s + Number(t.amount), 0);
      const despesas = (txns || []).filter(t => t.type === "despesa").reduce((s, t) => s + Number(t.amount), 0);
      const despesasPagas = (txns || []).filter(t => t.type === "despesa" && t.status === "pago").reduce((s, t) => s + Number(t.amount), 0);
      const comissoes = (comms || []).reduce((s, c) => s + Number(c.amount), 0);
      const comissoesPagas = (comms || []).filter(c => c.status === "pago").reduce((s, c) => s + Number(c.amount), 0);

      // Group despesas by category
      const catMap: Record<string, number> = {};
      (txns || []).filter(t => t.type === "despesa").forEach((t: any) => {
        const name = t.financial_categories?.name || "Outras despesas";
        catMap[name] = (catMap[name] || 0) + Number(t.amount);
      });

      const dreLines: DRELine[] = [
        { label: "(+) Receita Bruta", value: receitas, bold: true },
        { label: "(-) Deduções sobre receita", value: 0, indent: true },
        { label: "(=) Receita Líquida", value: receitas, bold: true },
        { label: "", value: 0 },
        { label: "(-) Despesas Operacionais", value: despesas, bold: true },
        ...Object.entries(catMap).map(([name, value]) => ({ label: `    ${name}`, value, indent: true })),
        { label: "", value: 0 },
        { label: "(-) Comissões", value: comissoes },
        { label: "", value: 0 },
        { label: "(=) Resultado Operacional (EBITDA)", value: receitas - despesas - comissoes, bold: true },
        { label: "", value: 0 },
        { label: "(=) Resultado Líquido", value: receitas - despesas - comissoes, bold: true },
      ];

      setLines(dreLines);

      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) return <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">Demonstrativo de Resultado do Exercício e Fluxo de Caixa.</p>

      <Card>
        <CardHeader><CardTitle>DRE - Demonstrativo de Resultados</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Conta</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lines.map((line, i) => (
                <TableRow key={i} className={line.label === "" ? "h-4" : ""}>
                  <TableCell className={`${line.bold ? "font-bold" : ""} ${line.indent ? "pl-8 text-muted-foreground" : ""}`}>
                    {line.label}
                  </TableCell>
                  <TableCell className={`text-right ${line.bold ? "font-bold" : ""} ${line.value < 0 ? "text-red-600" : ""}`}>
                    {line.label ? formatCurrency(line.value) : ""}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default DRECaixa;
