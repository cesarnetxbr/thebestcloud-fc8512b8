import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, Search, CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

const entityLabels: Record<string, string> = {
  customers: "Clientes",
  connections: "Conexões",
  tenants: "Tenants",
  price_tables: "Tabelas de preço",
  invoices: "Faturamento",
  skus: "SKUs",
};

const operationColors: Record<string, string> = {
  "Criação": "default",
  "Atualização": "secondary",
  "Exclusão": "destructive",
};

const AuditLogs = () => {
  const [entityFilter, setEntityFilter] = useState<string>("all");
  const [operationFilter, setOperationFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<Date | undefined>();
  const [search, setSearch] = useState("");

  const { data: logs, isLoading } = useQuery({
    queryKey: ["audit_logs", entityFilter, operationFilter, dateFilter],
    queryFn: async () => {
      let query = supabase
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);

      if (entityFilter !== "all") {
        query = query.eq("entity", entityFilter);
      }
      if (operationFilter !== "all") {
        query = query.eq("operation", operationFilter);
      }
      if (dateFilter) {
        const start = new Date(dateFilter);
        start.setHours(0, 0, 0, 0);
        const end = new Date(dateFilter);
        end.setHours(23, 59, 59, 999);
        query = query.gte("created_at", start.toISOString()).lte("created_at", end.toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const filtered = logs?.filter((log) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      log.user_email?.toLowerCase().includes(s) ||
      log.entity?.toLowerCase().includes(s) ||
      log.operation?.toLowerCase().includes(s) ||
      log.tenant_name?.toLowerCase().includes(s)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="p-3 bg-primary/10 rounded-lg">
          <ClipboardList className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Auditoria</h2>
          <p className="text-muted-foreground mt-1">
            Monitore todas as ações realizadas na plataforma, garantindo controle
            e segurança em cada passo.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select value={entityFilter} onValueChange={setEntityFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Todas as entidades" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as entidades</SelectItem>
            {Object.entries(entityLabels).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={operationFilter} onValueChange={setOperationFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Todas as operações" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as operações</SelectItem>
            <SelectItem value="Criação">Criação</SelectItem>
            <SelectItem value="Atualização">Atualização</SelectItem>
            <SelectItem value="Exclusão">Exclusão</SelectItem>
          </SelectContent>
        </Select>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[200px] justify-start text-left font-normal",
                !dateFilter && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateFilter
                ? format(dateFilter, "dd/MM/yyyy", { locale: ptBR })
                : "Selecione uma data"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={dateFilter}
              onSelect={setDateFilter}
              locale={ptBR}
            />
            {dateFilter && (
              <div className="p-2 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() => setDateFilter(undefined)}
                >
                  Limpar data
                </Button>
              </div>
            )}
          </PopoverContent>
        </Popover>

        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisa"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <p className="text-muted-foreground">Carregando...</p>
      ) : filtered && filtered.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>OPERAÇÃO</TableHead>
                  <TableHead>ENTIDADE</TableHead>
                  <TableHead>USUÁRIO</TableHead>
                  <TableHead>DATA/HORA</TableHead>
                  <TableHead>TENANT</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <Badge
                        variant={
                          (operationColors[log.operation] as any) || "default"
                        }
                      >
                        {log.operation}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {entityLabels[log.entity] || log.entity}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {log.user_email || "Sistema"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(log.created_at), "dd/MM/yyyy HH:mm:ss", {
                        locale: ptBR,
                      })}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {log.tenant_name || "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">
              Nenhum log de auditoria encontrado
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AuditLogs;
