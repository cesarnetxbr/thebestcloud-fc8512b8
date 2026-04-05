## Módulo LGPD — Plano de Implementação

### Módulos Protegidos (não serão alterados)
- Landing Page, Dashboard, Conexões, Tenants, SKUs, Tabelas de Custo/Venda
- Faturamento, Gestão Financeira, Solicitações Comerciais, Chamados, Auditoria
- Portal do Cliente, Ouvidoria, Usuários, Clientes

### Módulos Expandidos
- **Header**: adicionar link para Política de Privacidade no footer
- **Footer**: adicionar links LGPD (Privacidade, Cookies, DPO)
- **AdminLayout**: adicionar menu "LGPD" no sidebar

### Novas Tabelas (Migration)
1. **`lgpd_data_mapping`** — Registro de operações de tratamento (ROPA)
   - `data_category`, `purpose`, `legal_basis`, `storage_location`, `retention_period`, `third_parties`, `is_sensitive`
2. **`lgpd_consent_records`** — Log de consentimentos obtidos
   - `user_identifier`, `consent_type`, `granted`, `ip_address`, `user_agent`
3. **`lgpd_data_requests`** — Solicitações de titulares (acesso/correção/exclusão)
   - `requester_name`, `requester_email`, `request_type`, `status`, `response`, `protocol_number`
4. **`lgpd_incidents`** — Registro de incidentes de segurança
   - `title`, `description`, `severity`, `affected_data`, `notified_anpd`, `resolution`

### Novas Páginas

**Área Administrativa (`/admin/lgpd/...`)**
1. `/admin/lgpd` — Dashboard LGPD (visão geral de conformidade)
2. `/admin/lgpd/ropa` — Mapeamento de Dados (CRUD da tabela lgpd_data_mapping)
3. `/admin/lgpd/consents` — Registros de Consentimento (visualização dos logs)
4. `/admin/lgpd/requests` — Solicitações de Titulares (gerenciar pedidos)
5. `/admin/lgpd/incidents` — Incidentes de Segurança (registro e acompanhamento)
6. `/admin/lgpd/settings` — Config DPO + Política de Privacidade

**Páginas Públicas**
7. `/privacidade` — Política de Privacidade completa
8. `/cookies` — Política de Cookies

**Componentes**
9. **CookieConsentBanner** — Banner de cookies com aceitar/recusar/personalizar
10. **Links no Footer** para Privacidade, Cookies e contato DPO

### Etapas de Execução
1. **Migration** — Criar tabelas + RLS
2. **Páginas públicas** — Privacidade + Cookies
3. **Cookie Banner** — Componente global com persistência
4. **Admin LGPD** — Dashboard + ROPA + Solicitações + Incidentes
5. **Integração** — Menu admin + Footer + rotas
