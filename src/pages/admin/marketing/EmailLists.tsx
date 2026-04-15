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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Users, Upload, Trash2 } from "lucide-react";
import { toast } from "sonner";
import CsvImportDialog, { type CsvColumn } from "@/components/admin/CsvImportDialog";

const emailCsvColumns: CsvColumn[] = [
  { key: "name", label: "Nome" },
  { key: "email", label: "E-mail", required: true },
  { key: "phone", label: "Telefone" },
];

const EmailLists = () => {
  const [open, setOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [csvOpen, setCsvOpen] = useState(false);
  const [selectedList, setSelectedList] = useState<any>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const queryClient = useQueryClient();

  const { data: lists, isLoading } = useQuery({
    queryKey: ["email-lists"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("email_marketing_lists")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: contacts } = useQuery({
    queryKey: ["email-contacts", selectedList?.id],
    enabled: !!selectedList,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("email_marketing_contacts")
        .select("*")
        .eq("list_id", selectedList.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const createList = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("email_marketing_lists").insert({ name, description });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-lists"] });
      toast.success("Lista criada!");
      setOpen(false);
      setName("");
      setDescription("");
    },
    onError: () => toast.error("Erro ao criar lista"),
  });

  const addContact = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("email_marketing_contacts").insert({
        list_id: selectedList.id,
        name: contactName,
        email: contactEmail,
        phone: contactPhone || null,
      });
      if (error) throw error;
      // Update contact count
      await supabase.from("email_marketing_lists").update({
        contact_count: (selectedList.contact_count || 0) + 1,
      }).eq("id", selectedList.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-contacts", selectedList?.id] });
      queryClient.invalidateQueries({ queryKey: ["email-lists"] });
      toast.success("Contato adicionado!");
      setContactOpen(false);
      setContactName("");
      setContactEmail("");
      setContactPhone("");
    },
    onError: () => toast.error("Erro ao adicionar contato"),
  });

  const handleCsvImport = async (rows: Record<string, string>[]) => {
    if (!selectedList) return { success: 0, errors: 0 };
    let success = 0;
    let errors = 0;
    for (const r of rows) {
      if (!r.email) { errors++; continue; }
      const { error } = await supabase.from("email_marketing_contacts").insert({
        list_id: selectedList.id,
        name: r.name || null,
        email: r.email,
        phone: r.phone || null,
      });
      if (error) errors++; else success++;
    }
    await supabase.from("email_marketing_lists").update({
      contact_count: (selectedList.contact_count || 0) + success,
    }).eq("id", selectedList.id);
    queryClient.invalidateQueries({ queryKey: ["email-contacts", selectedList.id] });
    queryClient.invalidateQueries({ queryKey: ["email-lists"] });
    return { success, errors };
  };

  const statusColor = (s: string) => {
    if (s === "active") return "default" as const;
    if (s === "unsubscribed") return "secondary" as const;
    return "destructive" as const;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Listas de Contatos</h2>
          <p className="text-muted-foreground">Gerencie suas listas e segmentos de contatos</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> Nova Lista</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nova Lista</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Nome</Label><Input value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Clientes Ativos" /></div>
              <div><Label>Descrição</Label><Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Descrição da lista" /></div>
              <Button onClick={() => createList.mutate()} disabled={!name} className="w-full">Criar Lista</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lists panel */}
        <div className="space-y-3">
          <h3 className="font-semibold text-foreground">Suas Listas</h3>
          {isLoading ? (
            <p className="text-muted-foreground text-sm">Carregando...</p>
          ) : !lists?.length ? (
            <Card><CardContent className="py-8 text-center text-muted-foreground text-sm">Nenhuma lista criada</CardContent></Card>
          ) : lists.map(l => (
            <Card
              key={l.id}
              className={`cursor-pointer transition-colors ${selectedList?.id === l.id ? "border-primary" : "hover:border-primary/50"}`}
              onClick={() => setSelectedList(l)}
            >
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{l.name}</p>
                    <p className="text-xs text-muted-foreground">{l.description || "Sem descrição"}</p>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span className="text-sm font-medium">{l.contact_count || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Contacts panel */}
        <div className="lg:col-span-2">
          {selectedList ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground">Contatos: {selectedList.name}</h3>
                <Dialog open={contactOpen} onOpenChange={setContactOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Adicionar Contato</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Adicionar Contato</DialogTitle></DialogHeader>
                    <div className="space-y-4">
                      <div><Label>Nome</Label><Input value={contactName} onChange={e => setContactName(e.target.value)} /></div>
                      <div><Label>E-mail</Label><Input type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} /></div>
                      <div><Label>Telefone (opcional)</Label><Input value={contactPhone} onChange={e => setContactPhone(e.target.value)} /></div>
                      <Button onClick={() => addContact.mutate()} disabled={!contactEmail} className="w-full">Adicionar</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>E-mail</TableHead>
                        <TableHead>Telefone</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Adicionado em</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {!contacts?.length ? (
                        <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Nenhum contato nesta lista</TableCell></TableRow>
                      ) : contacts.map(c => (
                        <TableRow key={c.id}>
                          <TableCell>{c.name || "—"}</TableCell>
                          <TableCell>{c.email}</TableCell>
                          <TableCell>{c.phone || "—"}</TableCell>
                          <TableCell><Badge variant={statusColor(c.status)}>{c.status === "active" ? "Ativo" : c.status === "unsubscribed" ? "Descadastrado" : c.status}</Badge></TableCell>
                          <TableCell>{new Date(c.created_at).toLocaleDateString("pt-BR")}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card><CardContent className="py-16 text-center text-muted-foreground">Selecione uma lista para visualizar os contatos</CardContent></Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailLists;
