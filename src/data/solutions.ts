export interface SolutionSection {
  title: string;
  description: string;
  bullets?: string[];
  image?: string;
}

export interface SolutionData {
  slug: string;
  title: string;
  subtitle: string;
  category: "seguranca" | "protecao" | "operacoes";
  heroDescription: string;
  image: string;
  sections: SolutionSection[];
}

// Hero images
import xdrHero from "@/assets/solutions/xdr-hero.webp";
import edrHero from "@/assets/solutions/edr-hero.webp";
import mdrHero from "@/assets/solutions/mdr-hero.webp";
import dlpHero from "@/assets/solutions/dlp-hero.webp";
import securityPostureHero from "@/assets/solutions/security-posture-hero.webp";
import emailSecurityHero from "@/assets/solutions/email-security-hero.webp";
import emailArchivingHero from "@/assets/solutions/email-archiving-hero.webp";
import satHero from "@/assets/solutions/sat-hero.webp";
import backupHero from "@/assets/solutions/backup-hero.webp";
import backupM365Hero from "@/assets/solutions/backup-m365-hero.webp";
import drHero from "@/assets/solutions/dr-hero.webp";
import backupCloudHero from "@/assets/solutions/backup-cloud-hero.webp";
import rmmHero from "@/assets/solutions/rmm-hero.webp";
import psaHero from "@/assets/solutions/psa-hero.webp";

// Section images
import xdrModernize from "@/assets/solutions/xdr-modernize.webp";
import xdrNist from "@/assets/solutions/xdr-nist.webp";
import edrMargens from "@/assets/solutions/edr-margens.webp";
import edrRapidez from "@/assets/solutions/edr-rapidez.webp";
import mdrTerceirizar from "@/assets/solutions/mdr-terceirizar.webp";
import dlpSolucao from "@/assets/solutions/dlp-solucao.webp";
import dlpSobrecarga from "@/assets/solutions/dlp-sobrecarga.webp";
import securityPostureDashboards from "@/assets/solutions/security-posture-dashboards.webp";
import emailSecurityProteja from "@/assets/solutions/email-security-proteja.webp";
import emailArchivingAuxiliar from "@/assets/solutions/email-archiving-auxiliar.webp";
import emailArchivingMicrosoft from "@/assets/solutions/email-archiving-microsoft.webp";
import satEconomize from "@/assets/solutions/sat-economize.webp";
import satConformidade from "@/assets/solutions/sat-conformidade.webp";
import backupPlataforma from "@/assets/solutions/backup-plataforma.webp";
import backupRecuperacao from "@/assets/solutions/backup-recuperacao.webp";
import backupSeguranca from "@/assets/solutions/backup-seguranca.webp";
import backupM365Protecao from "@/assets/solutions/backup-m365-protecao.webp";
import drCoordenacao from "@/assets/solutions/dr-coordenacao.webp";
import drRecuperacao from "@/assets/solutions/dr-recuperacao.webp";
import backupCloudIntegracao from "@/assets/solutions/backup-cloud-integracao.webp";
import backupCloudProtecao from "@/assets/solutions/backup-cloud-protecao.webp";
import rmmPermitir from "@/assets/solutions/rmm-permitir.webp";
import rmmIntegracao from "@/assets/solutions/rmm-integracao.webp";
import psaCotacoes from "@/assets/solutions/psa-cotacoes.webp";
import psaLucratividade from "@/assets/solutions/psa-lucratividade.webp";

export const solutions: SolutionData[] = [
  {
    slug: "xdr",
    title: "Extended Detection and Response (XDR)",
    subtitle: "Detecção e resposta estendidas",
    category: "seguranca",
    heroDescription: "Proteção completa contra ameaças avançadas com detecção e resposta integradas em toda a sua infraestrutura.",
    image: xdrHero,
    sections: [
      {
        title: "Proteção integrada e abrangente",
        description: "Com XDR, sua empresa obtém proteção completa e integrada, desenvolvida para prevenir, detectar, analisar, responder e recuperar incidentes nas superfícies de ataque mais vulneráveis.",
        bullets: [
          "Prevenção proativa de riscos com conformidade NIST",
          "Gerenciamento centralizado em uma única plataforma",
          "Conformidade com LGPD através de DLP integrado",
        ],
        image: xdrModernize,
      },
      {
        title: "Cibersegurança orientada por IA",
        description: "Proteja endpoints com visibilidade total nas superfícies de ataque mais vulneráveis da sua empresa.",
        bullets: [
          "Visibilidade em e-mail, identidade e apps Microsoft 365",
          "Análise e resposta em minutos com IA",
          "Automação de ações de remediação",
        ],
        image: xdrNist,
      },
      {
        title: "Proteção completa com NIST",
        description: "Governança, Identificação, Proteção, Detecção, Resposta e Recuperação em uma plataforma integrada.",
        image: xdrHero,
      },
    ],
  },
  {
    slug: "edr",
    title: "Detecção e Resposta para Endpoints (EDR)",
    subtitle: "Endpoint Detection and Response",
    category: "seguranca",
    heroDescription: "Detecte e responda a ameaças avançadas nos endpoints da sua empresa com inteligência artificial.",
    image: edrHero,
    sections: [
      {
        title: "Detecção avançada de ameaças",
        description: "Tecnologia de proteção cibernética para detectar e responder a ameaças avançadas em endpoints, com análise orientada por IA e resposta com um clique.",
        bullets: [
          "Análise orientada por inteligência artificial",
          "Resposta a incidentes com um clique",
          "Flexível e adaptável ao tamanho da sua empresa",
        ],
        image: edrMargens,
      },
      {
        title: "Visibilidade completa",
        description: "Monitore continuamente os endpoints para identificar comportamentos suspeitos e prevenir ataques antes que causem danos.",
        image: edrRapidez,
      },
    ],
  },
  {
    slug: "mdr",
    title: "Detecção e Resposta Gerenciadas (MDR)",
    subtitle: "Managed Detection and Response",
    category: "seguranca",
    heroDescription: "Segurança de nível empresarial com monitoramento 24/7 por especialistas, sem precisar de uma equipe interna.",
    image: mdrHero,
    sections: [
      {
        title: "Segurança gerenciada por especialistas",
        description: "Serviço gerenciado de detecção e resposta que oferece segurança de nível empresarial sem a complexidade de manter uma equipe de segurança interna.",
        bullets: [
          "Monitoramento 24/7 por especialistas em segurança",
          "Resposta rápida a incidentes",
          "Relatórios detalhados de segurança",
        ],
        image: mdrTerceirizar,
      },
    ],
  },
  {
    slug: "dlp",
    title: "Prevenção de Perda de Dados (DLP)",
    subtitle: "Data Loss Prevention",
    category: "seguranca",
    heroDescription: "Proteja dados sensíveis da sua empresa contra vazamentos e garanta conformidade com a LGPD.",
    image: dlpHero,
    sections: [
      {
        title: "Proteção de dados sensíveis",
        description: "Controle e proteja dados confidenciais em endpoints, prevenindo vazamentos e garantindo conformidade regulatória.",
        bullets: [
          "Monitoramento de transferências de dados",
          "Políticas granulares de controle de dados",
          "Conformidade com LGPD e GDPR",
        ],
        image: dlpSolucao,
      },
      {
        title: "Gestão simplificada",
        description: "Configure políticas de proteção de dados de forma simples e centralizada, com modo de observação para implantação gradual.",
        image: dlpSobrecarga,
      },
    ],
  },
  {
    slug: "security-posture",
    title: "Security Posture Management",
    subtitle: "Gerenciamento de Postura de Segurança",
    category: "seguranca",
    heroDescription: "Avalie e melhore continuamente a postura de segurança do seu ambiente Microsoft 365.",
    image: securityPostureHero,
    sections: [
      {
        title: "Postura de segurança do Microsoft 365",
        description: "Avalie e melhore continuamente a postura de segurança do seu ambiente Microsoft 365 com avaliações automatizadas.",
        bullets: [
          "Avaliações automatizadas de segurança",
          "Recomendações baseadas em boas práticas",
          "Monitoramento contínuo de conformidade",
        ],
        image: securityPostureDashboards,
      },
    ],
  },
  {
    slug: "email-security",
    title: "Email Security",
    subtitle: "Segurança de E-mail",
    category: "seguranca",
    heroDescription: "Bloqueie ataques por e-mail em segundos — phishing, malware e ameaças avançadas.",
    image: emailSecurityHero,
    sections: [
      {
        title: "Proteção contra ameaças por e-mail",
        description: "Bloqueie phishing, malware, BEC e outras ameaças baseadas em e-mail antes que cheguem à caixa de entrada dos seus colaboradores.",
        bullets: [
          "Detecção de phishing e BEC com IA",
          "Filtragem de spam e malware",
          "Proteção para Microsoft 365 e Google Workspace",
        ],
        image: emailSecurityProteja,
      },
    ],
  },
  {
    slug: "email-archiving",
    title: "Email Archiving para Microsoft 365",
    subtitle: "Arquivamento de E-mail",
    category: "seguranca",
    heroDescription: "Arquive e-mails do Microsoft 365 para atender normas regulatórias e manter conformidade.",
    image: emailArchivingHero,
    sections: [
      {
        title: "Arquivamento e conformidade",
        description: "Arquive e-mails do Microsoft 365 para atender requisitos regulatórios e de retenção de dados da sua empresa.",
        bullets: [
          "Retenção e busca rápida de e-mails",
          "Conformidade com normas regulatórias",
          "Integração nativa com Microsoft 365",
        ],
        image: emailArchivingAuxiliar,
      },
      {
        title: "Arquivamento profissional para Microsoft 365",
        description: "Solução desenvolvida para empresas que utilizam o ecossistema Microsoft e precisam de conformidade documental.",
        image: emailArchivingMicrosoft,
      },
    ],
  },
  {
    slug: "sat",
    title: "Security Awareness Training (SAT)",
    subtitle: "Treinamento de Conscientização em Segurança",
    category: "seguranca",
    heroDescription: "Capacite seus colaboradores para reconhecer e evitar ameaças cibernéticas.",
    image: satHero,
    sections: [
      {
        title: "Conscientize sua equipe",
        description: "Reduza o risco humano com treinamentos interativos e simulações de phishing para os colaboradores da sua empresa.",
        bullets: [
          "Simulações de phishing automatizadas",
          "Conteúdo de treinamento personalizado",
          "Relatórios de progresso e risco",
        ],
        image: satEconomize,
      },
      {
        title: "Conformidade e cultura de segurança",
        description: "Crie uma cultura de segurança na sua empresa e mantenha-se em conformidade com regulamentações.",
        image: satConformidade,
      },
    ],
  },
  {
    slug: "backup",
    title: "Backup em Nuvem",
    subtitle: "Backup para todas as cargas de trabalho",
    category: "protecao",
    heroDescription: "Proteja servidores, estações, nuvem e aplicações SaaS com backup seguro e recuperação rápida.",
    image: backupHero,
    sections: [
      {
        title: "Proteção para cada carga de trabalho",
        description: "Proteja servidores físicos, máquinas virtuais, ambientes em nuvem e aplicações SaaS a partir de um único console.",
        bullets: [
          "Servidores físicos: backup em arquivo, disco e imagem para Windows e Linux",
          "Máquinas virtuais: proteção sem agente para VMware, Hyper-V e Nutanix",
          "SaaS: Microsoft 365 e Google Workspace com armazenamento ilimitado",
        ],
        image: backupPlataforma,
      },
      {
        title: "Recuperação rápida",
        description: "Reduza o tempo de inatividade e restaure ambientes rapidamente em caso de falha ou ataque.",
        bullets: [
          "Restauração instantânea para VMs",
          "Conversões P2V, V2V e V2C",
          "Recuperação com um clique para múltiplas máquinas",
        ],
        image: backupRecuperacao,
      },
      {
        title: "Segurança e compliance integrados",
        description: "Backup combinado com controles de segurança e ferramentas de conformidade para proteger seus dados.",
        bullets: [
          "Anti-malware e varredura por IA dos backups",
          "Armazenamento geo-redundante e imutável",
          "Retenção arquivística e backups forenses",
        ],
        image: backupSeguranca,
      },
    ],
  },
  {
    slug: "backup-m365",
    title: "Backup para Microsoft 365",
    subtitle: "Proteção completa para Microsoft 365",
    category: "protecao",
    heroDescription: "Proteção abrangente para os dados e aplicativos do Microsoft 365 da sua empresa.",
    image: backupM365Hero,
    sections: [
      {
        title: "Proteção completa do Microsoft 365",
        description: "Backup, recuperação e proteção cibernética para proteger dados e aplicativos do Microsoft 365 da sua empresa.",
        bullets: [
          "Backup de Exchange, OneDrive, SharePoint e Teams",
          "Recuperação granular de itens individuais",
          "Armazenamento ilimitado em nuvem",
        ],
        image: backupM365Protecao,
      },
    ],
  },
  {
    slug: "disaster-recovery",
    title: "Disaster Recovery",
    subtitle: "Recuperação de Desastres",
    category: "protecao",
    heroDescription: "Recupere-se rapidamente de ataques cibernéticos e outras paralisações inesperadas.",
    image: drHero,
    sections: [
      {
        title: "Continuidade do negócio",
        description: "Minimize o tempo de inatividade com failover automatizado para a nuvem e recuperação rápida dos seus sistemas críticos.",
        bullets: [
          "Failover automatizado para a nuvem",
          "RPO e RTO minimizados",
          "Testes de DR sem impacto na produção",
        ],
        image: drCoordenacao,
      },
      {
        title: "Recuperação rápida",
        description: "Restaure sistemas críticos em minutos com orquestração automatizada.",
        image: drRecuperacao,
      },
    ],
  },
  {
    slug: "backup-public-cloud",
    title: "Backup em Nuvem Pública",
    subtitle: "Backup direto para nuvem pública",
    category: "protecao",
    heroDescription: "Faça backup diretamente para AWS, Azure ou Google Cloud com total flexibilidade.",
    image: backupCloudHero,
    sections: [
      {
        title: "Flexibilidade de armazenamento",
        description: "Faça backup diretamente para provedores de nuvem pública como AWS, Azure e Google Cloud.",
        bullets: [
          "Suporte a AWS S3, Azure Blob e Google Cloud Storage",
          "Controle total sobre custos de armazenamento",
          "Integração nativa com a plataforma",
        ],
        image: backupCloudIntegracao,
      },
      {
        title: "Proteção de dados segura e em conformidade",
        description: "Proteção de dados com criptografia de ponta e conformidade regulatória.",
        image: backupCloudProtecao,
      },
    ],
  },
  {
    slug: "rmm",
    title: "RMM – Monitoramento e Gerenciamento Remoto",
    subtitle: "Remote Monitoring and Management",
    category: "operacoes",
    heroDescription: "Monitore e gerencie toda a infraestrutura de TI da sua empresa de forma remota e proativa.",
    image: rmmHero,
    sections: [
      {
        title: "Gerenciamento de TI com IA",
        description: "Aumente a eficiência da sua equipe de TI com monitoramento proativo e automação inteligente.",
        bullets: [
          "Monitoramento proativo de endpoints",
          "Gerenciamento de patches automatizado",
          "Acesso remoto seguro integrado",
          "Automação baseada em IA",
        ],
        image: rmmPermitir,
      },
      {
        title: "Plataforma unificada",
        description: "Uma plataforma que combina monitoramento, segurança e backup para operações de TI mais eficientes.",
        bullets: [
          "Console único para todas as operações",
          "Relatórios unificados de desempenho",
          "Escalável para empresas de qualquer porte",
        ],
        image: rmmIntegracao,
      },
    ],
  },
  {
    slug: "psa",
    title: "PSA – Automação de Serviços Profissionais",
    subtitle: "Professional Services Automation",
    category: "operacoes",
    heroDescription: "Automatize a gestão de serviços de TI da sua empresa com tickets, SLA e relatórios integrados.",
    image: psaHero,
    sections: [
      {
        title: "Automação de serviços de TI",
        description: "Automatize fluxos de trabalho, gestão de tickets e controle de SLA para uma operação de TI mais eficiente.",
        bullets: [
          "Gerenciamento de tickets inteligente",
          "Controle de SLA automatizado",
          "Relatórios de desempenho",
          "Integração nativa com RMM",
        ],
        image: psaCotacoes,
      },
      {
        title: "Mais eficiência operacional",
        description: "Tome decisões baseadas em dados para otimizar a operação de TI da sua empresa.",
        image: psaLucratividade,
      },
    ],
  },
];

export const getSolutionBySlug = (slug: string) => solutions.find((s) => s.slug === slug);
