## 🗺️ Mapeamento — o que JÁ existe (NÃO será removido)

| Recurso | Localização | Status |
|---|---|---|
| Tabela `quotes` (com `payment_terms text` livre) | DB | ✅ Existe — será **estendida** com novas colunas |
| Tabela `quote_items` | DB | ✅ Existe — intacta |
| Tabela `quote_audit_log` + trigger `log_quote_changes` | DB | ✅ Existe — capturará automaticamente as novas colunas |
| Tela `Quotes.tsx` (form + preview + duplicação + versão + assinatura) | `src/pages/admin/Quotes.tsx` | ✅ Existe — apenas **estendida** |
| `generate-proposal-pdf` (PDF via pdf-lib) | edge function | ✅ Existe — apenas **estendida** com seção "Condições Comerciais" |
| Card "Condições e Assinatura" (campo livre `payment_terms`) | linhas 723–761 | ✅ Será mantido como fallback editorial; a nova lógica passa a ser a fonte de verdade |
| Preview da proposta (linhas 1078–1087) | `Quotes.tsx` | ✅ Será **estendido** com bloco "Condições Comerciais" e tabela de parcelas |
| Tela de impressão / PDF do navegador | já usa o preview | ✅ Funcionará automaticamente com o novo bloco |

## 🛡️ Módulos protegidos (apenas ESTENDIDOS, nunca substituídos)
- `Quotes.tsx` — form, criar/atualizar/duplicar, preview, aceite e assinatura digital
- `quote_items` e RLS já corrigida (admin/manager)
- `quote_audit_log` (mantém histórico)
- `generate-proposal-pdf` (mantém layout atual; só adiciona uma página/seção)
- Webhook WhatsApp e fluxo de PDF automático — não tocados

## 🆕 Etapas modulares (todas seguras, reversíveis e isoladas)

### Etapa 1 — Schema (migration aditiva, sem DROP)
Adiciona em `quotes` (todas nullable, com defaults seguros):
- `payment_method text` ('a_vista' | 'faturado') default `'faturado'`
- `discount_type text` ('percent' | 'value') nullable
- `discount_value numeric` default 0
- `installments_plan text` ('30' | '60' | '90' | '30_60' | '30_60_90' | 'custom')
- `installments jsonb` — array `[{n, due_date, amount}]` editável
- `final_value numeric` — valor final negociado (após desconto)
- `payment_status text` ('aguardando' | 'pago' | 'faturado' | 'parcial') default `'aguardando'`
- `payment_link text` nullable

Mantém `payment_terms` (compatibilidade total com propostas antigas).

### Etapa 2 — Componente `PaymentConditionsCard.tsx` (novo)
- Local: `src/components/admin/quotes/PaymentConditionsCard.tsx`
- Props: `totalValue`, valores controlados + setters
- Seleção À Vista / Faturado (Tabs ou RadioGroup)
- À Vista: input desconto % ou R$, badge "💰 Desconto especial para pagamento à vista", cards Original / Desconto / Final
- Faturado: select de plano (30, 60, 90, 30/60, 30/60/90), tabela editável de parcelas (n, vencimento, valor), validação ao vivo (soma = total, sem negativo)
- Botão "Gerar link de pagamento" (placeholder — grava texto/URL no campo `payment_link`; integração real fica para etapa futura)
- Select de status de pagamento

### Etapa 3 — Integração no form (`Quotes.tsx`)
- Adiciona estados + persiste em create/update/duplicate/openEdit
- Inserir o novo card logo após o card "Condições e Assinatura"
- Recalcula `final_value` automaticamente
- Validações: desconto não pode tornar total negativo; soma das parcelas == final_value (tolerância 0.01)

### Etapa 4 — Preview + Impressão
- Bloco "CONDIÇÕES COMERCIAIS" no preview (linhas ~1078):
  - Forma de pagamento (À Vista / Faturado)
  - Desconto (se houver) com destaque verde
  - Valor final negociado
  - Tabela de parcelas (timeline em tela, tabela na impressão)
- Mantém o texto livre `payment_terms` como linha complementar opcional

### Etapa 5 — PDF (`generate-proposal-pdf`)
- Acrescenta seção "Condições Comerciais" no PDF gerado:
  - Forma de pagamento, parcelamento, % de desconto, valor final
  - Tabela simples de parcelas se faturado
- Layout consistente (navy/orange, pdf-lib)

### Etapa 6 — Documentação
- Criar `mem://features/admin/quote-payment-conditions.md`
- Atualizar `mem://index.md` (referência ao novo módulo)
- Não remove nada existente

## ✅ Garantias
- Migration somente **aditiva** (ALTER TABLE ADD COLUMN ... DEFAULT)
- RLS herdada do `quotes` (admin/manager)
- Auditoria automática via `log_quote_changes`
- Propostas antigas continuam abrindo (defaults preservam comportamento)
- Sem remoção do campo livre `payment_terms`

## ⏳ Confirme para eu seguir
Posso executar as 6 etapas em sequência nesta mesma rodada (recomendado, é coeso) ou prefere etapa-a-etapa com validação? Se confirmar, começo pela migration.
