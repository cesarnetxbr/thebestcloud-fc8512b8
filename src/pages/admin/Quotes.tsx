import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Plus, Eye, Trash2, FileText, Download, Search, X } from "lucide-react";
import logo from "@/assets/logo.png";

const QUOTE_CATEGORIES = [
  { value: "seguranca", label: "Segurança" },
  { value: "protecao", label: "Proteção" },
  { value: "operacoes", label: "Operações" },
  { value: "outros_servicos", label: "Outros Serviços" },
];

const STATUS_MAP: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  rascunho: { label: "Rascunho", variant: "secondary" },
  enviado: { label: "Enviado", variant: "default" },
  aprovado: { label: "Aprovado", variant: "outline" },
  recusado: { label: "Recusado", variant: "destructive" },
};

interface QuoteItem {
  id?: string;
  item_number: number;
  category: string;
  service_name: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  markup_info: string;
}

const emptyItem = (): QuoteItem => ({
  item_number: 1,
  category: "servico",
  service_name: "",
  description: "",
  quantity: 1,
  unit_price: 0,
  total_price: 0,
  markup_info: "",
});

const Quotes = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewQuote, setPreviewQuote] = useState<any>(null);
  const [search, setSearch] = useState("");

  // Form state
  const [customerName, setCustomerName] = useState("");
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactDept, setContactDept] = useState("");
  const [introText, setIntroText] = useState(
    "Somos provedores de serviços gerenciados de TI, trabalhamos com as melhores soluções de mercado para backup, cyber proteção, DR, File Sync & Share, monitoração e gerenciamento de ambiente de TI. Nossas equipes estão devidamente capacitadas para atendê-los na prestação de serviços básicos e de alta complexidade. Desde já, agradecemos o seu interesse em contratar os nossos serviços!"
  );
  const [paymentTerms, setPaymentTerms] = useState("Boleto bancário com vencimento em 30 dias");
  const [validityDays, setValidityDays] = useState(10);
  const [signedName, setSignedName] = useState("");
  const [signedTitle, setSignedTitle] = useState("Diretor");
  const [items, setItems] = useState<QuoteItem[]>([emptyItem()]);

  const { data: quotes = [], isLoading } = useQuery({
    queryKey: ["quotes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quotes")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: customers = [] } = useQuery({
    queryKey: ["customers-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customers")
        .select("id, name, email, phone")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const totalValue = items.reduce((sum, i) => sum + (i.total_price || 0), 0);
      const { data: quote, error } = await supabase
        .from("quotes")
        .insert({
          quote_number: "TEMP",
          customer_id: customerId,
          customer_name: customerName,
          contact_name: contactName,
          contact_email: contactEmail,
          contact_phone: contactPhone,
          contact_department: contactDept,
          introduction_text: introText,
          payment_terms: paymentTerms,
          validity_days: validityDays,
          total_value: totalValue,
          created_by: user?.id,
          signed_by_name: signedName,
          signed_by_title: signedTitle,
        } as any)
        .select()
        .single();
      if (error) throw error;

      const validItems = items.filter((i) => i.service_name.trim());
      if (validItems.length > 0) {
        const { error: itemsError } = await supabase.from("quote_items").insert(
          validItems.map((item, idx) => ({
            quote_id: quote.id,
            item_number: idx + 1,
            category: item.category,
            service_name: item.service_name,
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unit_price,
            total_price: item.total_price,
            markup_info: item.markup_info,
          })) as any
        );
        if (itemsError) throw itemsError;
      }
      return quote;
    },
    onSuccess: () => {
      toast.success("Orçamento criado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
      resetForm();
    },
    onError: (err: any) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("quotes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Orçamento excluído!");
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const resetForm = () => {
    setShowForm(false);
    setCustomerName("");
    setCustomerId(null);
    setContactName("");
    setContactEmail("");
    setContactPhone("");
    setContactDept("");
    setIntroText(
      "Somos provedores de serviços gerenciados de TI, trabalhamos com as melhores soluções de mercado para backup, cyber proteção, DR, File Sync & Share, monitoração e gerenciamento de ambiente de TI. Nossas equipes estão devidamente capacitadas para atendê-los na prestação de serviços básicos e de alta complexidade. Desde já, agradecemos o seu interesse em contratar os nossos serviços!"
    );
    setPaymentTerms("Boleto bancário com vencimento em 30 dias");
    setValidityDays(10);
    setSignedName("");
    setSignedTitle("Diretor");
    setItems([emptyItem()]);
  };

  const handleCustomerSelect = (id: string) => {
    const c = customers.find((c) => c.id === id);
    if (c) {
      setCustomerId(id);
      setCustomerName(c.name);
      setContactEmail(c.email || "");
      setContactPhone(c.phone || "");
    }
  };

  const updateItem = (idx: number, field: keyof QuoteItem, value: any) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };
      if (field === "quantity" || field === "unit_price") {
        updated[idx].total_price = updated[idx].quantity * updated[idx].unit_price;
      }
      return updated;
    });
  };

  const addItem = () => setItems((prev) => [...prev, { ...emptyItem(), item_number: prev.length + 1 }]);
  const removeItem = (idx: number) => setItems((prev) => prev.filter((_, i) => i !== idx));

  const openPreview = async (quote: any) => {
    const { data: qItems } = await supabase
      .from("quote_items")
      .select("*")
      .eq("quote_id", quote.id)
      .order("item_number");
    setPreviewQuote({ ...quote, items: qItems || [] });
    setShowPreview(true);
  };

  const filteredQuotes = quotes.filter(
    (q: any) =>
      q.quote_number?.toLowerCase().includes(search.toLowerCase()) ||
      q.customer_name?.toLowerCase().includes(search.toLowerCase())
  );

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

  if (showForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">Novo Orçamento</h2>
          <Button variant="outline" onClick={resetForm}>
            <X className="h-4 w-4 mr-2" /> Cancelar
          </Button>
        </div>

        {/* Cliente */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Dados do Cliente</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label>Selecionar Cliente Cadastrado</Label>
              <Select onValueChange={handleCustomerSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione ou preencha manualmente" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Nome do Cliente *</Label>
              <Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
            </div>
            <div>
              <Label>Contato</Label>
              <Input value={contactName} onChange={(e) => setContactName(e.target.value)} />
            </div>
            <div>
              <Label>E-mail</Label>
              <Input value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
            </div>
            <div>
              <Label>Telefone</Label>
              <Input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
            </div>
            <div>
              <Label>Departamento</Label>
              <Input value={contactDept} onChange={(e) => setContactDept(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        {/* Introdução */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Texto de Apresentação</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea rows={4} value={introText} onChange={(e) => setIntroText(e.target.value)} />
          </CardContent>
        </Card>

        {/* Itens */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Itens do Orçamento</CardTitle>
            <Button size="sm" onClick={addItem}>
              <Plus className="h-4 w-4 mr-1" /> Adicionar Item
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.map((item, idx) => (
              <div key={idx} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm">Item {idx + 1}</span>
                  {items.length > 1 && (
                    <Button variant="ghost" size="sm" onClick={() => removeItem(idx)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <Label>Categoria</Label>
                    <Select value={item.category} onValueChange={(v) => updateItem(idx, "category", v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SERVICE_CATEGORIES.map((c) => (
                          <SelectItem key={c.value} value={c.value}>
                            {c.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2">
                    <Label>Nome do Serviço *</Label>
                    <Input
                      value={item.service_name}
                      onChange={(e) => updateItem(idx, "service_name", e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label>Descrição</Label>
                  <Textarea
                    rows={2}
                    value={item.description}
                    onChange={(e) => updateItem(idx, "description", e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <Label>Quantidade</Label>
                    <Input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) => updateItem(idx, "quantity", Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label>Preço Unitário (R$)</Label>
                    <Input
                      type="number"
                      min={0}
                      step={0.01}
                      value={item.unit_price}
                      onChange={(e) => updateItem(idx, "unit_price", Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label>Total (R$)</Label>
                    <Input type="number" readOnly value={item.total_price} className="bg-muted" />
                  </div>
                  <div>
                    <Label>Info Markup</Label>
                    <Input
                      value={item.markup_info}
                      onChange={(e) => updateItem(idx, "markup_info", e.target.value)}
                      placeholder="Ex: 1.6x custo"
                    />
                  </div>
                </div>
              </div>
            ))}
            <Separator />
            <div className="flex justify-end text-lg font-bold">
              Total: {formatCurrency(items.reduce((s, i) => s + (i.total_price || 0), 0))}
            </div>
          </CardContent>
        </Card>

        {/* Condições */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Condições e Assinatura</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Forma de Pagamento</Label>
              <Input value={paymentTerms} onChange={(e) => setPaymentTerms(e.target.value)} />
            </div>
            <div>
              <Label>Validade (dias)</Label>
              <Input
                type="number"
                value={validityDays}
                onChange={(e) => setValidityDays(Number(e.target.value))}
              />
            </div>
            <div>
              <Label>Nome do Assinante</Label>
              <Input value={signedName} onChange={(e) => setSignedName(e.target.value)} />
            </div>
            <div>
              <Label>Cargo</Label>
              <Input value={signedTitle} onChange={(e) => setSignedTitle(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={resetForm}>
            Cancelar
          </Button>
          <Button onClick={() => createMutation.mutate()} disabled={!customerName.trim() || createMutation.isPending}>
            <FileText className="h-4 w-4 mr-2" />
            {createMutation.isPending ? "Salvando..." : "Criar Orçamento"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-foreground">Orçamentos</h2>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" /> Novo Orçamento
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por número ou cliente..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Valor Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : filteredQuotes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Nenhum orçamento encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredQuotes.map((q: any) => {
                  const st = STATUS_MAP[q.status] || STATUS_MAP.rascunho;
                  return (
                    <TableRow key={q.id}>
                      <TableCell className="font-mono text-sm">{q.quote_number}</TableCell>
                      <TableCell>{q.customer_name}</TableCell>
                      <TableCell>{formatCurrency(q.total_value || 0)}</TableCell>
                      <TableCell>
                        <Badge variant={st.variant}>{st.label}</Badge>
                      </TableCell>
                      <TableCell>{new Date(q.created_at).toLocaleDateString("pt-BR")}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => openPreview(q)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (confirm("Excluir este orçamento?")) deleteMutation.mutate(q.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Pré-visualização — {previewQuote?.quote_number}</span>
              <Button variant="outline" size="sm" onClick={() => window.print()}>
                <Download className="h-4 w-4 mr-1" /> Imprimir / PDF
              </Button>
            </DialogTitle>
          </DialogHeader>

          {previewQuote && (
            <div className="bg-white text-black p-8 rounded-lg space-y-6 print:p-0" id="quote-preview">
              {/* Header */}
              <div className="flex items-start justify-between border-b-4 border-[#1a365d] pb-4">
                <div>
                  <img src={logo} alt="The Best Cloud" className="h-12 mb-2" />
                  <p className="text-xs text-gray-500">Soluções em Cloud e Cybersegurança</p>
                </div>
                <div className="text-right text-sm">
                  <p className="font-bold text-[#1a365d] text-lg">{previewQuote.quote_number}</p>
                  <p>{new Date(previewQuote.created_at).toLocaleDateString("pt-BR")}</p>
                </div>
              </div>

              {/* Client info */}
              <div className="grid grid-cols-2 gap-6 text-sm">
                <div>
                  <p className="font-bold text-[#1a365d] uppercase text-xs mb-1">Criado por:</p>
                  <p className="font-semibold">The Best Cloud</p>
                  <p>Contato: {previewQuote.signed_by_name || "—"}</p>
                </div>
                <div>
                  <p className="font-bold text-[#1a365d] uppercase text-xs mb-1">Proposta para:</p>
                  <p className="font-semibold">{previewQuote.customer_name}</p>
                  {previewQuote.contact_name && <p>Contato: {previewQuote.contact_name}</p>}
                  {previewQuote.contact_department && <p>Depto: {previewQuote.contact_department}</p>}
                  {previewQuote.contact_phone && <p>Telefone: {previewQuote.contact_phone}</p>}
                  {previewQuote.contact_email && <p>E-mail: {previewQuote.contact_email}</p>}
                </div>
              </div>

              {/* Title */}
              <div className="bg-[#1a365d] text-white text-center py-3 rounded">
                <h2 className="text-xl font-bold tracking-wider">PROPOSTA COMERCIAL</h2>
              </div>

              {/* Intro */}
              <p className="text-sm leading-relaxed">{previewQuote.introduction_text}</p>

              {/* Items table */}
              {previewQuote.items?.length > 0 && (
                <div>
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-[#1a365d] text-white">
                        <th className="p-2 text-left border border-[#1a365d]">Item</th>
                        <th className="p-2 text-left border border-[#1a365d]">Serviço</th>
                        <th className="p-2 text-left border border-[#1a365d]">Categoria</th>
                        <th className="p-2 text-right border border-[#1a365d]">Qtd</th>
                        <th className="p-2 text-right border border-[#1a365d]">Vlr Unit.</th>
                        <th className="p-2 text-right border border-[#1a365d]">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {previewQuote.items.map((item: any, idx: number) => (
                        <tr key={item.id} className={idx % 2 === 0 ? "bg-gray-50" : ""}>
                          <td className="p-2 border">{item.item_number}</td>
                          <td className="p-2 border">
                            <p className="font-medium">{item.service_name}</p>
                            {item.description && (
                              <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                            )}
                          </td>
                          <td className="p-2 border">
                            {QUOTE_CATEGORIES.find((c) => c.value === item.category)?.label || item.category}
                          </td>
                          <td className="p-2 border text-right">{item.quantity}</td>
                          <td className="p-2 border text-right">{formatCurrency(item.unit_price)}</td>
                          <td className="p-2 border text-right font-medium">{formatCurrency(item.total_price)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-[#1a365d] text-white font-bold">
                        <td colSpan={5} className="p-2 text-right border border-[#1a365d]">
                          TOTAL
                        </td>
                        <td className="p-2 text-right border border-[#1a365d]">
                          {formatCurrency(previewQuote.total_value || 0)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}

              {/* Terms */}
              <div className="grid grid-cols-2 gap-6 text-sm">
                <div>
                  <p className="font-bold text-[#1a365d]">Forma de pagamento</p>
                  <p>{previewQuote.payment_terms}</p>
                </div>
                <div>
                  <p className="font-bold text-[#1a365d]">Validade da proposta</p>
                  <p>{previewQuote.validity_days} dias</p>
                </div>
              </div>

              <p className="text-xs text-gray-500 italic">
                *Os valores contidos nesta proposta comercial serão reajustados anualmente pelo IGPM a partir da data de
                contratação destes serviços.
              </p>

              {/* Signature */}
              <div className="text-center pt-8">
                <p className="text-sm">Atenciosamente,</p>
                <div className="mt-8 border-t border-black inline-block px-16 pt-2">
                  <p className="font-semibold">{previewQuote.signed_by_name || "—"}</p>
                  <p className="text-sm text-gray-500">{previewQuote.signed_by_title || "Diretor"}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Quotes;
