import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
const TrialForm = () => {
  const navigate = useNavigate();

  return (
    <section id="trial" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-strong border-2 border-primary/20">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-3xl font-bold mb-3">
                Teste 14 Dias Grátis — Sem Cartão
              </CardTitle>
              <CardDescription className="text-lg">
                Ative agora seu período de avaliação completo. Sem compromisso, cancele quando quiser.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button
                variant="cta"
                size="lg"
                className="w-full text-lg"
                onClick={() => navigate("/teste-gratis")}
              >
                Ativar Meu Teste Grátis
              </Button>
              <p className="text-center text-sm text-muted-foreground mt-4">
                Ao solicitar o teste, você concorda com nossa Política de Privacidade e Termos de Uso.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default TrialForm;
