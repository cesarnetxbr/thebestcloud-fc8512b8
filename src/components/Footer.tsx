import logo from "@/assets/logo.png";
import { Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const handleWhatsApp = () => {
    window.open("https://wa.me/5511999999999?text=Olá! Gostaria de saber mais sobre o BestBackup Cloud", "_blank");
  };

  return (
    <footer id="contact" className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Logo and description */}
          <div className="lg:col-span-2">
            <img src={logo} alt="The Best Cloud" className="h-12 w-auto mb-6 brightness-0 invert" />
            <p className="text-primary-foreground/80 leading-relaxed mb-6 max-w-md">
              Proteção completa de dados com backup automático em nuvem e disaster recovery. 
              Segurança, confiabilidade e conformidade LGPD para sua empresa.
            </p>
            <Button 
              variant="cta" 
              onClick={handleWhatsApp}
              className="mb-4"
            >
              Fale Conosco no WhatsApp
            </Button>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="font-bold text-lg mb-4">Links Rápidos</h3>
            <ul className="space-y-3">
              <li>
                <a href="#features" className="text-primary-foreground/80 hover:text-accent transition-colors">
                  Recursos
                </a>
              </li>
              <li>
                <a href="#benefits" className="text-primary-foreground/80 hover:text-accent transition-colors">
                  Benefícios
                </a>
              </li>
              <li>
                <a href="#pricing" className="text-primary-foreground/80 hover:text-accent transition-colors">
                  Planos e Preços
                </a>
              </li>
              <li>
                <a href="#trial" className="text-primary-foreground/80 hover:text-accent transition-colors">
                  Teste Grátis
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-lg mb-4">Contato</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                <a 
                  href="mailto:contato@thebestcloud.com.br" 
                  className="text-primary-foreground/80 hover:text-accent transition-colors"
                >
                  contato@thebestcloud.com.br
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                <a 
                  href="tel:+5511999999999" 
                  className="text-primary-foreground/80 hover:text-accent transition-colors"
                >
                  (11) 9999-9999
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                <span className="text-primary-foreground/80">
                  São Paulo, SP - Brasil
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-primary-foreground/20 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-primary-foreground/70 text-sm">
              © {currentYear} The Best Cloud. Todos os direitos reservados.
            </p>
            <div className="flex gap-6 text-sm">
              <a href="#" className="text-primary-foreground/70 hover:text-accent transition-colors">
                Política de Privacidade
              </a>
              <a href="#" className="text-primary-foreground/70 hover:text-accent transition-colors">
                Termos de Uso
              </a>
              <a href="#" className="text-primary-foreground/70 hover:text-accent transition-colors">
                LGPD
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
