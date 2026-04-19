---
name: Documentação Técnica Admin
description: Página /admin/documentacao gera PDF/Markdown executivo e técnico, mapa mental e fluxograma via Mermaid
type: feature
---
- Rota: /admin/documentacao (acesso admin via permissão "configuracoes")
- Página: src/pages/admin/Documentation.tsx
- Conteúdo: src/data/documentation.ts (DOC_META, EXECUTIVE_SECTIONS, TECHNICAL_SECTIONS, diagramas Mermaid, buildMarkdown)
- Downloads: PDF (jsPDF) executivo + técnico, Markdown executivo + técnico, SVG dos diagramas
- Diagramas: mindmap, flowchart, architecture (renderizados via mermaid lib client-side)
- Para atualizar conteúdo: editar src/data/documentation.ts (centralizado)
- Sem mudanças no banco — toda doc é estática + gerada em runtime
