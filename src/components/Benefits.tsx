import { Briefcase, TrendingUp, Headphones, GraduationCap, BarChart3, Palette } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const benefits = [
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
    description: "Suporte técnico e comercial total para sua revenda, em português.",
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

const stats = [
  { value: "350+", label: "Revendedores parceiros" },
  { value: "#1", label: "Maior revendedor LATAM" },
  { value: "24/7", label: "Suporte especializado" },
  { value: "100%", label: "Em português" },
];

const Benefits = () => {
  return (
    <section id="vantagens" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Stats bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20 max-w-4xl mx-auto">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-1">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            Vantagens de ser um revendedor
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Entenda o que faz nosso modelo perfeito para sua empresa.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {benefits.map((benefit, index) => {
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
