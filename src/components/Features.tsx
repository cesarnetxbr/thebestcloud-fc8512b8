import { Shield, Database, Zap, Monitor, Mail, Lock, Server, Cloud, HardDrive, RefreshCw, Settings, Headphones } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";

const tabs = [
  { id: "seguranca", label: "Segurança" },
  { id: "protecao", label: "Proteção" },
  { id: "operacoes", label: "Operações" },
];

const solutions: Record<string, Array<{ icon: React.ElementType; title: string; description: string }>> = {
  seguranca: [
    { icon: Shield, title: "XDR – Detecção e Resposta Estendidas", description: "Modernize sua pilha de serviços de segurança com um XDR projetado para provedores de serviço." },
    { icon: Monitor, title: "EDR – Detecção e Resposta para Endpoints", description: "Detecção e Resposta de Endpoint guiada por inteligência artificial para MSPs." },
    { icon: Lock, title: "Prevenção de Perda de Dados (DLP)", description: "Uma solução de DLP desenvolvida para reduzir a complexidade do gerenciamento." },
    { icon: Mail, title: "Email Security", description: "Intercepte ataques de e-mail modernos em questão de segundos." },
  ],
  protecao: [
    { icon: Database, title: "Backup em Nuvem", description: "Backup para MSP: Uma plataforma para cada carga de trabalho com máxima eficiência." },
    { icon: Cloud, title: "Backup para Microsoft 365", description: "Proteção cibernética abrangente para os dados e aplicativos do Microsoft 365." },
    { icon: Zap, title: "Disaster Recovery", description: "Recupere-se rapidamente de ataques cibernéticos e outras paralisações não planejadas." },
    { icon: HardDrive, title: "Backup em Nuvem Pública", description: "Backup em Nuvem Flexível: Seu Armazenamento, Sua Escolha." },
  ],
  operacoes: [
    { icon: Settings, title: "RMM – Monitoramento Remoto", description: "Alcance o máximo desempenho com uma plataforma RMM nativamente integrada." },
    { icon: RefreshCw, title: "PSA – Automação de Serviços", description: "Simplifique o sucesso com um PSA fácil de usar para MSPs modernos." },
    { icon: Server, title: "Security Posture Management", description: "Entrega eficiente de serviços de gerenciamento de postura de segurança." },
    { icon: Headphones, title: "Suporte 24/7 em PT-BR", description: "Atendimento técnico e comercial em português, sem enrolação." },
  ],
};

const Features = () => {
  const [activeTab, setActiveTab] = useState("seguranca");

  return (
    <section id="solucoes" className="py-24 bg-secondary">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            Plataforma completa de Segurança Digital
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Por meio de uma única plataforma integrada, forneça aos seus clientes Backup em Nuvem, Antivírus, Anti-ransomware, Anti-malware e muito mais.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-2 mb-12">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground shadow-medium"
                  : "bg-background text-muted-foreground hover:bg-primary/5 border border-border"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {solutions[activeTab].map((solution, index) => {
            const Icon = solution.icon;
            return (
              <Card key={index} className="border border-border shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-1 bg-background">
                <CardContent className="p-6">
                  <div className="mb-4 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-base font-bold mb-2 text-foreground">{solution.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{solution.description}</p>
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
