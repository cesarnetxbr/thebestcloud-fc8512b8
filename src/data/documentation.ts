// Documentação centralizada do sistema The Best Cloud
// Usada na página /admin/documentacao para gerar PDF e Markdown

export const DOC_META = {
  product: "The Best Cloud",
  company: "The Best Cloud — Plataforma B2B/B2C",
  version: "1.0.0",
  dpo: "César Augusto Cavalcante Valente — dpo@thebestcloud.com.br",
};

export type DocBlock =
  | { type: "heading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] }
  | { type: "code"; text: string };

export interface DocSection {
  title: string;
  blocks: DocBlock[];
}

// =====================================================
// VERSÃO EXECUTIVA — visão de negócio
// =====================================================
export const EXECUTIVE_SECTIONS: DocSection[] = [
  {
    title: "Visão Geral",
    blocks: [
      { type: "paragraph", text: "The Best Cloud é uma plataforma B2B/B2C focada em serviços de Cloud, Backup, Segurança e Operações TI. Oferece portal administrativo completo, portal do cliente, CRM integrado, marketing multicanal e compliance LGPD." },
      { type: "heading", text: "Proposta de Valor" },
      { type: "list", items: [
        "Plataforma única para gestão de clientes, faturamento e operações",
        "Modelo TundraFinOps: gestão precisa de custo (COST-) e venda (SALE-)",
        "Integração nativa com Acronis Cloud e WhatsApp (Z-API)",
        "Compliance total com LGPD",
        "Pronto para produção, escalável e auditado"
      ]},
      { type: "heading", text: "Público-alvo" },
      { type: "list", items: [
        "Empresas que oferecem cloud, backup e segurança como serviço",
        "Times comerciais e financeiros que precisam de visibilidade end-to-end",
        "Equipes de suporte com SLA e tickets",
        "DPOs e responsáveis por LGPD"
      ]},
    ],
  },
  {
    title: "Módulos do Sistema",
    blocks: [
      { type: "heading", text: "Portal Administrativo (/admin)" },
      { type: "list", items: [
        "Dashboard executivo com KPIs",
        "CRM: Pipeline, Leads, Agenda, Chat & Atendimentos",
        "Marketing: Email, SMS, Analytics, Campanhas",
        "Financeiro: Receitas, Despesas, Comissões, DRE, CFO Panel",
        "LGPD: ROPA, Consentimentos, Solicitações, Incidentes",
        "Faturamento: Custo, Venda, Comparativo, Tabelas de Preço",
        "Operações: Tickets, Agenda Técnica, Tenants, Conexões Acronis",
        "Auditoria completa de operações",
      ]},
      { type: "heading", text: "Portal do Cliente (/portal)" },
      { type: "list", items: [
        "Dashboard de serviços contratados",
        "Visualização de faturas e histórico",
        "Abertura de chamados e ouvidoria",
        "Acompanhamento de SLA",
      ]},
      { type: "heading", text: "Páginas Públicas" },
      { type: "list", items: [
        "Landing page institucional com solicitação de teste de 14 dias",
        "Catálogo de soluções técnicas",
        "Base de Conhecimento com busca por IA",
        "Página LGPD informativa + formulário de direitos",
        "Ouvidoria pública com protocolo automático",
      ]},
    ],
  },
  {
    title: "Stack Tecnológica",
    blocks: [
      { type: "list", items: [
        "Frontend: React 18, Vite 5, TypeScript 5",
        "UI: Tailwind v3, shadcn/ui, Lucide Icons",
        "Backend: Lovable Cloud (Supabase + Postgres + Auth + Storage)",
        "Edge Functions em Deno (Acronis, WhatsApp Z-API, IA, billing)",
        "IA: Lovable AI Gateway (Gemini 2.5, GPT-5)",
        "Realtime: Supabase Channels para chat",
      ]},
    ],
  },
  {
    title: "Fluxos Críticos de Negócio",
    blocks: [
      { type: "heading", text: "1. Onboarding de Cliente Trial (14 dias)" },
      { type: "paragraph", text: "Visitante preenche formulário público → reserva slot da agenda técnica → equipe contata → cliente aprovado vira tenant Acronis → começa monitoramento automático de consumo." },
      { type: "heading", text: "2. Faturamento Automatizado (mensal)" },
      { type: "paragraph", text: "pg_cron sincroniza tenants Acronis → calcula uso por SKU (COST-) → aplica margem da tabela de venda (SALE-) → gera fatura com período/vencimento → envia para portal do cliente." },
      { type: "heading", text: "3. Ciclo Comercial CRM" },
      { type: "paragraph", text: "Lead (origem: formulário, WhatsApp, manual) → atribuição → pipeline (6 estágios) → cotação → solicitação comercial → fechamento → vira cliente + fatura." },
      { type: "heading", text: "4. Atendimento WhatsApp" },
      { type: "paragraph", text: "Mensagem chega via Z-API webhook → identificação por telefone → reabertura automática se conversa fechada → bot com menus numéricos → escalação para humano se necessário → ticket gerado se aplicável." },
      { type: "heading", text: "5. Fluxo \"Fale com um Consultor\" (Site → Lead → IA → Pipeline)" },
      { type: "paragraph", text: "Visitante clica em \"Fale com um Consultor\" → modal coleta nome, telefone, e-mail e empresa → edge function consultant-lead cria lead (source=site, status=novo) e abre conversa WhatsApp → bot envia saudação proativa via Z-API + cliente é redirecionado para wa.me → após mensagens do cliente, IA (Gemini) classifica probabilidade. Os limiares são configuráveis em Admin → CRM → Configurações do Chat → IA Comercial (padrão: ≥40 cria deal no Pipeline; ≥75 adiciona tag verde \"Alta Probabilidade\"). Nome e cor da tag também são configuráveis, e a classificação pode ser desativada sem alteração de código." },
    ],
  },
  {
    title: "Diferenciais e Conformidade",
    blocks: [
      { type: "list", items: [
        "Auditoria automática de todas operações sensíveis (clientes, usuários, tickets, permissões)",
        "RLS (Row-Level Security) em 100% das tabelas",
        "Sistema de roles separado da tabela de usuários (boa prática)",
        "Encarregado de Dados (DPO) cadastrado e formulário público de exercício de direitos",
        "Cookies banner com gestão de consentimento granular",
        "Trial de 30 dias para tenants Acronis com tracking",
      ]},
    ],
  },
  {
    title: "Próximos Passos Recomendados",
    blocks: [
      { type: "list", items: [
        "Integração com gateway de pagamento (Stripe ou Pagar.me)",
        "Notificações por email transacional (Resend)",
        "App mobile do portal do cliente",
        "Marketplace de SKUs adicionais",
        "BI avançado com data warehouse",
      ]},
    ],
  },
];

// =====================================================
// VERSÃO TÉCNICA COMPLETA — para devs/ops
// =====================================================
export const TECHNICAL_SECTIONS: DocSection[] = [
  ...EXECUTIVE_SECTIONS,
  {
    title: "Arquitetura Detalhada",
    blocks: [
      { type: "heading", text: "Camadas" },
      { type: "list", items: [
        "Apresentação: React SPA com React Router (BrowserRouter)",
        "Estado: TanStack Query para data fetching + Context API para auth",
        "API: Cliente Supabase (@/integrations/supabase/client)",
        "Banco: PostgreSQL com RLS, triggers e funções SECURITY DEFINER",
        "Compute: Edge Functions Deno para lógica server-side",
        "Storage: Supabase Storage para anexos (a configurar quando necessário)",
      ]},
      { type: "heading", text: "Padrão de Autenticação" },
      { type: "paragraph", text: "AuthContext gerencia sessão Supabase. ProtectedRoute envolve rotas /admin. ClientProtectedRoute envolve /portal. Roles consultados via tabela user_roles e função has_role()." },
      { type: "heading", text: "Estrutura de Pastas" },
      { type: "code", text: "src/\n  components/      # UI reutilizável (admin, client, ui shadcn)\n  pages/           # Rotas (admin/, client/, públicas)\n  contexts/        # AuthContext\n  hooks/           # useUserRole, useRolePermissions, useAnalyticsTracker\n  data/            # Conteúdo estático (knowledge base, soluções, docs)\n  integrations/    # Clientes Supabase e Lovable\n  lib/             # Utils\nsupabase/\n  functions/       # Edge Functions Deno\n  migrations/      # SQL versionado (read-only via Lovable)" },
    ],
  },
  {
    title: "Modelo de Dados (Tabelas Principais)",
    blocks: [
      { type: "heading", text: "Identidade & Acesso" },
      { type: "list", items: [
        "profiles — dados extras de usuários auth",
        "user_roles — papéis (admin, manager, viewer, client, operador, supervisor)",
        "user_permissions — permissões granulares por módulo",
        "audit_logs — todas operações sensíveis (auto-triggered)",
      ]},
      { type: "heading", text: "Comercial & CRM" },
      { type: "list", items: [
        "customers — clientes finais com endereço completo",
        "crm_leads, crm_deals, crm_pipeline_stages, crm_activities, crm_appointments",
        "crm_deal_items, crm_deal_notes, crm_deal_tags",
        "commercial_requests + items/notes/tags + kanban_stages",
        "quotes + quote_items (numeração automática ORC-AAAA-NNNNN)",
      ]},
      { type: "heading", text: "Faturamento" },
      { type: "list", items: [
        "invoices — número, período, custo, venda, margem, status",
        "invoice_items — sku_id + quantity + unit_cost + unit_price",
        "skus — catálogo de itens cobráveis",
        "price_tables + price_table_items (tipo: cost ou sale)",
        "acronis_sku_mapping — De/Para nomes Acronis ↔ SKU interno",
        "connections — APIs Acronis (key/secret/datacenter)",
      ]},
      { type: "heading", text: "Chat & Atendimento" },
      { type: "list", items: [
        "chat_conversations — uma por telefone (reaproveita auto)",
        "chat_messages — com external_message_id para deduplicação",
        "chat_departments, chat_quick_replies",
        "chatbot_rules — gatilhos e respostas automáticas",
      ]},
      { type: "heading", text: "Marketing" },
      { type: "list", items: [
        "email_marketing_campaigns + lists + templates + contacts + metrics",
        "Pronto para integrar Resend, SendGrid ou Mailgun",
        "SMS: estrutura paralela pronta para Twilio/Vonage",
      ]},
      { type: "heading", text: "Financeiro" },
      { type: "list", items: [
        "financial_transactions (receita/despesa) + categories",
        "financial_commissions",
      ]},
      { type: "heading", text: "LGPD & Compliance" },
      { type: "list", items: [
        "lgpd_data_mapping (ROPA)",
        "lgpd_consent_records",
        "lgpd_data_requests (numeração LGPD-AAAA-NNNNN)",
        "lgpd_incidents",
        "ombudsman_reports (numeração OUV-AAAA-NNNNN)",
      ]},
      { type: "heading", text: "Analytics" },
      { type: "list", items: [
        "analytics_pageviews",
        "analytics_events",
      ]},
    ],
  },
  {
    title: "Edge Functions",
    blocks: [
      { type: "list", items: [
        "admin-list-users — lista usuários (Service Role)",
        "admin-manage-user — CRUD de usuários (Service Role)",
        "create-user — provisionamento",
        "client-register — vincula auth.user a customers",
        "generate-invoices — geração mensal de faturas",
        "kb-ai-search — busca semântica na base de conhecimento (Lovable AI)",
        "sync-acronis-tenants — sincroniza tenants de uma conexão",
        "sync-all-tenants — varre todas as conexões",
        "sync-tenant-usage — coleta uso por tenant para billing",
        "whatsapp-evolution — envio de mensagens via Z-API",
        "whatsapp-webhook — recebimento de mensagens com bot integrado",
        "whatsapp-auto-close — fecha conversas inativas (cron)",
      ]},
      { type: "heading", text: "Padrões" },
      { type: "list", items: [
        "Sempre incluem CORS headers",
        "Service Role Key para operações privilegiadas",
        "Logs estruturados via console.log/error",
        "Tratamento de erros com try/catch e response 4xx/5xx",
      ]},
    ],
  },
  {
    title: "Segurança",
    blocks: [
      { type: "heading", text: "RLS — Row Level Security" },
      { type: "paragraph", text: "Todas as tabelas têm RLS habilitado. Policies usam auth.uid() e public.has_role() para verificação." },
      { type: "code", text: "CREATE POLICY \"Admins manage all\"\nON public.invoices\nFOR ALL\nTO authenticated\nUSING (public.has_role(auth.uid(), 'admin'));" },
      { type: "heading", text: "Função has_role (SECURITY DEFINER)" },
      { type: "paragraph", text: "Evita recursão de RLS ao verificar papéis. Sempre usar essa função, nunca consultar user_roles diretamente em policies." },
      { type: "heading", text: "Auditoria Automática" },
      { type: "paragraph", text: "Triggers AFTER INSERT/UPDATE/DELETE em: customers, tickets, ticket_messages, profiles, user_roles, user_permissions, invoices. Função log_audit_event() registra operação, autor (auth.uid + email) e diff completo em jsonb." },
      { type: "heading", text: "Secrets" },
      { type: "list", items: [
        "ZAPI_INSTANCE_ID, ZAPI_TOKEN, ZAPI_CLIENT_TOKEN — WhatsApp",
        "LOVABLE_API_KEY — IA Gateway (auto-provisionado)",
        "SUPABASE_SERVICE_ROLE_KEY — operações privilegiadas em edge functions",
        "Secrets nunca expostos no frontend",
      ]},
    ],
  },
  {
    title: "Integrações Externas",
    blocks: [
      { type: "heading", text: "Acronis Cloud" },
      { type: "paragraph", text: "Cada conexão (datacenter + API key/secret) sincroniza tenants e uso. Mapeamento Acronis → SKU interno via tabela acronis_sku_mapping. pg_cron dispara sync-all-tenants periodicamente." },
      { type: "heading", text: "Z-API (WhatsApp)" },
      { type: "paragraph", text: "Substituiu Evolution API. Conexão via QR Code na página /admin/crm/whatsapp-connect. Webhook recebe mensagens, identifica conversa por telefone (reabre se fechada), executa bot com menus numéricos e fallback IA." },
      { type: "heading", text: "Lovable AI Gateway" },
      { type: "paragraph", text: "Sem necessidade de API key própria. Modelos disponíveis: google/gemini-2.5-flash, openai/gpt-5-mini, etc. Usado em kb-ai-search e fallback do bot WhatsApp." },
    ],
  },
  {
    title: "Padrões de Código",
    blocks: [
      { type: "heading", text: "Design System" },
      { type: "paragraph", text: "Tokens em src/index.css e tailwind.config.ts. Cores HSL semânticas: --primary, --secondary, --accent, --background, --foreground. NUNCA usar text-white, bg-black diretamente." },
      { type: "heading", text: "Convenções" },
      { type: "list", items: [
        "Componentes em PascalCase",
        "Hooks customizados em camelCase com prefixo use",
        "Imports absolutos via alias @/",
        "shadcn/ui customizado, não modificado diretamente",
        "TanStack Query para todo data fetching server-state",
        "toast (sonner) para feedback ao usuário",
      ]},
      { type: "heading", text: "Comunicação Frontend ↔ Backend" },
      { type: "code", text: "import { supabase } from \"@/integrations/supabase/client\";\n\nconst { data, error } = await supabase\n  .from(\"customers\")\n  .select(\"*\")\n  .eq(\"status\", \"ativo\");" },
    ],
  },
  {
    title: "Como Expandir o Sistema",
    blocks: [
      { type: "heading", text: "Adicionar novo módulo" },
      { type: "list", items: [
        "1. Criar pasta src/pages/admin/<modulo>/",
        "2. Adicionar rotas em src/App.tsx",
        "3. Adicionar entrada em navSections de AdminLayout.tsx",
        "4. Criar tabelas via migration com RLS habilitado",
        "5. Adicionar permissão em useRolePermissions",
        "6. Documentar em .lovable/memory/features/<modulo>.md",
      ]},
      { type: "heading", text: "Adicionar Edge Function" },
      { type: "list", items: [
        "1. Criar supabase/functions/<nome>/index.ts",
        "2. Sempre incluir CORS headers",
        "3. Deploy automático no Lovable",
        "4. Chamar via supabase.functions.invoke()",
      ]},
      { type: "heading", text: "Boas Práticas" },
      { type: "list", items: [
        "Sempre habilitar RLS em novas tabelas",
        "Usar has_role() em policies, nunca consultar user_roles direto",
        "Auditar mudanças sensíveis com triggers",
        "Validar input no client E no banco (constraints/triggers)",
        "Tratar todos os estados: loading, error, empty, success",
      ]},
    ],
  },
  {
    title: "Compliance LGPD",
    blocks: [
      { type: "paragraph", text: `DPO: ${DOC_META.dpo}` },
      { type: "list", items: [
        "Página informativa em /lgpd com base na Lei 13.709/2018",
        "Formulário de exercício de direitos em /lgpd/solicitar",
        "Protocolo automático LGPD-AAAA-NNNNN",
        "ROPA gerenciado em /admin/lgpd/ropa",
        "Consentimentos rastreáveis com IP e User Agent",
        "Registro e tratamento de incidentes com flag de notificação ANPD",
      ]},
    ],
  },
  {
    title: "Operação e Monitoramento",
    blocks: [
      { type: "list", items: [
        "Logs de Edge Functions disponíveis no painel Lovable Cloud",
        "Auditoria visualizável em /admin/audit-logs com filtros",
        "Analytics em /admin/analytics com pageviews e eventos",
        "pg_cron jobs visíveis no banco para tarefas recorrentes",
        "Realtime channels para chat (subscription via supabase.channel)",
      ]},
    ],
  },
];

// =====================================================
// MERMAID DIAGRAMS
// =====================================================
export const MINDMAP_DEFINITION = `mindmap
  root((The Best Cloud))
    Portal Admin
      Dashboard
      CRM
        Pipeline
        Leads
        Agenda
        Chat WhatsApp
      Marketing
        Email
        SMS
        Analytics
      Financeiro
        Receitas
        Despesas
        DRE
        Comissoes
      Faturamento
        Custo
        Venda
        Tabelas
      LGPD
        ROPA
        Consentimentos
        Solicitacoes
        Incidentes
      Operacoes
        Tickets
        Tenants
        Conexoes
        Auditoria
    Portal Cliente
      Dashboard
      Faturas
      Chamados
      Ouvidoria
    Publico
      Landing
      Solucoes
      Base Conhecimento
      Trial 14 dias
      LGPD Info
    Backend
      Lovable Cloud
      Edge Functions
      Z-API WhatsApp
      Acronis Cloud
      Lovable AI`;

export const FLOWCHART_DEFINITION = `flowchart TD
    A[Visitante Landing] -->|Solicita trial| B(Formulario Trial 14d)
    B --> C{Reserva Slot Agenda}
    C --> D[Lead criado no CRM]
    D --> E[Atendimento Comercial]
    E --> F{Aprovado?}
    F -->|Sim| G[Cria Customer + Tenant Acronis]
    F -->|Nao| H[Lead descartado / nutrir]
    G --> I[Sync Acronis cron]
    I --> J[Calcula uso por SKU]
    J --> K[Gera Fatura COST + SALE]
    K --> L[Cliente ve no Portal]
    L --> M{Pago?}
    M -->|Sim| N[Renovacao automatica]
    M -->|Nao| O[Cobranca / Suporte]
    
    P[WhatsApp Cliente] --> Q[Webhook Z-API]
    Q --> R{Conversa existe?}
    R -->|Sim| S[Reabre se fechada]
    R -->|Nao| T[Cria conversa]
    S --> U[Bot com menus]
    T --> U
    U --> V{Resolveu?}
    V -->|Nao| W[Escala humano]
    V -->|Sim| X[Encerra apos 48h]`;

export const ARCHITECTURE_DEFINITION = `flowchart LR
    subgraph Frontend
        A[React SPA<br/>Vite + TS]
        B[shadcn/ui<br/>Tailwind]
        C[TanStack Query]
    end
    
    subgraph Lovable Cloud
        D[(PostgreSQL<br/>RLS)]
        E[Auth<br/>JWT]
        F[Edge Functions<br/>Deno]
        G[Storage]
        H[Realtime<br/>Channels]
    end
    
    subgraph Externos
        I[Acronis Cloud API]
        J[Z-API WhatsApp]
        K[Lovable AI Gateway]
        L[Email Provider<br/>opcional]
    end
    
    A --> E
    A --> D
    A --> F
    A --> H
    F --> D
    F --> I
    F --> J
    F --> K
    A -.SPA Routes.-> A`;

// =====================================================
// MARKDOWN BUILDER
// =====================================================
export function buildMarkdown(variant: "executive" | "technical"): string {
  const sections = variant === "executive" ? EXECUTIVE_SECTIONS : TECHNICAL_SECTIONS;
  const title = variant === "executive" ? "Documentação Executiva" : "Documentação Técnica Completa";
  let md = `# ${DOC_META.product} — ${title}\n\n`;
  md += `**Versão:** ${DOC_META.version}  \n`;
  md += `**Data:** ${new Date().toLocaleDateString("pt-BR")}  \n`;
  md += `**Empresa:** ${DOC_META.company}  \n`;
  md += `**DPO:** ${DOC_META.dpo}\n\n`;
  md += `---\n\n## Sumário\n\n`;
  sections.forEach((s, i) => {
    md += `${i + 1}. [${s.title}](#${s.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")})\n`;
  });
  md += `\n---\n\n`;

  sections.forEach((section, idx) => {
    md += `## ${idx + 1}. ${section.title}\n\n`;
    section.blocks.forEach((block) => {
      if (block.type === "heading") md += `### ${block.text}\n\n`;
      else if (block.type === "paragraph") md += `${block.text}\n\n`;
      else if (block.type === "list") md += block.items.map((i) => `- ${i}`).join("\n") + "\n\n";
      else if (block.type === "code") md += "```\n" + block.text + "\n```\n\n";
    });
  });

  md += `---\n\n## Diagramas\n\n`;
  md += `### Mapa Mental\n\n\`\`\`mermaid\n${MINDMAP_DEFINITION}\n\`\`\`\n\n`;
  md += `### Fluxograma\n\n\`\`\`mermaid\n${FLOWCHART_DEFINITION}\n\`\`\`\n\n`;
  md += `### Arquitetura\n\n\`\`\`mermaid\n${ARCHITECTURE_DEFINITION}\n\`\`\`\n\n`;

  md += `---\n\n_Documento gerado automaticamente pela plataforma ${DOC_META.product}._\n`;
  return md;
}
