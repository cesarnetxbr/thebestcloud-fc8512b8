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
import { Plus, Eye, Trash2, FileText, Download, Search, X, Pencil, Copy, History, ArrowUp, ArrowDown } from "lucide-react";
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
  aceito: { label: "Aceito", variant: "outline" },
  assinado: { label: "Assinado", variant: "outline" },
  aprovado: { label: "Aprovado", variant: "outline" },
  recusado: { label: "Recusado", variant: "destructive" },
};

const STATUS_OPTIONS = ["rascunho", "enviado", "aceito", "assinado"];

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
  category: "outros_servicos",
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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewQuote, setPreviewQuote] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [historyQuoteId, setHistoryQuoteId] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("rascunho");

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
  const [generalNotes, setGeneralNotes] = useState("");
  const DEFAULT_POLICY_TEXT =
    "Cumprir a Política de Segurança da Informação mantendo sigilo absoluto sobre todas as informações relacionadas à proposta comercial e contratos que venham a ser realizados entre as partes e terceiros.\n\nAssumir a responsabilidade por toda e qualquer despesa com pagamento de seu pessoal, inclusive com traslados, alimentação, acomodação etc., e também por todos os danos e perdas causados a terceiros, diretamente resultantes de ação ou omissão de seus empregados ou prepostos. Por fim, agradecemos toda a confiança depositada na empresa e esperamos concretizar uma parceria de grande sucesso.";
  const [policyText, setPolicyText] = useState(DEFAULT_POLICY_TEXT);
  const [clientAcceptanceName, setClientAcceptanceName] = useState("");
  const [clientAcceptanceDocument, setClientAcceptanceDocument] = useState("");
  const [clientAcceptanceDate, setClientAcceptanceDate] = useState<string>("");
  const [clientSignatureDataUrl, setClientSignatureDataUrl] = useState<string>("");

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

  const { data: companyInfo } = useQuery({
    queryKey: ["company-settings"],
    queryFn: async () => {
      const { data } = await supabase
        .from("company_settings")
        .select("*")
        .eq("singleton", true)
        .maybeSingle();
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

  const { data: saleTableItems = [] } = useQuery({
    queryKey: ["sale-table-items"],
    queryFn: async () => {
      const { data: saleTables } = await supabase
        .from("price_tables")
        .select("id")
        .eq("type", "sale");
      if (!saleTables?.length) return [];
      const tableIds = saleTables.map((t) => t.id);
      const { data, error } = await supabase
        .from("price_table_items")
        .select("id, item_name, unit_value, category, price_table_id")
        .in("price_table_id", tableIds)
        .order("item_name");
      if (error) throw error;
      return data || [];
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
          status,
          general_notes: generalNotes,
          policy_text: policyText,
          client_acceptance_name: clientAcceptanceName,
          client_acceptance_document: clientAcceptanceDocument,
          client_acceptance_date: clientAcceptanceDate || null,
          client_signature_data_url: clientSignatureDataUrl,
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

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!editingId) throw new Error("ID do orçamento ausente");
      const totalValue = items.reduce((sum, i) => sum + (i.total_price || 0), 0);
      const { error } = await supabase
        .from("quotes")
        .update({
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
          signed_by_name: signedName,
          signed_by_title: signedTitle,
          status,
          general_notes: generalNotes,
          policy_text: policyText,
          client_acceptance_name: clientAcceptanceName,
          client_acceptance_document: clientAcceptanceDocument,
          client_acceptance_date: clientAcceptanceDate || null,
          client_signature_data_url: clientSignatureDataUrl,
        } as any)
        .eq("id", editingId);
      if (error) throw error;

      // Substitui os itens (preserva o orçamento, recria itens conforme edição)
      const { error: delError } = await supabase.from("quote_items").delete().eq("quote_id", editingId);
      if (delError) throw delError;

      const validItems = items.filter((i) => i.service_name.trim());
      if (validItems.length > 0) {
        const { error: itemsError } = await supabase.from("quote_items").insert(
          validItems.map((item, idx) => ({
            quote_id: editingId,
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
    },
    onSuccess: () => {
      toast.success("Orçamento atualizado com sucesso!");
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

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, newStatus }: { id: string; newStatus: string }) => {
      const { error } = await supabase.from("quotes").update({ status: newStatus } as any).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Status atualizado!");
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const duplicateMutation = useMutation({
    mutationFn: async (quote: any) => {
      const { data: srcItems } = await supabase
        .from("quote_items")
        .select("*")
        .eq("quote_id", quote.id)
        .order("item_number");

      // Próxima versão: máxima existente em parent_quote_id = root + 1
      const rootId = quote.parent_quote_id || quote.id;
      const { data: siblings } = await supabase
        .from("quotes")
        .select("version")
        .or(`id.eq.${rootId},parent_quote_id.eq.${rootId}`);
      const nextVersion = Math.max(...(siblings?.map((s: any) => s.version || 1) || [1])) + 1;

      const { data: newQuote, error } = await supabase
        .from("quotes")
        .insert({
          quote_number: "TEMP",
          customer_id: quote.customer_id,
          customer_name: quote.customer_name,
          contact_name: quote.contact_name,
          contact_email: quote.contact_email,
          contact_phone: quote.contact_phone,
          contact_department: quote.contact_department,
          introduction_text: quote.introduction_text,
          payment_terms: quote.payment_terms,
          validity_days: quote.validity_days,
          total_value: quote.total_value,
          signed_by_name: quote.signed_by_name,
          signed_by_title: quote.signed_by_title,
          status: "rascunho",
          parent_quote_id: rootId,
          version: nextVersion,
          created_by: user?.id,
          general_notes: quote.general_notes,
          policy_text: quote.policy_text,
          // Aceite e assinatura NÃO são duplicados (são do cliente)
          client_acceptance_name: null,
          client_acceptance_document: null,
          client_acceptance_date: null,
          client_signature_data_url: null,
        } as any)
        .select()
        .single();
      if (error) throw error;

      if (srcItems && srcItems.length > 0) {
        await supabase.from("quote_items").insert(
          srcItems.map((it: any, idx: number) => ({
            quote_id: newQuote.id,
            item_number: idx + 1,
            category: it.category,
            service_name: it.service_name,
            description: it.description,
            quantity: it.quantity,
            unit_price: it.unit_price,
            total_price: it.total_price,
            markup_info: it.markup_info,
          })) as any
        );
      }
      return newQuote;
    },
    onSuccess: () => {
      toast.success("Orçamento duplicado! Nova versão criada como Rascunho.");
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const { data: auditLog = [] } = useQuery({
    queryKey: ["quote-audit", historyQuoteId],
    enabled: !!historyQuoteId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quote_audit_log" as any)
        .select("*")
        .eq("quote_id", historyQuoteId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
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
    setStatus("rascunho");
    setGeneralNotes("");
    setPolicyText(DEFAULT_POLICY_TEXT);
    setClientAcceptanceName("");
    setClientAcceptanceDocument("");
    setClientAcceptanceDate("");
    setClientSignatureDataUrl("");
  };

  const openEdit = async (quote: any) => {
    const { data: qItems, error } = await supabase
      .from("quote_items")
      .select("*")
      .eq("quote_id", quote.id)
      .order("item_number");
    if (error) {
      toast.error("Erro ao carregar itens do orçamento");
      return;
    }
    setEditingId(quote.id);
    setCustomerId(quote.customer_id || null);
    setCustomerName(quote.customer_name || "");
    setContactName(quote.contact_name || "");
    setContactEmail(quote.contact_email || "");
    setContactPhone(quote.contact_phone || "");
    setContactDept(quote.contact_department || "");
    setIntroText(quote.introduction_text || "");
    setPaymentTerms(quote.payment_terms || "");
    setValidityDays(quote.validity_days || 10);
    setSignedName(quote.signed_by_name || "");
    setSignedTitle(quote.signed_by_title || "Diretor");
    setStatus(quote.status || "rascunho");
    setGeneralNotes(quote.general_notes || "");
    setPolicyText(quote.policy_text || DEFAULT_POLICY_TEXT);
    setClientAcceptanceName(quote.client_acceptance_name || "");
    setClientAcceptanceDocument(quote.client_acceptance_document || "");
    setClientAcceptanceDate(quote.client_acceptance_date || "");
    setClientSignatureDataUrl(quote.client_signature_data_url || "");
    setItems(
      qItems && qItems.length > 0
        ? qItems.map((it: any, idx: number) => ({
            id: it.id,
            item_number: it.item_number || idx + 1,
            category: it.category || "outros_servicos",
            service_name: it.service_name || "",
            description: it.description || "",
            quantity: Number(it.quantity) || 1,
            unit_price: Number(it.unit_price) || 0,
            total_price: Number(it.total_price) || 0,
            markup_info: it.markup_info || "",
          }))
        : [emptyItem()]
    );
    setShowForm(true);
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

  const moveItem = (idx: number, direction: -1 | 1) => {
    setItems((prev) => {
      const newIdx = idx + direction;
      if (newIdx < 0 || newIdx >= prev.length) return prev;
      const updated = [...prev];
      [updated[idx], updated[newIdx]] = [updated[newIdx], updated[idx]];
      return updated.map((it, i) => ({ ...it, item_number: i + 1 }));
    });
  };

  const openPreview = async (quote: any) => {
    const { data: qItems } = await supabase
      .from("quote_items")
      .select("*")
      .eq("quote_id", quote.id)
      .order("item_number");
    setPreviewQuote({ ...quote, items: qItems || [] });
    setShowPreview(true);
  };

  // Impressão multi-página confiável em Chrome e Firefox:
  // clona o conteúdo do preview para um contêiner fora do Dialog do Radix,
  // eliminando os limites de altura/overflow que truncavam para 1 página.
  const handlePrintQuote = () => {
    const source = document.getElementById("quote-preview");
    if (!source) {
      window.print();
      return;
    }
    const PRINT_ID = "tbc-print-root";
    document.getElementById(PRINT_ID)?.remove();
    const container = document.createElement("div");
    container.id = PRINT_ID;
    container.innerHTML = source.outerHTML;
    document.body.appendChild(container);
    document.body.classList.add("printing-quote");

    const cleanup = () => {
      document.body.classList.remove("printing-quote");
      document.getElementById(PRINT_ID)?.remove();
      window.removeEventListener("afterprint", cleanup);
    };
    window.addEventListener("afterprint", cleanup);

    setTimeout(() => {
      window.print();
      setTimeout(cleanup, 1000);
    }, 80);
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
          <h2 className="text-2xl font-bold text-foreground">{editingId ? "Editar Orçamento" : "Novo Orçamento"}</h2>
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
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" onClick={() => moveItem(idx, -1)} disabled={idx === 0} title="Mover para cima">
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => moveItem(idx, 1)} disabled={idx === items.length - 1} title="Mover para baixo">
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    {items.length > 1 && (
                      <Button variant="ghost" size="sm" onClick={() => removeItem(idx)} title="Remover">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <Label>Categoria</Label>
                    <Select value={item.category} onValueChange={(v) => {
                      updateItem(idx, "category", v);
                      updateItem(idx, "service_name", "");
                      updateItem(idx, "unit_price", 0);
                      updateItem(idx, "total_price", 0);
                    }}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {QUOTE_CATEGORIES.map((c) => (
                          <SelectItem key={c.value} value={c.value}>
                            {c.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2">
                    <Label>Nome do Serviço * <span className="text-xs text-muted-foreground font-normal">(digite livre ou selecione da lista)</span></Label>
                    <Input
                      list={`sale-items-${idx}`}
                      value={item.service_name}
                      onChange={(e) => {
                        const v = e.target.value;
                        const saleItem = saleTableItems.find((s) => s.item_name === v);
                        updateItem(idx, "service_name", v);
                        if (saleItem) {
                          updateItem(idx, "unit_price", saleItem.unit_value || 0);
                          updateItem(idx, "total_price", (saleItem.unit_value || 0) * item.quantity);
                        }
                      }}
                      placeholder="Nome do serviço (item avulso permitido)"
                    />
                    <datalist id={`sale-items-${idx}`}>
                      {saleTableItems
                        .filter((s) => !item.category || s.category === item.category || item.category === "outros_servicos")
                        .filter((s, i, arr) => arr.findIndex((x) => x.item_name === s.item_name) === i)
                        .map((s) => (
                          <option key={s.id} value={s.item_name} />
                        ))}
                    </datalist>
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
            <div>
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>{STATUS_MAP[s].label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Observações Gerais e Política */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Observações Gerais e Termos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Observações Gerais (exibidas no final da proposta)</Label>
              <Textarea rows={4} value={generalNotes} onChange={(e) => setGeneralNotes(e.target.value)} placeholder="Informações adicionais, condições específicas, escopo complementar..." />
            </div>
            <div>
              <Label>Termos de Confidencialidade e Responsabilidade</Label>
              <Textarea rows={6} value={policyText} onChange={(e) => setPolicyText(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        {/* Aceite do Cliente */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Aceite do Cliente</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Nome do responsável pelo aceite</Label>
              <Input value={clientAcceptanceName} onChange={(e) => setClientAcceptanceName(e.target.value)} />
            </div>
            <div>
              <Label>CPF/Documento</Label>
              <Input value={clientAcceptanceDocument} onChange={(e) => setClientAcceptanceDocument(e.target.value)} />
            </div>
            <div>
              <Label>Data do aceite</Label>
              <Input type="date" value={clientAcceptanceDate} onChange={(e) => setClientAcceptanceDate(e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <Label>Assinatura manuscrita (imagem PNG/JPG, até 2MB)</Label>
              <Input
                type="file"
                accept="image/png,image/jpeg"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  if (file.size > 2 * 1024 * 1024) {
                    toast.error("Imagem deve ter no máximo 2MB");
                    return;
                  }
                  const reader = new FileReader();
                  reader.onload = () => setClientSignatureDataUrl(String(reader.result || ""));
                  reader.readAsDataURL(file);
                }}
              />
              {clientSignatureDataUrl && (
                <div className="mt-2 flex items-center gap-3">
                  <img src={clientSignatureDataUrl} alt="Assinatura" className="h-20 border rounded bg-white p-1" />
                  <Button variant="ghost" size="sm" onClick={() => setClientSignatureDataUrl("")}>
                    <X className="h-4 w-4 mr-1" /> Remover
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={resetForm}>
            Cancelar
          </Button>
          <Button
            onClick={() => (editingId ? updateMutation.mutate() : createMutation.mutate())}
            disabled={!customerName.trim() || createMutation.isPending || updateMutation.isPending}
          >
            <FileText className="h-4 w-4 mr-2" />
            {editingId
              ? updateMutation.isPending
                ? "Salvando..."
                : "Salvar Alterações"
              : createMutation.isPending
                ? "Salvando..."
                : "Criar Orçamento"}
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
                      <TableCell className="font-mono text-sm">
                        {q.quote_number}
                        {(q.version > 1 || q.parent_quote_id) && (
                          <Badge variant="outline" className="ml-2 text-xs">v{q.version}</Badge>
                        )}
                      </TableCell>
                      <TableCell>{q.customer_name}</TableCell>
                      <TableCell>{formatCurrency(q.total_value || 0)}</TableCell>
                      <TableCell>
                        <Select
                          value={q.status}
                          onValueChange={(v) => updateStatusMutation.mutate({ id: q.id, newStatus: v })}
                        >
                          <SelectTrigger className="h-8 w-[130px]">
                            <SelectValue>
                              <Badge variant={st.variant}>{st.label}</Badge>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {STATUS_OPTIONS.map((s) => (
                              <SelectItem key={s} value={s}>{STATUS_MAP[s].label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>{new Date(q.created_at).toLocaleDateString("pt-BR")}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => openPreview(q)} title="Pré-visualizar">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => openEdit(q)} title="Editar">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => duplicateMutation.mutate(q)} title="Duplicar (nova versão)" disabled={duplicateMutation.isPending}>
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setHistoryQuoteId(q.id)} title="Histórico de alterações">
                            <History className="h-4 w-4" />
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
              <Button variant="outline" size="sm" onClick={handlePrintQuote}>
                <Download className="h-4 w-4 mr-1" /> Imprimir / PDF
              </Button>
            </DialogTitle>
          </DialogHeader>

          {previewQuote && (
            <div className="bg-white text-black p-8 rounded-lg space-y-6 print:p-0" id="quote-preview">
              {/* Header */}
              <div className="flex items-start justify-between border-b-4 border-[#1a365d] pb-4">
                <div>
                  <img src={logo} alt={companyInfo?.nome_fantasia || "The Best Cloud"} className="h-24 w-auto mb-2 object-contain" style={{ imageRendering: "auto" }} />
                  <p className="text-xs text-gray-500">{companyInfo?.slogan || "Soluções em Cloud e Cybersegurança"}</p>
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
                  <p className="font-semibold">{companyInfo?.nome_fantasia || "The Best Cloud"}</p>
                  <p>Contato: {previewQuote.signed_by_name || companyInfo?.signed_by_name || "—"}</p>
                  <div className="mt-2 space-y-0.5">
                    <p>Nome fantasia: {companyInfo?.nome_fantasia || "The Best Cloud"}</p>
                    {companyInfo?.razao_social && <p>Razão social: {companyInfo.razao_social}</p>}
                    <p>CNPJ: {companyInfo?.cnpj || "—"}</p>
                    <p>E-mail: {companyInfo?.email || "—"}</p>
                    {(companyInfo?.endereco || companyInfo?.cidade) && (
                      <p>
                        {[companyInfo?.endereco, companyInfo?.numero, companyInfo?.complemento].filter(Boolean).join(", ")}
                        {companyInfo?.bairro ? ` — ${companyInfo.bairro}` : ""}
                      </p>
                    )}
                    {(companyInfo?.cidade || companyInfo?.estado || companyInfo?.cep) && (
                      <p>
                        {[companyInfo?.cidade, companyInfo?.estado].filter(Boolean).join("/")}
                        {companyInfo?.cep ? ` — CEP ${companyInfo.cep}` : ""}
                      </p>
                    )}
                    {companyInfo?.phone && <p>Telefone: {companyInfo.phone}</p>}
                    {companyInfo?.website && <p>Site: {companyInfo.website}</p>}
                  </div>
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

      {/* Histórico de Alterações */}
      <Dialog open={!!historyQuoteId} onOpenChange={(o) => !o && setHistoryQuoteId(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Histórico de Alterações</DialogTitle>
          </DialogHeader>
          {auditLog.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">Nenhum registro de alteração ainda.</p>
          ) : (
            <div className="space-y-2">
              {auditLog.map((log: any) => (
                <div key={log.id} className="border rounded-md p-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{log.action}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(log.created_at).toLocaleString("pt-BR")}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Por: {log.user_email || "Sistema"}
                  </p>
                  {log.changes && (
                    <pre className="text-xs bg-muted/50 rounded p-2 mt-2 overflow-x-auto">
                      {JSON.stringify(log.changes, null, 2)}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Quotes;
