import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Básico",
    price: "14,90",
    description: "Ideal para profissionais autônomos",
    features: [
      "100 GB de armazenamento",
      "Backup automático diário",
      "Criptografia AES-256",
      "1 dispositivo",
      "Suporte por email",
      "Retenção de 30 dias",
    ],
  },
  {
    name: "Profissional",
    price: "49,90",
    description: "Para pequenas e médias empresas",
    features: [
      "500 GB de armazenamento",
      "Backup automático a cada 4h",
      "Criptografia AES-256",
      "Até 5 dispositivos",
      "Suporte 24/7 prioritário",
      "Retenção de 90 dias",
      "Disaster Recovery básico",
      "Conformidade LGPD",
    ],
    popular: true,
  },
  {
    name: "Empresarial",
    price: "Sob Consulta",
    description: "Solução completa para grandes empresas",
    features: [
      "Armazenamento ilimitado",
      "Backup contínuo (CDP)",
      "Criptografia AES-256",
      "Dispositivos ilimitados",
      "Gerente de conta dedicado",
      "Retenção personalizada",
      "Disaster Recovery completo",
      "SLA garantido",
      "Integração personalizada",
    ],
  },
];

const Pricing = () => {
  const scrollToTrial = () => {
    const element = document.getElementById("trial");
    element?.scrollIntoView({ behavior: "smooth" });
  };

  const handleContact = () => {
    const element = document.getElementById("contact");
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="pricing" className="py-24 bg-secondary">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Planos Transparentes e Acessíveis
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Escolha o plano ideal para o tamanho da sua operação. Todos incluem teste gratuito de 14 dias.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative border-2 shadow-medium hover:shadow-strong transition-all duration-300 ${
                plan.popular
                  ? "border-accent scale-105 shadow-strong"
                  : "border-border hover:-translate-y-1"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="bg-accent text-accent-foreground px-6 py-1.5 rounded-full text-sm font-bold shadow-medium">
                    Mais Popular
                  </div>
                </div>
              )}

              <CardHeader className="text-center pb-8 pt-10">
                <CardTitle className="text-2xl font-bold mb-2">{plan.name}</CardTitle>
                <CardDescription className="text-base mb-6">
                  {plan.description}
                </CardDescription>
                <div className="flex items-baseline justify-center gap-2">
                  {plan.price !== "Sob Consulta" ? (
                    <>
                      <span className="text-5xl font-bold text-foreground">R$ {plan.price}</span>
                      <span className="text-muted-foreground">/mês</span>
                    </>
                  ) : (
                    <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                  )}
                </div>
              </CardHeader>

              <CardContent className="pb-8">
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                      <span className="text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter className="pt-0 pb-8">
                <Button
                  variant={plan.popular ? "cta" : "default"}
                  size="lg"
                  className="w-full"
                  onClick={plan.price === "Sob Consulta" ? handleContact : scrollToTrial}
                >
                  {plan.price === "Sob Consulta" ? "Entrar em Contato" : "Iniciar Teste Grátis"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <p className="text-center mt-12 text-muted-foreground">
          Todos os planos incluem criptografia de ponta a ponta, backups automáticos e conformidade LGPD.
        </p>
      </div>
    </section>
  );
};

export default Pricing;
