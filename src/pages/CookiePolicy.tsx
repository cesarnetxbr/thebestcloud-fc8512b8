import Header from "@/components/Header";
import Footer from "@/components/Footer";

const CookiePolicy = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl prose prose-sm">
          <h1 className="text-3xl font-bold mb-2">Política de Cookies</h1>
          <p className="text-muted-foreground mb-8">Última atualização: {new Date().toLocaleDateString("pt-BR")}</p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3">1. O que são Cookies?</h2>
            <p className="text-foreground/80 leading-relaxed">
              Cookies são pequenos arquivos de texto armazenados no seu dispositivo quando você visita nosso site. Eles nos ajudam a oferecer uma experiência melhor, lembrar suas preferências e entender como o site é utilizado.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3">2. Tipos de Cookies que Utilizamos</h2>
            <div className="space-y-4">
              <div className="border border-border rounded-lg p-4">
                <h3 className="font-semibold text-sm mb-1">🔒 Cookies Essenciais</h3>
                <p className="text-foreground/70 text-sm">Necessários para o funcionamento do site. Não podem ser desativados. Incluem cookies de sessão e autenticação.</p>
              </div>
              <div className="border border-border rounded-lg p-4">
                <h3 className="font-semibold text-sm mb-1">📊 Cookies de Análise</h3>
                <p className="text-foreground/70 text-sm">Ajudam a entender como os visitantes interagem com o site. Utilizamos ferramentas como Google Analytics para coletar dados anônimos de navegação.</p>
              </div>
              <div className="border border-border rounded-lg p-4">
                <h3 className="font-semibold text-sm mb-1">📢 Cookies de Marketing</h3>
                <p className="text-foreground/70 text-sm">Utilizados para exibir conteúdo relevante. Podem incluir pixels de rastreamento de terceiros como Facebook Pixel.</p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3">3. Ferramentas de Terceiros</h2>
            <ul className="list-disc pl-6 space-y-2 text-foreground/80">
              <li><strong>Google Analytics:</strong> análise de tráfego e comportamento de navegação</li>
              <li><strong>Facebook Pixel:</strong> mensuração de campanhas publicitárias (quando ativo)</li>
              <li><strong>Hotjar:</strong> análise de usabilidade e mapas de calor (quando ativo)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3">4. Como Gerenciar seus Cookies</h2>
            <p className="text-foreground/80 leading-relaxed">
              Você pode gerenciar suas preferências de cookies a qualquer momento através do banner de consentimento exibido no site ou nas configurações do seu navegador. A desativação de cookies não essenciais pode afetar a funcionalidade de algumas áreas do site.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3">5. Período de Retenção</h2>
            <p className="text-foreground/80 leading-relaxed">
              Cookies de sessão são excluídos quando você fecha o navegador. Cookies persistentes podem permanecer por até 12 meses, dependendo da sua finalidade.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3">6. Mais Informações</h2>
            <p className="text-foreground/80 leading-relaxed">
              Para mais detalhes sobre como tratamos seus dados pessoais, consulte nossa <a href="/privacidade" className="text-primary hover:underline">Política de Privacidade</a>. Para dúvidas, entre em contato com nosso DPO: <a href="mailto:dpo@thebestcloud.com.br" className="text-primary hover:underline">dpo@thebestcloud.com.br</a>.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CookiePolicy;
