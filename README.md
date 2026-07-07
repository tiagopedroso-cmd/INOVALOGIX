# InovaLogix · Sistema de Gestão

Sistema interno para contas a pagar/receber, fluxo de caixa, projetos (Kanban) e CRM (funil de vendas), construído com **Next.js (App Router)**, **Supabase** (Postgres + Auth) e deploy na **Vercel**.

## Stack

- Next.js 16 (App Router, Turbopack) + TypeScript + Tailwind CSS v4
- Supabase: Postgres, Auth (login por e-mail/senha), Row Level Security
- `@supabase/ssr` para sessão em Server Components/middleware (`src/proxy.ts`)

## Estrutura

```
src/
  app/            páginas (Home, /financeiro, /projetos, /crm, /login)
  components/     Topbar, Kanban boards, gráficos SVG, tabela financeira
  lib/supabase/   clients (browser/server) + refresh de sessão
  lib/labels.ts   mapeamento de status/etapas -> label/cor
  types/database.ts  tipos das tabelas e views do Supabase
supabase/migrations/  schema SQL (rodar em ordem no SQL Editor ou via CLI)
```

## Configuração local

1. Copie `.env.local.example` para `.env.local` e preencha:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (chave **publishable/anon**, não a secret)
2. `npm install`
3. `npm run dev` e acesse `http://localhost:3000`

## Banco de dados

As migrations em `supabase/migrations/` criam:
- `usuarios`, `parceiros`, `projetos`, `crm_leads`, `contas_pagar`, `contas_receber`
- Views de KPI/dashboard: `vw_kpis`, `vw_fluxo_previsto_90d`, `vw_projetos_resumo`, `vw_crm_funil`, `vw_pagar_resumo`, `vw_receber_resumo`, `vw_caixa`, `vw_fluxo_mensal`
- RLS: qualquer usuário autenticado lê/edita; exclusão restrita a `role = 'admin'`

Login é vinculado à tabela `usuarios` pelo e-mail (trigger `handle_new_user`): cadastre o membro da equipe em `usuarios` antes do primeiro login, ou ele é criado automaticamente no signup.

`atualizar_status_vencimento()` marca contas como vencidas/atrasadas por data — agende via pg_cron (se disponível no plano) ou uma Vercel Cron chamando uma Edge Function.

## Deploy

- **Vercel**: importar o repositório, configurar as duas env vars acima em Project Settings → Environment Variables.
- **Supabase**: projeto já provisionado; rode migrations futuras pelo SQL Editor ou `supabase db push` caso adote a CLI localmente.
