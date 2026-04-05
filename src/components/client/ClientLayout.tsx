import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Headphones, FileText, LogOut, Menu, X, ShoppingCart, MessageSquareWarning } from "lucide-react";
import { useState } from "react";

const navItems = [
  { label: "Painel", icon: LayoutDashboard, path: "/portal" },
  { label: "Chamados", icon: Headphones, path: "/portal/chamados" },
  { label: "Faturas", icon: FileText, path: "/portal/faturas" },
  { label: "Solicitar Serviços", icon: ShoppingCart, path: "/portal/servicos" },
  { label: "Ouvidoria", icon: MessageSquareWarning, path: "/portal/ouvidoria" },
];

const ClientLayout = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === "/portal") return location.pathname === "/portal";
    return location.pathname.startsWith(path);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/portal/login");
  };

  return (
    <div className="min-h-screen bg-secondary flex">
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      
      <aside className={cn(
        "fixed lg:sticky top-0 left-0 z-50 h-screen w-60 bg-primary text-primary-foreground flex flex-col transition-transform duration-300",
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="p-6 flex items-center justify-between border-b border-primary-foreground/10">
          <span className="font-bold text-lg">Portal do Cliente</span>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden"><X className="h-5 w-5" /></button>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link key={item.path} to={item.path} onClick={() => setSidebarOpen(false)}
                className={cn("flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  active ? "bg-primary-foreground/15 text-primary-foreground" : "text-primary-foreground/70 hover:bg-primary-foreground/10"
                )}>
                <Icon className="h-4 w-4" />{item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-primary-foreground/10">
          <p className="text-xs text-primary-foreground/50 mb-2 truncate">{user?.email}</p>
          <Button variant="ghost" size="sm" onClick={handleSignOut}
            className="w-full justify-start text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10">
            <LogOut className="h-4 w-4 mr-2" />Sair
          </Button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen">
        <header className="sticky top-0 z-30 bg-background border-b px-6 py-4 flex items-center gap-4">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden"><Menu className="h-6 w-6" /></button>
          <h1 className="text-lg font-semibold">{navItems.find(n => isActive(n.path))?.label || "Portal"}</h1>
        </header>
        <main className="flex-1 p-6"><Outlet /></main>
      </div>
    </div>
  );
};

export default ClientLayout;
