import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";

const Header = () => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header className="fixed top-0 w-full bg-background/95 backdrop-blur-sm border-b border-border z-50 shadow-soft">
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={logo} alt="The Best Cloud" className="h-10 w-auto" />
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <button
              onClick={() => scrollToSection("features")}
              className="text-foreground hover:text-primary transition-colors font-medium"
            >
              Recursos
            </button>
            <button
              onClick={() => scrollToSection("benefits")}
              className="text-foreground hover:text-primary transition-colors font-medium"
            >
              Benefícios
            </button>
            <button
              onClick={() => scrollToSection("pricing")}
              className="text-foreground hover:text-primary transition-colors font-medium"
            >
              Planos
            </button>
            <button
              onClick={() => scrollToSection("contact")}
              className="text-foreground hover:text-primary transition-colors font-medium"
            >
              Contato
            </button>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="cta" onClick={() => scrollToSection("trial")}>
              Teste Grátis
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
