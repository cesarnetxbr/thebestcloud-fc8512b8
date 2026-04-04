import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import logo from "@/assets/logo.png";

const navItems = [
  { label: "Início", href: "#" },
  { label: "Soluções", href: "#solucoes" },
  { label: "Vantagens", href: "#vantagens" },
  { label: "FAQ", href: "#faq" },
  { label: "Contato", href: "#contato" },
];

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const scrollToSection = (href: string) => {
    setMobileOpen(false);
    if (href === "#") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const el = document.getElementById(href.replace("#", ""));
    el?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header className="fixed top-0 w-full bg-background/95 backdrop-blur-sm border-b border-border z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <img src={logo} alt="The Best Cloud" className="h-10 w-auto" />
          </div>

          {/* Nav desktop */}
          <nav className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => scrollToSection(item.href)}
                className="text-foreground/80 hover:text-primary transition-colors text-sm font-medium"
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Actions desktop */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/portal/login">
              <Button variant="outline" size="sm">Portal do Cliente</Button>
            </Link>
            <Link to="/admin/login">
              <Button variant="outline" size="sm">Área Administrativa</Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden">
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden pb-6 space-y-4 border-t border-border pt-4">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => scrollToSection(item.href)}
                className="block w-full text-left text-foreground/80 hover:text-primary transition-colors text-sm font-medium py-2"
              >
                {item.label}
              </button>
            ))}
            <div className="flex flex-col gap-2 pt-2">
              <Link to="/portal/login">
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
