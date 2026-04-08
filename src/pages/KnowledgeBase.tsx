import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search, Shield, HardDrive, Settings, BookOpen, ExternalLink,
  FileText, Video, HelpCircle, AlertTriangle, Monitor, Mail,
  Lock, Database, Cloud, Server, Laptop, RefreshCw
} from "lucide-react";
import { useState, useMemo } from "react";

interface KBArticle {
  title: string;
  description: string;
  category: string;
  subcategory: string;
  type: "guia" | "video" | "faq" | "troubleshooting";
  externalUrl?: string;
  tags: string[];
}

const articles: KBArticle[] = [
  // === SEGURANÇA ===
  {
    title: "Detecção e Resposta Estendida (XDR) - Guia Completo",
    description: "Como configurar e gerenciar a solução XDR para detecção avançada de ameaças em múltiplos vetores de ataque incluindo endpoints, email e rede.",
    category: "Segurança",
    subcategory: "XDR",
    type: "guia",
    externalUrl: "https://www.acronis.com/support/documentation/CyberProtectionService/#44130.html",
    tags: ["xdr", "detecção", "ameaças", "resposta"],
  },
  {
    title: "Detecção e Resposta para Endpoints (EDR)",
    description: "Guia de implementação da solução EDR para monitoramento contínuo, detecção de comportamentos suspeitos e resposta automática a incidentes em endpoints.",
    category: "Segurança",
    subcategory: "EDR",
    type: "guia",
    externalUrl: "https://www.acronis.com/support/documentation/CyberProtectionService/#44130.html",
    tags: ["edr", "endpoint", "monitoramento", "incidentes"],
  },
  {
    title: "Serviços de Detecção e Resposta Gerenciadas (MDR)",
    description: "Como funciona o serviço gerenciado de detecção e resposta, com equipe especializada monitorando 24/7 e respondendo a ameaças em tempo real.",
    category: "Segurança",
    subcategory: "MDR",
    type: "guia",
    externalUrl: "https://www.acronis.com/support/documentation/CyberProtectionService/#44130.html",
    tags: ["mdr", "gerenciado", "soc", "monitoramento 24/7"],
  },
  {
    title: "Prevenção de Perda de Dados (DLP)",
    description: "Configuração e gerenciamento de políticas DLP para prevenir vazamento de dados sensíveis através de email, dispositivos USB, impressão e compartilhamento.",
    category: "Segurança",
    subcategory: "DLP",
    type: "guia",
    externalUrl: "https://www.acronis.com/support/documentation/CyberProtectionService/#44130.html",
    tags: ["dlp", "vazamento", "dados sensíveis", "políticas"],
  },
  {
    title: "Security Posture Management para Microsoft 365",
    description: "Avaliação e melhoria contínua da postura de segurança do ambiente Microsoft 365, identificando configurações incorretas e vulnerabilidades.",
    category: "Segurança",
    subcategory: "Postura de Segurança",
    type: "guia",
    externalUrl: "https://dl.managed-protection.com/u/baas/help/wp/M365SecurityPosture/en-US/index.html",
    tags: ["microsoft 365", "postura", "configuração", "vulnerabilidades"],
  },
  {
    title: "Segurança de Email",
    description: "Proteção avançada contra phishing, spam, malware e ataques BEC (Business Email Compromise) para caixas de email corporativas.",
    category: "Segurança",
    subcategory: "Email Security",
    type: "guia",
    externalUrl: "https://www.acronis.com/support/documentation/CyberProtectionService/#44130.html",
    tags: ["email", "phishing", "spam", "malware", "bec"],
  },
  {
    title: "Arquivamento de Email para Microsoft 365",
    description: "Como configurar o arquivamento automático de emails do Microsoft 365 para conformidade regulatória, eDiscovery e retenção a longo prazo.",
    category: "Segurança",
    subcategory: "Email Archiving",
    type: "guia",
    externalUrl: "https://www.acronis.com/support/documentation/CyberProtectionService/#44130.html",
    tags: ["email", "arquivamento", "microsoft 365", "conformidade"],
  },
  {
    title: "Security Awareness Training (SAT)",
    description: "Programa de treinamento de conscientização em segurança para colaboradores, com simulações de phishing e cursos interativos.",
    category: "Segurança",
    subcategory: "SAT",
    type: "guia",
    externalUrl: "https://www.acronis.com/support/documentation/CyberProtectionService/#44130.html",
    tags: ["treinamento", "conscientização", "phishing", "simulação"],
  },
  {
    title: "Como identificar e responder a um ataque de ransomware",
    description: "Passo a passo para identificar sinais de um ataque de ransomware, isolar sistemas afetados e iniciar o processo de recuperação.",
    category: "Segurança",
    subcategory: "Troubleshooting",
    type: "troubleshooting",
    tags: ["ransomware", "ataque", "recuperação", "incidente"],
  },
  {
    title: "Melhores práticas de segurança para endpoints",
    description: "Checklist completo de configurações recomendadas para proteger endpoints corporativos contra ameaças modernas.",
    category: "Segurança",
    subcategory: "Boas Práticas",
    type: "guia",
    tags: ["endpoints", "boas práticas", "configuração", "proteção"],
  },

  // === PROTEÇÃO ===
  {
    title: "Backup - Guia do Administrador",
    description: "Guia completo de configuração e gerenciamento de backup para servidores, estações de trabalho e dispositivos móveis com agendamento e retenção.",
    category: "Proteção",
    subcategory: "Backup",
    type: "guia",
    externalUrl: "https://www.acronis.com/support/documentation/CyberProtectionService/#44130.html",
    tags: ["backup", "agendamento", "retenção", "servidor"],
  },
  {
    title: "Backup para Microsoft 365",
    description: "Como proteger dados do Exchange Online, OneDrive, SharePoint e Teams com backup automatizado e recuperação granular.",
    category: "Proteção",
    subcategory: "Backup M365",
    type: "guia",
    externalUrl: "https://www.acronis.com/support/documentation/CyberProtectionService/#44130.html",
    tags: ["microsoft 365", "exchange", "onedrive", "sharepoint", "teams"],
  },
  {
    title: "Disaster Recovery - Guia de Início Rápido",
    description: "Configuração rápida de planos de disaster recovery com failover automático para a nuvem e RPO/RTO mínimos.",
    category: "Proteção",
    subcategory: "Disaster Recovery",
    type: "guia",
    externalUrl: "https://www.acronis.com/support/documentation/DisasterRecovery/#43224.html",
    tags: ["disaster recovery", "failover", "rpo", "rto", "continuidade"],
  },
  {
    title: "Disaster Recovery Hybrid Cloud",
    description: "Implementação de DR híbrido combinando infraestrutura local e nuvem para máxima resiliência e flexibilidade.",
    category: "Proteção",
    subcategory: "Disaster Recovery",
    type: "guia",
    externalUrl: "https://www.acronis.com/support/documentation/DisasterRecoveryHybridCloud/",
    tags: ["disaster recovery", "hybrid", "nuvem", "local"],
  },
  {
    title: "Direct Backup to Public Cloud (AWS, Azure, Google)",
    description: "Como configurar backup direto para nuvem pública (AWS S3, Azure Blob, Google Cloud Storage) com deduplicação e criptografia.",
    category: "Proteção",
    subcategory: "Backup Nuvem Pública",
    type: "guia",
    tags: ["backup", "aws", "azure", "google cloud", "nuvem pública"],
  },
  {
    title: "Como restaurar arquivos de um backup",
    description: "Procedimentos para restauração granular de arquivos, pastas, bancos de dados e máquinas virtuais completas a partir de backups.",
    category: "Proteção",
    subcategory: "Restauração",
    type: "guia",
    tags: ["restauração", "recuperação", "arquivos", "granular"],
  },
  {
    title: "Erros comuns de backup e como resolver",
    description: "Diagnóstico e resolução dos erros mais frequentes durante operações de backup, incluindo falhas de conexão, espaço insuficiente e timeouts.",
    category: "Proteção",
    subcategory: "Troubleshooting",
    type: "troubleshooting",
    tags: ["erros", "backup", "diagnóstico", "resolução"],
  },
  {
    title: "Teste de recuperação de desastres - Guia prático",
    description: "Como planejar e executar testes periódicos de DR para garantir que seus planos de recuperação funcionam corretamente.",
    category: "Proteção",
    subcategory: "Disaster Recovery",
    type: "guia",
    tags: ["teste", "dr", "recuperação", "validação"],
  },

  // === OPERAÇÃO ===
  {
    title: "RMM - Monitoramento e Gerenciamento Remoto",
    description: "Guia completo para configuração do RMM: monitoramento proativo, alertas, automação de patches e scripts remotos para gerenciar a infraestrutura.",
    category: "Operação",
    subcategory: "RMM",
    type: "guia",
    externalUrl: "https://www.acronis.com/support/documentation/CyberProtectionService/#44130.html",
    tags: ["rmm", "monitoramento", "patches", "automação", "remoto"],
  },
  {
    title: "PSA - Automação de Serviços Profissionais",
    description: "Como utilizar o PSA para gerenciamento de tickets, contratos SLA, faturamento e acompanhamento de tempo para equipes de suporte.",
    category: "Operação",
    subcategory: "PSA",
    type: "guia",
    externalUrl: "https://www.acronis.com/support/documentation/CyberProtectionService/#44130.html",
    tags: ["psa", "tickets", "sla", "faturamento", "suporte"],
  },
  {
    title: "Console de Gerenciamento Cyber Protect",
    description: "Visão geral do console de gerenciamento centralizado para administrar todos os serviços de proteção, segurança e operação.",
    category: "Operação",
    subcategory: "Console",
    type: "guia",
    externalUrl: "https://www.acronis.com/support/documentation/AcronisCyberCloud/",
    tags: ["console", "gerenciamento", "centralizado", "administração"],
  },
  {
    title: "Como instalar o agente de proteção",
    description: "Procedimento passo a passo para download, instalação e registro do agente de proteção em Windows, macOS e Linux.",
    category: "Operação",
    subcategory: "Instalação",
    type: "guia",
    tags: ["agente", "instalação", "windows", "macos", "linux"],
  },
  {
    title: "Gerenciamento de patches e atualizações",
    description: "Como configurar e gerenciar a distribuição automatizada de patches do sistema operacional e aplicativos de terceiros.",
    category: "Operação",
    subcategory: "Patches",
    type: "guia",
    tags: ["patches", "atualizações", "automação", "vulnerabilidades"],
  },
  {
    title: "Automação de tarefas com scripts",
    description: "Como criar e agendar scripts personalizados para automatizar tarefas repetitivas de manutenção e configuração de sistemas.",
    category: "Operação",
    subcategory: "Automação",
    type: "guia",
    tags: ["scripts", "automação", "agendamento", "manutenção"],
  },

  // === FAQ ===
  {
    title: "Quais sistemas operacionais são suportados?",
    description: "Lista completa de sistemas operacionais compatíveis: Windows Server 2012+, Windows 10/11, macOS 10.15+, Ubuntu 18.04+, RHEL 7+, entre outros.",
    category: "Segurança",
    subcategory: "FAQ",
    type: "faq",
    tags: ["compatibilidade", "sistemas operacionais", "requisitos"],
  },
  {
    title: "Qual a diferença entre backup completo, incremental e diferencial?",
    description: "Explicação detalhada dos tipos de backup, quando usar cada um e o impacto no espaço de armazenamento e tempo de recuperação.",
    category: "Proteção",
    subcategory: "FAQ",
    type: "faq",
    tags: ["backup", "incremental", "diferencial", "completo"],
  },
  {
    title: "Como funciona a criptografia de dados?",
    description: "Explicação sobre os métodos de criptografia AES-256 utilizados para proteger dados em trânsito e em repouso nos backups.",
    category: "Proteção",
    subcategory: "FAQ",
    type: "faq",
    tags: ["criptografia", "aes-256", "segurança", "dados"],
  },
  {
    title: "Qual o consumo de banda durante o backup?",
    description: "Informações sobre controle de largura de banda, deduplicação e compressão para otimizar o uso da rede durante backups.",
    category: "Proteção",
    subcategory: "FAQ",
    type: "faq",
    tags: ["banda", "rede", "deduplicação", "compressão"],
  },
  {
    title: "Como abrir um chamado de suporte técnico?",
    description: "Passo a passo para abrir chamados no portal do cliente, incluindo níveis de prioridade, SLA e informações necessárias.",
    category: "Operação",
    subcategory: "FAQ",
    type: "faq",
    tags: ["chamado", "suporte", "sla", "prioridade"],
  },
];

const categories = [
  { id: "todos", label: "Todos", icon: BookOpen, color: "text-primary" },
  { id: "Segurança", label: "Segurança", icon: Shield, color: "text-red-500" },
  { id: "Proteção", label: "Proteção", icon: HardDrive, color: "text-blue-500" },
  { id: "Operação", label: "Operação", icon: Settings, color: "text-green-500" },
];

const typeIcons: Record<string, typeof BookOpen> = {
  guia: FileText,
  video: Video,
  faq: HelpCircle,
  troubleshooting: AlertTriangle,
};

const typeLabels: Record<string, string> = {
  guia: "Guia",
  video: "Vídeo",
  faq: "FAQ",
  troubleshooting: "Solução de Problemas",
};

const typeBadgeVariant: Record<string, string> = {
  guia: "bg-blue-100 text-blue-800",
  video: "bg-purple-100 text-purple-800",
  faq: "bg-amber-100 text-amber-800",
  troubleshooting: "bg-red-100 text-red-800",
};

const KnowledgeBase = () => {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("todos");

  const filtered = useMemo(() => {
    return articles.filter((a) => {
      const matchCat = activeCategory === "todos" || a.category === activeCategory;
      if (!matchCat) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        a.title.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.tags.some((t) => t.includes(q)) ||
        a.subcategory.toLowerCase().includes(q)
      );
    });
  }, [search, activeCategory]);

  const stats = useMemo(() => ({
    total: articles.length,
    seguranca: articles.filter((a) => a.category === "Segurança").length,
    protecao: articles.filter((a) => a.category === "Proteção").length,
    operacao: articles.filter((a) => a.category === "Operação").length,
  }), []);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="pt-24 pb-12 bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Base de Conhecimento
          </h1>
          <p className="text-foreground/70 max-w-2xl mx-auto mb-8">
            Documentação técnica, guias práticos e respostas para as dúvidas mais comuns sobre nossas soluções de ciberproteção.
          </p>

          {/* Search */}
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Pesquisar artigos, guias, soluções..."
              className="pl-10 h-12 text-base"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-6 mt-8">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Artigos</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-500">{stats.seguranca}</p>
              <p className="text-sm text-muted-foreground">Segurança</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-500">{stats.protecao}</p>
              <p className="text-sm text-muted-foreground">Proteção</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-500">{stats.operacao}</p>
              <p className="text-sm text-muted-foreground">Operação</p>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="container mx-auto px-4 py-10">
        <Tabs defaultValue="todos" onValueChange={setActiveCategory}>
          <TabsList className="mb-8 flex flex-wrap h-auto gap-2">
            {categories.map((c) => {
              const Icon = c.icon;
              return (
                <TabsTrigger key={c.id} value={c.id} className="flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${c.color}`} />
                  {c.label}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {categories.map((c) => (
            <TabsContent key={c.id} value={c.id}>
              {filtered.length === 0 ? (
                <div className="text-center py-16">
                  <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg text-muted-foreground">Nenhum artigo encontrado.</p>
                  <p className="text-sm text-muted-foreground">Tente outros termos de pesquisa.</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filtered.map((article, i) => {
                    const TypeIcon = typeIcons[article.type];
                    return (
                      <Card key={i} className="group hover:shadow-lg transition-shadow border-border/50">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between gap-2">
                            <Badge variant="outline" className={`text-xs ${typeBadgeVariant[article.type]}`}>
                              <TypeIcon className="h-3 w-3 mr-1" />
                              {typeLabels[article.type]}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {article.subcategory}
                            </Badge>
                          </div>
                          <CardTitle className="text-base leading-snug mt-2 group-hover:text-primary transition-colors">
                            {article.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                            {article.description}
                          </p>
                          <div className="flex flex-wrap gap-1 mb-3">
                            {article.tags.slice(0, 3).map((tag) => (
                              <Badge key={tag} variant="outline" className="text-[10px] text-muted-foreground">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          {article.externalUrl && (
                            <a
                              href={article.externalUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                            >
                              Ver documentação oficial
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>

        {/* Quick Links */}
        <div className="mt-16 border-t border-border pt-10">
          <h2 className="text-xl font-semibold mb-6 text-foreground">Links Úteis</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <a
              href="https://www.acronis.com/support/documentation/CyberProtectionService/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-colors"
            >
              <BookOpen className="h-5 w-5 text-primary shrink-0" />
              <div>
                <p className="text-sm font-medium">Guia Cyber Protect Cloud</p>
                <p className="text-xs text-muted-foreground">Documentação completa</p>
              </div>
            </a>
            <a
              href="https://www.acronis.com/support/documentation/AcronisCyberCloud/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-colors"
            >
              <Monitor className="h-5 w-5 text-primary shrink-0" />
              <div>
                <p className="text-sm font-medium">Console de Gerenciamento</p>
                <p className="text-xs text-muted-foreground">Guia do administrador</p>
              </div>
            </a>
            <a
              href="https://www.acronis.com/support/documentation/DisasterRecovery/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-colors"
            >
              <RefreshCw className="h-5 w-5 text-primary shrink-0" />
              <div>
                <p className="text-sm font-medium">Disaster Recovery</p>
                <p className="text-xs text-muted-foreground">Guia de DR na nuvem</p>
              </div>
            </a>
            <a
              href="https://kb.acronis.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-colors"
            >
              <HelpCircle className="h-5 w-5 text-primary shrink-0" />
              <div>
                <p className="text-sm font-medium">Knowledge Base Acronis</p>
                <p className="text-xs text-muted-foreground">Base oficial de suporte</p>
              </div>
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default KnowledgeBase;
