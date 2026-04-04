import { Button } from "@/components/ui/button";

const CTASection = () => {
  const handleContact = () => {
    window.open("https://wa.me/5511999999999?text=Olá! Gostaria de saber mais sobre os serviços da The Best Cloud para minha empresa", "_blank");
  };

  const scrollToSolutions = () => {
    document.getElementById("solucoes")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="contato" className="py-24 bg-primary">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
          Proteja sua empresa com a The Best Cloud
        </h2>
        <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto mb-8">
          Fale com nossos consultores e descubra a solução ideal para proteger os dados e a operação da sua empresa.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="cta" size="lg" onClick={handleContact} className="text-base px-8">
            Fale com um Consultor
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={scrollToSolutions}
            className="text-base px-8 bg-primary-foreground/5 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
          >
            Conheça as Soluções
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
