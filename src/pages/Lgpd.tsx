import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Shield, Eye, Edit3, Trash2, Download, XCircle, Info, Lock, FileText, Users, AlertTriangle, CheckCircle2, Mail } from "lucide-react";

const rights = [
  { icon: Eye, title: "Acesso", desc: "Saber quais dados pessoais a empresa possui sobre você." },
  { icon: Edit3, title: "Correção", desc: "Solicitar correção de dados incompletos, inexatos ou desatualizados." },
  { icon: Trash2, title: "Exclusão", desc: "Pedir a eliminação de dados desnecessários ou tratados em desconformidade." },
  { icon: Download, title: "Portabilidade", desc: "Receber seus dados em formato estruturado e transferi-los a outro fornecedor." },
  { icon: XCircle, title: "Revogação", desc: "Retirar o consentimento dado a qualquer momento, de forma gratuita." },
  { icon: Info, title: "Informação", desc: "Conhecer com quem seus dados são compartilhados e a finalidade do uso." },
];

const principles = [
  { title: "Finalidade", desc: "Tratamento para propósitos legítimos, específicos e informados." },
  { title: "Adequação", desc: "Compatibilidade do tratamento com as finalidades informadas." },
  { title: "Necessidade", desc: "Limitação ao mínimo necessário para a finalidade." },
  { title: "Livre acesso", desc: "Garantia de consulta facilitada e gratuita aos dados." },
  { title: "Qualidade dos dados", desc: "Exatidão, clareza e atualização dos dados." },
  { title: "Transparência", desc: "Informações claras sobre o tratamento realizado." },
  { title: "Segurança", desc: "Medidas técnicas e administrativas de proteção." },
  { title: "Prevenção", desc: "Adoção de medidas para prevenir danos." },
  { title: "Não discriminação", desc: "Impossibilidade de tratamento para fins discriminatórios." },
  { title: "Responsabilização", desc: "Demonstração de medidas eficazes de cumprimento da lei." },
];

const Lgpd = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-24 pb-16">
        {/* Hero */}
        <section className="container mx-auto px-4 max-w-5xl mb-12">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Shield className="h-4 w-4" /> Lei nº 13.709/2018
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">LGPD — Lei Geral de Proteção de Dados</h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Conheça seus direitos como titular de dados pessoais e como The Best Cloud protege suas informações
              em conformidade com a legislação brasileira de proteção de dados.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg">
                <Link to="/lgpd/solicitar">
                  <FileText className="h-5 w-5 mr-2" />
                  Exercer meus Direitos
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href="mailto:dpo@thebestcloud.com.br">
                  <Mail className="h-5 w-5 mr-2" />
                  Falar com o DPO
                </a>
              </Button>
            </div>
          </div>
        </section>

        {/* O que é a LGPD */}
        <section className="container mx-auto px-4 max-w-5xl mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5 text-primary" /> O que é a LGPD?</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-3">
              <p>
                A <strong>Lei Geral de Proteção de Dados (Lei nº 13.709/2018)</strong> é a legislação brasileira que regula o
                tratamento de dados pessoais por pessoas físicas ou jurídicas, públicas ou privadas. Em vigor desde
                setembro de 2020, ela tem como objetivo proteger os direitos fundamentais de liberdade, privacidade e
                o livre desenvolvimento da personalidade da pessoa natural.
              </p>
              <p>
                A LGPD se aplica a qualquer operação de tratamento realizada por pessoa natural ou jurídica que
                envolva dados pessoais, independentemente do meio (físico ou digital), do país de sua sede ou do país
                onde estejam localizados os dados.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Seus Direitos */}
        <section className="container mx-auto px-4 max-w-5xl mb-12">
          <h2 className="text-2xl font-bold mb-2 text-center">Seus Direitos como Titular</h2>
          <p className="text-muted-foreground text-center mb-8">A LGPD garante a você 6 direitos fundamentais sobre seus dados pessoais</p>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {rights.map((r) => (
              <Card key={r.title} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                    <r.icon className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-base">{r.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">{r.desc}</CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Princípios */}
        <section className="container mx-auto px-4 max-w-5xl mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-primary" /> Princípios da LGPD</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                {principles.map((p) => (
                  <div key={p.title} className="flex gap-3">
                    <div className="mt-1 w-2 h-2 rounded-full bg-primary shrink-0" />
                    <div>
                      <p className="font-medium text-sm">{p.title}</p>
                      <p className="text-xs text-muted-foreground">{p.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Bases Legais e Dados Sensíveis */}
        <section className="container mx-auto px-4 max-w-5xl mb-12 grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-primary" /> Bases Legais</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>O tratamento de dados pessoais só pode ocorrer com base em uma das hipóteses legais previstas:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Consentimento do titular</li>
                <li>Cumprimento de obrigação legal</li>
                <li>Execução de contrato</li>
                <li>Exercício regular de direitos</li>
                <li>Proteção da vida</li>
                <li>Tutela da saúde</li>
                <li>Legítimo interesse</li>
                <li>Proteção do crédito</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-destructive" /> Dados Sensíveis</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>São considerados sensíveis e exigem proteção reforçada os dados sobre:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Origem racial ou étnica</li>
                <li>Convicção religiosa</li>
                <li>Opinião política</li>
                <li>Filiação a sindicato ou organização</li>
                <li>Dados de saúde ou vida sexual</li>
                <li>Dados genéticos ou biométricos</li>
              </ul>
            </CardContent>
          </Card>
        </section>

        {/* Como protegemos */}
        <section className="container mx-auto px-4 max-w-5xl mb-12">
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Lock className="h-5 w-5 text-primary" /> Como The Best Cloud Protege seus Dados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { t: "Criptografia em trânsito e repouso", d: "Todos os dados trafegam via TLS e são armazenados criptografados." },
                  { t: "Controle de acesso por papéis", d: "Cada colaborador acessa apenas o necessário para sua função." },
                  { t: "Auditoria e logs", d: "Registramos operações sensíveis para rastreabilidade." },
                  { t: "Backups regulares", d: "Cópias de segurança protegidas e testadas periodicamente." },
                  { t: "Treinamento da equipe", d: "Capacitação contínua em segurança e privacidade." },
                  { t: "Retenção mínima", d: "Mantemos dados apenas pelo tempo necessário à finalidade." },
                ].map((item) => (
                  <div key={item.t} className="flex gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">{item.t}</p>
                      <p className="text-xs text-muted-foreground">{item.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* DPO */}
        <section className="container mx-auto px-4 max-w-5xl mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-primary" /> Encarregado de Dados (DPO)</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p className="text-muted-foreground">
                O Encarregado pelo Tratamento de Dados Pessoais (DPO — Data Protection Officer) é a pessoa
                responsável por receber comunicações dos titulares e da Autoridade Nacional de Proteção de Dados (ANPD).
              </p>
              <div className="bg-muted/50 rounded-lg p-4 mt-3">
                <p><strong>Nome:</strong> César Augusto Cavalcante Valente</p>
                <p><strong>E-mail:</strong> <a href="mailto:dpo@thebestcloud.com.br" className="text-primary hover:underline">dpo@thebestcloud.com.br</a></p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* FAQ */}
        <section className="container mx-auto px-4 max-w-5xl mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">Perguntas Frequentes</h2>
          <Accordion type="single" collapsible className="bg-card border rounded-lg px-4">
            <AccordionItem value="q1">
              <AccordionTrigger>Quanto tempo a empresa tem para responder uma solicitação?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                A LGPD estabelece o prazo de até <strong>15 dias</strong> a contar da data do requerimento do titular para
                a resposta às solicitações.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="q2">
              <AccordionTrigger>Preciso pagar para exercer meus direitos?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Não. Todas as solicitações relacionadas aos seus direitos como titular de dados são <strong>gratuitas</strong>.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="q3">
              <AccordionTrigger>Posso revogar meu consentimento depois de dado?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Sim, a qualquer momento e de forma gratuita. Basta utilizar nosso formulário de solicitação ou
                entrar em contato com o DPO.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="q4">
              <AccordionTrigger>O que acontece se a empresa não cumprir a LGPD?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                A ANPD pode aplicar sanções como advertência, multa de até 2% do faturamento (limitada a R$ 50 milhões
                por infração), publicização da infração, bloqueio ou eliminação dos dados pessoais.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="q5">
              <AccordionTrigger>Como faço para denunciar um incidente de vazamento?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Entre em contato imediatamente com nosso DPO pelo e-mail <a href="mailto:dpo@thebestcloud.com.br" className="text-primary hover:underline">dpo@thebestcloud.com.br</a>.
                Investigamos e, conforme o caso, comunicamos à ANPD e aos titulares afetados.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="q6">
              <AccordionTrigger>Funcionários também são protegidos pela LGPD?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Sim. A LGPD protege qualquer pessoa natural identificada ou identificável, incluindo colaboradores,
                clientes, fornecedores e parceiros.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>

        {/* CTA Final */}
        <section className="container mx-auto px-4 max-w-5xl">
          <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground border-0">
            <CardContent className="p-8 text-center">
              <Shield className="h-12 w-12 mx-auto mb-4 opacity-90" />
              <h3 className="text-2xl font-bold mb-2">Pronto para exercer seus direitos?</h3>
              <p className="opacity-90 mb-6 max-w-2xl mx-auto">
                Use nosso formulário online seguro para solicitar acesso, correção, exclusão, portabilidade,
                revogação de consentimento ou informações sobre o tratamento de seus dados.
              </p>
              <Button asChild size="lg" variant="secondary">
                <Link to="/lgpd/solicitar">
                  <FileText className="h-5 w-5 mr-2" />
                  Abrir Solicitação de Direitos
                </Link>
              </Button>
            </CardContent>
          </Card>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Lgpd;
