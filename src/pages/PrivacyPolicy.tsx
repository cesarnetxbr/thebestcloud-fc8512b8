import Header from "@/components/Header";
import Footer from "@/components/Footer";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl prose prose-sm">
          <h1 className="text-3xl font-bold mb-2">Política de Privacidade</h1>
          <p className="text-muted-foreground mb-8">Última atualização: {new Date().toLocaleDateString("pt-BR")}</p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3">1. Introdução</h2>
            <p className="text-foreground/80 leading-relaxed">
              A The Best Cloud ("nós", "nosso") está comprometida com a proteção dos dados pessoais de seus usuários, clientes e visitantes, em conformidade com a Lei nº 13.709/2018 (LGPD — Lei Geral de Proteção de Dados). Esta Política de Privacidade descreve como coletamos, utilizamos, armazenamos e protegemos suas informações pessoais.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3">2. Dados Pessoais que Coletamos</h2>
            <ul className="list-disc pl-6 space-y-2 text-foreground/80">
              <li><strong>Dados de identificação:</strong> nome completo, CPF/CNPJ, e-mail, telefone</li>
              <li><strong>Dados de acesso:</strong> endereço IP, tipo de navegador, páginas visitadas</li>
              <li><strong>Dados de contato comercial:</strong> empresa, cargo, informações de faturamento</li>
              <li><strong>Dados de uso do serviço:</strong> logs de atividades, preferências de configuração</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3">3. Finalidades do Tratamento</h2>
            <ul className="list-disc pl-6 space-y-2 text-foreground/80">
              <li>Prestação e melhoria dos serviços contratados</li>
              <li>Comunicação sobre atualizações, suporte técnico e novidades</li>
              <li>Cumprimento de obrigações legais e regulatórias</li>
              <li>Análise de desempenho e segurança da plataforma</li>
              <li>Emissão de faturas e gestão financeira</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3">4. Base Legal</h2>
            <p className="text-foreground/80 leading-relaxed">
              O tratamento de dados pessoais é realizado com base no consentimento do titular, execução de contrato, cumprimento de obrigação legal e legítimo interesse, conforme previsto nos artigos 7º e 11 da LGPD.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3">5. Compartilhamento de Dados</h2>
            <p className="text-foreground/80 leading-relaxed">
              Os dados podem ser compartilhados com prestadores de serviço essenciais à operação, como provedores de infraestrutura em nuvem, processadores de pagamento e ferramentas de análise. Todos os parceiros são contratualmente obrigados a cumprir a LGPD.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3">6. Retenção de Dados</h2>
            <p className="text-foreground/80 leading-relaxed">
              Os dados pessoais são mantidos enquanto necessários para a finalidade do tratamento ou conforme exigido por lei. Dados de clientes inativos são retidos por até 5 anos para fins legais e fiscais, após o que são anonimizados ou excluídos.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3">7. Direitos dos Titulares</h2>
            <p className="text-foreground/80 leading-relaxed mb-3">
              Conforme a LGPD, você tem direito a:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-foreground/80">
              <li>Confirmar a existência de tratamento de seus dados</li>
              <li>Acessar seus dados pessoais</li>
              <li>Corrigir dados incompletos ou desatualizados</li>
              <li>Solicitar anonimização, bloqueio ou eliminação</li>
              <li>Revogar o consentimento a qualquer momento</li>
              <li>Solicitar portabilidade dos dados</li>
            </ul>
            <p className="text-foreground/80 mt-3">
              Para exercer seus direitos, utilize nosso <a href="/lgpd/solicitar" className="text-primary hover:underline">formulário de solicitação</a> ou entre em contato com nosso DPO.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3">8. Segurança dos Dados</h2>
            <p className="text-foreground/80 leading-relaxed">
              Utilizamos medidas técnicas e administrativas para proteger os dados pessoais, incluindo criptografia em trânsito e em repouso, controle de acesso baseado em funções (RBAC), autenticação multifator, monitoramento de acessos e auditorias regulares.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3">9. Encarregado de Proteção de Dados (DPO)</h2>
            <div className="bg-secondary rounded-lg p-4">
              <p className="text-foreground/80"><strong>Nome:</strong> César Augusto Cavalcante Valente</p>
              <p className="text-foreground/80"><strong>E-mail:</strong> <a href="mailto:dpo@thebestcloud.com.br" className="text-primary hover:underline">dpo@thebestcloud.com.br</a></p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3">10. Cookies</h2>
            <p className="text-foreground/80 leading-relaxed">
              Utilizamos cookies para melhorar a experiência do usuário. Para mais detalhes, consulte nossa <a href="/cookies" className="text-primary hover:underline">Política de Cookies</a>.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3">11. Alterações nesta Política</h2>
            <p className="text-foreground/80 leading-relaxed">
              Esta Política de Privacidade pode ser atualizada periodicamente. Recomendamos que você revise esta página regularmente.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
