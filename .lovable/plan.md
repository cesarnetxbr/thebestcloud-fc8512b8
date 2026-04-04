## Mapeamento do Existente

**Módulos protegidos (não serão alterados):**
- Landing Page, Dashboard, Conexões, Tenants, SKUs, Tabelas de Custo/Venda
- Faturamento, Gestão Financeira, Solicitações Comerciais, Chamados, Auditoria

**Módulos expandidos:**
- **Clientes** (`/admin/customers`): já possui CRUD completo com delete. Será expandido com vínculo a user_id e opção de desativar
- **Usuários** (`/admin/users`): já possui criação, roles e permissões. Será expandido com opções de desativar e excluir

## Etapas de Implementação

### Etapa 1 — Migration
- Adicionar coluna `user_id` na tabela `customers` (referência a auth.users, nullable)
- Adicionar coluna `is_active` na tabela `profiles` (default true)
- Atualizar RLS se necessário

### Etapa 2 — Edge Function `admin-manage-user`
- Ação `deactivate`: marca `profiles.is_active = false`
- Ação `delete`: remove user via admin API + cascata em user_roles/profiles
- Verificação de admin obrigatória

### Etapa 3 — UI Usuários (`/admin/users`)
- Botões "Desativar" e "Excluir" na tabela e no dialog de detalhes
- Indicador visual de status ativo/inativo
- Confirmação antes de excluir

### Etapa 4 — UI Clientes (`/admin/customers`)
- Campo para vincular usuário do tipo "cliente" ao cadastro
- Botão "Desativar" (altera status para "inactive")
- Status já existe na tabela, apenas expandir a UI

### Etapa 5 — Portal do Cliente
- Na autenticação, buscar o `customer_id` vinculado ao user logado para filtrar faturas/chamados
