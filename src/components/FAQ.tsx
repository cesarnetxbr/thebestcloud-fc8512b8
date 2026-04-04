import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Como funciona a contratação dos serviços?",
    answer: "A contratação é simples e sem burocracia. Você escolhe os serviços que sua empresa precisa, e nosso time configura tudo para você. Não há fidelidade contratual — você pode ajustar ou cancelar quando precisar.",
  },
  {
    question: "Receberei nota fiscal?",
    answer: "Sim. Todos os meses é gerada uma nota fiscal com o valor da mensalidade assim que seu pagamento for recebido. Este processo é automático.",
  },
  {
    question: "Minha empresa precisa de equipe de TI para usar a plataforma?",
    answer: "Não necessariamente. Nosso time cuida da implantação e do monitoramento. Caso sua empresa tenha uma equipe de TI, ela terá acesso a todas as ferramentas de gerenciamento pela plataforma.",
  },
  {
    question: "Qual é a forma de pagamento?",
    answer: "O pagamento pode ser feito por meio de cartão de crédito, boleto bancário e PIX para facilitar sua rotina.",
  },
  {
    question: "Como funciona o suporte?",
    answer: "Contamos com suporte técnico 100% em português, disponível por chat, e-mail e telefone. Nossa equipe é especializada em cibersegurança e proteção de dados.",
  },
  {
    question: "Quais tipos de empresa podem usar os serviços?",
    answer: "Nossos serviços atendem empresas de todos os portes — desde pequenas empresas até grandes corporações. As soluções são escaláveis e adaptáveis às necessidades de cada negócio.",
  },
  {
    question: "Meus dados ficam seguros na nuvem?",
    answer: "Sim. Utilizamos criptografia de ponta a ponta, datacenters com certificação internacional e armazenamento geo-redundante para garantir a máxima segurança dos seus dados.",
  },
  {
    question: "Posso testar antes de contratar?",
    answer: "Sim! Oferecemos um período de avaliação para que você conheça a plataforma e veja na prática como ela protege sua empresa. Entre em contato para saber mais.",
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
