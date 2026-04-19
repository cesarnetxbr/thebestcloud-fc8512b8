import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  FileText,
  Download,
  BookOpen,
  Network,
  GitBranch,
  Database,
  Shield,
  Code2,
  Cloud,
  Workflow,
  Layers,
  Lock,
} from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import mermaid from "mermaid";
import {
  DOC_META,
  EXECUTIVE_SECTIONS,
  TECHNICAL_SECTIONS,
  MINDMAP_DEFINITION,
  FLOWCHART_DEFINITION,
  ARCHITECTURE_DEFINITION,
  buildMarkdown,
} from "@/data/documentation";

mermaid.initialize({
  startOnLoad: false,
  theme: "default",
  securityLevel: "loose",
  themeVariables: {
    primaryColor: "#FF6A00",
    primaryTextColor: "#0A2540",
    primaryBorderColor: "#0A2540",
    lineColor: "#0A2540",
    secondaryColor: "#E6F0FF",
    tertiaryColor: "#FFF4E6",
  },
});

type DiagramKey = "mindmap" | "flowchart" | "architecture";

const DIAGRAMS: Record<DiagramKey, { title: string; definition: string; description: string }> = {
  mindmap: {
    title: "Mapa Mental do Sistema",
    description: "Visão geral hierárquica de todos os módulos da plataforma.",
    definition: MINDMAP_DEFINITION,
  },
  flowchart: {
    title: "Fluxograma de Processos",
    description: "Fluxo principal: Cliente → CRM → Cotação → Fatura → Pagamento.",
    definition: FLOWCHART_DEFINITION,
  },
  architecture: {
    title: "Arquitetura Técnica",
    description: "Camadas de frontend, backend (Lovable Cloud) e integrações externas.",
    definition: ARCHITECTURE_DEFINITION,
  },
};

const DocumentationPage = () => {
  const [activeDiagram, setActiveDiagram] = useState<DiagramKey>("mindmap");
  const [renderedSvgs, setRenderedSvgs] = useState<Record<DiagramKey, string>>({
    mindmap: "",
    flowchart: "",
    architecture: "",
  });
  const diagramRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    const renderAll = async () => {
      const entries = Object.entries(DIAGRAMS) as [DiagramKey, typeof DIAGRAMS[DiagramKey]][];
      const results: Partial<Record<DiagramKey, string>> = {};
      for (const [key, diagram] of entries) {
        try {
          const { svg } = await mermaid.render(`diagram-${key}-${Date.now()}`, diagram.definition);
          results[key] = svg;
        } catch (err) {
          console.error(`Error rendering ${key}:`, err);
          results[key] = `<p style="color:red">Erro ao renderizar diagrama: ${(err as Error).message}</p>`;
        }
      }
      if (!cancelled) setRenderedSvgs(results as Record<DiagramKey, string>);
    };
    renderAll();
    return () => {
      cancelled = true;
    };
  }, []);

  const downloadFile = (content: string, filename: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadMarkdown = (variant: "executive" | "technical") => {
    const md = buildMarkdown(variant);
    const filename =
      variant === "executive"
        ? "TheBestCloud-Documentacao-Executiva.md"
        : "TheBestCloud-Documentacao-Tecnica.md";
    downloadFile(md, filename, "text/markdown;charset=utf-8");
    toast.success("Markdown gerado com sucesso");
  };

  const downloadDiagramSvg = (key: DiagramKey) => {
    const svg = renderedSvgs[key];
    if (!svg) {
      toast.error("Diagrama ainda não foi renderizado");
      return;
    }
    downloadFile(svg, `TheBestCloud-${key}.svg`, "image/svg+xml;charset=utf-8");
    toast.success("Diagrama exportado");
  };

  const downloadPdf = async (variant: "executive" | "technical") => {
    toast.info("Gerando PDF... isso pode levar alguns segundos");
    try {
      const sections = variant === "executive" ? EXECUTIVE_SECTIONS : TECHNICAL_SECTIONS;
      const pdf = new jsPDF({ unit: "pt", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 48;
      const lineHeight = 14;
      let y = margin;

      // Cover
      pdf.setFillColor(10, 37, 64);
      pdf.rect(0, 0, pageWidth, pageHeight, "F");
      pdf.setTextColor(255, 255, 255);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(28);
      pdf.text(DOC_META.product, margin, 200);
      pdf.setFontSize(18);
      pdf.text(
        variant === "executive" ? "Documentação Executiva" : "Documentação Técnica Completa",
        margin,
        232
      );
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(11);
      pdf.text(`Versão ${DOC_META.version} • ${new Date().toLocaleDateString("pt-BR")}`, margin, 260);
      pdf.text(DOC_META.company, margin, 280);
      pdf.setFontSize(10);
      pdf.setTextColor(255, 180, 100);
      pdf.text("Plataforma de Cloud, Backup e Segurança", margin, 310);

      pdf.addPage();
      pdf.setTextColor(10, 37, 64);
      y = margin;

      const writeText = (text: string, options: { size?: number; bold?: boolean; color?: [number, number, number] } = {}) => {
        const { size = 10, bold = false, color = [40, 40, 40] } = options;
        pdf.setFont("helvetica", bold ? "bold" : "normal");
        pdf.setFontSize(size);
        pdf.setTextColor(...color);
        const wrapped = pdf.splitTextToSize(text, pageWidth - margin * 2);
        wrapped.forEach((line: string) => {
          if (y + lineHeight > pageHeight - margin) {
            pdf.addPage();
            y = margin;
          }
          pdf.text(line, margin, y);
          y += size === 10 ? lineHeight : size + 4;
        });
      };

      sections.forEach((section, idx) => {
        if (y > margin + 20) y += 12;
        writeText(`${idx + 1}. ${section.title}`, { size: 16, bold: true, color: [10, 37, 64] });
        y += 6;
        section.blocks.forEach((block) => {
          if (block.type === "heading") {
            y += 6;
            writeText(block.text, { size: 13, bold: true, color: [255, 106, 0] });
            y += 2;
          } else if (block.type === "paragraph") {
            writeText(block.text, { size: 10 });
            y += 4;
          } else if (block.type === "list") {
            block.items.forEach((item) => writeText(`• ${item}`, { size: 10 }));
            y += 4;
          } else if (block.type === "code") {
            pdf.setFillColor(245, 245, 250);
            const lines = block.text.split("\n");
            const blockHeight = lines.length * 11 + 12;
            if (y + blockHeight > pageHeight - margin) {
              pdf.addPage();
              y = margin;
            }
            pdf.rect(margin, y - 4, pageWidth - margin * 2, blockHeight, "F");
            pdf.setFont("courier", "normal");
            pdf.setFontSize(9);
            pdf.setTextColor(40, 40, 80);
            lines.forEach((line) => {
              pdf.text(line, margin + 6, y + 8);
              y += 11;
            });
            y += 8;
          }
        });
      });

      // Footer with page numbers
      const total = pdf.getNumberOfPages();
      for (let i = 1; i <= total; i++) {
        pdf.setPage(i);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(8);
        pdf.setTextColor(120, 120, 120);
        pdf.text(`${DOC_META.product} • ${DOC_META.version}`, margin, pageHeight - 20);
        pdf.text(`Página ${i} de ${total}`, pageWidth - margin - 80, pageHeight - 20);
      }

      const filename =
        variant === "executive"
          ? "TheBestCloud-Documentacao-Executiva.pdf"
          : "TheBestCloud-Documentacao-Tecnica.pdf";
      pdf.save(filename);
      toast.success("PDF gerado com sucesso");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao gerar PDF: " + (err as Error).message);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-primary" />
            Documentação Técnica
          </h1>
          <p className="text-muted-foreground mt-1">
            Documentação completa do sistema, fluxos, mapa mental e arquitetura — pronta para download.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Badge variant="outline" className="gap-1">
            <Code2 className="h-3 w-3" /> v{DOC_META.version}
          </Badge>
          <Badge variant="outline" className="gap-1">
            <Lock className="h-3 w-3" /> Acesso restrito
          </Badge>
        </div>
      </div>

      {/* Download grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5 text-primary" />
              Versão Executiva
            </CardTitle>
            <CardDescription>
              Visão de negócio, módulos principais, stack e fluxos críticos. ~10-15 páginas.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-2 flex-wrap">
            <Button onClick={() => downloadPdf("executive")} className="gap-2">
              <Download className="h-4 w-4" /> PDF
            </Button>
            <Button variant="outline" onClick={() => downloadMarkdown("executive")} className="gap-2">
              <Download className="h-4 w-4" /> Markdown
            </Button>
          </CardContent>
        </Card>

        <Card className="border-accent/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Layers className="h-5 w-5 text-accent" />
              Versão Técnica Completa
            </CardTitle>
            <CardDescription>
              Arquitetura, banco, edge functions, integrações, segurança, guia de expansão. ~30-50 páginas.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-2 flex-wrap">
            <Button onClick={() => downloadPdf("technical")} className="gap-2">
              <Download className="h-4 w-4" /> PDF
            </Button>
            <Button variant="outline" onClick={() => downloadMarkdown("technical")} className="gap-2">
              <Download className="h-4 w-4" /> Markdown
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Diagrams */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="h-5 w-5 text-primary" />
            Mapa Mental, Fluxograma e Arquitetura
          </CardTitle>
          <CardDescription>
            Diagramas interativos renderizados via Mermaid. Exporte como SVG para apresentações ou docs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeDiagram} onValueChange={(v) => setActiveDiagram(v as DiagramKey)}>
            <TabsList className="grid grid-cols-3 max-w-md">
              <TabsTrigger value="mindmap" className="gap-1">
                <Network className="h-4 w-4" /> Mapa Mental
              </TabsTrigger>
              <TabsTrigger value="flowchart" className="gap-1">
                <Workflow className="h-4 w-4" /> Fluxograma
              </TabsTrigger>
              <TabsTrigger value="architecture" className="gap-1">
                <GitBranch className="h-4 w-4" /> Arquitetura
              </TabsTrigger>
            </TabsList>
            {(Object.keys(DIAGRAMS) as DiagramKey[]).map((key) => (
              <TabsContent key={key} value={key} className="mt-4">
                <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                  <div>
                    <h3 className="font-semibold">{DIAGRAMS[key].title}</h3>
                    <p className="text-sm text-muted-foreground">{DIAGRAMS[key].description}</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => downloadDiagramSvg(key)} className="gap-1">
                    <Download className="h-4 w-4" /> Baixar SVG
                  </Button>
                </div>
                <div
                  ref={key === activeDiagram ? diagramRef : null}
                  className="border rounded-lg p-4 bg-white overflow-auto min-h-[300px] flex justify-center"
                  dangerouslySetInnerHTML={{ __html: renderedSvgs[key] || "<p>Carregando diagrama...</p>" }}
                />
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Quick reference cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <InfoCard icon={<Cloud />} title="Stack Principal" items={["React 18 + Vite", "TypeScript 5", "Tailwind v3 + shadcn/ui", "Lovable Cloud (Supabase)", "Edge Functions Deno"]} />
        <InfoCard icon={<Database />} title="Backend" items={["PostgreSQL com RLS", "Auth com roles em tabela", "pg_cron para sincronização", "Service Role em Edge Functions", "Realtime via channels"]} />
        <InfoCard icon={<Shield />} title="Segurança" items={["RLS em todas tabelas", "Roles separadas (user_roles)", "LGPD compliance ativo", "Auditoria de operações", "Secrets isolados em Cloud"]} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Boas Práticas Adotadas</CardTitle>
          <CardDescription>Padrões seguidos para garantir código escalável e pronto para produção.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <PracticeRow title="Modularidade" text="Cada módulo é independente: CRM, Marketing, Financeiro, LGPD, Chat. Permite expansão sem quebrar outros." />
          <Separator />
          <PracticeRow title="Design System" text="Tokens semânticos em index.css e tailwind.config.ts. Nunca usar cores hardcoded em componentes." />
          <Separator />
          <PracticeRow title="Segurança em Camadas" text="RLS no banco + verificação de roles + edge functions com Service Role para operações sensíveis." />
          <Separator />
          <PracticeRow title="Auditoria Completa" text="Triggers automáticos em tickets, profiles, user_roles e user_permissions registram todas operações." />
          <Separator />
          <PracticeRow title="Integrações Resilientes" text="Edge Functions tratam erros e fazem retry. Webhooks idempotentes via external_message_id." />
        </CardContent>
      </Card>
    </div>
  );
};

const InfoCard = ({ icon, title, items }: { icon: React.ReactNode; title: string; items: string[] }) => (
  <Card>
    <CardHeader className="pb-3">
      <CardTitle className="text-base flex items-center gap-2">
        <span className="text-primary [&>svg]:h-5 [&>svg]:w-5">{icon}</span>
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent>
      <ul className="text-sm space-y-1 text-muted-foreground">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2">
            <span className="text-primary">•</span>
            {item}
          </li>
        ))}
      </ul>
    </CardContent>
  </Card>
);

const PracticeRow = ({ title, text }: { title: string; text: string }) => (
  <div>
    <h4 className="font-semibold text-foreground">{title}</h4>
    <p className="text-muted-foreground">{text}</p>
  </div>
);

export default DocumentationPage;
