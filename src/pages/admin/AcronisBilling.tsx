import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import * as XLSX from "xlsx";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Upload } from "lucide-react";

type Row = { tenant: string; sku: string; name: string; qty: number; unit: number; total: number };
const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const num = (v: unknown) => typeof v === "number" ? v : parseFloat(String(v ?? "").replace(/\./g, "").replace(",", ".")) || 0;
const key = (t: string, s: string) => `${t.trim().toUpperCase()}|${s}`;

export default function AcronisBilling() {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [report, setReport] = useState<Row[] | null>(null);

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["acronis-billing", month],
    queryFn: async () => {
      const start = `${month}-01`;
      const d = new Date(start + "T00:00:00"); d.setMonth(d.getMonth() + 1);
      const end = d.toISOString().slice(0, 10);
      const { data, error } = await supabase.from("tenant_usage")
        .select("tenant_id, sku_code, sku_name, quantity, unit_cost, total_cost, usage_date, tenants(name)")
        .gte("usage_date", start).lt("usage_date", end).order("usage_date", { ascending: false });
      if (error) throw error;
      // Usa a leitura mais recente do mês para cada cliente + serviço
      const seen = new Map<string, Row>();
      for (const r of data ?? []) {
        const tenant = (r as any).tenants?.name ?? "—";
        const k = key(tenant, r.sku_code);
        if (!seen.has(k)) seen.set(k, { tenant, sku: r.sku_code, name: r.sku_name ?? r.sku_code, qty: Number(r.quantity) || 0, unit: Number(r.unit_cost) || 0, total: Number(r.total_cost) || 0 });
      }
      return [...seen.values()].sort((a, b) => a.tenant.localeCompare(b.tenant) || a.sku.localeCompare(b.sku));
    },
  });

  const handleFile = async (f: File) => {
    const wb = XLSX.read(await f.arrayBuffer());
    const ws = wb.Sheets["Clientes"];
    if (!ws) return setReport([]);
    const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws);
    setReport(json.filter((r) => r["SKU"]).map((r) => ({
      tenant: String(r["Cliente"] ?? ""), sku: String(r["SKU"]), name: String(r["Produto"] ?? ""),
      qty: num(r["Quantidade"]), unit: num(r["Custo das unidades"]), total: num(r["Custo total"]),
    })));
  };

  const totals = useMemo(() => {
    const byTenant = new Map<string, number>();
    rows.forEach((r) => byTenant.set(r.tenant, (byTenant.get(r.tenant) ?? 0) + r.total));
    return { byTenant, total: rows.reduce((s, r) => s + r.total, 0) };
  }, [rows]);

  const comparison = useMemo(() => {
    if (!report) return [];
    const mine = new Map(rows.map((r) => [key(r.tenant, r.sku), r]));
    const keys = new Set([...report.map((r) => key(r.tenant, r.sku)), ...mine.keys()]);
    const rep = new Map(report.map((r) => [key(r.tenant, r.sku), r]));
    return [...keys].sort().map((k) => ({ k, a: rep.get(k), p: mine.get(k) }));
  }, [report, rows]);
  const reportTotal = report?.reduce((s, r) => s + r.total, 0) ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Cobrança Acronis</h1>
          <p className="text-muted-foreground text-sm">Consumo trazido automaticamente da Acronis (leitura mais recente do mês).</p>
        </div>
        <div className="flex gap-3 items-end">
          <div><label className="text-xs text-muted-foreground">Mês</label>
            <Input type="month" value={month} onChange={(e) => setMonth(e.target.value)} /></div>
          <label className="inline-flex items-center gap-2 cursor-pointer rounded-md border px-3 h-10 text-sm hover:bg-muted">
            <Upload className="h-4 w-4" /> Comparar com relatório (.xlsx)
            <input type="file" accept=".xlsx" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
          </label>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Custo total do mês</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold text-primary">{brl(totals.total)}</CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Clientes com consumo</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold">{totals.byTenant.size}</CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Relatório Acronis</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold">{report ? brl(reportTotal) : "—"}</CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Consumo por cliente</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? <Loader2 className="animate-spin" /> : rows.length === 0 ? <p className="text-muted-foreground text-sm">Sem consumo registrado neste mês.</p> : (
            <Table>
              <TableHeader><TableRow><TableHead>Cliente</TableHead><TableHead>SKU</TableHead><TableHead>Serviço</TableHead>
                <TableHead className="text-right">Quantidade</TableHead><TableHead className="text-right">Custo unit.</TableHead><TableHead className="text-right">Custo total</TableHead></TableRow></TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={key(r.tenant, r.sku)}>
                    <TableCell className="font-medium">{r.tenant}</TableCell><TableCell>{r.sku}</TableCell><TableCell className="max-w-xs truncate">{r.name}</TableCell>
                    <TableCell className="text-right">{r.qty.toLocaleString("pt-BR")}</TableCell><TableCell className="text-right">{brl(r.unit)}</TableCell><TableCell className="text-right">{brl(r.total)}</TableCell>
                  </TableRow>))}
                {[...totals.byTenant].map(([t, v]) => (
                  <TableRow key={t} className="bg-muted/50"><TableCell colSpan={5} className="font-semibold">Total {t}</TableCell><TableCell className="text-right font-semibold">{brl(v)}</TableCell></TableRow>))}
              </TableBody>
            </Table>)}
        </CardContent>
      </Card>

      {report && (
        <Card>
          <CardHeader><CardTitle>Comparação com o relatório da Acronis</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Cliente</TableHead><TableHead>SKU</TableHead>
                <TableHead className="text-right">Qtd. relatório</TableHead><TableHead className="text-right">Qtd. plataforma</TableHead>
                <TableHead className="text-right">Custo relatório</TableHead><TableHead className="text-right">Custo plataforma</TableHead><TableHead>Situação</TableHead></TableRow></TableHeader>
              <TableBody>
                {comparison.map(({ k, a, p }) => {
                  const diff = (p?.total ?? 0) - (a?.total ?? 0);
                  const ok = Math.abs(diff) < 0.05;
                  return (
                    <TableRow key={k}>
                      <TableCell>{a?.tenant ?? p?.tenant}</TableCell><TableCell>{a?.sku ?? p?.sku}</TableCell>
                      <TableCell className="text-right">{a ? a.qty.toLocaleString("pt-BR") : "—"}</TableCell>
                      <TableCell className="text-right">{p ? p.qty.toLocaleString("pt-BR") : "—"}</TableCell>
                      <TableCell className="text-right">{a ? brl(a.total) : "—"}</TableCell>
                      <TableCell className="text-right">{p ? brl(p.total) : "—"}</TableCell>
                      <TableCell>{!a ? <Badge variant="secondary">Só na plataforma</Badge> : !p ? <Badge variant="destructive">Só no relatório</Badge>
                        : ok ? <Badge>Confere</Badge> : <Badge variant="outline">Diferença {brl(diff)}</Badge>}</TableCell>
                    </TableRow>);
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>)}
    </div>
  );
}
