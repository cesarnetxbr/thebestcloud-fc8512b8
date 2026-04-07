import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import logo from "@/assets/logo.png";

const menuItems = [
  { label: "Início", href: "/" },
  {
    label: "Segurança",
    children: [
      { label: "Detecção e resposta estendidas (XDR)", href: "/solucao/xdr" },
      { label: "Detecção e resposta para endpoints (EDR)", href: "/solucao/edr" },
      { label: "Serviços de detecção e resposta gerenciadas (MDR)", href: "/solucao/mdr" },
      { label: "Prevenção de perda de dados (DLP)", href: "/solucao/dlp" },
      { label: "Security Posture Management", href: "/solucao/security-posture" },
      { label: "Email Security", href: "/solucao/email-security" },
      { label: "Email Archiving para Microsoft 365", href: "/solucao/email-archiving" },
      { label: "Security Awareness Training (SAT)", href: "/solucao/sat" },
    ],
  },
  {
    label: "Proteção",
    children: [
      { label: "Backup", href: "/solucao/backup" },
      { label: "Backup para Microsoft 365", href: "/solucao/backup-m365" },
      { label: "Disaster Recovery", href: "/solucao/disaster-recovery" },
      { label: "Direct Backup to Public Cloud", href: "/solucao/backup-public-cloud" },
    ],
  },
  {
    label: "Operação",
    children: [
      { label: "RMM", href: "/solucao/rmm" },
      { label: "PSA", href: "/solucao/psa" },
    ],
  },
];

interface DropdownProps {
  item: typeof menuItems[number];
  onClose: () => void;
}

const DesktopDropdown = ({ item, onClose }: DropdownProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (!item.children) {
    return (
      <Link
        to={item.href || "/"}
        className="text-foreground/80 hover:text-primary transition-colors text-sm font-medium"
        onClick={onClose}
      >
        {item.label}
      </Link>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 text-foreground/80 hover:text-primary transition-colors text-sm font-medium"
      >
        {item.label}
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-2 w-72 bg-background border border-border rounded-lg shadow-medium py-2 z-50">
          {item.children.map((child) => (
            <Link
              key={child.href}
              to={child.href}
              className="block px-4 py-2.5 text-sm text-foreground/80 hover:text-primary hover:bg-secondary transition-colors"
              onClick={() => {
                setOpen(false);
                onClose();
              }}
            >
              {child.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);

  return (
    <header className="fixed top-0 w-full bg-background/95 backdrop-blur-sm border-b border-border z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2">
              <img src={logo} alt="The Best Cloud" className="h-14 md:h-16 w-auto" />
            </Link>
            <Link to="/teste-gratis">
              <Button size="sm" className="inline-flex bg-green-600 hover:bg-green-700 text-white text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-1 rounded-full animate-pulse">
                🎁 Teste 14 Dias Grátis
              </Button>
            </Link>
          </div>

          {/* Nav desktop */}
          <nav className="hidden lg:flex items-center gap-8">
            {menuItems.map((item) => (
              <DesktopDropdown key={item.label} item={item} onClose={() => {}} />
            ))}
          </nav>

          {/* Actions desktop */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/portal">
              <Button variant="outline" size="sm">Portal do Cliente</Button>
            </Link>
            <Link to="/admin/login">
              <Button variant="outline" size="sm">Área Administrativa</Button>
            </Link>
          </div>

          <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden">
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden pb-6 space-y-1 border-t border-border pt-4 max-h-[80vh] overflow-y-auto">
            {menuItems.map((item) => (
              <div key={item.label}>
                {item.children ? (
                  <>
                    <button
                      onClick={() => setMobileExpanded(mobileExpanded === item.label ? null : item.label)}
                      className="flex items-center justify-between w-full text-left text-foreground/80 hover:text-primary transition-colors text-sm font-medium py-2.5 px-2"
                    >
                      {item.label}
                      <ChevronDown className={`h-4 w-4 transition-transform ${mobileExpanded === item.label ? "rotate-180" : ""}`} />
                    </button>
                    {mobileExpanded === item.label && (
                      <div className="pl-4 space-y-1">
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            to={child.href}
                            className="block text-sm text-foreground/70 hover:text-primary py-2 px-2"
                            onClick={() => setMobileOpen(false)}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    to={item.href || "/"}
                    className="block text-foreground/80 hover:text-primary transition-colors text-sm font-medium py-2.5 px-2"
                    onClick={() => setMobileOpen(false)}
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
            <div className="flex flex-col gap-2 pt-4">
              <Link to="/portal">
                <Button variant="outline" size="sm" className="w-full">Portal do Cliente</Button>
              </Link>
              <Link to="/admin/login">
                <Button variant="outline" size="sm" className="w-full">Área Administrativa</Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
