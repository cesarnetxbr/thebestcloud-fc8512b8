import { Button } from "@/components/ui/button";
import dashboardPreview from "@/assets/dashboard-preview.jpg";

const Hero = () => {
  const handleContact = () => {
    window.open("https://wa.me/5511999999999?text=Olá! Gostaria de saber mais sobre os serviços da The Best Cloud", "_blank");
  };

  const scrollToSolutions = () => {
    document.getElementById("solucoes")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative pt-20 md:pt-24 overflow-hidden bg-gradient-to-br from-primary via-primary to-primary/90">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left - Text */}
          <div className="animate-fade-in">
            <span className="inline-block bg-primary-foreground/10 text-primary-foreground text-sm font-medium px-4 py-1.5 rounded-full border border-primary-foreground/20 mb-6">
              Cyber Protect Cloud
            </span>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground leading-tight mb-6">
              Segurança para seus clientes.{" "}
              <span className="text-accent">Lucro para o seu negócio.</span>
            </h1>

            <p className="text-lg text-primary-foreground/80 leading-relaxed mb-8 max-w-lg">
              Ciberproteção impulsionada por inteligência artificial, projetada para MSPs que buscam produtividade e escala, unificando operações, cibersegurança e proteção de dados em uma plataforma única.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                variant="cta"
                size="lg"
                onClick={handleContact}
                className="text-base px-8"
              >
                Seja um revendedor
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={scrollToSolutions}
                className="text-base px-8 bg-primary-foreground/5 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
              >
                Nossas soluções
              </Button>
            </div>
          </div>

          {/* Right - Dashboard Image */}
          <div className="animate-fade-in hidden lg:block">
            <div className="relative">
              <div className="absolute -inset-4 bg-accent/20 rounded-2xl blur-2xl" />
              <img
                src={dashboardPreview}
                alt="Plataforma de Cyber Proteção"
                className="relative rounded-xl shadow-strong border border-primary-foreground/10 w-full"
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
  );
};

export default Hero;
