import { Shield, Database, Zap, FileCheck, Clock, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: Shield,
    title: "Criptografia AES-256",
    description: "Padrão bancário de segurança. Seus dados protegidos com a mesma tecnologia usada por instituições financeiras globais.",
  },
  {
    icon: Database,
    title: "Backup Automático",
    description: "Cópias diárias automáticas sem esforço manual. Configure uma vez e relaxe enquanto protegemos seus arquivos.",
  },
  {
    icon: Zap,
    title: "Recuperação Rápida",
    description: "RTO baixíssimo com restauração em 1 clique. Volte aos negócios em minutos após qualquer falha ou desastre.",
  },
  {
    icon: FileCheck,
    title: "Conformidade LGPD",
    description: "Proteja sua empresa de multas e penalidades. Atenda todos os requisitos da Lei Geral de Proteção de Dados.",
  },
  {
    icon: Clock,
    title: "Versões Múltiplas",
    description: "Mantenha várias versões dos seus arquivos. Recupere qualquer ponto no tempo, não apenas o backup mais recente.",
  },
  {
    icon: Users,
    title: "Suporte 24/7",
    description: "Especialistas sempre disponíveis para ajudar. Atendimento técnico especializado quando você mais precisa.",
  },
];

const Features = () => {
  return (
    <section id="features" className="py-24 bg-secondary">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Proteção Completa para Seus Dados
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Uma solução de backup em nuvem que vai além do básico, com recursos 
            avançados de segurança e recuperação de desastres.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={index} 
                className="border-none shadow-medium hover:shadow-strong transition-all duration-300 hover:-translate-y-1 bg-gradient-card"
              >
                <CardContent className="p-8">
                  <div className="mb-6 w-14 h-14 bg-primary-light rounded-xl flex items-center justify-center">
                    <Icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
