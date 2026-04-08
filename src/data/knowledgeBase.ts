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
    content: `## Sensores Disponíveis\n\n### Endpoint\nInstale o agente de proteção com módulo XDR ativado em todos os dispositivos.\n\n### Email\nConfigure a integração com Microsoft 365 ou Google Workspace para monitoramento de emails.\n\n### Rede\nIntegre com firewalls compatíveis (Fortinet, Palo Alto, Sophos) via syslog.\n\n### Identidade\nConecte com Azure AD / Entra ID para detecção de comprometimento de contas.\n\n## Configuração Passo a Passo\n\n1. Acesse Configurações > Integrações > XDR\n2. Selecione o tipo de sensor\n3. Siga o assistente de configuração\n4. Valide a conexão com o teste integrado`,
  },
  {
    title: "XDR - Investigação e Resposta a Incidentes",
    description: "Como utilizar a timeline de ataque, realizar investigação forense e executar ações de resposta coordenadas em múltiplos vetores.",
    category: "Segurança",
    subcategory: "XDR",
    type: "guia",
    externalUrl: "https://www.acronis.com/en/support/documentation/CyberProtectionService/#xdr-extended-detection-response.html",
    tags: ["xdr", "investigação", "forense", "timeline", "resposta a incidentes"],
    content: `## Timeline de Ataque\n\nA timeline de ataque exibe visualmente toda a cadeia de eventos de um incidente, desde o vetor de entrada até as ações realizadas.\n\n### Como Investigar\n\n1. Acesse Segurança > Incidentes\n2. Selecione o incidente para investigar\n3. Analise a timeline visual\n4. Verifique os artefatos coletados\n5. Identifique o escopo do comprometimento\n\n### Ações de Resposta\n\n- **Isolar endpoint**: Desconectar da rede mantendo comunicação com o console\n- **Encerrar processo**: Finalizar processos maliciosos\n- **Quarentena**: Mover arquivos suspeitos para quarentena\n- **Rollback**: Reverter alterações usando backup\n- **Bloquear IoC**: Adicionar indicadores à blacklist`,
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
    content: `## Framework MITRE ATT&CK\n\nCada alerta EDR é mapeado a uma técnica específica do MITRE ATT&CK, facilitando a compreensão do ataque.\n\n### Táticas Mais Comuns\n\n1. **Initial Access (TA0001)**: Phishing, exploits, credenciais comprometidas\n2. **Execution (TA0002)**: Scripts, PowerShell, macros maliciosas\n3. **Persistence (TA0003)**: Chaves de registro, tarefas agendadas\n4. **Privilege Escalation (TA0004)**: Exploits de kernel, bypass UAC\n5. **Defense Evasion (TA0005)**: Ofuscação, desabilitar AV\n\n### Como Analisar\n\n1. Acesse o alerta EDR\n2. Visualize a técnica MITRE associada\n3. Analise a árvore de processos\n4. Verifique os artefatos coletados\n5. Execute ações de resposta necessárias`,
  },
  {
    title: "EDR - Isolamento e Contenção de Ameaças",
    description: "Procedimentos para isolar endpoints comprometidos, conter a propagação de ameaças e restaurar sistemas usando backup integrado.",
    category: "Segurança",
    subcategory: "EDR",
    type: "guia",
    externalUrl: "https://www.acronis.com/en/support/documentation/CyberProtectionService/#edr-endpoint-detection-response.html",
    tags: ["edr", "isolamento", "contenção", "quarentena", "restauração"],
    content: `## Isolamento de Endpoints\n\nO isolamento desconecta o endpoint da rede local, mantendo apenas a comunicação com o console de gerenciamento.\n\n### Quando Isolar\n\n- Detecção de malware ativo\n- Comportamento de ransomware identificado\n- Exfiltração de dados em andamento\n- Comprometimento confirmado\n\n### Procedimento\n\n1. Acesse o dispositivo no console\n2. Clique em "Isolar da rede"\n3. Confirme a ação\n4. Investigue o incidente\n5. Remedie a ameaça\n6. Remova o isolamento\n\n### Restauração via Backup\n\nSe necessário, restaure o sistema a partir do último backup limpo:\n1. Identifique o ponto de recuperação anterior ao comprometimento\n2. Inicie a restauração\n3. Aplique patches e atualizações\n4. Monitore o sistema restaurado`,
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
    externalUrl: "https://www.acronis.com/en/support/documentation/CyberProtectionService/#a-mdr-overview.html",
    tags: ["mdr", "relatórios", "métricas", "mttd", "mttr"],
    content: `## Métricas Principais\n\n### MTTD (Mean Time to Detect)\nTempo médio para detectar uma ameaça. Meta: < 5 minutos.\n\n### MTTR (Mean Time to Respond)\nTempo médio para responder a um incidente. Meta: < 30 minutos.\n\n### Relatório Mensal\n\nO relatório inclui:\n- Total de alertas investigados\n- Incidentes confirmados e contidos\n- Ameaças por categoria e severidade\n- Recomendações de melhoria\n- Score de postura de segurança\n\n### Indicadores de Performance\n\n| Métrica | Meta | Descrição |\n|---------|------|-----------||\n| MTTD | < 5 min | Tempo de detecção |\n| MTTR | < 30 min | Tempo de resposta |\n| Falsos Positivos | < 5% | Taxa de FP |`,
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
    externalUrl: "https://www.acronis.com/en/support/documentation/CyberProtectionService/#advanced-dlp.html",
    tags: ["dlp", "regras", "cpf", "cnpj", "lgpd", "proteção de dados"],
    content: `## Criando Políticas DLP\n\n### Passo a Passo\n\n1. Acesse Configurações > DLP > Políticas\n2. Clique em "Criar Política"\n3. Defina o nome e descrição\n4. Selecione os tipos de dados a proteger\n5. Escolha os canais a monitorar\n6. Defina a ação (bloquear, alertar, registrar)\n7. Aplique a política aos grupos desejados\n\n### Regras Predefinidas para LGPD\n\n- **CPF**: Detecta números de CPF em documentos e comunicações\n- **CNPJ**: Detecta números de CNPJ\n- **Dados Pessoais**: Nome + endereço + telefone combinados\n- **Dados Financeiros**: Números de conta e agência bancária\n- **Dados de Saúde**: Informações médicas e CID\n\n### Ações Disponíveis\n\n- **Bloquear**: Impede a transferência\n- **Alertar**: Permite mas notifica o administrador\n- **Registrar**: Apenas registra no log para auditoria`,
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
    content: `## Postura de Segurança M365\n\nAvalie e melhore continuamente a configuração de segurança do seu tenant Microsoft 365.\n\n### Verificações Realizadas\n\n- **MFA**: Autenticação multifator ativada para todos os usuários\n- **Políticas de senha**: Complexidade e expiração configuradas\n- **Acesso condicional**: Regras de acesso baseadas em contexto\n- **Compartilhamento externo**: Configurações de compartilhamento seguras\n- **Auditoria**: Logs de auditoria habilitados\n- **Anti-phishing**: Políticas de proteção contra phishing\n\n### Score de Segurança\n\nO score varia de 0 a 100 e indica a maturidade da configuração.\n\n| Score | Classificação |\n|-------|---------------|\n| 90-100 | Excelente |\n| 70-89 | Bom |\n| 50-69 | Regular |\n| < 50 | Crítico |`,
  },
  {
    title: "Avaliação de Vulnerabilidades e Gerenciamento de Patches",
    description: "Como executar varreduras de vulnerabilidades em sua infraestrutura e gerenciar a aplicação de patches de segurança de forma automatizada.",
    category: "Segurança",
    subcategory: "Vulnerabilidades",
    type: "guia",
    externalUrl: "https://www.acronis.com/en/support/documentation/CyberProtectionService/#cyber-protection-understand-level-of-protection.html",
    tags: ["vulnerabilidades", "patches", "varredura", "cve", "remediação"],
    content: `## Gerenciamento de Vulnerabilidades\n\n### Varredura Automática\nConfigure varreduras periódicas para identificar vulnerabilidades em:\n- Sistemas operacionais (Windows, macOS, Linux)\n- Aplicativos de terceiros (Adobe, Java, Chrome, etc.)\n- Configurações de segurança\n\n### Classificação por Severidade\n- **Crítica (CVSS 9.0-10.0)**: Correção imediata\n- **Alta (CVSS 7.0-8.9)**: Correção em 7 dias\n- **Média (CVSS 4.0-6.9)**: Correção em 30 dias\n- **Baixa (CVSS 0.1-3.9)**: Próxima janela de manutenção\n\n### Gerenciamento de Patches\n\n1. Execute a varredura de vulnerabilidades\n2. Revise as vulnerabilidades encontradas\n3. Aprove os patches recomendados\n4. Agende a instalação\n5. Verifique os resultados`,
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
    externalUrl: "https://www.acronis.com/en/support/documentation/CyberProtectionService/#44130.html",
    tags: ["email", "quarentena", "filtragem", "whitelist", "blacklist"],
    content: `## Regras de Filtragem\n\n### Listas de Remetentes\n\n- **Lista de Permitidos (Whitelist)**: Remetentes confiáveis que nunca serão bloqueados\n- **Lista de Bloqueados (Blacklist)**: Remetentes que serão sempre rejeitados\n\n### Gerenciamento de Quarentena\n\n1. Acesse Email Security > Quarentena\n2. Revise os emails em quarentena\n3. Libere emails legítimos\n4. Exclua emails maliciosos\n5. Configure relatórios de quarentena para os usuários\n\n### Regras Personalizadas\n\nCrie regras baseadas em:\n- Remetente / destinatário\n- Assunto / conteúdo\n- Tipo de anexo\n- Tamanho do email\n- Cabeçalhos específicos`,
  },
  {
    title: "Como identificar um email de phishing",
    description: "Guia visual para identificar tentativas de phishing, verificar legitimidade de remetentes e reportar emails suspeitos.",
    category: "Segurança",
    subcategory: "Email Security",
    type: "faq",
    externalUrl: "https://www.acronis.com/en/support/documentation/CyberProtectionService/#44130.html",
    tags: ["phishing", "email", "identificação", "segurança"],
    content: `## Sinais de Email de Phishing\n\n### Verificações Básicas\n\n1. **Remetente suspeito**: Verifique o endereço real (não apenas o nome exibido)\n2. **Urgência excessiva**: "Sua conta será bloqueada em 24 horas"\n3. **Links suspeitos**: Passe o mouse sobre links antes de clicar\n4. **Erros gramaticais**: Textos mal escritos ou traduzidos\n5. **Anexos inesperados**: Especialmente .exe, .zip, .docm\n\n### O que fazer\n\n- **Não clique** em links suspeitos\n- **Não abra** anexos inesperados\n- **Não forneça** dados pessoais ou senhas\n- **Reporte** o email como phishing\n- **Notifique** a equipe de TI/segurança`,
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
    externalUrl: "https://www.acronis.com/en/support/documentation/CyberProtectionService/#email-archiving.html",
    tags: ["email", "arquivamento", "microsoft 365", "conformidade", "ediscovery"],
    content: `## Arquivamento de Email\n\nO arquivamento de email armazena uma cópia imutável de todos os emails para fins regulatórios e legais.\n\n### Configuração Inicial\n\n1. Acesse o console de gerenciamento\n2. Navegue até Email Archiving\n3. Conecte seu tenant Microsoft 365\n4. Configure as políticas de retenção\n5. Defina os grupos de usuários a proteger\n\n### Políticas de Retenção\n\n- **Curto prazo**: 1-3 anos (requisitos operacionais)\n- **Médio prazo**: 5-7 anos (requisitos regulatórios)\n- **Longo prazo**: 10+ anos (setores regulados)\n\n### Conformidade\n\nAtende aos requisitos de:\n- LGPD (Brasil)\n- GDPR (Europa)\n- SOX (Sarbanes-Oxley)\n- HIPAA (Saúde)`,
  },
  {
    title: "Email Archiving - Pesquisa e eDiscovery",
    description: "Como realizar buscas avançadas no arquivo de emails, exportar resultados para auditorias e atender requisições legais de eDiscovery.",
    category: "Segurança",
    subcategory: "Email Archiving",
    type: "guia",
    externalUrl: "https://www.acronis.com/en/support/documentation/CyberProtectionService/#email-archiving.html",
    tags: ["email", "pesquisa", "ediscovery", "auditoria", "exportação"],
    content: `## Pesquisa e eDiscovery\n\n### Busca Avançada\n\nPesquise por:\n- Remetente / destinatário\n- Data / período\n- Assunto / conteúdo\n- Tipo de anexo\n- Palavras-chave com operadores booleanos (AND, OR, NOT)\n\n### Exportação\n\nExporte resultados em formatos:\n- PST (compatível com Outlook)\n- EML (formato padrão de email)\n- PDF (para documentação)\n\n### Processo de eDiscovery\n\n1. Receba a requisição legal\n2. Defina o escopo da busca\n3. Execute a pesquisa nos arquivos\n4. Revise os resultados\n5. Exporte e entregue ao solicitante\n6. Documente todo o processo`,
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
    externalUrl: "https://www.acronis.com/en/support/documentation/CyberProtectionService/#security-awareness-training.html",
    tags: ["treinamento", "conscientização", "phishing", "simulação", "colaboradores"],
    content: `## Treinamento de Conscientização\n\n### Módulos Disponíveis\n\n1. **Phishing e Engenharia Social**: Como reconhecer e evitar ataques\n2. **Senhas Seguras**: Boas práticas de criação e gerenciamento\n3. **Segurança de Dispositivos**: Proteção de laptops e celulares\n4. **Dados Confidenciais**: Como lidar com informações sensíveis\n5. **Trabalho Remoto**: Segurança em home office\n6. **LGPD**: Proteção de dados pessoais\n\n### Simulações de Phishing\n\nCrie campanhas de simulação para testar a maturidade dos colaboradores:\n- Templates realistas personalizáveis\n- Landing pages educativas\n- Relatórios de cliques e denúncias\n- Treinamento automático para quem falhar`,
  },
  {
    title: "SAT - Criando Campanhas de Simulação de Phishing",
    description: "Como criar e gerenciar campanhas de simulação de phishing para avaliar a consciência de segurança dos colaboradores da empresa.",
    category: "Segurança",
    subcategory: "SAT",
    type: "guia",
    externalUrl: "https://www.acronis.com/en/support/documentation/CyberProtectionService/#security-awareness-training.html",
    tags: ["sat", "campanha", "simulação", "phishing", "avaliação"],
    content: `## Campanhas de Simulação\n\n### Criando uma Campanha\n\n1. Acesse SAT > Campanhas > Nova Campanha\n2. Selecione o template de phishing\n3. Personalize o email (remetente, assunto, conteúdo)\n4. Defina a landing page educativa\n5. Selecione os destinatários\n6. Agende o envio\n\n### Templates Disponíveis\n\n- Redefinição de senha\n- Fatura/boleto pendente\n- Entrega de encomenda\n- Convite para reunião\n- Atualização de sistema\n\n### Relatórios\n\n- Taxa de abertura do email\n- Taxa de clique no link\n- Taxa de inserção de credenciais\n- Taxa de denúncia\n- Evolução ao longo do tempo`,
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
    externalUrl: "https://www.acronis.com/en/support/documentation/CyberProtectionService/#antimalware-and-web-protection.html",
    tags: ["ransomware", "criptografia", "rollback", "proteção", "anti-ransomware"],
    content: `## Proteção Anti-Ransomware\n\n### Como Funciona\n\nA tecnologia anti-ransomware utiliza análise comportamental para detectar processos que tentam criptografar arquivos em massa.\n\n### Mecanismos de Proteção\n\n1. **Detecção comportamental**: Identifica padrões de criptografia maliciosa\n2. **Cache de arquivos**: Mantém cópias temporárias dos arquivos sendo modificados\n3. **Rollback automático**: Reverte alterações feitas pelo ransomware\n4. **Proteção de backup**: Impede que malware exclua ou altere backups\n5. **Proteção de MBR**: Previne alterações no Master Boot Record\n\n### Processo de Proteção\n\n1. Processo suspeito detectado\n2. Atividade de criptografia identificada\n3. Processo bloqueado automaticamente\n4. Arquivos afetados restaurados do cache\n5. Alerta enviado ao administrador`,
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
    content: `## Proteção GenAI\n\nMonitore e controle o uso de ferramentas de IA generativa para evitar vazamento de dados corporativos.\n\n### Ferramentas Monitoradas\n\n- ChatGPT / OpenAI\n- Google Gemini / Bard\n- Microsoft Copilot\n- Claude / Anthropic\n- Midjourney, DALL-E\n- GitHub Copilot\n\n### Políticas de Controle\n\n1. **Bloquear**: Impedir acesso a ferramentas de IA\n2. **Monitorar**: Permitir mas registrar uso\n3. **DLP integrado**: Bloquear envio de dados sensíveis\n4. **Alertar**: Notificar administrador sobre uso\n\n### Configuração\n\n1. Acesse Segurança > GenAI Protection\n2. Selecione as ferramentas a monitorar\n3. Defina a política por grupo de usuários\n4. Configure alertas e notificações`,
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
    externalUrl: "https://www.acronis.com/en/support/documentation/CyberProtectionService/#antimalware-and-web-protection.html",
    tags: ["ransomware", "ataque", "recuperação", "incidente", "resposta"],
    content: `## Sinais de Ataque de Ransomware\n\n1. Arquivos com extensões estranhas (.encrypted, .locked)\n2. Notas de resgate na área de trabalho\n3. Lentidão extrema no sistema\n4. Processos desconhecidos consumindo CPU\n5. Conexões de rede incomuns\n\n## Ações Imediatas\n\n1. **Isolar** o dispositivo da rede (desconectar cabo/WiFi)\n2. **Não desligar** o computador (evidências na memória)\n3. **Documentar** tudo com fotos/prints\n4. **Notificar** a equipe de segurança\n5. **Verificar** o escopo do comprometimento\n\n## Recuperação\n\n1. Identificar a variante do ransomware\n2. Verificar backups disponíveis\n3. Restaurar sistemas a partir do último backup limpo\n4. Aplicar patches e correções\n5. Monitorar sistemas restaurados`,
  },
  {
    title: "Agente de proteção não conecta ao console",
    description: "Procedimentos de diagnóstico quando o agente de proteção não se conecta ao console de gerenciamento, incluindo verificação de firewall e proxy.",
    category: "Segurança",
    subcategory: "Troubleshooting",
    type: "troubleshooting",
    externalUrl: "https://kb.acronis.com/",
    tags: ["agente", "conexão", "firewall", "proxy", "diagnóstico"],
    content: `## Diagnóstico de Conexão do Agente\n\n### Verificar Serviço\n1. Abra services.msc\n2. Procure "Acronis Managed Machine Service"\n3. Verifique se está em execução\n\n### Verificar Conectividade\n1. Teste ping para cloud.acronis.com\n2. Verifique acesso à porta 443\n3. Teste com: telnet cloud.acronis.com 443\n4. Verifique configurações de proxy\n\n### Verificar Firewall\n\nLibere as seguintes URLs:\n- *.acronis.com\n- *.backup.acronis.com\n\n### Verificar Logs\n1. Acesse C:\\ProgramData\\Acronis\\Logs\n2. Abra mms.log\n3. Procure erros de conexão\n\n### Re-registrar o Agente\n1. Abra o Acronis Cyber Protect Monitor\n2. Clique em "Registrar"\n3. Insira o novo token de registro`,
  },
  {
    title: "Falso positivo na detecção de ameaças",
    description: "Como identificar e resolver falsos positivos, adicionar exclusões e reportar detecções incorretas para melhoria do motor de detecção.",
    category: "Segurança",
    subcategory: "Troubleshooting",
    type: "troubleshooting",
    externalUrl: "https://kb.acronis.com/",
    tags: ["falso positivo", "exclusão", "detecção", "whitelist"],
    content: `## Gerenciando Falsos Positivos\n\n### Identificação\n\nUm falso positivo ocorre quando um arquivo ou processo legítimo é detectado como ameaça.\n\n### Como Resolver\n\n1. **Verifique a detecção**: Confirme que o arquivo é realmente seguro\n2. **Adicione exclusão**: Configurações > Antimalware > Exclusões\n3. **Tipos de exclusão**:\n   - Por caminho de arquivo\n   - Por nome do processo\n   - Por hash do arquivo\n   - Por tipo de detecção\n\n### Reportar Falso Positivo\n\n1. Acesse o alerta de detecção\n2. Clique em "Reportar como falso positivo"\n3. Forneça contexto sobre o arquivo/processo\n4. A equipe analisará e atualizará as assinaturas`,
  },
  {
    title: "Melhores práticas de segurança para endpoints",
    description: "Checklist completo de configurações recomendadas para proteger endpoints corporativos contra ameaças modernas.",
    category: "Segurança",
    subcategory: "Boas Práticas",
    type: "guia",
    externalUrl: "https://www.acronis.com/en/support/documentation/CyberProtectionService/#antimalware-and-web-protection.html",
    tags: ["endpoints", "boas práticas", "configuração", "proteção", "checklist"],
    content: `## Checklist de Segurança para Endpoints\n\n### Proteção Básica\n- ✅ Antimalware ativado com varredura em tempo real\n- ✅ Proteção web ativada\n- ✅ Firewall configurado\n- ✅ Atualizações automáticas habilitadas\n\n### Proteção Avançada\n- ✅ EDR/XDR ativado\n- ✅ Proteção anti-ransomware\n- ✅ Controle de dispositivos USB\n- ✅ DLP configurado\n- ✅ Proteção de email\n\n### Backup e Recuperação\n- ✅ Backup diário configurado\n- ✅ Backup em pelo menos 2 destinos\n- ✅ Restauração testada periodicamente\n\n### Gerenciamento\n- ✅ Patches atualizados (OS e terceiros)\n- ✅ Alertas configurados\n- ✅ Relatórios semanais habilitados`,
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
    externalUrl: "https://www.acronis.com/en/support/documentation/CyberProtectionService/#supported-operating-systems.html",
    tags: ["compatibilidade", "sistemas operacionais", "requisitos"],
    content: `## Sistemas Operacionais Suportados\n\n### Windows Desktop\n- Windows 11 (todas as edições)\n- Windows 10 (todas as edições)\n\n### Windows Server\n- Windows Server 2025\n- Windows Server 2022\n- Windows Server 2019\n- Windows Server 2016\n- Windows Server 2012 R2\n\n### macOS\n- macOS 15 Sequoia\n- macOS 14 Sonoma\n- macOS 13 Ventura\n- macOS 12 Monterey\n\n### Linux\n- Ubuntu 18.04, 20.04, 22.04, 24.04\n- RHEL 7, 8, 9\n- CentOS 7, 8\n- Debian 10, 11, 12\n- SUSE Linux Enterprise Server 12, 15`,
  },
  {
    title: "Qual a diferença entre EDR, XDR e MDR?",
    description: "Comparação detalhada entre as soluções EDR (endpoint), XDR (estendida) e MDR (gerenciada), com recomendações de quando usar cada uma.",
    category: "Segurança",
    subcategory: "FAQ",
    type: "faq",
    externalUrl: "https://www.acronis.com/en/support/documentation/CyberProtectionService/#edr-endpoint-detection-response.html",
    tags: ["edr", "xdr", "mdr", "comparação", "diferenças"],
    content: `## EDR vs XDR vs MDR\n\n### EDR (Endpoint Detection and Response)\n- Foco: Endpoints (computadores, servidores)\n- Quem opera: Sua equipe de TI\n- Ideal para: Empresas com equipe de segurança interna\n\n### XDR (Extended Detection and Response)\n- Foco: Endpoints + Email + Rede + Identidade\n- Quem opera: Sua equipe de TI\n- Ideal para: Empresas que precisam de visibilidade completa\n\n### MDR (Managed Detection and Response)\n- Foco: Todos os vetores (operado por especialistas)\n- Quem opera: Equipe SOC terceirizada 24/7\n- Ideal para: Empresas sem equipe de segurança dedicada\n\n### Recomendação\n\n| Cenário | Solução |\n|---------|---------|\n| Equipe de TI básica | EDR |\n| Equipe de segurança | XDR |\n| Sem equipe dedicada | MDR |`,
  },
  {
    title: "O que é MITRE ATT&CK e como é utilizado?",
    description: "Explicação do framework MITRE ATT&CK, como as detecções são mapeadas a técnicas de ataque e como isso ajuda na resposta a incidentes.",
    category: "Segurança",
    subcategory: "FAQ",
    type: "faq",
    externalUrl: "https://attack.mitre.org/",
    tags: ["mitre", "att&ck", "framework", "técnicas", "táticas"],
    content: `## Framework MITRE ATT&CK\n\n### O que é?\n\nO MITRE ATT&CK é uma base de conhecimento globalmente reconhecida que cataloga táticas, técnicas e procedimentos (TTPs) utilizados por adversários em ataques cibernéticos.\n\n### Estrutura\n\n- **Táticas**: O objetivo do atacante (ex: acesso inicial, execução)\n- **Técnicas**: Como o atacante atinge o objetivo (ex: phishing, exploits)\n- **Procedimentos**: Implementações específicas de técnicas\n\n### Como é Utilizado\n\n1. **Detecção**: Alertas são mapeados a técnicas MITRE\n2. **Investigação**: Entenda o contexto do ataque\n3. **Cobertura**: Identifique gaps na proteção\n4. **Comunicação**: Linguagem comum entre equipes`,
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
    externalUrl: "https://www.acronis.com/en/support/documentation/CyberProtectionService/#backup-and-recovery.html",
    tags: ["backup", "plano de proteção", "retenção", "gfs", "limpeza"],
    content: `## Retenção GFS (Avô-Pai-Filho)\n\n### Configuração Recomendada\n\n- **Diário (Filho)**: Manter últimos 7 dias\n- **Semanal (Pai)**: Manter últimas 4 semanas\n- **Mensal (Avô)**: Manter últimos 12 meses\n- **Anual**: Manter últimos 3-7 anos\n\n### Destinos de Backup\n\n1. **Armazenamento local**: NAS, SAN, disco\n2. **Nuvem Acronis**: Datacenter seguro\n3. **Nuvem pública**: AWS S3, Azure Blob, Google Cloud\n4. **Fita**: LTO para retenção de longo prazo`,
  },
  {
    title: "Backup de Máquinas Virtuais (VMware e Hyper-V)",
    description: "Como configurar backup sem agente para ambientes VMware vSphere e Microsoft Hyper-V, incluindo CBT e restauração granular.",
    category: "Proteção",
    subcategory: "Backup",
    type: "guia",
    externalUrl: "https://www.acronis.com/en/support/documentation/CyberProtectionService/#backup-and-recovery.html",
    tags: ["backup", "vmware", "hyper-v", "máquina virtual", "cbt", "agentless"],
    content: `## Backup de Máquinas Virtuais\n\n### VMware vSphere\n\n- Backup sem agente via vCenter/ESXi\n- CBT (Changed Block Tracking) para incrementais rápidos\n- Restauração granular de arquivos, pastas e itens de aplicação\n- Restauração instantânea (boot direto do backup)\n\n### Microsoft Hyper-V\n\n- Backup via VSS integration\n- Suporte a geração 1 e 2\n- Cluster Shared Volumes (CSV)\n- Restauração granular e instantânea\n\n### Recursos Avançados\n\n- **Instant Restore**: Boot da VM direto do backup em segundos\n- **Replicação**: Copie VMs entre hosts\n- **Validação**: Teste automático de integridade do backup\n- **Mapa de proteção**: Visualize VMs protegidas e desprotegidas`,
  },
  {
    title: "Backup de Bancos de Dados (SQL Server, Oracle, MySQL)",
    description: "Procedimentos para backup consistente de bancos de dados em produção, incluindo backup de logs de transação e restauração point-in-time.",
    category: "Proteção",
    subcategory: "Backup",
    type: "guia",
    externalUrl: "https://www.acronis.com/en/support/documentation/CyberProtectionService/#backup-and-recovery.html",
    tags: ["backup", "sql server", "oracle", "mysql", "banco de dados", "point-in-time"],
    content: `## Backup de Bancos de Dados\n\n### SQL Server\n\n- Backup completo e de logs de transação\n- Restauração point-in-time\n- Suporte a Always On Availability Groups\n- Restauração de databases individuais\n\n### Oracle Database\n\n- Integração com RMAN\n- Backup de archive logs\n- Restauração point-in-time\n\n### MySQL / MariaDB\n\n- Backup completo do servidor\n- Restauração de databases individuais\n- Compatível com InnoDB e MyISAM\n\n### Boas Práticas\n\n1. Faça backup dos logs de transação a cada 15-30 minutos\n2. Teste a restauração periodicamente\n3. Monitore o tamanho dos logs\n4. Mantenha backups em pelo menos 2 locais`,
  },
  {
    title: "Proteção Contínua de Dados (CDP)",
    description: "Como configurar a proteção contínua de dados para RPO próximo de zero, monitorando alterações em tempo real.",
    category: "Proteção",
    subcategory: "Backup",
    type: "guia",
    externalUrl: "https://www.acronis.com/en/support/documentation/CyberProtectionService/#backup-and-recovery.html",
    tags: ["cdp", "proteção contínua", "rpo", "tempo real"],
    content: `## Proteção Contínua de Dados (CDP)\n\n### O que é CDP?\n\nO CDP monitora alterações em tempo real e captura cada modificação de arquivo, permitindo restauração a qualquer ponto no tempo.\n\n### Benefícios\n\n- **RPO próximo de zero**: Perda mínima de dados\n- **Granularidade**: Restaure qualquer versão de arquivo\n- **Transparente**: Funciona em segundo plano sem impacto\n\n### Configuração\n\n1. Ative o CDP no plano de proteção\n2. Selecione os arquivos/pastas a monitorar\n3. Defina o destino do CDP\n4. Configure o período de retenção\n\n### Casos de Uso\n\n- Documentos em constante edição\n- Desenvolvimento de software (código-fonte)\n- Dados financeiros em tempo real\n- Ambientes de criação de conteúdo`,
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
    externalUrl: "https://www.acronis.com/en/support/documentation/CyberProtectionService/#backup-and-recovery.html",
    tags: ["microsoft 365", "exchange", "onedrive", "sharepoint", "teams"],
    content: `## Escopo de Proteção\n\n### Exchange Online\n- Caixas de correio (emails, contatos, calendário)\n- Pastas públicas\n- Arquivos mortos\n\n### OneDrive for Business\n- Todos os arquivos e pastas\n- Versões de documentos\n- Lixeira\n\n### SharePoint Online\n- Sites e subsites\n- Bibliotecas de documentos\n- Listas\n\n### Microsoft Teams\n- Mensagens de canais\n- Arquivos compartilhados\n- Configurações de equipes\n\n## Restauração Granular\n\nRestaure itens individuais sem afetar outros dados:\n- Email específico\n- Arquivo individual do OneDrive\n- Item de lista do SharePoint\n- Conversa do Teams`,
  },
  {
    title: "Backup M365 - Configuração Inicial e Autenticação",
    description: "Passo a passo para configurar a conexão com o tenant Microsoft 365, autenticação via Azure AD e concessão de permissões necessárias.",
    category: "Proteção",
    subcategory: "Backup M365",
    type: "guia",
    externalUrl: "https://www.acronis.com/en/support/documentation/CyberProtectionService/#backup-and-recovery.html",
    tags: ["microsoft 365", "azure ad", "autenticação", "permissões", "tenant"],
    content: `## Configuração Inicial\n\n### Pré-requisitos\n\n- Conta de administrador global do Microsoft 365\n- Acesso ao Azure AD / Entra ID\n- Plano de backup M365 ativo\n\n### Passo a Passo\n\n1. Acesse o console de gerenciamento\n2. Navegue até Microsoft 365 > Configurar\n3. Clique em "Autorizar acesso"\n4. Faça login com a conta de administrador\n5. Conceda as permissões solicitadas\n6. Selecione os usuários/grupos a proteger\n7. Configure o agendamento de backup\n\n### Permissões Necessárias\n\n- **Exchange**: ApplicationImpersonation\n- **OneDrive/SharePoint**: Sites.FullControl.All\n- **Teams**: Group.ReadWrite.All\n- **Users**: User.Read.All`,
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
    content: `## DR Híbrido\n\n### Arquitetura\n\nCombine infraestrutura local com nuvem para criar uma solução de DR resiliente e econômica.\n\n### Cenários\n\n1. **Local → Nuvem**: Failover para nuvem quando o site local falhar\n2. **Nuvem → Local**: Failback para infraestrutura local após recuperação\n3. **Local → Local**: Replicação entre sites físicos\n\n### Componentes\n\n- **VPN Gateway**: Conecta site local à nuvem\n- **Replicação**: Sincronização contínua de dados\n- **Runbooks**: Scripts de automação de failover\n- **Monitoramento**: Verificação de saúde contínua\n\n### Benefícios\n\n- Menor custo que DR 100% em nuvem\n- Flexibilidade de escolha de destino\n- Tempo de recuperação otimizado\n- Teste sem impacto na produção`,
  },
  {
    title: "DR - Configuração de VPN Site-to-Site",
    description: "Como configurar VPN site-to-site para conectar a infraestrutura local com o ambiente de disaster recovery na nuvem.",
    category: "Proteção",
    subcategory: "Disaster Recovery",
    type: "guia",
    externalUrl: "https://www.acronis.com/en/support/documentation/CyberProtectionService/#appendix-a.html",
    tags: ["vpn", "site-to-site", "rede", "dr", "conectividade"],
    content: `## VPN Site-to-Site para DR\n\n### Pré-requisitos\n\n- Firewall/roteador compatível com IPsec\n- IP público fixo no site local\n- Plano de DR ativo\n\n### Configuração\n\n1. Acesse Disaster Recovery > Conectividade\n2. Selecione "VPN Site-to-Site"\n3. Configure os parâmetros IPsec:\n   - IKE version: IKEv2\n   - Encryption: AES-256\n   - Authentication: SHA-256\n   - DH Group: 14\n4. Insira o IP público do seu gateway\n5. Baixe a configuração para seu equipamento\n6. Aplique no firewall local\n7. Teste a conexão\n\n### Verificação\n\n- Ping entre redes\n- Teste de failover\n- Validação de rotas`,
  },
  {
    title: "Teste de recuperação de desastres - Guia prático",
    description: "Como planejar e executar testes periódicos de DR para garantir que seus planos de recuperação funcionam corretamente.",
    category: "Proteção",
    subcategory: "Disaster Recovery",
    type: "guia",
    externalUrl: "https://www.acronis.com/support/documentation/DisasterRecovery/",
    tags: ["teste", "dr", "recuperação", "validação", "procedimento"],
    content: `## Teste de DR\n\n### Frequência Recomendada\n\n- **Trimestral**: Teste completo de failover\n- **Mensal**: Verificação de replicação\n- **Semanal**: Monitoramento de saúde\n\n### Procedimento de Teste\n\n1. **Planejamento**: Defina escopo, participantes e critérios de sucesso\n2. **Comunicação**: Notifique todos os envolvidos\n3. **Execução**: Inicie o failover de teste\n4. **Validação**: Teste aplicações e serviços\n5. **Documentação**: Registre resultados e lições aprendidas\n6. **Cleanup**: Encerre o teste e restaure o estado normal\n\n### O que Validar\n\n- Conectividade de rede\n- Acesso a aplicações críticas\n- Performance dos servidores em DR\n- Integridade dos dados\n- Tempo de failover (RTO)`,
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
    externalUrl: "https://www.acronis.com/en/support/documentation/CyberProtectionService/#backup-and-recovery.html",
    tags: ["backup", "aws", "azure", "google cloud", "nuvem pública", "s3"],
    content: `## Backup Direto para Nuvem Pública\n\n### Provedores Suportados\n\n- **AWS S3**: Standard, Intelligent-Tiering, Glacier\n- **Azure Blob**: Hot, Cool, Archive\n- **Google Cloud Storage**: Standard, Nearline, Coldline\n\n### Configuração\n\n1. Crie as credenciais no provedor de nuvem\n2. Acesse Configurações > Destinos de Backup\n3. Adicione o destino de nuvem pública\n4. Insira as credenciais de acesso\n5. Selecione o bucket/container\n6. Configure criptografia e deduplicação\n\n### Segurança\n\n- Criptografia AES-256 em trânsito e repouso\n- Deduplicação na origem\n- Compressão automática\n- Verificação de integridade`,
  },
  {
    title: "Backup para AWS S3 - Configuração Detalhada",
    description: "Passo a passo para configurar backup direto para Amazon S3, incluindo criação de bucket, políticas IAM e classes de armazenamento.",
    category: "Proteção",
    subcategory: "Backup Nuvem Pública",
    type: "guia",
    externalUrl: "https://www.acronis.com/en/support/documentation/CyberProtectionService/#backup-and-recovery.html",
    tags: ["aws", "s3", "iam", "bucket", "armazenamento"],
    content: `## Backup para AWS S3\n\n### Criar Bucket S3\n\n1. Acesse o console AWS\n2. Navegue até S3 > Create Bucket\n3. Defina nome e região\n4. Ative versionamento\n5. Configure criptografia (SSE-S3 ou SSE-KMS)\n\n### Criar Política IAM\n\nPermissões mínimas necessárias:\n- s3:PutObject\n- s3:GetObject\n- s3:DeleteObject\n- s3:ListBucket\n- s3:GetBucketLocation\n\n### Classes de Armazenamento\n\n| Classe | Uso | Custo |\n|--------|-----|-------|\n| Standard | Dados ativos | $$$$ |\n| Intelligent-Tiering | Acesso variável | $$$ |\n| Glacier Instant | Arquivo rápido | $$ |\n| Glacier Deep | Arquivo longo prazo | $ |`,
  },
  {
    title: "Backup para Azure Blob Storage - Configuração",
    description: "Como configurar backup para Azure Blob Storage, incluindo conta de armazenamento, containers e políticas de acesso.",
    category: "Proteção",
    subcategory: "Backup Nuvem Pública",
    type: "guia",
    externalUrl: "https://www.acronis.com/en/support/documentation/CyberProtectionService/#backup-and-recovery.html",
    tags: ["azure", "blob", "conta de armazenamento", "container"],
    content: `## Backup para Azure Blob Storage\n\n### Criar Conta de Armazenamento\n\n1. Acesse o portal Azure\n2. Navegue até Storage Accounts > Create\n3. Selecione a assinatura e grupo de recursos\n4. Defina nome e região\n5. Selecione performance (Standard/Premium)\n6. Selecione redundância (LRS/GRS/ZRS)\n\n### Criar Container\n\n1. Acesse a conta de armazenamento\n2. Navegue até Containers > + Container\n3. Defina o nome\n4. Nível de acesso: Private\n\n### Configurar no Console\n\n1. Acesse Destinos de Backup\n2. Adicione "Azure Blob Storage"\n3. Insira Account Name e Access Key\n4. Selecione o container\n5. Teste a conexão`,
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
    externalUrl: "https://www.acronis.com/en/support/documentation/CyberProtectionService/#backup-and-recovery.html",
    tags: ["restauração", "recuperação", "arquivos", "granular", "pastas"],
    content: `## Tipos de Restauração\n\n### Restauração de Arquivos\n1. Selecione o ponto de recuperação\n2. Navegue pela estrutura de pastas\n3. Selecione os arquivos desejados\n4. Escolha restaurar no local original ou alternativo\n5. Defina o comportamento para arquivos existentes\n\n### Restauração de Máquina Completa\n1. Crie mídia bootável ou use boot PXE\n2. Conecte ao console de recuperação\n3. Selecione o backup\n4. Mapeie os discos\n5. Inicie a restauração\n\n### Restauração para Máquina Virtual\nRestaure diretamente como VM em:\n- VMware vSphere\n- Microsoft Hyper-V\n- Nuvem Acronis`,
  },
  {
    title: "Restauração Bare-Metal (BMR)",
    description: "Como realizar a restauração completa de um servidor em hardware novo ou diferente usando mídia bootável e dissimilar restore.",
    category: "Proteção",
    subcategory: "Restauração",
    type: "guia",
    externalUrl: "https://www.acronis.com/en/support/documentation/CyberProtectionService/#backup-and-recovery.html",
    tags: ["bare-metal", "bmr", "dissimilar", "hardware", "mídia bootável"],
    content: `## Restauração Bare-Metal\n\n### O que é BMR?\n\nA restauração bare-metal permite restaurar um sistema completo (SO, aplicações, dados) em hardware novo ou diferente do original.\n\n### Dissimilar Restore\n\nQuando o hardware de destino é diferente do original:\n1. A tecnologia Universal Restore injeta drivers automaticamente\n2. Suporta mudança de controladora RAID, rede e chipset\n3. Funciona entre fabricantes diferentes\n\n### Procedimento\n\n1. Crie a mídia bootável no console\n2. Faça boot no hardware novo com a mídia\n3. Conecte ao console de recuperação\n4. Selecione o backup a restaurar\n5. Ative "Universal Restore" se necessário\n6. Mapeie os discos\n7. Inicie a restauração\n8. Reinicie e valide o sistema`,
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
    externalUrl: "https://kb.acronis.com/",
    tags: ["erros", "backup", "diagnóstico", "resolução", "falha"],
    content: `## Erros Comuns\n\n### Erro: Espaço Insuficiente\n**Causa**: Destino de backup sem espaço\n**Solução**:\n1. Verifique o espaço disponível no destino\n2. Ajuste a política de retenção\n3. Habilite deduplicação\n4. Considere usar armazenamento em nuvem\n\n### Erro: Falha de Conexão\n**Causa**: Problemas de rede ou firewall\n**Solução**:\n1. Verifique conectividade com o destino\n2. Libere as portas necessárias (443, 8443)\n3. Configure exceções no proxy\n4. Teste com ping e traceroute\n\n### Erro: VSS Writer Falhou\n**Causa**: Serviço VSS com problemas\n**Solução**:\n1. Reinicie os serviços VSS\n2. Verifique espaço no volume de sombra\n3. Atualize drivers de storage\n4. Verifique logs do Event Viewer`,
  },
  {
    title: "Backup lento - Diagnóstico e otimização",
    description: "Como diagnosticar e resolver problemas de performance de backup, incluindo otimização de rede, deduplicação e agendamento.",
    category: "Proteção",
    subcategory: "Troubleshooting",
    type: "troubleshooting",
    externalUrl: "https://kb.acronis.com/",
    tags: ["performance", "lento", "otimização", "rede", "deduplicação"],
    content: `## Diagnóstico de Performance\n\n### Causas Comuns\n\n1. **Rede lenta**: Largura de banda insuficiente\n2. **Disco lento**: I/O do storage saturado\n3. **Sem deduplicação**: Dados duplicados sendo copiados\n4. **Agendamento inadequado**: Muitos backups simultâneos\n\n### Soluções\n\n#### Otimização de Rede\n- Configure throttling para horários de pico\n- Use deduplicação na origem\n- Habilite compressão\n- Considere backup incremental\n\n#### Otimização de Disco\n- Use discos SSD para staging\n- Separe o destino de backup do sistema\n- Monitore IOPS do storage\n\n#### Otimização de Agendamento\n- Escalone os backups (não inicie todos ao mesmo tempo)\n- Use janelas de manutenção fora do horário comercial\n- Priorize servidores críticos`,
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
    externalUrl: "https://www.acronis.com/en/support/documentation/CyberProtectionService/#backup-and-recovery.html",
    tags: ["backup", "incremental", "diferencial", "completo", "tipos"],
    content: `## Tipos de Backup\n\n### Backup Completo (Full)\n- **O que copia**: Todos os dados selecionados\n- **Vantagem**: Restauração independente e rápida\n- **Desvantagem**: Mais espaço e tempo\n- **Quando usar**: Base inicial, backup semanal\n\n### Backup Incremental\n- **O que copia**: Apenas alterações desde o último backup (qualquer tipo)\n- **Vantagem**: Mais rápido e menor espaço\n- **Desvantagem**: Restauração depende de toda a cadeia\n- **Quando usar**: Backup diário/horário\n\n### Backup Diferencial\n- **O que copia**: Alterações desde o último backup completo\n- **Vantagem**: Restauração depende apenas do full + diferencial\n- **Desvantagem**: Cresce ao longo do tempo\n- **Quando usar**: Quando precisa de independência sem full diário`,
  },
  {
    title: "Como funciona a criptografia de dados nos backups?",
    description: "Explicação sobre os métodos de criptografia AES-256 utilizados para proteger dados em trânsito e em repouso nos backups.",
    category: "Proteção",
    subcategory: "FAQ",
    type: "faq",
    externalUrl: "https://www.acronis.com/en/support/documentation/CyberProtectionService/#backup-and-recovery.html",
    tags: ["criptografia", "aes-256", "segurança", "dados", "repouso"],
    content: `## Criptografia de Backups\n\n### Em Trânsito\n- TLS 1.2/1.3 para comunicação com o console\n- Canal criptografado para transferência de dados\n\n### Em Repouso\n- AES-256 (padrão militar)\n- Senha definida pelo administrador\n- Sem acesso sem a senha (nem pelo provedor)\n\n### Importante\n\n⚠️ **A senha de criptografia não pode ser recuperada**. Se perdida, os backups ficam inacessíveis.\n\n### Recomendações\n\n1. Use senhas fortes (16+ caracteres)\n2. Armazene a senha em local seguro (cofre de senhas)\n3. Não compartilhe a senha por email\n4. Documente a política de criptografia`,
  },
  {
    title: "Qual o consumo de banda durante o backup?",
    description: "Informações sobre controle de largura de banda, deduplicação e compressão para otimizar o uso da rede durante backups.",
    category: "Proteção",
    subcategory: "FAQ",
    type: "faq",
    externalUrl: "https://www.acronis.com/en/support/documentation/CyberProtectionService/#backup-and-recovery.html",
    tags: ["banda", "rede", "deduplicação", "compressão", "otimização"],
    content: `## Consumo de Banda\n\n### Primeiro Backup (Full)\n- Depende do volume total de dados\n- Exemplo: 100 GB de dados ≈ 8-12 horas em link de 25 Mbps\n\n### Backups Incrementais\n- Tipicamente 1-5% do volume total\n- Exemplo: 100 GB → 1-5 GB por dia\n\n### Otimizações\n\n1. **Deduplicação**: Elimina blocos duplicados (economia de 40-60%)\n2. **Compressão**: Reduz tamanho dos dados (economia de 30-50%)\n3. **Throttling**: Limite de banda por horário\n4. **Agendamento**: Backups fora do horário comercial\n\n### Configurar Throttling\n\n1. Acesse o plano de proteção\n2. Configurações de rede\n3. Defina limite em Mbps por período`,
  },
  {
    title: "Quanto espaço de armazenamento eu preciso?",
    description: "Como calcular o espaço necessário considerando tipo de backup, retenção, deduplicação e taxa de crescimento dos dados.",
    category: "Proteção",
    subcategory: "FAQ",
    type: "faq",
    externalUrl: "https://www.acronis.com/en/support/documentation/CyberProtectionService/#backup-and-recovery.html",
    tags: ["espaço", "armazenamento", "cálculo", "estimativa", "crescimento"],
    content: `## Calculando Espaço Necessário\n\n### Fórmula Básica\n\nEspaço = Volume Total × Fator de Retenção × (1 - Taxa de Deduplicação)\n\n### Exemplo\n\n- Volume: 500 GB\n- Retenção: 30 dias (daily incremental)\n- Taxa de mudança diária: 3%\n- Deduplicação: 50%\n\nCálculo:\n- Full: 500 GB\n- Incrementais: 500 GB × 3% × 30 dias = 450 GB\n- Total bruto: 950 GB\n- Com deduplicação (50%): ~475 GB\n\n### Recomendações\n\n- Provisione 2x o volume inicial\n- Monitore o crescimento mensal\n- Configure alertas de espaço (80% de uso)\n- Revise a política de retenção periodicamente`,
  },
  {
    title: "O que acontece se o backup falhar?",
    description: "Entenda o sistema de alertas, retentativas automáticas e notificações quando um backup não é concluído com sucesso.",
    category: "Proteção",
    subcategory: "FAQ",
    type: "faq",
    externalUrl: "https://www.acronis.com/en/support/documentation/CyberProtectionService/#backup-and-recovery.html",
    tags: ["falha", "alerta", "retentativa", "notificação", "monitoramento"],
    content: `## Sistema de Alertas de Backup\n\n### Quando um Backup Falha\n\n1. **Alerta no console**: Status vermelho no dashboard\n2. **Email de notificação**: Enviado para administradores configurados\n3. **Retentativa automática**: O sistema tenta novamente após intervalo\n4. **Escalonamento**: Se persistir, alerta de criticidade aumenta\n\n### Configuração de Alertas\n\n- Backup não executado por X horas\n- Falha em X tentativas consecutivas\n- Espaço de armazenamento < X%\n- Agente offline por X horas\n\n### O que Fazer\n\n1. Verifique o motivo da falha nos logs\n2. Corrija o problema identificado\n3. Execute o backup manualmente\n4. Monitore as próximas execuções\n5. Configure alertas para detecção precoce`,
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
    externalUrl: "https://www.acronis.com/en/support/documentation/CyberProtectionService/#advanced-management.html",
    tags: ["rmm", "alertas", "notificações", "monitoramento", "proativo"],
    content: `## Configuração de Alertas\n\n### Alertas de Hardware\n\n| Métrica | Threshold Aviso | Threshold Crítico |\n|---------|----------------|-------------------|\n| CPU | > 80% por 15 min | > 95% por 5 min |\n| Memória | > 85% | > 95% |\n| Disco | < 20% livre | < 10% livre |\n| Temperatura | > 70°C | > 85°C |\n\n### Alertas de Software\n\n- Serviço parado (ex: SQL Server, IIS)\n- Processo consumindo > X% CPU\n- Evento crítico no Event Viewer\n- Falha de login repetida\n\n### Canais de Notificação\n\n1. Email para administradores\n2. SMS (via integração)\n3. Webhook (para Slack, Teams, etc.)\n4. Dashboard do console`,
  },
  {
    title: "RMM - Gerenciamento de Patches do Windows e Terceiros",
    description: "Como configurar a distribuição automatizada de patches do Windows e de mais de 200 aplicativos de terceiros.",
    category: "Operação",
    subcategory: "RMM",
    type: "guia",
    externalUrl: "https://www.acronis.com/en/support/documentation/CyberProtectionService/#advanced-management.html",
    tags: ["rmm", "patches", "windows update", "terceiros", "automação"],
    content: `## Gerenciamento de Patches\n\n### Windows Update\n\n1. Configure a política de aprovação:\n   - Automática (instalar imediatamente)\n   - Manual (aprovar antes de instalar)\n   - Teste (instalar em grupo piloto primeiro)\n\n2. Agende a instalação:\n   - Horário fora do expediente\n   - Janela de manutenção definida\n   - Reinicialização automática ou agendada\n\n### Aplicativos de Terceiros (200+)\n\nAtualize automaticamente:\n- Adobe (Reader, Flash, Air)\n- Java Runtime\n- Google Chrome, Firefox, Edge\n- 7-Zip, WinRAR\n- VLC, Zoom, Teams\n- E mais de 200 outros\n\n### Relatórios de Compliance\n\n- Dispositivos com patches pendentes\n- Patches críticos não aplicados\n- Histórico de atualizações`,
  },
  {
    title: "RMM - Acesso Remoto e Suporte Técnico",
    description: "Como utilizar o acesso remoto para suporte técnico, incluindo desktop remoto, terminal, transferência de arquivos e chat.",
    category: "Operação",
    subcategory: "RMM",
    type: "guia",
    externalUrl: "https://www.acronis.com/en/support/documentation/CyberProtectionService/#advanced-management.html",
    tags: ["rmm", "acesso remoto", "suporte", "desktop remoto", "terminal"],
    content: `## Acesso Remoto\n\n### Métodos Disponíveis\n\n1. **Desktop Remoto**: Controle visual completo do endpoint\n2. **Terminal Remoto**: PowerShell (Windows) ou SSH (Linux/macOS)\n3. **Transferência de Arquivos**: Upload/download de arquivos\n4. **Chat**: Comunicação com o usuário durante o suporte\n\n### Como Conectar\n\n1. Acesse o dispositivo no console\n2. Clique em "Conectar Remotamente"\n3. Selecione o método desejado\n4. Autorize a conexão (se necessário)\n5. Inicie a sessão\n\n### Segurança\n\n- Conexão criptografada TLS 1.3\n- Autenticação de dois fatores\n- Log de todas as sessões\n- Permissão do usuário necessária (opcional)\n- Gravação de sessão (opcional)`,
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
    externalUrl: "https://www.acronis.com/en/support/documentation/CyberProtectionService/#advanced-management.html",
    tags: ["psa", "tickets", "sla", "faturamento", "suporte"],
    content: `## PSA - Professional Service Automation\n\n### Funcionalidades\n\n1. **Gerenciamento de Tickets**\n   - Criação automática via email ou portal\n   - Categorização e priorização\n   - Atribuição automática\n   - SLA tracking\n\n2. **Contratos SLA**\n   - Definição de métricas de nível de serviço\n   - Monitoramento em tempo real\n   - Alertas de violação\n   - Relatórios de compliance\n\n3. **Faturamento**\n   - Cobrança por uso\n   - Faturamento por contrato\n   - Relatórios financeiros\n   - Integração com sistemas contábeis\n\n4. **Tempo e Produtividade**\n   - Registro de horas por ticket\n   - Relatórios de utilização\n   - Métricas de equipe`,
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
    content: `## Gerenciamento de Usuários\n\n### Funções Disponíveis\n\n| Função | Descrição |\n|--------|-----------||\n| Administrador | Acesso total ao console |\n| Operador | Gerenciamento de dispositivos e backups |\n| Visualizador | Apenas visualização de relatórios |\n| Usuário | Acesso ao próprio dispositivo |\n\n### Criando Usuários\n\n1. Acesse Configurações > Usuários\n2. Clique em "Adicionar Usuário"\n3. Preencha nome, email e telefone\n4. Selecione a função\n5. Defina os grupos de dispositivos\n6. Envie o convite\n\n### Boas Práticas\n\n- Use o princípio do menor privilégio\n- Habilite MFA para todos os administradores\n- Revise permissões periodicamente\n- Desative contas de ex-funcionários imediatamente`,
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
    externalUrl: "https://www.acronis.com/en/support/documentation/CyberProtectionService/#installing-software.html",
    tags: ["agente", "instalação", "macos", "permissões", "extensão"],
    content: `## Instalação no macOS\n\n### Pré-requisitos\n\n- macOS 12 Monterey ou superior\n- 1 GB RAM disponível\n- 500 MB espaço em disco\n- Conta de administrador\n\n### Passo a Passo\n\n1. Baixe o instalador .dmg do console\n2. Execute o instalador\n3. Insira a senha de administrador\n4. Insira o token de registro\n5. Conceda as permissões necessárias:\n\n### Permissões Necessárias\n\n- **Full Disk Access**: Necessário para backup\n- **Extensões de Sistema**: Para proteção em tempo real\n- **Notificações**: Para alertas\n\n### Concedendo Permissões (Preferências do Sistema)\n\n1. Segurança e Privacidade > Privacidade\n2. Acesso Total ao Disco > Adicionar o agente\n3. Extensões de Sistema > Permitir`,
  },
  {
    title: "Instalação do Agente de Proteção - Linux",
    description: "Como instalar e configurar o agente de proteção em distribuições Linux (Ubuntu, RHEL, CentOS, Debian, SUSE).",
    category: "Operação",
    subcategory: "Instalação",
    type: "guia",
    externalUrl: "https://www.acronis.com/en/support/documentation/CyberProtectionService/#installing-software.html",
    tags: ["agente", "instalação", "linux", "ubuntu", "rhel"],
    content: `## Instalação no Linux\n\n### Pré-requisitos\n\n- Distribuição suportada (Ubuntu 18.04+, RHEL 7+, etc.)\n- Acesso root ou sudo\n- Porta 443 liberada\n- 1 GB RAM e 500 MB disco\n\n### Instalação via Terminal\n\n\`\`\`bash\n# Baixe o instalador\nwget https://download.acronis.com/AcronisCyberProtect_Linux64.bin\n\n# Torne executável\nchmod +x AcronisCyberProtect_Linux64.bin\n\n# Execute a instalação\nsudo ./AcronisCyberProtect_Linux64.bin\n\n# Registre no console\nsudo acronis_register --token SEU_TOKEN\n\`\`\`\n\n### Verificação\n\n\`\`\`bash\n# Verifique o status do serviço\nsudo systemctl status acronis_mms\n\n# Verifique os logs\nsudo tail -f /var/log/acronis/mms.log\n\`\`\``,
  },
  {
    title: "Deploy em massa do agente via GPO",
    description: "Como distribuir o agente de proteção automaticamente para centenas de máquinas usando Group Policy Objects do Active Directory.",
    category: "Operação",
    subcategory: "Instalação",
    type: "guia",
    externalUrl: "https://www.acronis.com/en/support/documentation/CyberProtectionService/#installing-software.html",
    tags: ["deploy", "gpo", "active directory", "massa", "automação"],
    content: `## Deploy via GPO\n\n### Pré-requisitos\n\n- Active Directory configurado\n- Acesso ao Group Policy Management Console (GPMC)\n- Instalador MSI do agente\n- Compartilhamento de rede acessível\n\n### Passo a Passo\n\n1. Baixe o instalador MSI no console\n2. Copie para um compartilhamento de rede\n3. Abra o GPMC (gpmc.msc)\n4. Crie ou edite uma GPO\n5. Navegue até:\n   Computer Configuration > Policies > Software Settings > Software Installation\n6. Adicione o pacote MSI\n7. Configure os parâmetros de instalação\n8. Vincule a GPO às OUs desejadas\n9. Aguarde a aplicação da política (ou force com gpupdate /force)\n\n### Parâmetros MSI\n\n- REGISTRATION_TOKEN=seu_token\n- INSTALL_DIR=C:\\Program Files\\Acronis`,
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
    externalUrl: "https://www.acronis.com/en/support/documentation/CyberProtectionService/#advanced-management.html",
    tags: ["scripts", "automação", "agendamento", "manutenção", "powershell"],
    content: `## Automação com Scripts\n\n### Linguagens Suportadas\n\n- **PowerShell** (Windows)\n- **Bash** (Linux/macOS)\n- **CMD/Batch** (Windows)\n\n### Criando um Script\n\n1. Acesse RMM > Scripts > Novo Script\n2. Selecione a linguagem\n3. Escreva ou cole o script\n4. Defina parâmetros de entrada (opcional)\n5. Teste em um dispositivo\n6. Salve na biblioteca\n\n### Exemplos Úteis\n\n- Limpeza de disco temporário\n- Verificação de serviços críticos\n- Inventário de software\n- Configuração de políticas de grupo\n- Coleta de logs para diagnóstico\n\n### Agendamento\n\n- Uma vez\n- Diário / Semanal / Mensal\n- Baseado em evento (alerta, login, etc.)`,
  },
  {
    title: "Workflows de Automação - Guia Prático",
    description: "Como criar workflows automatizados combinando múltiplas ações: varredura, patch, backup, reinício e verificação.",
    category: "Operação",
    subcategory: "Automação",
    type: "guia",
    externalUrl: "https://www.acronis.com/en/support/documentation/CyberProtectionService/#workflows.html",
    tags: ["workflows", "automação", "ações", "orquestração"],
    content: `## Workflows de Automação\n\n### O que é um Workflow?\n\nUm workflow é uma sequência automatizada de ações que são executadas em ordem, com condições e tratamento de erros.\n\n### Exemplo de Workflow: Patch Tuesday\n\n1. **Criar snapshot/backup** do sistema\n2. **Verificar patches** disponíveis\n3. **Instalar patches** aprovados\n4. **Reiniciar** se necessário\n5. **Verificar saúde** do sistema\n6. **Notificar** resultado\n\n### Criando um Workflow\n\n1. Acesse RMM > Workflows > Novo\n2. Adicione ações na sequência desejada\n3. Configure condições (se/então/senão)\n4. Defina tratamento de erros\n5. Agende a execução\n6. Aplique aos grupos de dispositivos`,
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
    externalUrl: "https://www.acronis.com/en/support/documentation/CyberProtectionService/#reports.html",
    tags: ["relatórios", "dashboard", "status", "compliance", "executivo"],
    content: `## Relatórios Executivos\n\n### Relatórios Disponíveis\n\n1. **Status de Proteção**: Visão geral de todos os dispositivos\n2. **Uso de Armazenamento**: Consumo por cliente/dispositivo\n3. **Ameaças Detectadas**: Resumo de detecções e ações\n4. **Compliance**: Conformidade com políticas\n5. **Atividades**: Log de ações administrativas\n\n### Personalização\n\n- Selecione widgets e métricas\n- Filtre por cliente, grupo ou período\n- Exporte em PDF, CSV ou HTML\n- Agende envio automático por email\n\n### Dashboard\n\nVisualize em tempo real:\n- Dispositivos protegidos vs desprotegidos\n- Backups com sucesso vs falha\n- Alertas ativos por severidade\n- Uso de armazenamento`,
  },
  {
    title: "Relatório de Conformidade e Auditoria",
    description: "Como gerar relatórios de conformidade para auditorias internas e externas, incluindo evidências de backup e proteção.",
    category: "Operação",
    subcategory: "Relatórios",
    type: "guia",
    externalUrl: "https://www.acronis.com/en/support/documentation/CyberProtectionService/#reports.html",
    tags: ["conformidade", "auditoria", "evidências", "compliance", "lgpd"],
    content: `## Relatórios de Conformidade\n\n### Para Auditorias\n\nGere evidências de:\n- Backups realizados com sucesso\n- Proteção antimalware ativa\n- Patches aplicados\n- Criptografia de dados\n- Controles de acesso\n\n### Frameworks Suportados\n\n- **LGPD**: Evidências de proteção de dados pessoais\n- **ISO 27001**: Controles de segurança da informação\n- **SOC 2**: Disponibilidade e segurança\n- **HIPAA**: Proteção de dados de saúde\n- **PCI-DSS**: Segurança de dados de pagamento\n\n### Gerando o Relatório\n\n1. Acesse Relatórios > Compliance\n2. Selecione o framework\n3. Defina o período\n4. Selecione os clientes/dispositivos\n5. Gere o relatório\n6. Exporte e entregue ao auditor`,
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
    content: `## Integrações Disponíveis\n\n### RMM/PSA\n\n- **ConnectWise Manage**: Tickets e faturamento\n- **ConnectWise Automate**: Monitoramento e automação\n- **Datto RMM**: Gerenciamento de endpoints\n- **NinjaOne (NinjaRMM)**: Monitoramento\n- **Kaseya VSA**: Automação de TI\n- **N-able N-central**: Gerenciamento MSP\n\n### Ferramentas Microsoft\n\n- **Microsoft Intune**: Gerenciamento de dispositivos\n- **Azure AD / Entra ID**: Identidade e SSO\n- **Microsoft 365**: Backup e proteção\n\n### Outras\n\n- **Splunk**: SIEM integration\n- **ServiceNow**: ITSM\n- **Autotask PSA**: Tickets e contratos\n\n### Como Configurar\n\n1. Acesse Configurações > Integrações\n2. Selecione a ferramenta\n3. Siga o assistente de configuração\n4. Forneça as credenciais/API key\n5. Teste a conexão`,
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
    externalUrl: "https://kb.acronis.com/",
    tags: ["agente", "console", "registro", "diagnóstico", "instalação"],
    content: `## Diagnóstico\n\n### Verificar Serviço\n1. Abra services.msc\n2. Procure "Acronis Managed Machine Service"\n3. Verifique se está em execução\n4. Se parado, inicie e defina como Automático\n\n### Verificar Conectividade\n1. Teste acesso à porta 443 do datacenter\n2. Verifique configurações de proxy\n3. Teste resolução DNS\n\n### Verificar Logs\n1. Acesse C:\\ProgramData\\Acronis\\Logs\n2. Abra o arquivo mms.log\n3. Procure por erros de conexão ou autenticação\n\n### Re-registrar\n1. Abra o Acronis Cyber Protect Monitor\n2. Clique em "Registrar"\n3. Insira o novo token de registro`,
  },
  {
    title: "Performance lenta do console de gerenciamento",
    description: "Como otimizar a performance do console web, incluindo configurações de navegador, cache e limites de exibição.",
    category: "Operação",
    subcategory: "Troubleshooting",
    type: "troubleshooting",
    externalUrl: "https://kb.acronis.com/",
    tags: ["console", "performance", "lento", "navegador", "otimização"],
    content: `## Otimização do Console\n\n### Navegador\n\n1. Use Chrome ou Edge (versão mais recente)\n2. Limpe cache e cookies\n3. Desabilite extensões desnecessárias\n4. Aumente a memória disponível\n\n### Configurações do Console\n\n1. Reduza itens por página nas listagens\n2. Use filtros para limitar resultados\n3. Evite abrir muitas abas simultaneamente\n4. Configure colunas visíveis (remova desnecessárias)\n\n### Rede\n\n1. Verifique latência para o datacenter\n2. Use conexão cabeada quando possível\n3. Desabilite VPN se não necessário\n4. Verifique proxy (pode impactar performance)\n\n### Se o Problema Persistir\n\n- Limpe o cache do navegador (Ctrl+Shift+Del)\n- Teste em modo anônimo/privativo\n- Teste em outro navegador\n- Contate o suporte técnico`,
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
    externalUrl: "https://kb.acronis.com/",
    tags: ["chamado", "suporte", "sla", "prioridade", "portal"],
    content: `## Abrindo um Chamado\n\n### Canais de Suporte\n\n1. **Portal do Cliente**: Acesse a área de suporte e abra um ticket\n2. **Email**: Envie para o email de suporte da The Best Cloud\n3. **Telefone**: Para emergências e incidentes críticos\n\n### Informações Necessárias\n\n- Descrição detalhada do problema\n- Dispositivo(s) afetado(s)\n- Mensagens de erro (prints)\n- Passos para reproduzir o problema\n- Impacto no negócio\n\n### Níveis de Prioridade\n\n| Prioridade | Descrição | SLA |\n|------------|-----------|-----|\n| Crítica | Sistema parado | 2 horas |\n| Alta | Funcionalidade comprometida | 4 horas |\n| Média | Problema com workaround | 8 horas |\n| Baixa | Dúvida ou melhoria | 24 horas |`,
  },
  {
    title: "Quais portas de rede precisam estar abertas?",
    description: "Lista completa de portas TCP/UDP necessárias para comunicação do agente com o console e serviços de nuvem.",
    category: "Operação",
    subcategory: "FAQ",
    type: "faq",
    externalUrl: "https://kb.acronis.com/content/65063",
    tags: ["portas", "rede", "firewall", "tcp", "udp"],
    content: `## Portas Necessárias\n\n### Comunicação Principal\n| Porta | Protocolo | Destino | Uso |\n|-------|-----------|---------|-----|\n| 443 | TCP | *.acronis.com | Console e API |\n| 8443 | TCP | Datacenter | Gerenciamento |\n| 44445 | TCP | Agentes | Comunicação P2P |\n\n### Backup para Nuvem\n| Porta | Protocolo | Destino | Uso |\n|-------|-----------|---------|-----|\n| 443 | TCP | backup.acronis.com | Upload/Download |\n| 7770-7800 | TCP | Datacenter | Transferência |\n\n### Acesso Remoto\n| Porta | Protocolo | Destino | Uso |\n|-------|-----------|---------|-----|\n| 443 | TCP | remote.acronis.com | Sessão remota |\n| 6443 | TCP | Datacenter | Relay |`,
  },
  {
    title: "Como funciona o licenciamento por carga de trabalho?",
    description: "Explicação do modelo de licenciamento: workload (carga de trabalho), por GB, por dispositivo e pacotes de serviços.",
    category: "Operação",
    subcategory: "FAQ",
    type: "faq",
    externalUrl: "https://www.acronis.com/en/support/documentation/CyberProtectionService/",
    tags: ["licenciamento", "workload", "preço", "pacote", "modelo"],
    content: `## Modelo de Licenciamento\n\n### Por Carga de Trabalho (Workload)\n\nCada dispositivo protegido conta como uma carga de trabalho.\n\n| Tipo | Exemplo |\n|------|---------|\n| Workstation | Desktop, notebook |\n| Server | Servidor físico ou virtual |\n| VM | Máquina virtual |\n| M365 User | Usuário Microsoft 365 |\n| Website | Site monitorado |\n\n### Por GB\n\nCobrança pelo armazenamento utilizado na nuvem.\n\n### Pacotes de Serviços\n\n- **Essential**: Backup + Antimalware básico\n- **Standard**: Essential + EDR + Email Security\n- **Advanced**: Standard + XDR + DLP\n- **Premium**: Advanced + MDR 24/7\n\n### Dicas\n\n- O modelo pay-as-you-go é ideal para crescimento\n- Sem compromisso de volume mínimo\n- Faturamento mensal`,
  },
  {
    title: "Qual a política de retenção de dados na nuvem?",
    description: "Detalhes sobre a política de retenção de dados na nuvem Acronis, incluindo períodos de retenção, exclusão e compliance.",
    category: "Operação",
    subcategory: "FAQ",
    type: "faq",
    externalUrl: "https://www.acronis.com/en/support/documentation/CyberProtectionService/",
    tags: ["retenção", "nuvem", "política", "exclusão", "compliance"],
    content: `## Política de Retenção\n\n### Armazenamento na Nuvem\n\nOs dados são mantidos de acordo com a política configurada no plano de proteção.\n\n### Após Cancelamento\n\n- **30 dias**: Dados mantidos após desativação do serviço\n- **Notificação**: Avisos antes da exclusão definitiva\n- **Exportação**: Possibilidade de baixar dados antes da exclusão\n\n### Exclusão Definitiva\n\n- Após o período de retenção, dados são permanentemente excluídos\n- Processo irreversível\n- Certificado de destruição disponível mediante solicitação\n\n### Compliance\n\n- Dados armazenados em datacenters certificados\n- Criptografia AES-256 em repouso\n- Conformidade com LGPD, GDPR, HIPAA\n- Logs de acesso e auditoria`,
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
    content: `## Cyber Files Cloud\n\n### Funcionalidades\n\n1. **Compartilhamento Seguro**: Links com senha e expiração\n2. **Sincronização**: Pastas sincronizadas entre dispositivos\n3. **Acesso Mobile**: Apps para iOS e Android\n4. **Controle de Acesso**: Permissões granulares por usuário/grupo\n5. **Auditoria**: Log de todos os acessos e downloads\n\n### Configuração\n\n1. Acesse o console > Files Cloud\n2. Configure os conectores de dados:\n   - SharePoint\n   - File Server (CIFS/SMB)\n   - OneDrive\n3. Defina políticas de compartilhamento\n4. Configure DRM (Digital Rights Management)\n5. Distribua o app para os usuários\n\n### Segurança\n\n- Criptografia AES-256 em trânsito e repouso\n- DRM para documentos compartilhados\n- Wipe remoto em dispositivos perdidos\n- Conformidade com LGPD/GDPR`,
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
    content: `## Physical Data Shipping\n\n### Quando Usar?\n\nIdeal quando o upload pela internet levaria muito tempo:\n- Volumes acima de 1 TB\n- Links de internet lentos\n- Necessidade de migração rápida\n\n### Como Funciona\n\n1. **Solicite** o disco no console (ou use seu próprio)\n2. **Faça o backup** para o disco local\n3. **Envie** o disco para o datacenter\n4. **Aguarde** o upload para a nuvem\n5. **Confirme** a disponibilidade dos dados\n6. **Configure** backups incrementais online\n\n### Especificações\n\n- Discos suportados: HDD/SSD USB 3.0+\n- Criptografia obrigatória no disco\n- Rastreamento de envio disponível\n- Tempo de processamento: 3-5 dias úteis`,
  },
];

export const categories = [
  { id: "todos", label: "Todos" },
  { id: "Segurança", label: "Segurança" },
  { id: "Proteção", label: "Proteção" },
  { id: "Operação", label: "Operação" },
];
