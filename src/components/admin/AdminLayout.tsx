import { useState, useEffect, useCallback } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";
import {
  LayoutDashboard,
  Users,
  Package,
  FileText,
  Gift,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  ChevronDown,
  Tag,
  ShoppingCart,
  Link2,
  Globe,
  ClipboardList,
  BarChart3,
  Shield,
  Database,
  AlertTriangle,
  PieChart,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Zap,
  FolderOpen,
  Briefcase,
  Headphones,
  Kanban,
  Target,
  UserPlus,
  Mail,
  Send,
  MessageSquare,
  Phone,
  Activity,
  CalendarDays,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRolePermissions } from "@/hooks/useRolePermissions";

interface NavItem {
  label: string;
  icon: any;
  path: string;
  indent?: boolean;
  module?: string;
}

interface NavSection {
  title?: string;
  module?: string;
  items: NavItem[];
  expandable?: {
    label: string;
    icon: any;
    module?: string;
    items: NavItem[];
  };
}

const navSections: NavSection[] = [
  {
    items: [
      { label: "Dashboard", icon: LayoutDashboard, path: "/admin", module: "dashboard" },
      { label: "Usuários", icon: Users, path: "/admin/users", module: "usuarios" },
    ],
  },
  {
    title: "CADASTROS",
    items: [
      { label: "Clientes", icon: Users, path: "/admin/customers", module: "clientes" },
      { label: "Clientes Trial", icon: Gift, path: "/admin/trial-clients", module: "trial_clients" },
    ],
  },
  {
    title: "CRM",
    items: [],
    expandable: {
      label: "Pipeline & Vendas",
      icon: Target,
      module: "comercial",
      items: [
        { label: "Dashboard CRM", icon: BarChart3, path: "/admin/crm", module: "comercial" },
        { label: "Pipeline", icon: Kanban, path: "/admin/crm/pipeline", module: "comercial" },
        { label: "Leads", icon: UserPlus, path: "/admin/crm/leads", module: "comercial" },
        { label: "Agenda", icon: CalendarDays, path: "/admin/crm/agenda", module: "comercial" },
        { label: "Solicitações", icon: ClipboardList, path: "/admin/crm/requests", module: "comercial" },
        { label: "Orçamentos", icon: FileText, path: "/admin/crm/quotes", module: "comercial" },
      ],
    },
  },
  {
    items: [],
    expandable: {
      label: "Chat & Atendimento",
      icon: Phone,
      module: "chat",
      items: [
        { label: "Multi-atendimento", icon: MessageSquare, path: "/admin/crm/chat", module: "chat" },
        { label: "WhatsApp Connect", icon: Phone, path: "/admin/crm/whatsapp-connect", module: "chat" },
        { label: "Chatbot & IA", icon: Zap, path: "/admin/crm/chatbot", module: "chat" },
        { label: "Config. Chat", icon: Settings, path: "/admin/crm/chat/settings", module: "chat" },
      ],
    },
  },
  {
    title: "MARKETING",
    items: [],
    expandable: {
      label: "Visão Geral",
      icon: TrendingUp,
      module: "analytics",
      items: [
        { label: "Dashboard Marketing", icon: BarChart3, path: "/admin/crm/marketing", module: "analytics" },
        { label: "Analytics & Tracking", icon: Activity, path: "/admin/analytics", module: "analytics" },
      ],
    },
  },
  {
    items: [],
    expandable: {
      label: "E-mail Marketing",
      icon: Mail,
      module: "marketing_email",
      items: [
        { label: "Dashboard E-mail", icon: BarChart3, path: "/admin/marketing", module: "marketing_email" },
        { label: "Campanhas E-mail", icon: Send, path: "/admin/marketing/campaigns", module: "marketing_email" },
        { label: "Listas", icon: Users, path: "/admin/marketing/lists", module: "marketing_email" },
        { label: "Templates E-mail", icon: FileText, path: "/admin/marketing/templates", module: "marketing_email" },
      ],
    },
  },
  {
    items: [],
    expandable: {
      label: "SMS Marketing",
      icon: MessageSquare,
      module: "marketing_sms",
      items: [
        { label: "Dashboard SMS", icon: BarChart3, path: "/admin/sms", module: "marketing_sms" },
        { label: "Campanhas SMS", icon: Send, path: "/admin/sms/campaigns", module: "marketing_sms" },
        { label: "Contatos SMS", icon: Phone, path: "/admin/sms/contacts", module: "marketing_sms" },
        { label: "Templates SMS", icon: FileText, path: "/admin/sms/templates", module: "marketing_sms" },
      ],
    },
  },
  {
    title: "SUPORTE",
    items: [
      { label: "Chamados", icon: Headphones, path: "/admin/tickets", module: "chamados" },
      { label: "Agenda Técnica", icon: CalendarDays, path: "/admin/support-schedule", module: "agenda_tecnica" },
      { label: "Ouvidoria", icon: ClipboardList, path: "/admin/ouvidoria", module: "ouvidoria" },
    ],
  },
  {
    title: "FINANCEIRO",
    items: [],
    expandable: {
      label: "Gestão Financeira",
      icon: Briefcase,
      module: "financeiro",
      items: [
        { label: "Resumo", icon: BarChart3, path: "/admin/financial", module: "financeiro" },
        { label: "Painel CFO", icon: PieChart, path: "/admin/financial/cfo", module: "financeiro" },
        { label: "DRE & Caixa", icon: FileText, path: "/admin/financial/dre", module: "financeiro" },
        { label: "Receitas", icon: TrendingUp, path: "/admin/financial/receitas", module: "financeiro" },
        { label: "Despesas", icon: TrendingDown, path: "/admin/financial/despesas", module: "financeiro" },
        { label: "Comissões", icon: DollarSign, path: "/admin/financial/comissoes", module: "financeiro" },
        { label: "Automações", icon: Zap, path: "/admin/financial/automacoes", module: "financeiro" },
        { label: "Categorias", icon: FolderOpen, path: "/admin/financial/categorias", module: "financeiro" },
      ],
    },
  },
  {
    title: "GESTÃO DE PREÇOS E FATURAMENTO",
    items: [],
    expandable: {
      label: "Preços e Faturamento",
      icon: DollarSign,
      module: "faturamento",
      items: [
        { label: "Tabela de custo", icon: Tag, path: "/admin/cost-tables", module: "tabelas_custo" },
        { label: "Tabela de venda", icon: ShoppingCart, path: "/admin/sale-tables", module: "tabelas_venda" },
        { label: "Conexões", icon: Link2, path: "/admin/connections", module: "conexoes" },
        { label: "Tenants", icon: Globe, path: "/admin/tenants", module: "tenants" },
        { label: "Faturamento", icon: FileText, path: "/admin/invoices/dashboard", module: "faturamento" },
        { label: "Custo", icon: TrendingDown, path: "/admin/invoices/custo", indent: true, module: "faturamento" },
        { label: "Venda", icon: TrendingUp, path: "/admin/invoices/venda", indent: true, module: "faturamento" },
      ],
    },
  },
  {
    title: "LGPD",
    items: [],
    expandable: {
      label: "Proteção de Dados",
      icon: Shield,
      module: "lgpd",
      items: [
        { label: "Painel LGPD", icon: Shield, path: "/admin/lgpd", module: "lgpd" },
        { label: "Mapeamento (ROPA)", icon: Database, path: "/admin/lgpd/ropa", module: "lgpd" },
        { label: "Consentimentos", icon: Users, path: "/admin/lgpd/consents", module: "lgpd" },
        { label: "Solicitações", icon: FileText, path: "/admin/lgpd/requests", module: "lgpd" },
        { label: "Incidentes", icon: AlertTriangle, path: "/admin/lgpd/incidents", module: "lgpd" },
      ],
    },
  },
  {
    items: [
      { label: "Configurações", icon: Settings, path: "/admin/settings", module: "configuracoes" },
      { label: "Auditoria", icon: ClipboardList, path: "/admin/audit-logs", module: "auditoria" },
    ],
  },
];

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [unreadChatCount, setUnreadChatCount] = useState(0);

  const fetchUnreadCount = useCallback(async () => {
    const { count, error } = await supabase
      .from("chat_messages")
      .select("*", { count: "exact", head: true })
      .eq("is_read", false)
      .neq("sender_type", "agent");
    if (!error && count !== null) setUnreadChatCount(count);
  }, []);

  useEffect(() => {
    fetchUnreadCount();
    const channel = supabase
      .channel("admin-chat-notifications")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages" }, (payload) => {
        const msg = payload.new as any;
        if (msg.sender_type !== "agent") {
          fetchUnreadCount();
          // Show prominent toast notification
          toast.info("💬 Nova mensagem WhatsApp", {
            description: msg.content?.substring(0, 80) || "Nova mensagem recebida",
            duration: 6000,
            action: {
              label: "Ver",
              onClick: () => { window.location.href = "/admin/crm/chat"; },
            },
          });
        }
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "chat_messages" }, () => {
        fetchUnreadCount();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchUnreadCount]);

  const toggleSection = (label: string) => {
    setExpandedSections(prev => ({ ...prev, [label]: !prev[label] }));
  };

  const isSectionExpanded = (label: string) => {
    if (expandedSections[label] !== undefined) return expandedSections[label];
    // Auto-expand if any sub-item is active
    return true;
  };
  const { user, signOut } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/admin") return location.pathname === "/admin";
    return location.pathname.startsWith(path);
  };

  const allNavItems = navSections.flatMap(s => [
    ...s.items,
    ...(s.expandable?.items || []),
  ]);

  return (
    <div className="min-h-screen bg-secondary flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-primary text-primary-foreground flex flex-col transition-transform duration-300",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="p-6 flex items-center justify-between border-b border-primary-foreground/10">
          <img src={logo} alt="The Best Cloud" className="h-8 w-auto brightness-0 invert" />
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-primary-foreground/70 hover:text-primary-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-4 overflow-y-auto">
          {navSections.map((section, si) => (
            <div key={si}>
              {section.title && (
                <div className="text-[10px] font-semibold uppercase tracking-wider text-primary-foreground/40 px-4 mb-1">
                  {section.title}
                </div>
              )}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors",
                        active
                          ? "bg-primary-foreground/15 text-primary-foreground"
                          : "text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                      {active && <ChevronRight className="h-4 w-4 ml-auto" />}
                    </Link>
                  );
                })}
                {section.expandable && (() => {
                  const exp = section.expandable;
                  const ExpIcon = exp.icon;
                  const isAnySubActive = exp.items.some(i => isActive(i.path));
                  return (
                    <div>
                      <button
                        onClick={() => toggleSection(exp.label)}
                        className={cn(
                          "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors w-full",
                          isAnySubActive
                            ? "bg-primary-foreground/15 text-primary-foreground"
                            : "text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground"
                        )}
                      >
                        <ExpIcon className="h-4 w-4" />
                        {exp.label}
                        {exp.label === "Chat & Atendimento" && unreadChatCount > 0 && (
                          <Badge className="bg-destructive text-destructive-foreground text-[10px] px-1.5 py-0 min-w-[20px] h-5 flex items-center justify-center animate-pulse">
                            {unreadChatCount > 99 ? "99+" : unreadChatCount}
                          </Badge>
                        )}
                        <ChevronDown className={cn("h-4 w-4 ml-auto transition-transform", !isSectionExpanded(exp.label) && "-rotate-90")} />
                      </button>
                      {isSectionExpanded(exp.label) && (
                        <div className="ml-4 mt-1 space-y-1">
                         {exp.items.map((item) => {
                            const active = isActive(item.path);
                            const isSubItem = item.indent;
                            return (
                              <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setSidebarOpen(false)}
                                className={cn(
                                  "flex items-center gap-3 rounded-lg text-sm transition-colors",
                                  isSubItem ? "px-8 py-1.5" : "px-4 py-2",
                                  active
                                    ? "text-primary-foreground font-medium"
                                    : "text-primary-foreground/60 hover:text-primary-foreground"
                                )}
                              >
                                {item.label}
                                {item.path === "/admin/crm/chat" && unreadChatCount > 0 && (
                                  <Badge className="ml-auto bg-destructive text-destructive-foreground text-[10px] px-1.5 py-0 min-w-[20px] h-5 flex items-center justify-center animate-pulse">
                                    {unreadChatCount > 99 ? "99+" : unreadChatCount}
                                  </Badge>
                                )}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-primary-foreground/10">
          <div className="text-xs text-primary-foreground/50 mb-2 truncate">{user?.email}</div>
          <Button
            variant="ghost"
            size="sm"
            onClick={signOut}
            className="w-full justify-start text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-background border-b border-border px-6 py-4 flex items-center gap-4">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-foreground">
            <Menu className="h-6 w-6" />
          </button>
          <h1 className="text-lg font-semibold text-foreground">
            {allNavItems.find((n) => isActive(n.path))?.label || "Portal"}
          </h1>
        </header>

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
