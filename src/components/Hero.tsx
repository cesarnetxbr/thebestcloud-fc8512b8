import { Button } from "@/components/ui/button";
import { Shield, Clock, Lock } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

const Hero = () => {
  const scrollToTrial = () => {
    const element = document.getElementById("trial");
    element?.scrollIntoView({ behavior: "smooth" });
  };

  const handleWhatsApp = () => {
    window.open("https://wa.me/5511999999999?text=Olá! Gostaria de saber mais sobre o BestBackup Cloud", "_blank");
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background with overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroBg}
          alt="Cloud backup infrastructure"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-hero opacity-90" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-32 relative z-10">
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white leading-tight">
            Seus Dados Seguros.<br />
            <span className="text-accent">Sempre Protegidos.</span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 text-white/90 leading-relaxed max-w-3xl mx-auto">
            O <strong>BestBackup Cloud</strong> da The Best Cloud garante backup automático, 
            criptografado e recuperação em 1 clique. Proteja sua empresa contra perda de dados, 
            ransomware e tempo de parada.
          </p>

          {/* Trust badges */}
          <div className="flex flex-wrap justify-center gap-6 mb-12">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
              <Shield className="h-5 w-5 text-accent" />
              <span className="text-white font-medium">Criptografia AES-256</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
              <Lock className="h-5 w-5 text-accent" />
              <span className="text-white font-medium">Conformidade LGPD</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
              <Clock className="h-5 w-5 text-accent" />
              <span className="text-white font-medium">RTO Baixíssimo</span>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              variant="hero" 
              size="lg"
              onClick={scrollToTrial}
              className="text-lg px-10 py-6"
            >
              Teste 14 Dias Grátis — Sem Cartão
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={handleWhatsApp}
              className="text-lg px-10 py-6 bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20"
            >
              Falar com Especialista
            </Button>
          </div>

          {/* Portal do Cliente */}
          <div className="mt-8">
            <a
              href="/portal/login"
              className="inline-flex items-center gap-2 text-white/80 hover:text-white text-sm font-medium border border-white/20 rounded-full px-6 py-2.5 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-colors"
            >
              <Shield className="h-4 w-4" />
              Portal do Cliente — Acesse sua área
            </a>
          </div>

          <p className="mt-6 text-white/70 text-sm">
            ✓ Sem necessidade de cartão de crédito • ✓ Cancele quando quiser • ✓ Suporte 24/7
          </p>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-2">
          <div className="w-1.5 h-3 bg-white/60 rounded-full" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
