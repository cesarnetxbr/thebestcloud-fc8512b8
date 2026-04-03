import { useState } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";
import {
  LayoutDashboard,
  Users,
  Package,
  FileText,
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
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  icon: any;
  path: string;
}

interface NavSection {
  title?: string;
  items: NavItem[];
  expandable?: {
    label: string;
    icon: any;
    items: NavItem[];
  };
}

const navSections: NavSection[] = [
  {
    items: [
      { label: "Dashboard", icon: LayoutDashboard, path: "/admin" },
    ],
  },
  {
    title: "CADASTROS",
    items: [
      { label: "Clientes", icon: Users, path: "/admin/customers" },
    ],
  },
  {
    title: "FINANCEIRO",
    items: [
      { label: "Tabela de custo", icon: Tag, path: "/admin/cost-tables" },
      { label: "Tabela de venda", icon: ShoppingCart, path: "/admin/sale-tables" },
    ],
  },
  {
    title: "PRODUTOS",
    items: [],
    expandable: {
      label: "Acronis Cloud",
      icon: Globe,
      items: [
        { label: "Conexões", icon: Link2, path: "/admin/connections" },
        { label: "Tenants", icon: Globe, path: "/admin/tenants" },
        { label: "Faturamento", icon: FileText, path: "/admin/invoices" },
      ],
    },
  },
  {
    items: [
      { label: "SKUs / Produtos", icon: Package, path: "/admin/skus" },
    ],
  },
  {
    items: [
      { label: "Configurações", icon: Settings, path: "/admin/settings" },
    ],
  },
];

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedProduct, setExpandedProduct] = useState(true);
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
                        onClick={() => setExpandedProduct(!expandedProduct)}
                        className={cn(
                          "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors w-full",
                          isAnySubActive
                            ? "bg-primary-foreground/15 text-primary-foreground"
                            : "text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground"
                        )}
                      >
                        <ExpIcon className="h-4 w-4" />
                        {exp.label}
                        <ChevronDown className={cn("h-4 w-4 ml-auto transition-transform", !expandedProduct && "-rotate-90")} />
                      </button>
                      {expandedProduct && (
                        <div className="ml-4 mt-1 space-y-1">
                          {exp.items.map((item) => {
                            const SubIcon = item.icon;
                            const active = isActive(item.path);
                            return (
                              <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setSidebarOpen(false)}
                                className={cn(
                                  "flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-colors",
                                  active
                                    ? "text-primary-foreground font-medium"
                                    : "text-primary-foreground/60 hover:text-primary-foreground"
                                )}
                              >
                                {item.label}
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
