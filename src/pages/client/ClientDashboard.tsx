import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Headphones, Package, AlertCircle, ShoppingCart, MessageSquare, DollarSign, ClipboardList } from "lucide-react";

const contactReasons = [
  {
    icon: ShoppingCart,
    title: "Contratar um Serviço",
    description: "Solicite a contratação de novos produtos e serviços de proteção digital.",
    color: "text-green-600",
    bgColor: "bg-green-50 hover:bg-green-100 dark:bg-green-950/30 dark:hover:bg-green-950/50",
    route: "/portal/servicos",
  },
  {
    icon: DollarSign,
    title: "Conhecer Valores",
    description: "Consulte preços e condições dos nossos planos e serviços.",
    color: "text-blue-600",
    bgColor: "bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/30 dark:hover:bg-blue-950/50",
    route: "/portal/servicos",
  },
  {
    icon: MessageSquare,
    title: "Saber Mais sobre um Produto",
    description: "Tire dúvidas técnicas sobre nossos produtos e soluções.",
    color: "text-purple-600",
    bgColor: "bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/30 dark:hover:bg-purple-950/50",
    route: "/portal/chamados",
    ticketCategory: "Dúvida Técnica",
  },
  {
    icon: AlertCircle,
    title: "Fazer uma Reclamação",
    description: "Registre uma reclamação para que nossa equipe possa resolver.",
    color: "text-red-600",
    bgColor: "bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-950/50",
    route: "/portal/ouvidoria",
    ticketCategory: "Reclamação",
  },
  {
    icon: ClipboardList,
    title: "Solicitação Administrativa",
    description: "Alterações cadastrais, notas fiscais, contratos e outros assuntos administrativos.",
    color: "text-orange-600",
    bgColor: "bg-orange-50 hover:bg-orange-100 dark:bg-orange-950/30 dark:hover:bg-orange-950/50",
    route: "/portal/chamados",
    ticketCategory: "Administrativo",
  },
];

const ClientDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: tickets = [] } = useQuery({
    queryKey: ["client_tickets", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tickets")
        .select("*")
        .eq("created_by", user!.id)
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const openTickets = tickets.filter((t: any) => t.status !== "fechado" && t.status !== "resolvido").length;

  const handleReasonClick = (reason: typeof contactReasons[0]) => {
    navigate(reason.route);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Bem-vindo ao Portal</h2>

      {/* Contact Reason Cards */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-3">Como podemos ajudar?</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {contactReasons.map((reason) => (
            <Card
              key={reason.title}
              className={`cursor-pointer transition-all border ${reason.bgColor}`}
              onClick={() => handleReasonClick(reason)}
            >
              <CardContent className="p-4 flex items-start gap-3">
                <reason.icon className={`h-6 w-6 mt-0.5 shrink-0 ${reason.color}`} />
                <div>
                  <p className="font-medium text-sm">{reason.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{reason.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Chamados Abertos</CardTitle>
            <Headphones className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{openTickets}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Faturas</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">—</div>
            <p className="text-xs text-muted-foreground">Em breve</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Serviços Ativos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">—</div>
            <p className="text-xs text-muted-foreground">Em breve</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Tickets */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Últimos Chamados</CardTitle>
        </CardHeader>
        <CardContent>
          {tickets.length === 0 ? (
            <div className="flex items-center gap-2 text-muted-foreground py-4">
              <AlertCircle className="h-4 w-4" />
              <span>Nenhum chamado encontrado</span>
            </div>
          ) : (
            <div className="space-y-3">
              {tickets.map((t: any) => (
                <div key={t.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <div>
                    <p className="font-medium text-sm">{t.subject}</p>
                    <p className="text-xs text-muted-foreground">{t.ticket_number}</p>
                  </div>
                  <Badge variant={t.status === "aberto" ? "default" : "secondary"}>{t.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientDashboard;
