import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Shield, Lock, Clock, Database, Globe, AlertTriangle, CloudOff, Smartphone } from "lucide-react";

const slides = [
  {
    id: 1,
    title: "Seus Dados Seguros.",
    titleAccent: "Sempre Protegidos.",
    description:
      "O BestBackup Cloud da The Best Cloud garante backup automático, criptografado e recuperação em 1 clique. Proteja sua empresa contra perda de dados, ransomware e tempo de parada.",
    badges: [
      { icon: Shield, label: "Criptografia AES-256" },
      { icon: Lock, label: "Conformidade LGPD" },
      { icon: Clock, label: "RTO Baixíssimo" },
    ],
    cta: "Teste 14 Dias Grátis — Sem Cartão",
    ctaSecondary: "Falar com Especialista",
    footnotes: [
      "Sem necessidade de cartão de crédito",
      "Cancele quando quiser",
      "Suporte 24/7",
    ],
  },
  {
    id: 2,
    title: "Por que backup online?",
    titleAccent: "",
    description: "",
    cards: [
      {
        icon: Database,
        title: "Seu volume de dados cresce a cada dia",
        text: "A informação digital cresce num fator de 80% ao ano, tornando-se o principal ativo de qualquer organização moderna.",
      },
      {
        icon: AlertTriangle,
        title: "Sinistros e Perdas de dados ocorrem",
        text: "De incêndios a discos rígidos que queimam, de vírus a arquivos apagados acidentalmente, o que coloca o futuro da sua empresa em alto risco.",
      },
      {
        icon: CloudOff,
        title: "Você precisa fazer mais com menos",
        text: "Backups tradicionais são soluções muito caras e levam muito tempo para serem restauradas, gerando grandes perdas de faturamento e produtividade.",
      },
      {
        icon: Smartphone,
        title: "Acessibilidade e segurança",
        text: "Nossas soluções de backup online permitem que você acesse e restaure suas informações criptografadas, de qualquer lugar do mundo.",
      },
    ],
  },
  {
    id: 3,
    title: "Não perca suas informações",
    titleAccent: "mais importantes.",
    description:
      "Independente de você ser uma pessoa física ou jurídica, é imprescindível utilizar um serviço de backup para garantir que seus dados críticos — estejam eles em servidor local ou na nuvem — tenham uma cópia.",
    subdescription:
      "Este processo evita muita dor de cabeça caso haja perda de dados por ataque cibernético, erro humano ou falhas críticas.",
    cta: "Proteja seus dados agora",
    ctaSecondary: "Falar com Especialista",
  },
];

const BannerCarousel = () => {
  const [current, setCurrent] = useState(0);
  const navigate = useNavigate();

  const next = useCallback(() => setCurrent((c) => (c + 1) % slides.length), []);
  const prev = useCallback(() => setCurrent((c) => (c - 1 + slides.length) % slides.length), []);

  useEffect(() => {
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next]);

  const handleCta = () => navigate("/portal");

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary via-[hsl(215,60%,30%)] to-[hsl(25,60%,40%)]">
      <div className="container mx-auto px-4 py-10 md:py-14 min-h-[340px] flex items-center">
        {/* Slides */}
        {slides.map((slide, i) => (
          <div
            key={slide.id}
            className={`w-full transition-all duration-700 ${
              i === current
                ? "opacity-100 translate-x-0"
                : "opacity-0 absolute translate-x-8 pointer-events-none"
            }`}
          >
            {/* Slide 1 - Hero style */}
            {slide.badges && (
              <div className="text-center max-w-3xl mx-auto">
                <h2 className="text-3xl md:text-5xl font-bold text-primary-foreground mb-2">
                  {slide.title}
                </h2>
                {slide.titleAccent && (
                  <h2 className="text-3xl md:text-5xl font-bold text-accent mb-6">
                    {slide.titleAccent}
                  </h2>
                )}
                <p className="text-primary-foreground/80 text-base md:text-lg mb-8 leading-relaxed">
                  {slide.description}
                </p>
                <div className="flex flex-wrap justify-center gap-3 mb-8">
                  {slide.badges.map((b) => (
                    <span
                      key={b.label}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/5 text-primary-foreground text-sm"
                    >
                      <b.icon className="h-4 w-4 text-accent" />
                      {b.label}
                    </span>
                  ))}
                </div>
                <div className="flex flex-col sm:flex-row justify-center gap-4 mb-6">
                  <Button variant="cta" size="lg" onClick={handleCta}>
                    {slide.cta}
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleCta}
                    className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 bg-primary-foreground/5"
                  >
                    {slide.ctaSecondary}
                  </Button>
                </div>
                {slide.footnotes && (
                  <p className="text-primary-foreground/60 text-sm">
                    {slide.footnotes.map((f, idx) => (
                      <span key={idx}>
                        ✓ {f}
                        {idx < slide.footnotes!.length - 1 && " · "}
                      </span>
                    ))}
                  </p>
                )}
              </div>
            )}

            {/* Slide 2 - Cards grid */}
            {slide.cards && (
              <div className="max-w-5xl mx-auto">
                <h2 className="text-3xl md:text-5xl font-bold text-primary-foreground text-center mb-10">
                  {slide.title}
                </h2>
                <div className="grid sm:grid-cols-2 gap-6">
                  {slide.cards.map((card) => (
                    <div
                      key={card.title}
                      className="bg-primary-foreground/5 border border-primary-foreground/10 rounded-xl p-6 backdrop-blur-sm"
                    >
                      <card.icon className="h-8 w-8 text-accent mb-3" />
                      <h3 className="text-lg font-semibold text-primary-foreground mb-2">
                        {card.title}
                      </h3>
                      <p className="text-primary-foreground/70 text-sm leading-relaxed">
                        {card.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Slide 3 - Text + CTA */}
            {slide.subdescription && (
              <div className="text-center max-w-3xl mx-auto">
                <h2 className="text-3xl md:text-5xl font-bold text-primary-foreground mb-2">
                  {slide.title}
                </h2>
                {slide.titleAccent && (
                  <h2 className="text-3xl md:text-5xl font-bold text-accent mb-8">
                    {slide.titleAccent}
                  </h2>
                )}
                <p className="text-primary-foreground/80 text-base md:text-lg mb-4 leading-relaxed">
                  {slide.description}
                </p>
                <p className="text-primary-foreground/70 text-base mb-8 leading-relaxed">
                  {slide.subdescription}
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Button variant="cta" size="lg" onClick={handleCta}>
                    {slide.cta}
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleCta}
                    className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 bg-primary-foreground/5"
                  >
                    {slide.ctaSecondary}
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Navigation arrows */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground transition-colors"
        aria-label="Anterior"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground transition-colors"
        aria-label="Próximo"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Dots */}
      <div className="flex justify-center gap-2 pb-6">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-2.5 rounded-full transition-all ${
              i === current ? "w-8 bg-accent" : "w-2.5 bg-primary-foreground/30"
            }`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default BannerCarousel;
