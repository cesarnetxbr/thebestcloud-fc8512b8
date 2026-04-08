export interface KBArticle {
  title: string;
  description: string;
  category: string;
  subcategory: string;
  type: "guia" | "video" | "faq" | "troubleshooting";
  externalUrl?: string;
  tags: string[];
  content?: string;
}

export const articles: KBArticle[] = [
  // =====================================================
  // SEGURANÇA - XDR
  // =====================================================
  {
    title: "Detecção e Resposta Estendida (XDR) - Guia Completo",
    description: "Como configurar e gerenciar a solução XDR para detecção avançada de ameaças em múltiplos vetores de ataque incluindo endpoints, email e rede.",
    category: "Segurança",
    subcategory: "XDR",
    type: "guia",
    externalUrl: "https://www.acronis.com/en/support/documentation/CyberProtectionService/#xdr-extended-detection-response.html",
    tags: ["xdr", "detecção", "ameaças", "resposta", "vetores de ataque"],
    content: `## O que é XDR?\n\nA Detecção e Resposta Estendida (XDR) é uma evolução do EDR que amplia a visibilidade de segurança para além dos endpoints, cobrindo email, rede, identidade e cargas de trabalho em nuvem.\n\n## Principais Funcionalidades\n\n- **Correlação de eventos** entre múltiplos vetores\n- **Investigação automatizada** de incidentes\n- **Resposta orquestrada** em todos os vetores\n- **Timeline de ataque** visual e interativa\n- **Integração nativa** com backup e recuperação\n\n## Como Configurar\n\n1. Acesse o console de gerenciamento\n2. Navegue até Segurança > XDR\n3. Ative os sensores nos vetores desejados\n4. Configure as políticas de detecção\n5. Defina as ações de resposta automática`,
  },
  {
    title: "XDR - Configuração de Sensores e Integrações",
    description: "Passo a passo para ativar sensores XDR em endpoints, email, firewalls e serviços de identidade para correlação de eventos.",
    category: "Segurança",
    subcategory: "XDR",
    type: "guia",
    externalUrl: "https://www.acronis.com/en/support/documentation/CyberProtectionService/#xdr-extended-detection-response.html",
    tags: ["xdr", "sensores", "integrações", "firewall", "identidade"],
    content: `## Sensores Disponíveis\n\n### Endpoint\nInstale o agente de proteção com módulo XDR ativado em todos os dispositivos.\n\n### Email\nConfigure a integração com Microsoft 365 ou Google Workspace para monitoramento de emails.\n\n### Rede\nIntegre com firewalls compatíveis (Fortinet, Palo Alto, Sophos) via syslog.\n\n### Identidade\nConecte com Azure AD / Entra ID para detecção de comprometimento de contas.`,
  },
  {
    title: "XDR - Investigação e Resposta a Incidentes",
    description: "Como utilizar a timeline de ataque, realizar investigação forense e executar ações de resposta coordenadas em múltiplos vetores.",
    category: "Segurança",
    subcategory: "XDR",
    type: "guia",
    externalUrl: "https://www.acronis.com/en/support/documentation/CyberProtectionService/#xdr-extended-detection-response.html",
    tags: ["xdr", "investigação", "forense", "timeline", "resposta a incidentes"],
  },

  // =====================================================
  // SEGURANÇA - EDR
  // =====================================================
  {
    title: "Detecção e Resposta para Endpoints (EDR) - Guia do Administrador",
    description: "Guia completo de implementação da solução EDR para monitoramento contínuo, detecção de comportamentos suspeitos e resposta automática a incidentes em endpoints.",
    category: "Segurança",
    subcategory: "EDR",
    type: "guia",
    externalUrl: "https://www.acronis.com/en/support/documentation/CyberProtectionService/#edr-endpoint-detection-response.html",
    tags: ["edr", "endpoint", "monitoramento", "incidentes", "comportamento"],
    content: `## Visão Geral do EDR\n\nO EDR monitora continuamente os endpoints para detectar e responder a ameaças avançadas que passam pelas defesas tradicionais de antivírus.\n\n## Componentes\n\n- **Agente de monitoramento**: Coleta telemetria de processos, rede, registro e arquivos\n- **Motor de detecção**: Analisa eventos usando IA e regras MITRE ATT&CK\n- **Console de investigação**: Interface para análise detalhada de incidentes\n- **Ações de resposta**: Isolamento, quarentena, rollback e remediação\n\n## Requisitos de Sistema\n\n- Windows 10/11 (64-bit)\n- Windows Server 2016+\n- macOS 11+\n- 2 GB RAM disponível\n- 1 GB espaço em disco`,
  },
  {
    title: "EDR - Análise de Incidentes e MITRE ATT&CK",
    description: "Como interpretar alertas EDR mapeados ao framework MITRE ATT&CK, analisar cadeias de ataque e tomar ações de remediação.",
    category: "Segurança",
    subcategory: "EDR",
    type: "guia",
    externalUrl: "https://www.acronis.com/en/support/documentation/CyberProtectionService/#edr-endpoint-detection-response.html",
    tags: ["edr", "mitre att&ck", "análise", "cadeia de ataque", "remediação"],
  },
  {
    title: "EDR - Isolamento e Contenção de Ameaças",
    description: "Procedimentos para isolar endpoints comprometidos, conter a propagação de ameaças e restaurar sistemas usando backup integrado.",
    category: "Segurança",
    subcategory: "EDR",
    type: "guia",
    tags: ["edr", "isolamento", "contenção", "quarentena", "restauração"],
  },

  // =====================================================
  // SEGURANÇA - MDR
  // =====================================================
  {
    title: "Serviços de Detecção e Resposta Gerenciadas (MDR)",
    description: "Como funciona o serviço gerenciado de detecção e resposta, com equipe especializada monitorando 24/7 e respondendo a ameaças em tempo real.",
    category: "Segurança",
    subcategory: "MDR",
    type: "guia",
    externalUrl: "https://www.acronis.com/en/support/documentation/CyberProtectionService/#a-mdr-overview.html",
    tags: ["mdr", "gerenciado", "soc", "monitoramento 24/7", "analistas"],
    content: `## O que é MDR?\n\nO MDR (Managed Detection and Response) é um serviço gerenciado onde analistas de segurança especializados monitoram seus sistemas 24/7, investigam alertas e respondem a ameaças em seu nome.\n\n## Benefícios\n\n- **Monitoramento 24/7/365** por analistas certificados\n- **Tempo de resposta** inferior a 15 minutos para incidentes críticos\n- **Caça a ameaças** proativa (threat hunting)\n- **Relatórios mensais** detalhados de segurança\n- **Sem necessidade** de equipe interna de SOC\n\n## Níveis de Serviço\n\n| Severidade | Tempo de Resposta |\n|------------|------------------|\n| Crítica | < 15 minutos |\n| Alta | < 1 hora |\n| Média | < 4 horas |\n| Baixa | < 24 horas |`,
  },
  {
    title: "MDR - Relatórios e Métricas de Segurança",
    description: "Como interpretar os relatórios mensais do MDR, acompanhar métricas de segurança (MTTD, MTTR) e avaliar a postura de segurança.",
    category: "Segurança",
    subcategory: "MDR",
    type: "guia",
    tags: ["mdr", "relatórios", "métricas", "mttd", "mttr"],
  },

  // =====================================================
  // SEGURANÇA - DLP
  // =====================================================
  {
    title: "Prevenção de Perda de Dados (DLP) - Guia Completo",
    description: "Configuração e gerenciamento de políticas DLP para prevenir vazamento de dados sensíveis através de email, dispositivos USB, impressão e compartilhamento.",
    category: "Segurança",
    subcategory: "DLP",
    type: "guia",
    externalUrl: "https://www.acronis.com/en/support/documentation/CyberProtectionService/#advanced-dlp.html",
    tags: ["dlp", "vazamento", "dados sensíveis", "políticas", "compliance"],
    content: `## Prevenção de Perda de Dados\n\nO DLP monitora e controla a transferência de dados sensíveis para evitar vazamentos acidentais ou intencionais.\n\n## Canais Monitorados\n\n- **Email**: Anexos e corpo de mensagens\n- **Dispositivos removíveis**: USB, HD externo\n- **Impressão**: Documentos enviados para impressoras\n- **Compartilhamento**: Upload para nuvem, mensageiros\n- **Clipboard**: Copiar e colar entre aplicações\n\n## Tipos de Dados Detectados\n\n- CPF, CNPJ, RG\n- Números de cartão de crédito\n- Dados de saúde (HIPAA)\n- Propriedade intelectual\n- Dados financeiros\n- Informações pessoais (LGPD)`,
  },
  {
    title: "DLP - Criando Políticas de Proteção de Dados",
    description: "Como criar regras personalizadas de DLP para detectar e bloquear transferências não autorizadas de dados sensíveis como CPF, CNPJ e dados financeiros.",
    category: "Segurança",
    subcategory: "DLP",
    type: "guia",
    tags: ["dlp", "regras", "cpf", "cnpj", "lgpd", "proteção de dados"],
  },

  // =====================================================
  // SEGURANÇA - Postura de Segurança
  // =====================================================
  {
    title: "Security Posture Management para Microsoft 365",
    description: "Avaliação e melhoria contínua da postura de segurança do ambiente Microsoft 365, identificando configurações incorretas e vulnerabilidades.",
    category: "Segurança",
    subcategory: "Postura de Segurança",
    type: "guia",
    externalUrl: "https://dl.managed-protection.com/u/baas/help/wp/M365SecurityPosture/en-US/index.html",
    tags: ["microsoft 365", "postura", "configuração", "vulnerabilidades", "compliance"],
  },
  {
    title: "Avaliação de Vulnerabilidades e Gerenciamento de Patches",
    description: "Como executar varreduras de vulnerabilidades em sua infraestrutura e gerenciar a aplicação de patches de segurança de forma automatizada.",
    category: "Segurança",
    subcategory: "Vulnerabilidades",
    type: "guia",
    externalUrl: "https://www.acronis.com/en/support/documentation/CyberProtectionService/#cyber-protection-understand-level-of-protection.html",
    tags: ["vulnerabilidades", "patches", "varredura", "cve", "remediação"],
    content: `## Gerenciamento de Vulnerabilidades\n\n### Varredura Automática\nConfigure varreduras periódicas para identificar vulnerabilidades em:\n- Sistemas operacionais (Windows, macOS, Linux)\n- Aplicativos de terceiros (Adobe, Java, Chrome, etc.)\n- Configurações de segurança\n\n### Classificação por Severidade\n- **Crítica (CVSS 9.0-10.0)**: Correção imediata\n- **Alta (CVSS 7.0-8.9)**: Correção em 7 dias\n- **Média (CVSS 4.0-6.9)**: Correção em 30 dias\n- **Baixa (CVSS 0.1-3.9)**: Próxima janela de manutenção`,
  },

  // =====================================================
  // SEGURANÇA - Email Security
  // =====================================================
  {
    title: "Segurança de Email - Proteção Avançada",
    description: "Proteção avançada contra phishing, spam, malware e ataques BEC (Business Email Compromise) para caixas de email corporativas.",
    category: "Segurança",
    subcategory: "Email Security",
    type: "guia",
    externalUrl: "https://www.acronis.com/en/support/documentation/CyberProtectionService/#44130.html",
    tags: ["email", "phishing", "spam", "malware", "bec"],
    content: `## Proteção de Email\n\n### Camadas de Proteção\n\n1. **Anti-Spam**: Filtragem baseada em reputação e conteúdo\n2. **Anti-Phishing**: Detecção por IA de tentativas de phishing\n3. **Anti-Malware**: Varredura de anexos em sandbox\n4. **Anti-BEC**: Proteção contra comprometimento de email empresarial\n5. **URL Protection**: Verificação em tempo real de links\n\n### Configuração para Microsoft 365\n\n1. Acesse o console de gerenciamento\n2. Navegue até Email Security\n3. Conecte seu tenant Microsoft 365\n4. Configure as políticas de filtragem\n5. Ative a quarentena automática`,
  },
  {
    title: "Email Security - Configuração de Regras e Quarentena",
    description: "Como configurar regras personalizadas de filtragem de email, gerenciar quarentena e criar listas de remetentes permitidos/bloqueados.",
    category: "Segurança",
    subcategory: "Email Security",
    type: "guia",
    tags: ["email", "quarentena", "filtragem", "whitelist", "blacklist"],
  },
  {
    title: "Como identificar um email de phishing",
    description: "Guia visual para identificar tentativas de phishing, verificar legitimidade de remetentes e reportar emails suspeitos.",
    category: "Segurança",
    subcategory: "Email Security",
    type: "faq",
    tags: ["phishing", "email", "identificação", "segurança"],
  },

  // =====================================================
  // SEGURANÇA - Email Archiving
  // =====================================================
  {
    title: "Arquivamento de Email para Microsoft 365",
    description: "Como configurar o arquivamento automático de emails do Microsoft 365 para conformidade regulatória, eDiscovery e retenção a longo prazo.",
    category: "Segurança",
    subcategory: "Email Archiving",
    type: "guia",
    tags: ["email", "arquivamento", "microsoft 365", "conformidade", "ediscovery"],
  },
  {
    title: "Email Archiving - Pesquisa e eDiscovery",
    description: "Como realizar buscas avançadas no arquivo de emails, exportar resultados para auditorias e atender requisições legais de eDiscovery.",
    category: "Segurança",
    subcategory: "Email Archiving",
    type: "guia",
    tags: ["email", "pesquisa", "ediscovery", "auditoria", "exportação"],
  },

  // =====================================================
  // SEGURANÇA - SAT
  // =====================================================
  {
    title: "Security Awareness Training (SAT) - Guia do Administrador",
    description: "Programa de treinamento de conscientização em segurança para colaboradores, com simulações de phishing e cursos interativos.",
    category: "Segurança",
    subcategory: "SAT",
    type: "guia",
    tags: ["treinamento", "conscientização", "phishing", "simulação", "colaboradores"],
    content: `## Treinamento de Conscientização\n\n### Módulos Disponíveis\n\n1. **Phishing e Engenharia Social**: Como reconhecer e evitar ataques\n2. **Senhas Seguras**: Boas práticas de criação e gerenciamento\n3. **Segurança de Dispositivos**: Proteção de laptops e celulares\n4. **Dados Confidenciais**: Como lidar com informações sensíveis\n5. **Trabalho Remoto**: Segurança em home office\n6. **LGPD**: Proteção de dados pessoais\n\n### Simulações de Phishing\n\nCrie campanhas de simulação para testar a maturidade dos colaboradores:\n- Templates realistas personalizáveis\n- Landing pages educativas\n- Relatórios de cliques e denúncias\n- Treinamento automático para quem falhar`,
  },
  {
    title: "SAT - Criando Campanhas de Simulação de Phishing",
    description: "Como criar e gerenciar campanhas de simulação de phishing para avaliar a consciência de segurança dos colaboradores da empresa.",
    category: "Segurança",
    subcategory: "SAT",
    type: "guia",
    tags: ["sat", "campanha", "simulação", "phishing", "avaliação"],
  },

  // =====================================================
  // SEGURANÇA - Antivírus/Antimalware
  // =====================================================
  {
    title: "Proteção Antivírus e Antimalware - Configuração",
    description: "Como configurar a proteção antivírus e antimalware com varredura em tempo real, proteção web, controle de dispositivos e firewall gerenciado.",
    category: "Segurança",
    subcategory: "Antimalware",
    type: "guia",
    externalUrl: "https://www.acronis.com/en/support/documentation/CyberProtectionService/#antimalware-and-web-protection.html",
    tags: ["antivírus", "antimalware", "varredura", "proteção web", "firewall"],
    content: `## Proteção Antimalware\n\n### Mecanismos de Detecção\n\n- **Assinaturas**: Base atualizada automaticamente\n- **Heurística**: Detecção de variantes desconhecidas\n- **Comportamental**: Análise de ações suspeitas\n- **IA/ML**: Modelos de machine learning\n- **Anti-exploit**: Proteção contra exploits de vulnerabilidades\n\n### Proteção em Tempo Real\n\nO agente monitora continuamente:\n- Criação e modificação de arquivos\n- Execução de processos\n- Conexões de rede\n- Downloads da internet\n- Mídias removíveis`,
  },
  {
    title: "Proteção contra Ransomware - Como Funciona",
    description: "Detalhes sobre a tecnologia anti-ransomware que detecta e bloqueia criptografia maliciosa com reversão automática de alterações.",
    category: "Segurança",
    subcategory: "Antimalware",
    type: "guia",
    tags: ["ransomware", "criptografia", "rollback", "proteção", "anti-ransomware"],
  },

  // =====================================================
  // SEGURANÇA - GenAI Protection
  // =====================================================
  {
    title: "Proteção GenAI - Segurança para Inteligência Artificial",
    description: "Como configurar a proteção GenAI para monitorar e controlar o uso de ferramentas de IA generativa, prevenindo vazamento de dados corporativos.",
    category: "Segurança",
    subcategory: "GenAI",
    type: "guia",
    externalUrl: "https://www.acronis.com/en/support/documentation/CyberProtectionService/#configuring_generative_ai-security.html",
    tags: ["ia generativa", "genai", "chatgpt", "copilot", "vazamento de dados"],
  },

  // =====================================================
  // SEGURANÇA - Troubleshooting
  // =====================================================
  {
    title: "Como identificar e responder a um ataque de ransomware",
    description: "Passo a passo para identificar sinais de um ataque de ransomware, isolar sistemas afetados e iniciar o processo de recuperação.",
    category: "Segurança",
    subcategory: "Troubleshooting",
    type: "troubleshooting",
    tags: ["ransomware", "ataque", "recuperação", "incidente", "resposta"],
    content: `## Sinais de Ataque de Ransomware\n\n1. Arquivos com extensões estranhas (.encrypted, .locked)\n2. Notas de resgate na área de trabalho\n3. Lentidão extrema no sistema\n4. Processos desconhecidos consumindo CPU\n5. Conexões de rede incomuns\n\n## Ações Imediatas\n\n1. **Isolar** o dispositivo da rede (desconectar cabo/WiFi)\n2. **Não desligar** o computador (evidências na memória)\n3. **Documentar** tudo com fotos/prints\n4. **Notificar** a equipe de segurança\n5. **Verificar** o escopo do comprometimento\n\n## Recuperação\n\n1. Identificar a variante do ransomware\n2. Verificar backups disponíveis\n3. Restaurar sistemas a partir do último backup limpo\n4. Aplicar patches e correções\n5. Monitorar sistemas restaurados`,
  },
  {
    title: "Agente de proteção não conecta ao console",
    description: "Procedimentos de diagnóstico quando o agente de proteção não se conecta ao console de gerenciamento, incluindo verificação de firewall e proxy.",
    category: "Segurança",
    subcategory: "Troubleshooting",
    type: "troubleshooting",
    tags: ["agente", "conexão", "firewall", "proxy", "diagnóstico"],
  },
  {
    title: "Falso positivo na detecção de ameaças",
    description: "Como identificar e resolver falsos positivos, adicionar exclusões e reportar detecções incorretas para melhoria do motor de detecção.",
    category: "Segurança",
    subcategory: "Troubleshooting",
    type: "troubleshooting",
    tags: ["falso positivo", "exclusão", "detecção", "whitelist"],
  },
  {
    title: "Melhores práticas de segurança para endpoints",
    description: "Checklist completo de configurações recomendadas para proteger endpoints corporativos contra ameaças modernas.",
    category: "Segurança",
    subcategory: "Boas Práticas",
    type: "guia",
    tags: ["endpoints", "boas práticas", "configuração", "proteção", "checklist"],
  },

  // =====================================================
  // SEGURANÇA - FAQ
  // =====================================================
  {
    title: "Quais sistemas operacionais são suportados?",
    description: "Lista completa de sistemas operacionais compatíveis: Windows Server 2012+, Windows 10/11, macOS 10.15+, Ubuntu 18.04+, RHEL 7+, entre outros.",
    category: "Segurança",
    subcategory: "FAQ",
    type: "faq",
    tags: ["compatibilidade", "sistemas operacionais", "requisitos"],
    content: `## Sistemas Operacionais Suportados\n\n### Windows Desktop\n- Windows 11 (todas as edições)\n- Windows 10 (todas as edições)\n\n### Windows Server\n- Windows Server 2025\n- Windows Server 2022\n- Windows Server 2019\n- Windows Server 2016\n- Windows Server 2012 R2\n\n### macOS\n- macOS 15 Sequoia\n- macOS 14 Sonoma\n- macOS 13 Ventura\n- macOS 12 Monterey\n\n### Linux\n- Ubuntu 18.04, 20.04, 22.04, 24.04\n- RHEL 7, 8, 9\n- CentOS 7, 8\n- Debian 10, 11, 12\n- SUSE Linux Enterprise Server 12, 15`,
  },
  {
    title: "Qual a diferença entre EDR, XDR e MDR?",
    description: "Comparação detalhada entre as soluções EDR (endpoint), XDR (estendida) e MDR (gerenciada), com recomendações de quando usar cada uma.",
    category: "Segurança",
    subcategory: "FAQ",
    type: "faq",
    tags: ["edr", "xdr", "mdr", "comparação", "diferenças"],
  },
  {
    title: "O que é MITRE ATT&CK e como é utilizado?",
    description: "Explicação do framework MITRE ATT&CK, como as detecções são mapeadas a técnicas de ataque e como isso ajuda na resposta a incidentes.",
    category: "Segurança",
    subcategory: "FAQ",
    type: "faq",
    tags: ["mitre", "att&ck", "framework", "técnicas", "táticas"],
  },

  // =====================================================
  // PROTEÇÃO - Backup
  // =====================================================
  {
    title: "Backup - Guia do Administrador",
    description: "Guia completo de configuração e gerenciamento de backup para servidores, estações de trabalho e dispositivos móveis com agendamento e retenção.",
    category: "Proteção",
    subcategory: "Backup",
    type: "guia",
    externalUrl: "https://www.acronis.com/en/support/documentation/CyberProtectionService/#backup-and-recovery.html",
    tags: ["backup", "agendamento", "retenção", "servidor", "estação de trabalho"],
    content: `## Tipos de Backup\n\n### Backup Completo\nCópia integral de todos os dados selecionados. Maior tempo de execução mas restauração mais rápida.\n\n### Backup Incremental\nApenas as alterações desde o último backup (completo ou incremental). Mais rápido mas depende da cadeia.\n\n### Backup Diferencial\nAlterações desde o último backup completo. Equilíbrio entre velocidade e independência.\n\n## Estratégia 3-2-1\n\nRecomendação universal:\n- **3** cópias dos dados\n- **2** tipos diferentes de mídia\n- **1** cópia offsite (nuvem)\n\n## Agendamento\n\n| Tipo | Frequência Recomendada |\n|------|----------------------|\n| Servidores críticos | A cada 1-4 horas |\n| Servidores | Diário |\n| Estações | Diário ou semanal |\n| Notebooks | Contínuo (CDP) |`,
  },
  {
    title: "Backup - Planos de Proteção e Políticas de Retenção",
    description: "Como criar planos de proteção com múltiplos destinos, configurar retenção GFS (Avô-Pai-Filho) e políticas de limpeza automática.",
    category: "Proteção",
    subcategory: "Backup",
    type: "guia",
    tags: ["backup", "plano de proteção", "retenção", "gfs", "limpeza"],
    content: `## Retenção GFS (Avô-Pai-Filho)\n\n### Configuração Recomendada\n\n- **Diário (Filho)**: Manter últimos 7 dias\n- **Semanal (Pai)**: Manter últimas 4 semanas\n- **Mensal (Avô)**: Manter últimos 12 meses\n- **Anual**: Manter últimos 3-7 anos\n\n### Destinos de Backup\n\n1. **Armazenamento local**: NAS, SAN, disco\n2. **Nuvem Acronis**: Datacenter seguro\n3. **Nuvem pública**: AWS S3, Azure Blob, Google Cloud\n4. **Fita**: LTO para retenção de longo prazo`,
  },
  {
    title: "Backup de Máquinas Virtuais (VMware e Hyper-V)",
    description: "Como configurar backup sem agente para ambientes VMware vSphere e Microsoft Hyper-V, incluindo CBT e restauração granular.",
    category: "Proteção",
    subcategory: "Backup",
    type: "guia",
    tags: ["backup", "vmware", "hyper-v", "máquina virtual", "cbt", "agentless"],
  },
  {
    title: "Backup de Bancos de Dados (SQL Server, Oracle, MySQL)",
    description: "Procedimentos para backup consistente de bancos de dados em produção, incluindo backup de logs de transação e restauração point-in-time.",
    category: "Proteção",
    subcategory: "Backup",
    type: "guia",
    tags: ["backup", "sql server", "oracle", "mysql", "banco de dados", "point-in-time"],
  },
  {
    title: "Proteção Contínua de Dados (CDP)",
    description: "Como configurar a proteção contínua de dados para RPO próximo de zero, monitorando alterações em tempo real.",
    category: "Proteção",
    subcategory: "Backup",
    type: "guia",
    tags: ["cdp", "proteção contínua", "rpo", "tempo real"],
  },

  // =====================================================
  // PROTEÇÃO - Backup Microsoft 365
  // =====================================================
  {
    title: "Backup para Microsoft 365 - Guia Completo",
    description: "Como proteger dados do Exchange Online, OneDrive, SharePoint e Teams com backup automatizado e recuperação granular.",
    category: "Proteção",
    subcategory: "Backup M365",
    type: "guia",
    tags: ["microsoft 365", "exchange", "onedrive", "sharepoint", "teams"],
    content: `## Escopo de Proteção\n\n### Exchange Online\n- Caixas de correio (emails, contatos, calendário)\n- Pastas públicas\n- Arquivos mortos\n\n### OneDrive for Business\n- Todos os arquivos e pastas\n- Versões de documentos\n- Lixeira\n\n### SharePoint Online\n- Sites e subsites\n- Bibliotecas de documentos\n- Listas\n\n### Microsoft Teams\n- Mensagens de canais\n- Arquivos compartilhados\n- Configurações de equipes\n\n## Restauração Granular\n\nRestaure itens individuais sem afetar outros dados:\n- Email específico\n- Arquivo individual do OneDrive\n- Item de lista do SharePoint\n- Conversa do Teams`,
  },
  {
    title: "Backup M365 - Configuração Inicial e Autenticação",
    description: "Passo a passo para configurar a conexão com o tenant Microsoft 365, autenticação via Azure AD e concessão de permissões necessárias.",
    category: "Proteção",
    subcategory: "Backup M365",
    type: "guia",
    tags: ["microsoft 365", "azure ad", "autenticação", "permissões", "tenant"],
  },

  // =====================================================
  // PROTEÇÃO - Disaster Recovery
  // =====================================================
  {
    title: "Disaster Recovery - Guia do Administrador",
    description: "Configuração completa de planos de disaster recovery com failover automático para a nuvem e RPO/RTO mínimos.",
    category: "Proteção",
    subcategory: "Disaster Recovery",
    type: "guia",
    externalUrl: "https://www.acronis.com/support/documentation/DisasterRecovery/#43224.html",
    tags: ["disaster recovery", "failover", "rpo", "rto", "continuidade"],
    content: `## Disaster Recovery na Nuvem\n\n### Conceitos Fundamentais\n\n- **RPO (Recovery Point Objective)**: Quanto de dados você pode perder\n- **RTO (Recovery Time Objective)**: Quanto tempo pode ficar offline\n- **Failover**: Transição para o ambiente de DR\n- **Failback**: Retorno ao ambiente original\n\n### Planos de DR\n\n1. Defina os servidores críticos\n2. Configure a replicação para a nuvem\n3. Defina RPO e RTO para cada servidor\n4. Configure redes virtuais na nuvem\n5. Teste o plano periodicamente\n\n### Teste de DR\n\nRealize testes sem impactar a produção:\n- Failover de teste (ambiente isolado)\n- Validação de conectividade\n- Teste de aplicações\n- Documentação de resultados`,
  },
  {
    title: "Disaster Recovery Hybrid Cloud",
    description: "Implementação de DR híbrido combinando infraestrutura local e nuvem para máxima resiliência e flexibilidade.",
    category: "Proteção",
    subcategory: "Disaster Recovery",
    type: "guia",
    externalUrl: "https://www.acronis.com/support/documentation/DisasterRecoveryHybridCloud/",
    tags: ["disaster recovery", "hybrid", "nuvem", "local", "resiliência"],
  },
  {
    title: "DR - Configuração de VPN Site-to-Site",
    description: "Como configurar VPN site-to-site para conectar a infraestrutura local com o ambiente de disaster recovery na nuvem.",
    category: "Proteção",
    subcategory: "Disaster Recovery",
    type: "guia",
    externalUrl: "https://www.acronis.com/en/support/documentation/CyberProtectionService/#appendix-a.html",
    tags: ["vpn", "site-to-site", "rede", "dr", "conectividade"],
  },
  {
    title: "Teste de recuperação de desastres - Guia prático",
    description: "Como planejar e executar testes periódicos de DR para garantir que seus planos de recuperação funcionam corretamente.",
    category: "Proteção",
    subcategory: "Disaster Recovery",
    type: "guia",
    tags: ["teste", "dr", "recuperação", "validação", "procedimento"],
  },

  // =====================================================
  // PROTEÇÃO - Backup Nuvem Pública
  // =====================================================
  {
    title: "Direct Backup to Public Cloud (AWS, Azure, Google)",
    description: "Como configurar backup direto para nuvem pública (AWS S3, Azure Blob, Google Cloud Storage) com deduplicação e criptografia.",
    category: "Proteção",
    subcategory: "Backup Nuvem Pública",
    type: "guia",
    tags: ["backup", "aws", "azure", "google cloud", "nuvem pública", "s3"],
  },
  {
    title: "Backup para AWS S3 - Configuração Detalhada",
    description: "Passo a passo para configurar backup direto para Amazon S3, incluindo criação de bucket, políticas IAM e classes de armazenamento.",
    category: "Proteção",
    subcategory: "Backup Nuvem Pública",
    type: "guia",
    tags: ["aws", "s3", "iam", "bucket", "armazenamento"],
  },
  {
    title: "Backup para Azure Blob Storage - Configuração",
    description: "Como configurar backup para Azure Blob Storage, incluindo conta de armazenamento, containers e políticas de acesso.",
    category: "Proteção",
    subcategory: "Backup Nuvem Pública",
    type: "guia",
    tags: ["azure", "blob", "conta de armazenamento", "container"],
  },

  // =====================================================
  // PROTEÇÃO - Restauração
  // =====================================================
  {
    title: "Como restaurar arquivos e pastas de um backup",
    description: "Procedimentos para restauração granular de arquivos, pastas, bancos de dados e máquinas virtuais completas a partir de backups.",
    category: "Proteção",
    subcategory: "Restauração",
    type: "guia",
    tags: ["restauração", "recuperação", "arquivos", "granular", "pastas"],
    content: `## Tipos de Restauração\n\n### Restauração de Arquivos\n1. Selecione o ponto de recuperação\n2. Navegue pela estrutura de pastas\n3. Selecione os arquivos desejados\n4. Escolha restaurar no local original ou alternativo\n5. Defina o comportamento para arquivos existentes\n\n### Restauração de Máquina Completa\n1. Crie mídia bootável ou use boot PXE\n2. Conecte ao console de recuperação\n3. Selecione o backup\n4. Mapeie os discos\n5. Inicie a restauração\n\n### Restauração para Máquina Virtual\nRestaure diretamente como VM em:\n- VMware vSphere\n- Microsoft Hyper-V\n- Nuvem Acronis`,
  },
  {
    title: "Restauração Bare-Metal (BMR)",
    description: "Como realizar a restauração completa de um servidor em hardware novo ou diferente usando mídia bootável e dissimilar restore.",
    category: "Proteção",
    subcategory: "Restauração",
    type: "guia",
    tags: ["bare-metal", "bmr", "dissimilar", "hardware", "mídia bootável"],
  },

  // =====================================================
  // PROTEÇÃO - Troubleshooting
  // =====================================================
  {
    title: "Erros comuns de backup e como resolver",
    description: "Diagnóstico e resolução dos erros mais frequentes durante operações de backup, incluindo falhas de conexão, espaço insuficiente e timeouts.",
    category: "Proteção",
    subcategory: "Troubleshooting",
    type: "troubleshooting",
    tags: ["erros", "backup", "diagnóstico", "resolução", "falha"],
    content: `## Erros Comuns\n\n### Erro: Espaço Insuficiente\n**Causa**: Destino de backup sem espaço\n**Solução**:\n1. Verifique o espaço disponível no destino\n2. Ajuste a política de retenção\n3. Habilite deduplicação\n4. Considere usar armazenamento em nuvem\n\n### Erro: Falha de Conexão\n**Causa**: Problemas de rede ou firewall\n**Solução**:\n1. Verifique conectividade com o destino\n2. Libere as portas necessárias (443, 8443)\n3. Configure exceções no proxy\n4. Teste com ping e traceroute\n\n### Erro: VSS Writer Falhou\n**Causa**: Serviço VSS com problemas\n**Solução**:\n1. Reinicie os serviços VSS\n2. Verifique espaço no volume de sombra\n3. Atualize drivers de storage\n4. Verifique logs do Event Viewer`,
  },
  {
    title: "Backup lento - Diagnóstico e otimização",
    description: "Como diagnosticar e resolver problemas de performance de backup, incluindo otimização de rede, deduplicação e agendamento.",
    category: "Proteção",
    subcategory: "Troubleshooting",
    type: "troubleshooting",
    tags: ["performance", "lento", "otimização", "rede", "deduplicação"],
  },

  // =====================================================
  // PROTEÇÃO - FAQ
  // =====================================================
  {
    title: "Qual a diferença entre backup completo, incremental e diferencial?",
    description: "Explicação detalhada dos tipos de backup, quando usar cada um e o impacto no espaço de armazenamento e tempo de recuperação.",
    category: "Proteção",
    subcategory: "FAQ",
    type: "faq",
    tags: ["backup", "incremental", "diferencial", "completo", "tipos"],
  },
  {
    title: "Como funciona a criptografia de dados nos backups?",
    description: "Explicação sobre os métodos de criptografia AES-256 utilizados para proteger dados em trânsito e em repouso nos backups.",
    category: "Proteção",
    subcategory: "FAQ",
    type: "faq",
    tags: ["criptografia", "aes-256", "segurança", "dados", "repouso"],
  },
  {
    title: "Qual o consumo de banda durante o backup?",
    description: "Informações sobre controle de largura de banda, deduplicação e compressão para otimizar o uso da rede durante backups.",
    category: "Proteção",
    subcategory: "FAQ",
    type: "faq",
    tags: ["banda", "rede", "deduplicação", "compressão", "otimização"],
  },
  {
    title: "Quanto espaço de armazenamento eu preciso?",
    description: "Como calcular o espaço necessário considerando tipo de backup, retenção, deduplicação e taxa de crescimento dos dados.",
    category: "Proteção",
    subcategory: "FAQ",
    type: "faq",
    tags: ["espaço", "armazenamento", "cálculo", "estimativa", "crescimento"],
  },
  {
    title: "O que acontece se o backup falhar?",
    description: "Entenda o sistema de alertas, retentativas automáticas e notificações quando um backup não é concluído com sucesso.",
    category: "Proteção",
    subcategory: "FAQ",
    type: "faq",
    tags: ["falha", "alerta", "retentativa", "notificação", "monitoramento"],
  },

  // =====================================================
  // OPERAÇÃO - RMM
  // =====================================================
  {
    title: "RMM - Monitoramento e Gerenciamento Remoto",
    description: "Guia completo para configuração do RMM: monitoramento proativo, alertas, automação de patches e scripts remotos.",
    category: "Operação",
    subcategory: "RMM",
    type: "guia",
    externalUrl: "https://www.acronis.com/en/support/documentation/CyberProtectionService/#advanced-management.html",
    tags: ["rmm", "monitoramento", "patches", "automação", "remoto"],
    content: `## RMM - Remote Monitoring and Management\n\n### Funcionalidades Principais\n\n1. **Monitoramento de Hardware**\n   - CPU, memória, disco, rede\n   - Temperatura e saúde dos componentes\n   - SMART status de discos\n\n2. **Monitoramento de Software**\n   - Serviços e processos\n   - Logs de eventos\n   - Aplicações instaladas\n\n3. **Gerenciamento de Patches**\n   - Windows Update\n   - Aplicativos de terceiros (200+)\n   - Teste e aprovação\n   - Agendamento de instalação\n\n4. **Acesso Remoto**\n   - Desktop remoto seguro\n   - Terminal remoto (PowerShell/SSH)\n   - Transferência de arquivos\n\n5. **Scripts e Automação**\n   - Biblioteca de scripts prontos\n   - Scripts personalizados\n   - Agendamento e execução em massa`,
  },
  {
    title: "RMM - Configuração de Alertas e Notificações",
    description: "Como configurar alertas personalizados para monitoramento proativo de CPU, memória, disco, serviços e eventos de segurança.",
    category: "Operação",
    subcategory: "RMM",
    type: "guia",
    tags: ["rmm", "alertas", "notificações", "monitoramento", "proativo"],
  },
  {
    title: "RMM - Gerenciamento de Patches do Windows e Terceiros",
    description: "Como configurar a distribuição automatizada de patches do Windows e de mais de 200 aplicativos de terceiros.",
    category: "Operação",
    subcategory: "RMM",
    type: "guia",
    tags: ["rmm", "patches", "windows update", "terceiros", "automação"],
  },
  {
    title: "RMM - Acesso Remoto e Suporte Técnico",
    description: "Como utilizar o acesso remoto para suporte técnico, incluindo desktop remoto, terminal, transferência de arquivos e chat.",
    category: "Operação",
    subcategory: "RMM",
    type: "guia",
    tags: ["rmm", "acesso remoto", "suporte", "desktop remoto", "terminal"],
  },

  // =====================================================
  // OPERAÇÃO - PSA
  // =====================================================
  {
    title: "PSA - Automação de Serviços Profissionais",
    description: "Como utilizar o PSA para gerenciamento de tickets, contratos SLA, faturamento e acompanhamento de tempo.",
    category: "Operação",
    subcategory: "PSA",
    type: "guia",
    tags: ["psa", "tickets", "sla", "faturamento", "suporte"],
  },

  // =====================================================
  // OPERAÇÃO - Console
  // =====================================================
  {
    title: "Console de Gerenciamento - Guia do Administrador",
    description: "Visão geral do console de gerenciamento centralizado para administrar todos os serviços de proteção, segurança e operação.",
    category: "Operação",
    subcategory: "Console",
    type: "guia",
    externalUrl: "https://www.acronis.com/support/documentation/AcronisCyberCloud/",
    tags: ["console", "gerenciamento", "centralizado", "administração", "painel"],
    content: `## Console de Gerenciamento\n\n### Áreas Principais\n\n1. **Dashboard**: Visão geral do status de todos os serviços\n2. **Dispositivos**: Lista e gerenciamento de todos os endpoints\n3. **Planos**: Criação e gerenciamento de planos de proteção\n4. **Alertas**: Central de alertas e notificações\n5. **Relatórios**: Relatórios de status, uso e compliance\n6. **Configurações**: Usuários, grupos e políticas\n\n### Hierarquia de Gerenciamento\n\n- **Parceiro**: Nível superior de administração\n- **Cliente**: Empresa/organização\n- **Unidade**: Departamento ou filial\n- **Dispositivo**: Endpoint individual`,
  },
  {
    title: "Console - Gerenciamento de Usuários e Permissões",
    description: "Como criar e gerenciar contas de usuário, definir funções e permissões de acesso ao console de gerenciamento.",
    category: "Operação",
    subcategory: "Console",
    type: "guia",
    externalUrl: "https://www.acronis.com/support/documentation/ManagementPortal/",
    tags: ["console", "usuários", "permissões", "funções", "acesso"],
  },

  // =====================================================
  // OPERAÇÃO - Instalação
  // =====================================================
  {
    title: "Instalação do Agente de Proteção - Windows",
    description: "Procedimento passo a passo para download, instalação e registro do agente de proteção em Windows (desktop e servidor).",
    category: "Operação",
    subcategory: "Instalação",
    type: "guia",
    externalUrl: "https://www.acronis.com/en/support/documentation/CyberProtectionService/#installing-software.html",
    tags: ["agente", "instalação", "windows", "registro", "deploy"],
    content: `## Instalação no Windows\n\n### Pré-requisitos\n\n- Windows 10/11 ou Server 2016+\n- 1 GB RAM disponível\n- 500 MB espaço em disco\n- Acesso à internet (porta 443)\n- Direitos de administrador\n\n### Instalação Manual\n\n1. Acesse o console de gerenciamento\n2. Vá em Dispositivos > Adicionar\n3. Baixe o instalador para Windows\n4. Execute como administrador\n5. Insira o token de registro\n6. Selecione os componentes desejados\n7. Conclua a instalação\n\n### Instalação em Massa (Deploy)\n\n- Via GPO (Group Policy)\n- Via SCCM/Intune\n- Via script PowerShell\n- Via ferramenta de RMM`,
  },
  {
    title: "Instalação do Agente de Proteção - macOS",
    description: "Procedimento de instalação do agente em macOS, incluindo concessão de permissões de disco completo e extensões de kernel.",
    category: "Operação",
    subcategory: "Instalação",
    type: "guia",
    tags: ["agente", "instalação", "macos", "permissões", "extensão"],
  },
  {
    title: "Instalação do Agente de Proteção - Linux",
    description: "Como instalar e configurar o agente de proteção em distribuições Linux (Ubuntu, RHEL, CentOS, Debian, SUSE).",
    category: "Operação",
    subcategory: "Instalação",
    type: "guia",
    tags: ["agente", "instalação", "linux", "ubuntu", "rhel"],
  },
  {
    title: "Deploy em massa do agente via GPO",
    description: "Como distribuir o agente de proteção automaticamente para centenas de máquinas usando Group Policy Objects do Active Directory.",
    category: "Operação",
    subcategory: "Instalação",
    type: "guia",
    tags: ["deploy", "gpo", "active directory", "massa", "automação"],
  },

  // =====================================================
  // OPERAÇÃO - Automação
  // =====================================================
  {
    title: "Automação de Tarefas com Scripts",
    description: "Como criar e agendar scripts personalizados (PowerShell, Bash) para automatizar tarefas repetitivas de manutenção e configuração.",
    category: "Operação",
    subcategory: "Automação",
    type: "guia",
    tags: ["scripts", "automação", "agendamento", "manutenção", "powershell"],
  },
  {
    title: "Workflows de Automação - Guia Prático",
    description: "Como criar workflows automatizados combinando múltiplas ações: varredura, patch, backup, reinício e verificação.",
    category: "Operação",
    subcategory: "Automação",
    type: "guia",
    externalUrl: "https://www.acronis.com/en/support/documentation/CyberProtectionService/#workflows.html",
    tags: ["workflows", "automação", "ações", "orquestração"],
  },

  // =====================================================
  // OPERAÇÃO - Relatórios
  // =====================================================
  {
    title: "Relatórios e Dashboards Executivos",
    description: "Como gerar e personalizar relatórios de status de proteção, uso de armazenamento, compliance e ameaças detectadas.",
    category: "Operação",
    subcategory: "Relatórios",
    type: "guia",
    tags: ["relatórios", "dashboard", "status", "compliance", "executivo"],
  },
  {
    title: "Relatório de Conformidade e Auditoria",
    description: "Como gerar relatórios de conformidade para auditorias internas e externas, incluindo evidências de backup e proteção.",
    category: "Operação",
    subcategory: "Relatórios",
    type: "guia",
    tags: ["conformidade", "auditoria", "evidências", "compliance", "lgpd"],
  },

  // =====================================================
  // OPERAÇÃO - Integrações
  // =====================================================
  {
    title: "Integrações com Ferramentas de Terceiros",
    description: "Visão geral das integrações disponíveis: ConnectWise, Datto RMM, NinjaOne, Kaseya, N-able, Microsoft Intune e outras.",
    category: "Operação",
    subcategory: "Integrações",
    type: "guia",
    externalUrl: "https://www.acronis.com/en/support/documentation/",
    tags: ["integrações", "connectwise", "datto", "ninjaone", "kaseya"],
  },

  // =====================================================
  // OPERAÇÃO - Troubleshooting
  // =====================================================
  {
    title: "Agente não aparece no console após instalação",
    description: "Diagnóstico e resolução para quando o agente é instalado mas não aparece no console de gerenciamento.",
    category: "Operação",
    subcategory: "Troubleshooting",
    type: "troubleshooting",
    tags: ["agente", "console", "registro", "diagnóstico", "instalação"],
    content: `## Diagnóstico\n\n### Verificar Serviço\n1. Abra services.msc\n2. Procure "Acronis Managed Machine Service"\n3. Verifique se está em execução\n4. Se parado, inicie e defina como Automático\n\n### Verificar Conectividade\n1. Teste acesso à porta 443 do datacenter\n2. Verifique configurações de proxy\n3. Teste resolução DNS\n\n### Verificar Logs\n1. Acesse C:\\ProgramData\\Acronis\\Logs\n2. Abra o arquivo mms.log\n3. Procure por erros de conexão ou autenticação\n\n### Re-registrar\n1. Abra o Acronis Cyber Protect Monitor\n2. Clique em "Registrar"\n3. Insira o novo token de registro`,
  },
  {
    title: "Performance lenta do console de gerenciamento",
    description: "Como otimizar a performance do console web, incluindo configurações de navegador, cache e limites de exibição.",
    category: "Operação",
    subcategory: "Troubleshooting",
    type: "troubleshooting",
    tags: ["console", "performance", "lento", "navegador", "otimização"],
  },

  // =====================================================
  // OPERAÇÃO - FAQ
  // =====================================================
  {
    title: "Como abrir um chamado de suporte técnico?",
    description: "Passo a passo para abrir chamados no portal do cliente, incluindo níveis de prioridade, SLA e informações necessárias.",
    category: "Operação",
    subcategory: "FAQ",
    type: "faq",
    tags: ["chamado", "suporte", "sla", "prioridade", "portal"],
  },
  {
    title: "Quais portas de rede precisam estar abertas?",
    description: "Lista completa de portas TCP/UDP necessárias para comunicação do agente com o console e serviços de nuvem.",
    category: "Operação",
    subcategory: "FAQ",
    type: "faq",
    tags: ["portas", "rede", "firewall", "tcp", "udp"],
    content: `## Portas Necessárias\n\n### Comunicação Principal\n| Porta | Protocolo | Destino | Uso |\n|-------|-----------|---------|-----|\n| 443 | TCP | *.acronis.com | Console e API |\n| 8443 | TCP | Datacenter | Gerenciamento |\n| 44445 | TCP | Agentes | Comunicação P2P |\n\n### Backup para Nuvem\n| Porta | Protocolo | Destino | Uso |\n|-------|-----------|---------|-----|\n| 443 | TCP | backup.acronis.com | Upload/Download |\n| 7770-7800 | TCP | Datacenter | Transferência |\n\n### Acesso Remoto\n| Porta | Protocolo | Destino | Uso |\n|-------|-----------|---------|-----|\n| 443 | TCP | remote.acronis.com | Sessão remota |\n| 6443 | TCP | Datacenter | Relay |`,
  },
  {
    title: "Como funciona o licenciamento por carga de trabalho?",
    description: "Explicação do modelo de licenciamento: workload (carga de trabalho), por GB, por dispositivo e pacotes de serviços.",
    category: "Operação",
    subcategory: "FAQ",
    type: "faq",
    tags: ["licenciamento", "workload", "preço", "pacote", "modelo"],
  },
  {
    title: "Qual a política de retenção de dados na nuvem?",
    description: "Detalhes sobre a política de retenção de dados na nuvem Acronis, incluindo períodos de retenção, exclusão e compliance.",
    category: "Operação",
    subcategory: "FAQ",
    type: "faq",
    tags: ["retenção", "nuvem", "política", "exclusão", "compliance"],
  },

  // =====================================================
  // OPERAÇÃO - Cyber Files Cloud
  // =====================================================
  {
    title: "Cyber Files Cloud - Compartilhamento Seguro de Arquivos",
    description: "Como configurar e utilizar o serviço de compartilhamento seguro de arquivos com criptografia, controle de acesso e auditoria.",
    category: "Operação",
    subcategory: "Files Cloud",
    type: "guia",
    externalUrl: "https://www.acronis.com/support/documentation/FilesCloudAdmin/",
    tags: ["files", "compartilhamento", "criptografia", "seguro", "colaboração"],
  },

  // =====================================================
  // OPERAÇÃO - Physical Data Shipping
  // =====================================================
  {
    title: "Physical Data Shipping - Envio Físico de Dados",
    description: "Como utilizar o serviço de envio físico de discos para migração inicial de grandes volumes de dados para a nuvem.",
    category: "Operação",
    subcategory: "Migração",
    type: "guia",
    externalUrl: "https://www.acronis.com/support/documentation/PhysicalDataShipping/",
    tags: ["migração", "envio físico", "disco", "dados", "initial seeding"],
  },
];

export const categories = [
  { id: "todos", label: "Todos" },
  { id: "Segurança", label: "Segurança" },
  { id: "Proteção", label: "Proteção" },
  { id: "Operação", label: "Operação" },
];
