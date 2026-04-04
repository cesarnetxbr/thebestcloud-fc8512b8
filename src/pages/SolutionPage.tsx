import { useParams, Link } from "react-router-dom";
import { getSolutionBySlug } from "@/data/solutions";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowLeft } from "lucide-react";
import CTASection from "@/components/CTASection";

const SolutionPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const solution = getSolutionBySlug(slug || "");

  if (!solution) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center pt-20">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4 text-foreground">Solução não encontrada</h1>
            <Link to="/">
              <Button variant="outline">Voltar ao início</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero with image - similar to acronisdata.cloud */}
      <section className="relative pt-20 md:pt-24 bg-gradient-to-br from-primary via-primary to-primary/90 overflow-hidden">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Text */}
            <div className="animate-fade-in">
              <Link to="/#solucoes" className="inline-flex items-center gap-2 text-primary-foreground/60 hover:text-primary-foreground text-sm mb-6 transition-colors">
                <ArrowLeft className="h-4 w-4" />
                Voltar às soluções
              </Link>
              <h1 className="text-3xl md:text-5xl font-bold text-primary-foreground leading-tight mb-6">
                {solution.title}
              </h1>
              <p className="text-lg text-primary-foreground/80 leading-relaxed mb-8 max-w-lg">
                {solution.heroDescription}
              </p>
              <Button
                variant="cta"
                size="lg"
                className="text-base px-8"
                onClick={() => window.open("https://wa.me/5511999999999?text=Olá! Gostaria de saber mais sobre " + solution.title, "_blank")}
              >
                Seja um Cliente
              </Button>
            </div>

            {/* Right - Dashboard Image */}
            <div className="animate-fade-in hidden lg:block">
              <div className="relative">
                <div className="absolute -inset-4 bg-accent/20 rounded-2xl blur-2xl" />
                <img
                  src={solution.image}
                  alt={solution.title}
                  className="relative rounded-xl shadow-strong border border-primary-foreground/10 w-full"
                  width={1280}
                  height={800}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 60L1440 60L1440 20C1440 20 1200 0 720 0C240 0 0 20 0 20L0 60Z" fill="hsl(var(--background))" />
          </svg>
        </div>
      </section>

      {/* Content sections - alternating layout */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto space-y-24">
            {solution.sections.map((section, index) => (
              <div
                key={index}
                className={`grid md:grid-cols-2 gap-12 items-center`}
              >
                <div className={index % 2 !== 0 ? "md:order-2" : ""}>
                  <h2 className="text-2xl md:text-3xl font-bold mb-4 text-foreground">
                    {section.title}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    {section.description}
                  </p>
                  {section.bullets && (
                    <ul className="space-y-3">
                      {section.bullets.map((bullet, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <CheckCircle className="h-5 w-5 text-accent mt-0.5 shrink-0" />
                          <span className="text-sm text-foreground/80">{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className={index % 2 !== 0 ? "md:order-1" : ""}>
                  <div className="relative">
                    <div className="absolute -inset-2 bg-primary/5 rounded-2xl blur-xl" />
                    <img
                      src={section.image || solution.image}
                      alt={section.title}
                      className="relative rounded-xl shadow-medium border border-border w-full"
                      loading="lazy"
                      width={1280}
                      height={800}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTASection />
      <Footer />
    </div>
  );
};

export default SolutionPage;
