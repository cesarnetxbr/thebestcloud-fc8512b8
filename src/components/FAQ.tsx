import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Como é o modelo comercial da Revenda?",
    answer: "Oferecemos um modelo comercial simplificado, sem contrato de fidelidade. O revendedor tem total liberdade para decidir o preço cobrado aos seus clientes pelos serviços.",
  },
  {
    question: "Receberei nota fiscal?",
    answer: "Sim. Todos os meses é gerada uma nota fiscal com o valor da mensalidade assim que seu pagamento for recebido. Este processo é automático.",
  },
  {
    question: "Os preços variam com o dólar?",
    answer: "Sim. Os valores cobrados variam de acordo com o dólar, dentro de faixas de preço pré-definidas com antecedência, dando previsibilidade ao seu negócio.",
  },
  {
    question: "Qual é a forma de pagamento?",
    answer: "O pagamento pode ser feito por meio de cartão de crédito, boleto bancário e PIX para facilitar sua rotina.",
  },
  {
    question: "Como é o suporte para revendedores?",
    answer: "Além de suporte e atendimento 100% em português, os revendedores contam com materiais exclusivos e treinamentos técnicos e comerciais para aprimorar sua estratégia de vendas.",
  },
  {
    question: "Tenho direito a ferramentas gratuitas?",
    answer: "Sim! Os revendedores contam com ferramentas gratuitas como Remote Desktop, Inventário de Hardware e Controle de Dispositivos integradas à plataforma.",
  },
];

const FAQ = () => {
  return (
    <section id="faq" className="py-24 bg-secondary">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              Dúvidas frequentes
            </h2>
            <p className="text-lg text-muted-foreground">
              Encontre respostas para as perguntas mais comuns.
            </p>
          </div>

          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border border-border rounded-lg bg-background px-6 shadow-soft"
              >
                <AccordionTrigger className="text-left font-medium text-foreground hover:no-underline py-5">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
