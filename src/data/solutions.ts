export interface SolutionData {
  slug: string;
  title: string;
  subtitle: string;
  category: "seguranca" | "protecao" | "operacoes";
  heroDescription: string;
  sections: Array<{
    title: string;
    description: string;
    bullets?: string[];
  }>;
}

export const solutions: SolutionData[] = [
  {
    slug: "xdr",
    title: "Extended Detection and Response (XDR)",
    subtitle: "Detecção e resposta estendidas",
    category: "seguranca",
    heroDescription: "Modernize sua pilha de serviços de segurança com um XDR projetado para provedores de serviços.",
    sections: [
      {
        title: "Integração nativa",
        description: "Com XDR, os MSPs obtêm proteção completa e integrada de forma nativa, desenvolvida para prevenir, detectar, analisar, responder e recuperar incidentes nas superfícies de ataque mais vulneráveis.",
        bullets: [
          "Previna riscos de forma proativa com conformidade NIST",
          "Gerencie e dimensione com uma única plataforma e agente",
          "Atenda requisitos de conformidade com DLP integrado",
        ],
      },
      {
        title: "Cibersegurança orientada por IA",
        description: "Proteja endpoints com visibilidade nas superfícies de ataque mais vulneráveis.",
        bullets: [
          "Visibilidade em e-mail, identidade e apps Microsoft 365",
          "Análise e resposta em minutos com IA",
          "Automação de ações de remediação",
        ],
      },
      {
        title: "Proteção completa com NIST",
        description: "Governança, Identificação, Proteção, Detecção, Resposta e Recuperação em uma plataforma integrada.",
      },
    ],
  },
  {
    slug: "edr",
    title: "Detecção e Resposta para Endpoints (EDR)",
    subtitle: "Endpoint Detection and Response",
    category: "seguranca",
    heroDescription: "Detecção e Resposta de Endpoint guiada por inteligência artificial para MSPs.",
    sections: [
      {
        title: "Detecção avançada de ameaças",
        description: "Use tecnologias de proteção cibernética para detectar e responder a ameaças avançadas em endpoints, com análise orientada por IA e resposta com um clique.",
        bullets: [
          "Análise orientada por inteligência artificial",
          "Resposta a incidentes com um clique",
          "Precificação modular e flexível",
        ],
      },
      {
        title: "Visibilidade completa",
        description: "Monitore continuamente os endpoints para identificar comportamentos suspeitos e prevenir ataques antes que causem danos.",
      },
    ],
  },
  {
    slug: "mdr",
    title: "Serviços de Detecção e Resposta Gerenciadas (MDR)",
    subtitle: "Managed Detection and Response",
    category: "seguranca",
    heroDescription: "Um MDR projetado para MSPs oferecerem uma resiliência empresarial incomparável.",
    sections: [
      {
        title: "Resiliência empresarial",
        description: "Serviço gerenciado de detecção e resposta que permite aos MSPs oferecer segurança de nível empresarial sem a complexidade de manter um SOC interno.",
        bullets: [
          "Monitoramento 24/7 por especialistas em segurança",
          "Resposta rápida a incidentes",
          "Relatórios detalhados de segurança",
        ],
      },
    ],
  },
  {
    slug: "dlp",
    title: "Prevenção de Perda de Dados (DLP)",
    subtitle: "Data Loss Prevention",
    category: "seguranca",
    heroDescription: "Uma solução de DLP desenvolvida para reduzir a complexidade do gerenciamento.",
    sections: [
      {
        title: "Proteção de dados sensíveis",
        description: "Controle e proteja dados confidenciais em endpoints, prevenindo vazamentos e garantindo conformidade regulatória.",
        bullets: [
          "Monitoramento de transferências de dados",
          "Políticas granulares de controle de dados",
          "Conformidade com LGPD e GDPR",
        ],
      },
    ],
  },
  {
    slug: "security-posture",
    title: "Security Posture Management",
    subtitle: "Gerenciamento de Postura de Segurança",
    category: "seguranca",
    heroDescription: "Entrega eficiente de serviços de gerenciamento de postura de segurança do Microsoft 365.",
    sections: [
      {
        title: "Postura de segurança do Microsoft 365",
        description: "Avalie e melhore continuamente a postura de segurança dos ambientes Microsoft 365 de seus clientes.",
        bullets: [
          "Avaliações automatizadas de segurança",
          "Recomendações baseadas em boas práticas",
          "Monitoramento contínuo de conformidade",
        ],
      },
    ],
  },
  {
    slug: "email-security",
    title: "Email Security",
    subtitle: "Segurança de E-mail",
    category: "seguranca",
    heroDescription: "Intercepte ataques de e-mail modernos em questão de segundos.",
    sections: [
      {
        title: "Proteção contra ameaças por e-mail",
        description: "Bloqueie phishing, malware, BEC e outras ameaças baseadas em e-mail antes que cheguem à caixa de entrada.",
        bullets: [
          "Detecção de phishing e BEC com IA",
          "Filtragem de spam e malware",
          "Proteção para Microsoft 365 e Google Workspace",
        ],
      },
    ],
  },
  {
    slug: "email-archiving",
    title: "Email Archiving para Microsoft 365",
    subtitle: "Arquivamento de E-mail",
    category: "seguranca",
    heroDescription: "Auxiliar os clientes no cumprimento de normas com arquivamento de e-mail.",
    sections: [
      {
        title: "Arquivamento e conformidade",
        description: "Arquive e-mails do Microsoft 365 para atender requisitos regulatórios e de retenção de dados.",
        bullets: [
          "Retenção e busca rápida de e-mails",
          "Conformidade com normas regulatórias",
          "Integração nativa com Microsoft 365",
        ],
      },
    ],
  },
  {
    slug: "sat",
    title: "Security Awareness Training (SAT)",
    subtitle: "Treinamento de Conscientização em Segurança",
    category: "seguranca",
    heroDescription: "Treinamento de conscientização sobre segurança gerenciado, desenvolvido para MSPs.",
    sections: [
      {
        title: "Conscientize seus clientes",
        description: "Reduza o risco humano com treinamentos interativos e simulações de phishing gerenciadas.",
        bullets: [
          "Simulações de phishing automatizadas",
          "Conteúdo de treinamento personalizado",
          "Relatórios de progresso e risco",
        ],
      },
    ],
  },
  {
    slug: "backup",
    title: "Backup para MSP",
    subtitle: "Uma plataforma para cada carga de trabalho",
    category: "protecao",
    heroDescription: "Backup para MSP: Uma plataforma para cada carga de trabalho com máxima eficiência.",
    sections: [
      {
        title: "Proteção para cada carga de trabalho",
        description: "Proteja cargas de trabalho físicas, virtuais, na nuvem e SaaS a partir de um console e um agente.",
        bullets: [
          "Físico: backup em arquivo, disco e imagem para Windows e Linux",
          "Virtual: proteção sem agente para VMware, Hyper-V e Nutanix AHV",
          "SaaS: Microsoft 365 e Google Workspace com armazenamento ilimitado",
        ],
      },
      {
        title: "Recuperação rápida",
        description: "Reduza o tempo para restaurar ambientes e mantenha os usuários trabalhando durante falhas ou ataques.",
        bullets: [
          "Restauração instantânea para VMs",
          "Conversões P2V, V2V e V2C",
          "Recuperação com um clique para milhares de máquinas",
        ],
      },
      {
        title: "Segurança e compliance integrados",
        description: "Backup combinado com controles de segurança e ferramentas de conformidade.",
        bullets: [
          "Anti-malware e varredura por IA dos backups",
          "Armazenamento geo-redundante e imutável",
          "Retenção arquivística e backups forenses",
        ],
      },
    ],
  },
  {
    slug: "backup-m365",
    title: "Backup para Microsoft 365",
    subtitle: "Proteção completa para Microsoft 365",
    category: "protecao",
    heroDescription: "Proteção cibernética abrangente para os dados e aplicativos do Microsoft 365.",
    sections: [
      {
        title: "Proteção completa do Microsoft 365",
        description: "Backup, recuperação e proteção cibernética para proteger dados e aplicativos do Microsoft 365 dos seus clientes.",
        bullets: [
          "Backup de Exchange, OneDrive, SharePoint e Teams",
          "Recuperação granular de itens individuais",
          "Armazenamento ilimitado em nuvem",
        ],
      },
    ],
  },
  {
    slug: "disaster-recovery",
    title: "Disaster Recovery",
    subtitle: "Recuperação de Desastres",
    category: "protecao",
    heroDescription: "Recupere-se rapidamente de ataques cibernéticos e outras paralisações não planejadas.",
    sections: [
      {
        title: "Continuidade do negócio",
        description: "Minimize o tempo de inatividade com failover automatizado para a nuvem e recuperação rápida.",
        bullets: [
          "Failover automatizado para a nuvem",
          "RPO e RTO minimizados",
          "Testes de DR sem impacto na produção",
        ],
      },
    ],
  },
  {
    slug: "backup-public-cloud",
    title: "Direct Backup to Public Cloud",
    subtitle: "Backup em Nuvem Pública",
    category: "protecao",
    heroDescription: "Backup em Nuvem Flexível: Seu Armazenamento, Sua Escolha.",
    sections: [
      {
        title: "Flexibilidade de armazenamento",
        description: "Faça backup diretamente para provedores de nuvem pública como AWS, Azure e Google Cloud.",
        bullets: [
          "Suporte a AWS S3, Azure Blob e Google Cloud Storage",
          "Controle total sobre custos de armazenamento",
          "Integração nativa com a plataforma",
        ],
      },
    ],
  },
  {
    slug: "rmm",
    title: "RMM – Monitoramento e Gerenciamento Remoto",
    subtitle: "Remote Monitoring and Management",
    category: "operacoes",
    heroDescription: "Alcance o máximo desempenho de MSP com uma plataforma RMM nativamente integrada.",
    sections: [
      {
        title: "Gerenciamento de TI com IA",
        description: "Aumente a satisfação do cliente fornecendo serviços superiores de administração e monitoramento de TI.",
        bullets: [
          "Monitoramento proativo de endpoints",
          "Gerenciamento de patches automatizado",
          "Acesso remoto seguro integrado",
          "Automação baseada em IA",
        ],
      },
      {
        title: "Integração nativa",
        description: "Uma plataforma unificada que combina RMM, segurança e backup para operações mais eficientes.",
        bullets: [
          "Console único para todas as operações",
          "Relatórios unificados de desempenho",
          "Escalabilidade para múltiplos clientes",
        ],
      },
    ],
  },
  {
    slug: "psa",
    title: "PSA – Automação de Serviços Profissionais",
    subtitle: "Professional Services Automation",
    category: "operacoes",
    heroDescription: "Simplifique o sucesso: um PSA fácil de usar para MSPs modernos.",
    sections: [
      {
        title: "Automação para MSPs",
        description: "Automatize fluxos de trabalho de serviços, faturamento e gerenciamento de tickets para aumentar a eficiência.",
        bullets: [
          "Gerenciamento de tickets inteligente",
          "Faturamento automatizado",
          "Relatórios de SLA e desempenho",
          "Integração nativa com RMM",
        ],
      },
    ],
  },
];

export const getSolutionBySlug = (slug: string) => solutions.find((s) => s.slug === slug);
