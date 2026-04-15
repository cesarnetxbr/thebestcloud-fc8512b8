import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Phone, Search, Upload } from "lucide-react";
import { toast } from "sonner";
import CsvImportDialog, { type CsvColumn } from "@/components/admin/CsvImportDialog";

const smsCsvColumns: CsvColumn[] = [
  { key: "name", label: "Nome" },
  { key: "phone", label: "Telefone", required: true },
  { key: "email", label: "E-mail" },
];

const SmsContacts = () => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();

  const { data: contacts, isLoading } = useQuery({
    queryKey: ["sms-contacts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sms_marketing_contacts")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const createContact = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("sms_marketing_contacts").insert({
        name: name || null,
        phone,
        email: email || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sms-contacts"] });
      toast.success("Contato adicionado!");
      setOpen(false);
      setName("");
      setPhone("");
      setEmail("");
    },
    onError: (e: any) => {
      if (e.message?.includes("duplicate")) {
        toast.error("Este telefone já está cadastrado");
      } else {
        toast.error("Erro ao adicionar contato");
      }
    },
  });

  const filtered = contacts?.filter(c =>
    !search || 
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  const statusColor = (s: string) => {
    if (s === "active") return "default" as const;
    if (s === "opted_out") return "secondary" as const;
    return "destructive" as const;
  };

  const statusLabel = (s: string) => {
    if (s === "active") return "Ativo";
    if (s === "opted_out") return "Descadastrado";
    if (s === "blocked") return "Bloqueado";
    return s;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Contatos SMS</h2>
          <p className="text-muted-foreground">Gerencie os contatos para campanhas SMS</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> Novo Contato</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Adicionar Contato</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Nome</Label><Input value={name} onChange={e => setName(e.target.value)} placeholder="Nome do contato" /></div>
              <div><Label>Telefone *</Label><Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+5511999999999" /></div>
              <div><Label>E-mail (opcional)</Label><Input type="email" value={email} onChange={e => setEmail(e.target.value)} /></div>
              <Button onClick={() => createContact.mutate()} disabled={!phone} className="w-full">Adicionar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar contato..." className="pl-10" />
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Phone className="h-4 w-4" />
          {contacts?.length || 0} contatos
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Cadastrado em</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Carregando...</TableCell></TableRow>
              ) : !filtered?.length ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Nenhum contato encontrado</TableCell></TableRow>
              ) : filtered.map(c => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name || "—"}</TableCell>
                  <TableCell>{c.phone}</TableCell>
                  <TableCell>{c.email || "—"}</TableCell>
                  <TableCell><Badge variant={statusColor(c.status)}>{statusLabel(c.status)}</Badge></TableCell>
                  <TableCell>{new Date(c.created_at).toLocaleDateString("pt-BR")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default SmsContacts;
