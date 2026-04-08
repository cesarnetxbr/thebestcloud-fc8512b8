## Módulo de Orçamentos — Plano de Implementação

### Módulos Protegidos (sem alteração)
- Landing Page, Dashboard, Conexões, Tenants, SKUs, Tabelas de Custo/Venda
- Faturamento, Gestão Financeira, Solicitações Comerciais, Chamados, Ouvidoria
- Portal do Cliente, LGPD, Usuários, Auditoria, Configurações

### Módulos Expandidos
- **AdminLayout**: adicionar item "Orçamentos" na seção COMERCIAL
- **App.tsx**: adicionar rota `/admin/quotes`

### Novas Tabelas (Migration)
1. **`quotes`** — Propostas comerciais
   - `quote_number`, `customer_id`, `customer_name`, `contact_name`, `contact_email`, `contact_phone`, `contact_department`
   - `introduction_text`, `payment_terms`, `validity_days`, `status` (rascunho/enviado/aprovado/recusado)
   - `total_value`, `notes`, `created_by`, `signed_by_name`, `signed_by_title`

2. **`quote_items`** — Itens da proposta
   - `quote_id`, `item_number`, `category` (implementação/backup/cybersegurança/etc)
   - `service_name`, `description`, `quantity`, `unit_price`, `total_price`, `markup_info`

### Nova Página
- `/admin/quotes` — Lista de orçamentos com CRUD completo
  - Formulário de criação com seções baseadas no modelo PDF
  - Pré-preenchimento com dados do cliente (da tabela `customers`)
  - Categorias de serviços: Implementação, Treinamento, Proteção de Dados, Cybersegurança, Gerenciamento
  - Visualização/preview da proposta com cores e logo The Best Cloud
  - Geração de PDF para download

### Etapas
1. **Migration** — Criar tabelas `quotes` e `quote_items` com RLS
2. **Página admin** — CRUD de orçamentos com formulário por seções
3. **Preview/PDF** — Visualização e geração de PDF da proposta
4. **Integração** — Menu admin + rota