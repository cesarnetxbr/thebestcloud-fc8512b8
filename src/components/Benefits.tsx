import { CheckCircle2 } from "lucide-react";

const benefits = [
  {
    title: "Escritórios Contábeis e Advocatícios",
    description: "Proteja documentos sensíveis e cumpra obrigações legais com backups automáticos e imutáveis.",
  },
  {
    title: "Clínicas e Consultórios Médicos",
    description: "Mantenha prontuários e dados de pacientes seguros conforme exigências da LGPD e regulamentações de saúde.",
  },
  {
    title: "Construtoras e Engenharias",
    description: "Preserve projetos, plantas e documentação técnica com versões múltiplas e recuperação rápida.",
  },
  {
    title: "Comércios e PMEs",
    description: "Evite prejuízos por perda de dados financeiros, cadastros de clientes e histórico de vendas.",
  },
];

const Benefits = () => {
  return (
    <section id="benefits" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Text content */}
            <div className="animate-slide-in">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
                Por Que Empresas Confiam no BestBackup Cloud?
              </h2>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                A maioria das PMEs só descobre o valor do backup depois da primeira perda de dados. 
                Não deixe isso acontecer com você.
              </p>

              <div className="space-y-6">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex-shrink-0 mt-1">
                      <CheckCircle2 className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold mb-2 text-foreground">
                        {benefit.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right side - Stats */}
            <div className="grid grid-cols-2 gap-6 animate-fade-in">
              <div className="bg-gradient-card border border-border rounded-2xl p-8 shadow-medium">
                <div className="text-5xl font-bold text-primary mb-2">99.9%</div>
                <div className="text-muted-foreground">Disponibilidade Garantida</div>
              </div>
              <div className="bg-gradient-card border border-border rounded-2xl p-8 shadow-medium">
                <div className="text-5xl font-bold text-primary mb-2">&lt;15min</div>
                <div className="text-muted-foreground">Tempo de Recuperação</div>
              </div>
              <div className="bg-gradient-card border border-border rounded-2xl p-8 shadow-medium">
                <div className="text-5xl font-bold text-primary mb-2">24/7</div>
                <div className="text-muted-foreground">Suporte Especializado</div>
              </div>
              <div className="bg-gradient-card border border-border rounded-2xl p-8 shadow-medium">
                <div className="text-5xl font-bold text-primary mb-2">100%</div>
                <div className="text-muted-foreground">LGPD Compliance</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Benefits;
