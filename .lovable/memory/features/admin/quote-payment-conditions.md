---
name: Quote Payment Conditions
description: Módulo de condições comerciais nas propostas (à vista com desconto ou faturado parcelado), persistência, preview, PDF e status de pagamento
type: feature
---

# Condições de Pagamento — Propostas Comerciais

## Schema (tabela `quotes`, colunas aditivas)
- `payment_method` — `'a_vista' | 'faturado'` (default `faturado`)
- `discount_type` — `'percent' | 'value'` (apenas à vista)
- `discount_value numeric` — valor ou percentual
- `installments_plan` — `'30' | '60' | '90' | '30_60' | '30_60_90' | 'custom'`
- `installments jsonb` — `[{ n, due_date (YYYY-MM-DD), amount }]`
- `final_value numeric` — total após desconto, fonte de verdade do valor cobrado
- `payment_status` — `'aguardando' | 'pago' | 'faturado' | 'parcial'`
- `payment_link text` — URL opcional de pagamento

Validação por trigger `validate_quote_payment` (não-CHECK por mutabilidade): impede valores inválidos e `final_value < 0`. Auditoria automática herdada de `log_quote_changes`.

## UI
- Componente `src/components/admin/quotes/PaymentConditionsCard.tsx`
- Inserido no form `src/pages/admin/Quotes.tsx` após o card "Condições e Assinatura"
- À vista: badge "Desconto especial para pagamento à vista" + 3 cards (Original / Desconto / Final)
- Faturado: tabela editável de parcelas; planos pré-definidos recalculam automaticamente; edição manual marca como `custom`
- Validação ao vivo: soma das parcelas == `final_value` (tolerância 0.01)

## Preview / Impressão
- Bloco "CONDIÇÕES COMERCIAIS" no preview de `Quotes.tsx`
- Mantém `payment_terms` (texto livre legado) como complemento opcional

## PDF (edge `generate-proposal-pdf`)
- Lê condições da `quotes` via `crm_deals.quote_id`
- Seção "Condições Comerciais": forma, desconto, parcelas, valor final
- `final_value` (se houver) tem prioridade sobre `crm_deals.value` para o destaque do investimento

## Compatibilidade
- Migration totalmente aditiva — propostas antigas continuam funcionando (defaults preservam comportamento)
- Campo `payment_terms` legado nunca foi removido
