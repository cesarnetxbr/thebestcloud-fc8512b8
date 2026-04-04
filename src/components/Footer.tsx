import logo from "@/assets/logo.png";
import { Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-foreground text-background">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
          {/* Logo */}
          <div className="lg:col-span-2">
            <img src={logo} alt="The Best Cloud" className="h-10 w-auto mb-4 brightness-0 invert" />
            <p className="text-background/70 text-sm leading-relaxed max-w-sm">
              Plataforma de ciberproteção integrada para provedores de serviços. Segurança, backup e operações em um só lugar.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-sm mb-4 text-background/90">Navegação</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#solucoes" className="text-background/60 hover:text-accent transition-colors">Soluções</a></li>
              <li><a href="#vantagens" className="text-background/60 hover:text-accent transition-colors">Vantagens</a></li>
              <li><a href="#faq" className="text-background/60 hover:text-accent transition-colors">FAQ</a></li>
              <li><a href="#contato" className="text-background/60 hover:text-accent transition-colors">Contato</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-sm mb-4 text-background/90">Contato</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-accent" />
                <a href="mailto:contato@thebestcloud.com.br" className="text-background/60 hover:text-accent transition-colors">
                  contato@thebestcloud.com.br
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-accent" />
                <a href="tel:+5511999999999" className="text-background/60 hover:text-accent transition-colors">
                  (11) 9999-9999
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-accent" />
                <span className="text-background/60">São Paulo, SP - Brasil</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-background/10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-background/50 text-xs">
            © {currentYear} The Best Cloud. Todos os direitos reservados.
          </p>
          <div className="flex gap-4 text-xs">
            <a href="#" className="text-background/50 hover:text-accent transition-colors">Política de Privacidade</a>
            <a href="#" className="text-background/50 hover:text-accent transition-colors">Termos de Uso</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
