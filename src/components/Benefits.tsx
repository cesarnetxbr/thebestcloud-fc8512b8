import { Shield, TrendingUp, Headphones, Clock, BarChart3, Lock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import reduzaComplexidade from "@/assets/landing/reduza-complexidade.webp";
import simplifique from "@/assets/landing/simplifique-gestao.webp";
import protecaoCompleta from "@/assets/landing/protecao-completa.webp";
import plataformaSeguranca from "@/assets/landing/plataforma-seguranca.webp";
import awsLogo from "@/assets/partners/aws.png";
import azureLogo from "@/assets/partners/azure.png";
import googleCloudLogo from "@/assets/partners/google-cloud.png";

const partners = [
  { image: awsLogo, label: "Amazon Web Services" },
  { image: azureLogo, label: "Microsoft Azure" },
  { image: googleCloudLogo, label: "Google Cloud" },
];

const advantages = [
  {
    id: "complexidade",
    label: "Sem complexidade",
    title: "Chega de múltiplas ferramentas",
    description: "Sua empresa provavelmente usa diversas soluções separadas para se proteger contra ameaças cibernéticas. Com a The Best Cloud, você unifica tudo em uma plataforma integrada — backup, antivírus, anti-ransomware e mais — reduzindo custos e eliminando a complexidade.",
    image: reduzaComplexidade,
  },
  {
    id: "gestao",
    label: "Gestão simples",
    title: "Tudo sob controle, sem complicação",
    description: "Gerencie a proteção de toda a sua infraestrutura de TI a partir de um único painel. Políticas de backup, avaliações de vulnerabilidade e atualizações de segurança em um só lugar, com poucos cliques.",
    image: simplifique,
  },
  {
    id: "protecao",
    label: "Proteção inteligente",
    title: "Proteção com inteligência artificial",
    description: "Detecte e bloqueie ciberameaças automaticamente, inclusive as desconhecidas. Nossa tecnologia baseada em IA identifica comportamentos maliciosos em tempo real, oferecendo proteção máxima com mínima intervenção da sua equipe.",
    image: protecaoCompleta,
  },
];

const clientBenefits = [
  {
    icon: Shield,
    title: "Proteção Completa",
    description: "Backup, antivírus, anti-ransomware e recuperação de desastres em uma única plataforma.",
  },
  {
    icon: Lock,
    title: "Conformidade e LGPD",
    description: "Mantenha seus dados em conformidade com a LGPD e outras regulamentações de proteção de dados.",
  },
  {
    icon: Headphones,
    title: "Suporte Especializado",
    description: "Equipe de suporte técnico em português, disponível para ajudar sua empresa.",
  },
  {
    icon: TrendingUp,
    title: "Escalável para seu Crescimento",
    description: "Soluções que crescem com a sua empresa, sem necessidade de trocar de plataforma.",
  },
  {
    icon: Clock,
    title: "Disponibilidade 24/7",
    description: "Monitoramento contínuo para manter seus dados e sistemas sempre protegidos.",
  },
  {
    icon: BarChart3,
    title: "Relatórios e Visibilidade",
    description: "Acompanhe o status de proteção da sua empresa com dashboards e relatórios detalhados.",
  },
];

const Benefits = () => {
  const [activeAdvantage, setActiveAdvantage] = useState("complexidade");
  const current = advantages.find((a) => a.id === activeAdvantage)!;

  return (
    <section id="vantagens" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* About section with image */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-24">
          <div>
            <img
              src={plataformaSeguranca}
              alt="Plataforma completa de Segurança Digital"
              className="rounded-xl shadow-medium w-full"
              loading="lazy"
            />
          </div>
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              Segurança digital sob medida para sua empresa
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Proteja os dados, servidores e estações de trabalho da sua empresa com uma plataforma integrada de Backup em Nuvem, Antivírus, Anti-ransomware, Anti-malware e muito mais.
            </p>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">500+</div>
                <div className="text-xs text-muted-foreground">Empresas protegidas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">99,9%</div>
                <div className="text-xs text-muted-foreground">Disponibilidade</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">24/7</div>
                <div className="text-xs text-muted-foreground">Monitoramento</div>
              </div>
            </div>
          </div>
        </div>

        {/* Parceiros */}
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold text-muted-foreground uppercase tracking-wider">Parceiros</h3>
        </div>
        <div className="flex justify-center items-center gap-16 mb-24">
          {partners.map((partner, i) => (
            <div key={i} className="flex flex-col items-center gap-3">
              <img src={partner.image} alt={partner.label} className="h-16 object-contain" loading="lazy" />
              <p className="text-sm text-muted-foreground text-center">{partner.label}</p>
            </div>
          ))}
        </div>

        {/* Vantagens tabs */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            Por que escolher a The Best Cloud?
          </h2>
        </div>

        <div className="max-w-5xl mx-auto mb-20">
          <div className="flex justify-center gap-2 mb-8">
            {advantages.map((adv) => (
              <button
                key={adv.id}
                onClick={() => setActiveAdvantage(adv.id)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                  activeAdvantage === adv.id
                    ? "bg-primary text-primary-foreground shadow-medium"
                    : "bg-secondary text-muted-foreground hover:bg-primary/5 border border-border"
                }`}
              >
                {adv.label}
              </button>
            ))}
          </div>
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-xl font-bold mb-4 text-foreground">{current.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{current.description}</p>
            </div>
            <div>
              <img
                src={current.image}
                alt={current.title}
                className="rounded-xl shadow-medium w-full"
                loading="lazy"
              />
            </div>
          </div>
        </div>

        {/* Client benefits */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            O que oferecemos para sua empresa
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Soluções completas de ciberproteção para empresas de todos os portes, com suporte em português e tecnologia de ponta.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {clientBenefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <Card key={index} className="border border-border shadow-soft hover:shadow-medium transition-all duration-300 bg-background">
                <CardContent className="p-6">
                  <div className="mb-4 w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                    <Icon className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="text-base font-bold mb-2 text-foreground">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{benefit.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Benefits;
