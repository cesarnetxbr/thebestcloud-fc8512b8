import { Briefcase, TrendingUp, Headphones, GraduationCap, BarChart3, Palette } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import reduzaComplexidade from "@/assets/landing/reduza-complexidade.webp";
import simplifique from "@/assets/landing/simplifique-gestao.webp";
import protecaoCompleta from "@/assets/landing/protecao-completa.webp";
import plataformaSeguranca from "@/assets/landing/plataforma-seguranca.webp";
import avTest from "@/assets/awards/av-test.webp";
import techcrunch from "@/assets/awards/techcrunch.webp";
import comptia from "@/assets/awards/comptia.webp";

const advantages = [
  {
    id: "complexidade",
    label: "Sem complexidade",
    title: "Reduza a complexidade",
    description: "Se você é como outras empresas, provavelmente usa um conjunto complexo de soluções para se defender contra a perda de dados e outras ameaças cibernéticas. As soluções de proteção cibernética integradas protegem cargas de trabalho inteiras com maior eficiência e uma fração da complexidade, liberando recursos e permitindo que você se concentre na proteção.",
    image: reduzaComplexidade,
  },
  {
    id: "gestao",
    label: "Gestão simples",
    title: "Simplifique a gestão",
    description: "Proteja cargas de trabalho inteiras sem atrito. Começar com as soluções de proteção cibernética é muito simples. Provisione vários sistemas com apenas um clique e gerencie tudo, desde políticas de backup à avaliações de vulnerabilidade e correção, por meio de um único painel.",
    image: simplifique,
  },
  {
    id: "protecao",
    label: "Proteção completa",
    title: "Proteção completa",
    description: "Detecte e bloqueie ciberameaças sem nenhum esforço, mesmo aquelas nunca vistas antes. A ferramenta comportamental baseada em IA identifica os processos maliciosos nos quais o malware depende, oferecendo a melhor proteção com menos falsos positivos e uma taxa de detecção comprovada.",
    image: protecaoCompleta,
  },
];

const awards = [
  { image: avTest, label: "AV-TEST participant\nand test winner", year: "2021" },
  { image: techcrunch, label: "TechCrunch", year: "2021" },
  { image: comptia, label: "CompTIA", year: "2021" },
];

const partnerBenefits = [
  {
    icon: Briefcase,
    title: "Modelo Comercial Simplificado",
    description: "Comece de forma rápida e fácil, sem fidelidade e sem faturamento mínimo.",
  },
  {
    icon: Palette,
    title: "Política Comercial Própria",
    description: "Liberdade para implantar sua política comercial na plataforma Whitelabel.",
  },
  {
    icon: Headphones,
    title: "Suporte em PT-BR",
    description: "Suporte técnico e comercial total para sua empresa, em português.",
  },
  {
    icon: TrendingUp,
    title: "Treinamento Comercial",
    description: "Técnicas e materiais de venda prontos para você performar rapidamente.",
  },
  {
    icon: GraduationCap,
    title: "Treinamento Técnico",
    description: "Vídeo aulas, material de apoio e suporte do nosso time de especialistas.",
  },
  {
    icon: BarChart3,
    title: "Painel de Controle Exclusivo",
    description: "Acompanhe em tempo real os indicadores de uso e evolução de seus clientes.",
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
              Plataforma completa de Segurança Digital
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Por meio de uma única plataforma integrada, você poderá fornecer aos seus clientes Backup em Nuvem, Antivírus, Antiransomware, Antimalware e muito mais!
            </p>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">500+</div>
                <div className="text-xs text-muted-foreground">Clientes corporativos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">100+</div>
                <div className="text-xs text-muted-foreground">Prêmios internacionais</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">300+</div>
                <div className="text-xs text-muted-foreground">Publicações na mídia</div>
              </div>
            </div>
          </div>
        </div>

        {/* Awards */}
        <div className="flex justify-center gap-12 mb-24">
          {awards.map((award, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <img src={award.image} alt={award.label} className="h-12 object-contain" loading="lazy" />
              <p className="text-xs text-muted-foreground text-center whitespace-pre-line">{award.label}</p>
              <p className="text-xs text-muted-foreground">{award.year}</p>
            </div>
          ))}
        </div>

        {/* Vantagens tabs */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            Vantagens de ser um cliente The Best Cloud
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

        {/* Partner program */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            The Best Cloud Partner Program
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Somos o maior revendedor da América Latina, com mais de 350 parceiros de sucesso. Entenda o que faz nosso modelo perfeito para sua empresa.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {partnerBenefits.map((benefit, index) => {
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