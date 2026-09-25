# CondoHub — Regras do Agente

## Sobre o projeto
SaaS de gestão de condomínio. Stack: React 19 + TypeScript + Vite 8 +
Tailwind CSS 4 + Zustand 5 + React Router DOM 7.

## Repositório
https://github.com/curioso01/CondoHub.git

## Regras absolutas — nunca violar
- NUNCA substituir ou remover classes do src/condo/styles.css por Tailwind
- NUNCA remover src/condo/data.js (expõe window.CondoSeed com dados mock)
- SEMPRE usar lucide-react para ícones (nunca CDN do unpkg)
- SEMPRE TypeScript estrito em todos os arquivos .ts e .tsx
- SEMPRE usar os stores Zustand (useAppStore, useAuthStore, useNotificationStore)
- SEMPRE passar inputs por security.sanitize() antes de exibir no DOM
- Tailwind é ADICIONAL ao styles.css, nunca substituto
- NUNCA usar window.Modules.*, window.Auth, window.Storage no código React novo

## Estrutura de arquivos existente (não apagar)
src/condo/styles.css  → design system completo (preservar)
src/condo/data.js     → seed de dados mock via window.CondoSeed (preservar)
src/condo/core.js     → lógica legada a ser portada para src/lib/ e src/store/
src/condo/modules1.js → Dashboard + Financeiro + Multas
src/condo/modules2.js → Manutenção + Assembleias + Comunicados
src/condo/modules3.js → Portaria + Reservas + Ocorrências + Cadastro
src/condo/modules4.js → Portal Morador + Relatórios + Configurações

## Classes CSS disponíveis no styles.css (usar sempre)
.card, .card-header, .card-title
.btn, .btn-primary, .btn-secondary, .btn-outline, .btn-ghost, .btn-sm
.form-control, .form-group, .form-label
.table, .badge, .badge-success, .badge-danger, .badge-warning, .badge-info
.tab-btn, .tab-btn.active, .nav-item, .nav-item.active
.modal, .modal-overlay, .sidebar, .top-header

## Permissões por módulo
dashboard:      SUPER_ADMIN, SINDICO, CONSELHEIRO
financial:      SUPER_ADMIN, SINDICO, CONSELHEIRO
maintenance:    SUPER_ADMIN, SINDICO, CONSELHEIRO
assemblies:     SUPER_ADMIN, SINDICO, CONSELHEIRO, MORADOR
communications: todos os roles
access:         SUPER_ADMIN, SINDICO, PORTEIRO
reservations:   todos os roles
occurrences:    todos os roles
registry:       SUPER_ADMIN, SINDICO
reports:        SUPER_ADMIN, SINDICO, CONSELHEIRO
settings:       SUPER_ADMIN, SINDICO
portal:         MORADOR

## Credenciais demo (hardcoded nos stores)
sindico@condohub.com     / Sindico@2024     → SINDICO
morador@condohub.com     / Morador@2024     → MORADOR (unitId: A101)
porteiro@condohub.com    / Porteiro@2024    → PORTEIRO
admin@condohub.com       / Admin@2024       → SUPER_ADMIN
conselheiro@condohub.com / Conselho@2024    → CONSELHEIRO (unitId: C101)

## Comandos do projeto
npm install          → instalar dependências
npm run dev          → dev server porta 3000
npm run lint         → checar TypeScript
npm run build        → build de produção

## Dependências a adicionar
npm install zustand react-router-dom

## Rotas React
/login          → Login (pública)
/dashboard      → Dashboard
/financeiro     → Financial
/manutencao     → Maintenance
/assembleias    → Assemblies
/comunicados    → Communications
/portaria       → Access
/reservas       → Reservations
/ocorrencias    → Occurrences
/cadastro       → Registry
/relatorios     → Reports
/configuracoes  → Settings
/portal         → ResidentPortal (MORADOR)
/               → redirect por role

## Redirect por role no login
MORADOR      → /portal
PORTEIRO     → /portaria
outros       → /dashboard
