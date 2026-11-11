import { DatabaseBackup, ShieldCheck, CloudCog, MonitorCog, KeyRound, Network, FolderLock } from "lucide-react";

const services = [
  { icon: DatabaseBackup, title: "Backup e Recuperação de Dados", desc: "Proteção completa e restauração rápida dos seus dados." },
  { icon: ShieldCheck, title: "Cibersegurança e Proteção de Endpoints", desc: "Defesa avançada contra malware, ransomware e ameaças." },
  { icon: CloudCog, title: "Cloud e Disaster Recovery", desc: "Continuidade do negócio com recuperação de desastres em nuvem." },
  { icon: MonitorCog, title: "Gerenciamento e Monitoramento de TI (RMM)", desc: "Visibilidade e controle remoto de todo o ambiente de TI." },
  { icon: KeyRound, title: "Produtividade, Infraestrutura Corporativa, Senhas e PAM", desc: "Red Access, Datadike e LastPass para acessos seguros." },
  { icon: Network, title: "Tundra Cloud", desc: "Configure uma VPN ou uma rede completa de datacenter na nuvem." },
  { icon: FolderLock, title: "Tundra Files", desc: "Compartilhe e armazene dados na nuvem com total segurança." },
];

const ServicesBanner = () => (
  <section id="servicos" className="py-20 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
    <div className="container mx-auto px-4">
      <div className="text-center mb-12">
        <span className="inline-block px-4 py-1 rounded-full bg-accent text-accent-foreground text-sm font-semibold mb-4">Nossos serviços</span>
        <h2 className="text-3xl md:text-4xl font-bold mb-3">Tudo o que sua empresa precisa em TI e segurança</h2>
        <p className="text-primary-foreground/80 max-w-2xl mx-auto">Soluções integradas The Best Cloud para proteger, gerenciar e escalar sua operação.</p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto">
        {services.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="rounded-xl p-6 bg-primary-foreground/10 border border-primary-foreground/20 backdrop-blur-sm hover:bg-primary-foreground/15 hover:-translate-y-1 transition-all">
            <div className="w-12 h-12 rounded-lg bg-accent text-accent-foreground flex items-center justify-center mb-4">
              <Icon className="w-6 h-6" />
            </div>
            <h3 className="font-semibold mb-2 leading-snug">{title}</h3>
            <p className="text-sm text-primary-foreground/75">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default ServicesBanner;
