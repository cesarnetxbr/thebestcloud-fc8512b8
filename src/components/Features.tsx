import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Link } from "react-router-dom";
import { solutions } from "@/data/solutions";

const tabs = [
  { id: "seguranca", label: "Segurança" },
  { id: "protecao", label: "Proteção" },
  { id: "operacoes", label: "Operações" },
];

const Features = () => {
  const [activeTab, setActiveTab] = useState("seguranca");

  const filtered = solutions.filter((s) => s.category === activeTab);

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
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {filtered.map((solution) => (
            <Card key={solution.slug} className="border border-border shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-1 bg-background">
              <CardContent className="p-6 flex flex-col h-full">
                <h3 className="text-base font-bold mb-2 text-foreground">{solution.subtitle || solution.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1">{solution.heroDescription}</p>
                <Link to={`/solucao/${solution.slug}`}>
                  <Button variant="outline" size="sm" className="w-full">
                    Conhecer
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
