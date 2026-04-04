import logo from "@/assets/logo.png";
import { Mail, Phone, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-foreground text-background">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
          <div className="lg:col-span-1">
            <img src={logo} alt="The Best Cloud" className="h-10 w-auto mb-4 brightness-0 invert" />
            <p className="text-background/70 text-sm leading-relaxed max-w-sm">
              Plataforma de ciberproteção integrada para provedores de serviços. Segurança, backup e operações em um só lugar.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-4 text-background/90">Segurança</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/solucao/xdr" className="text-background/60 hover:text-accent transition-colors">XDR</Link></li>
              <li><Link to="/solucao/edr" className="text-background/60 hover:text-accent transition-colors">EDR</Link></li>
              <li><Link to="/solucao/mdr" className="text-background/60 hover:text-accent transition-colors">MDR</Link></li>
              <li><Link to="/solucao/dlp" className="text-background/60 hover:text-accent transition-colors">DLP</Link></li>
              <li><Link to="/solucao/email-security" className="text-background/60 hover:text-accent transition-colors">Email Security</Link></li>
              <li><Link to="/solucao/sat" className="text-background/60 hover:text-accent transition-colors">SAT</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-4 text-background/90">Proteção & Operação</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/solucao/backup" className="text-background/60 hover:text-accent transition-colors">Backup</Link></li>
              <li><Link to="/solucao/backup-m365" className="text-background/60 hover:text-accent transition-colors">Backup Microsoft 365</Link></li>
              <li><Link to="/solucao/disaster-recovery" className="text-background/60 hover:text-accent transition-colors">Disaster Recovery</Link></li>
              <li><Link to="/solucao/rmm" className="text-background/60 hover:text-accent transition-colors">RMM</Link></li>
              <li><Link to="/solucao/psa" className="text-background/60 hover:text-accent transition-colors">PSA</Link></li>
            </ul>
          </div>

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
