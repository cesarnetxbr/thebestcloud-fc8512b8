import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export interface CsvColumn {
  key: string;
  label: string;
  required?: boolean;
}

interface CsvImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  columns: CsvColumn[];
  templateFileName: string;
  onImport: (rows: Record<string, string>[]) => Promise<{ success: number; errors: number }>;
  title?: string;
}

const parseCsvLine = (line: string): string[] => {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if ((ch === "," || ch === ";") && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
};

const CsvImportDialog = ({
  open,
  onOpenChange,
  columns,
  templateFileName,
  onImport,
  title = "Importar Contatos via CSV",
}: CsvImportDialogProps) => {
  const [preview, setPreview] = useState<Record<string, string>[]>([]);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ success: number; errors: number } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleDownloadTemplate = () => {
    const header = columns.map(c => c.label).join(",");
    const exampleRow = columns.map(c => {
      if (c.key === "email") return "exemplo@email.com";
      if (c.key === "phone") return "+5511999999999";
      if (c.key === "name") return "João Silva";
      return "";
    }).join(",");
    const csv = `${header}\n${exampleRow}\n`;
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = templateFileName;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Planilha modelo baixada!");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setResult(null);

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split(/\r?\n/).filter(l => l.trim());
      if (lines.length < 2) {
        toast.error("O arquivo precisa ter pelo menos 1 linha de dados além do cabeçalho");
        return;
      }

      const headers = parseCsvLine(lines[0]).map(h => h.toLowerCase().trim());
      const colMap: Record<number, string> = {};

      columns.forEach(col => {
        const idx = headers.findIndex(h =>
          h === col.key ||
          h === col.label.toLowerCase() ||
          h.replace(/[^a-z]/g, "") === col.key.replace(/[^a-z]/g, "")
        );
        if (idx >= 0) colMap[idx] = col.key;
      });

      const missingRequired = columns
        .filter(c => c.required)
        .filter(c => !Object.values(colMap).includes(c.key));

      if (missingRequired.length > 0) {
        toast.error(`Colunas obrigatórias não encontradas: ${missingRequired.map(c => c.label).join(", ")}`);
        return;
      }

      const rows = lines.slice(1).map(line => {
        const values = parseCsvLine(line);
        const row: Record<string, string> = {};
        Object.entries(colMap).forEach(([idx, key]) => {
          row[key] = values[Number(idx)] || "";
        });
        return row;
      }).filter(r => Object.values(r).some(v => v));

      if (rows.length === 0) {
        toast.error("Nenhuma linha válida encontrada no arquivo");
        return;
      }

      setPreview(rows);
      toast.info(`${rows.length} contatos encontrados para importação`);
    };
    reader.readAsText(file);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleImport = async () => {
    if (preview.length === 0) return;
    setImporting(true);
    try {
      const res = await onImport(preview);
      setResult(res);
      if (res.success > 0) {
        toast.success(`${res.success} contatos importados com sucesso!`);
      }
      if (res.errors > 0) {
        toast.error(`${res.errors} contatos com erro (duplicados ou inválidos)`);
      }
    } catch {
      toast.error("Erro durante a importação");
    }
    setImporting(false);
  };

  const handleClose = (o: boolean) => {
    if (!o) {
      setPreview([]);
      setResult(null);
    }
    onOpenChange(o);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Step 1: Download template */}
          <div className="p-4 rounded-lg border bg-muted/30 space-y-2">
            <p className="text-sm font-medium">1. Baixe a planilha modelo</p>
            <p className="text-xs text-muted-foreground">
              Colunas: {columns.map(c => `${c.label}${c.required ? " *" : ""}`).join(", ")}
            </p>
            <Button variant="outline" size="sm" onClick={handleDownloadTemplate}>
              <Download className="h-4 w-4 mr-2" />
              Baixar Modelo CSV
            </Button>
          </div>

          {/* Step 2: Upload file */}
          <div className="p-4 rounded-lg border bg-muted/30 space-y-2">
            <p className="text-sm font-medium">2. Selecione o arquivo preenchido</p>
            <p className="text-xs text-muted-foreground">Formatos aceitos: CSV (separador vírgula ou ponto-e-vírgula). Encoding UTF-8.</p>
            <div>
              <input
                ref={fileRef}
                type="file"
                accept=".csv,.txt"
                onChange={handleFileChange}
                className="hidden"
                id="csv-upload"
              />
              <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
                <Upload className="h-4 w-4 mr-2" />
                Selecionar Arquivo
              </Button>
            </div>
          </div>

          {/* Preview */}
          {preview.length > 0 && !result && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">3. Prévia ({preview.length} contatos)</p>
                <Button onClick={handleImport} disabled={importing} size="sm">
                  {importing ? "Importando..." : `Importar ${preview.length} contatos`}
                </Button>
              </div>
              <div className="max-h-60 overflow-auto rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">#</TableHead>
                      {columns.map(c => (
                        <TableHead key={c.key}>{c.label}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {preview.slice(0, 20).map((row, i) => (
                      <TableRow key={i}>
                        <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                        {columns.map(c => (
                          <TableCell key={c.key} className="text-sm">{row[c.key] || "—"}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                    {preview.length > 20 && (
                      <TableRow>
                        <TableCell colSpan={columns.length + 1} className="text-center text-muted-foreground text-sm">
                          ... e mais {preview.length - 20} contatos
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="p-4 rounded-lg border space-y-2">
              <p className="text-sm font-medium flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                Importação concluída
              </p>
              <div className="flex gap-4">
                <Badge variant="default" className="bg-green-100 text-green-700">{result.success} importados</Badge>
                {result.errors > 0 && (
                  <Badge variant="destructive">{result.errors} erros</Badge>
                )}
              </div>
              <Button variant="outline" size="sm" onClick={() => { setPreview([]); setResult(null); }}>
                Importar outro arquivo
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CsvImportDialog;
