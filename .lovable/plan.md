## 🗺️ Mapeamento do que JÁ existe (não será removido)

| Recurso | Localização | Status |
|---|---|---|
| Webhook WhatsApp + qualificação automática | `supabase/functions/whatsapp-webhook` | ✅ Recém-implementado, será apenas estendido |
| Lead/Deal automático com tags "WhatsApp" / "Alta Probabilidade" | `crm_leads`, `crm_deals`, `crm_deal_tags` | ✅ Existe |
| Pipeline kanban admin | `src/pages/admin/crm/CRMPipeline.tsx` | ✅ Existe |
| Multi-atendimento + chat | `CRMChat.tsx`, `chat_conversations`, `chat_messages` | ✅ Existe |
| Quotes (orçamentos) com PDF | `src/pages/admin/Quotes.tsx` | ✅ Existe (geração HTML/PDF print) |
| Tabelas de venda / SKUs | `sale_tables`, `sale_table_items`, `skus` | ✅ Existe |
| Edge functions e Lovable AI Gateway | `LOVABLE_API_KEY` configurado | ✅ Disponível |
| Z-API envio | `whatsapp-evolution` | ✅ Disponível |

## 🛡️ Módulos protegidos (apenas estendidos, nunca substituídos)
- `whatsapp-webhook` (handlers existentes intactos)
- `Quotes.tsx` (lógica de orçamento manual preservada)
- `CRMPipeline.tsx` (kanban atual preservado)
- Auth/RLS de `crm_leads`, `crm_deals`, `chat_conversations`

---

## 📐 Plano em 4 fases modulares (seguras e independentes)

### FASE 1 — Dashboard de métricas WhatsApp (2 etapas)

**1.1 – Edge function** `crm-whatsapp-metrics` (somente leitura, admin only)
- Calcula em uma única query agregada:
  - Total de leads qualificados via WhatsApp (filtro `source='whatsapp'`)
  - Tempo médio entre criação do lead e criação do deal (até proposta)
  - Taxa de conversão = deals com `status='ganho'` / leads WhatsApp
  - Top 5 serviços (extraídos da tag `serv:*` em `crm_leads.tags`)
  - Série temporal diária dos últimos 30/7/90 dias (parametrizável)

**1.2 – Página admin** `/admin/crm/whatsapp-metrics` (`CRMWhatsAppMetrics.tsx`)
- 4 cards de KPI no topo
- Gráfico de linha (recharts) com leads/deals/dia
- Gráfico de barras com top serviços
- Tabela dos últimos 20 deals WhatsApp (link para o deal)
- Filtro de período (7/30/90 dias)
- Item no menu lateral CRM já existente

### FASE 2 — Agendamento com especialista pós-qualificação (3 etapas)

**2.1 – Migração** nova tabela `consultant_bookings`:
```
id, deal_id (FK), lead_id (FK), customer_email, customer_name,
specialist_user_id (FK opcional → profiles), scheduled_at (timestamptz),
duration_minutes (default 30), status (pendente|confirmado|cancelado|realizado),
booking_token (text único, p/ acesso público), notes, created_at
```
+ tabela `specialist_availability` (slots disponíveis por especialista) OU regra simples (slots fixos seg-sex 9h-18h, 30min, exclui já marcados)
- RLS: admin lê tudo; público acessa via `booking_token` (edge function)

**2.2 – Edge function** `book-consultant-slot` (público mas validado)
- `GET ?token=xxx` → retorna slots disponíveis dos próximos 7 dias úteis
- `POST { token, scheduled_at }` → grava booking, atualiza deal com nota
- Envia confirmação por e-mail (Lovable Email Infra) ao cliente e especialista

**2.3 – Mensagem WhatsApp pós-qualificação atualizada**
- Após `tryQualifyCotacaoLead.created`, gera `booking_token` e envia link `https://thebestcloud.app/agendar/{token}` em vez de só "consultor entrará em contato"
- Página pública `/agendar/:token` (`BookingPage.tsx`) com calendário simples + slots

### FASE 3 — Envio automático de proposta em PDF por e-mail (3 etapas)

**3.1 – Verificar/setup email infra** (Lovable Emails)
- `email_domain--check_email_domain_status` → se não houver domínio, mostrar diálogo `<lov-open-email-setup>` e pausar nesta fase até o usuário configurar
- Após configurado: `email_domain--setup_email_infra` + `email_domain--scaffold_transactional_email`

**3.2 – Edge function** `generate-proposal-pdf` (admin/auto)
- Recebe `dealId`
- Busca dados do deal + lead + serviços identificados + heurística de preços
- Gera HTML estruturado da proposta (logo + dados The Best Cloud + escopo + valor + termos + IPCA + assinatura)
- Converte para PDF via biblioteca Deno-compatible (`https://esm.sh/pdfkit` ou geração HTML→PDF via API). **Plano A**: HTML inline + Puppeteer-on-Deno via serviço externo gratuito tipo `https://api.html2pdf.app/v1/generate`. **Plano B**: já que isso pode ser frágil em Deno, alternativa = gerar HTML rico estilizado e anexar como link assinado de Storage (PDF gerado client-side ou usando Lovable AI para gerar markdown→html, e o "anexo" é um link bonito; e-mail acompanha cópia do conteúdo)
- Faz upload para bucket `proposals` (privado, signed URL 7 dias)

**3.3 – Trigger automático**
- Em `tryQualifyCotacaoLead`, se `extracted.email`, dispara `generate-proposal-pdf` em background
- Template transacional `proposal-ready` com botão "Baixar Proposta" apontando para signed URL
- Idempotency key = `proposal-${dealId}`

### FASE 4 — Página pública de acompanhamento de cotação (2 etapas)

**4.1 – Coluna `tracking_token` em `crm_deals`** (UUID único, gerado por trigger)
- Edge function `quote-tracking` (público, sem JWT)
  - `GET ?token=xxx` → retorna deal sanitizado: título, etapa atual, probabilidade, próximos passos, timeline (criado, qualificado, agendado, proposta enviada, fechado)
  - Não expõe valores internos sensíveis (apenas valor proposto se status ≥ proposta)

**4.2 – Página pública** `/cotacao/:token` (`QuoteTrackingPage.tsx`)
- Stepper visual com etapas (igual UPS tracking)
- Card com probabilidade, próximos passos, contato consultor
- Link "Ver agendamento" se booking existir
- Link "Baixar proposta" se PDF gerado
- Mensagem WhatsApp pós-qualificação inclui o link `/cotacao/{tracking_token}`

---

## 📚 Documentação
Atualizar `mem://features/whatsapp-zapi.md` e criar:
- `mem://features/admin/whatsapp-metrics.md`
- `mem://features/admin/consultant-bookings.md`
- `mem://features/proposal-pdf-email.md`
- `mem://features/public-quote-tracking.md`

---

## ⚠️ Pontos de decisão antes de eu começar

1. **PDF**: Lovable Emails não suporta anexos. A alternativa padrão é enviar **link assinado do Storage** dentro do e-mail (botão "Baixar Proposta"). É essa a abordagem que você quer? (Recomendo SIM — confiável e rastreável)
2. **Agendamento**: Começo com **slots fixos automáticos** (seg-sex 9h-18h, 30 min, exclui já marcados) em vez de cadastro manual de disponibilidade por especialista? Mais rápido de entregar; podemos evoluir depois.
3. **Domínio de e-mail**: Você já tem um domínio de e-mail configurado em Lovable Cloud (ex: `notify.thebestcloud.app`)? Se não, na Fase 3 vou abrir o diálogo de configuração — leva poucos minutos do seu lado (DNS).
4. **Ordem de execução**: posso ir entregando fase a fase (cada uma testada e funcional antes da próxima), ou prefere tudo em uma rodada? Recomendo **fase a fase** pela complexidade.

Confirma esses 4 pontos e eu começo pela **Fase 1 (Dashboard)** imediatamente.