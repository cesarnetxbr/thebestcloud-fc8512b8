import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, FileText, Eye, Pencil } from "lucide-react";
import { toast } from "sonner";

const EmailTemplates = () => {
  const [open, setOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewHtml, setPreviewHtml] = useState("");
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("geral");
  const [htmlContent, setHtmlContent] = useState("");
  const queryClient = useQueryClient();

  const { data: templates, isLoading } = useQuery({
    queryKey: ["email-templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("email_marketing_templates")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const createTemplate = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("email_marketing_templates").insert({
        name, subject, category,
        html_content: htmlContent || defaultTemplate(name, subject),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-templates"] });
      toast.success("Template criado!");
      setOpen(false);
      setName("");
      setSubject("");
      setCategory("geral");
      setHtmlContent("");
    },
    onError: () => toast.error("Erro ao criar template"),
  });

  const defaultTemplate = (n: string, s: string) => `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>${s}</title></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;margin:20px 0;">
<tr><td style="padding:30px;background:#1a365d;border-radius:8px 8px 0 0;text-align:center;">
<h1 style="color:#ffffff;margin:0;font-size:24px;">The Best Cloud</h1>
</td></tr>
<tr><td style="padding:30px;">
<h2 style="color:#1a365d;margin:0 0 15px;">${n}</h2>
<p style="color:#555;line-height:1.6;">Insira seu conteúdo aqui. Este é um template padrão que pode ser personalizado.</p>
<p style="text-align:center;margin:30px 0;">
<a href="#" style="background:#e87c1e;color:#fff;padding:12px 30px;border-radius:6px;text-decoration:none;font-weight:bold;">Saiba Mais</a>
</p>
</td></tr>
<tr><td style="padding:20px;background:#f9f9f9;border-radius:0 0 8px 8px;text-align:center;">
<p style="color:#999;font-size:12px;margin:0;">© 2026 The Best Cloud. Todos os direitos reservados.</p>
</td></tr>
</table></td></tr></table></body></html>`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Templates de E-mail</h2>
          <p className="text-muted-foreground">Crie e gerencie templates reutilizáveis para suas campanhas</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> Novo Template</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>Novo Template</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Nome</Label><Input value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Newsletter Mensal" /></div>
                <div><Label>Categoria</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="geral">Geral</SelectItem>
                      <SelectItem value="promocional">Promocional</SelectItem>
                      <SelectItem value="newsletter">Newsletter</SelectItem>
                      <SelectItem value="boas-vindas">Boas-vindas</SelectItem>
                      <SelectItem value="reengajamento">Reengajamento</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label>Assunto</Label><Input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Ex: Novidades da semana!" /></div>
              <div>
                <Label>HTML do E-mail (opcional — deixe vazio para usar template padrão)</Label>
                <Textarea value={htmlContent} onChange={e => setHtmlContent(e.target.value)} rows={8} placeholder="<html>...</html>" className="font-mono text-xs" />
              </div>
              <Button onClick={() => createTemplate.mutate()} disabled={!name || !subject} className="w-full">Criar Template</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Preview dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader><DialogTitle>Preview do Template</DialogTitle></DialogHeader>
          <div className="border rounded-lg overflow-auto max-h-[60vh]">
            <iframe srcDoc={previewHtml} className="w-full h-[500px] border-0" title="Email Preview" />
          </div>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <p className="text-muted-foreground col-span-full text-center py-8">Carregando...</p>
        ) : !templates?.length ? (
          <Card className="col-span-full"><CardContent className="py-12 text-center text-muted-foreground">Nenhum template criado. Crie seu primeiro template!</CardContent></Card>
        ) : templates.map(t => (
          <Card key={t.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <h4 className="font-semibold">{t.name}</h4>
                </div>
                <Badge variant={t.is_active ? "default" : "secondary"}>{t.is_active ? "Ativo" : "Inativo"}</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-1">Assunto: {t.subject}</p>
              <p className="text-xs text-muted-foreground mb-4">Categoria: {t.category}</p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => { setPreviewHtml(t.html_content || ""); setPreviewOpen(true); }}>
                  <Eye className="h-3 w-3 mr-1" /> Preview
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default EmailTemplates;
