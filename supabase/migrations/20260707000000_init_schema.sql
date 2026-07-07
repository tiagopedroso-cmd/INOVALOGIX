-- ============================================================================
-- Sistema próprio: Contas a Pagar/Receber, Fluxo de Caixa, Projetos, CRM Kanban
-- Empresa única | Equipe com login e papéis via Supabase Auth
-- ============================================================================

create extension if not exists pgcrypto;

-- ----------------------------------------------------------------------------
-- Função utilitária: updated_at automático
-- ----------------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ============================================================================
-- 1. EQUIPE / PERFIS (extensão de auth.users)
-- ============================================================================
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nome_completo text not null,
  email text not null,
  role text not null default 'membro' check (role in ('admin', 'financeiro', 'vendas', 'membro')),
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_profiles_updated_at
  before update on profiles
  for each row execute function set_updated_at();

-- Cria o profile automaticamente quando um usuário se cadastra no Supabase Auth
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, nome_completo, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'nome_completo', new.email), new.email);
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Helper para policies: usuário logado é admin?
create or replace function is_admin()
returns boolean as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'admin' and ativo
  );
$$ language sql stable security definer set search_path = public;

-- ============================================================================
-- 2. TABELAS DE REFERÊNCIA
-- ============================================================================
create table categorias_financeiras (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  tipo text not null check (tipo in ('receita', 'despesa')),
  cor text,
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);

create table contas_bancarias (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  banco text,
  tipo text not null default 'corrente' check (tipo in ('corrente', 'poupanca', 'caixa', 'investimento')),
  saldo_inicial numeric(14,2) not null default 0,
  saldo_atual numeric(14,2) not null default 0,
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);

create table formas_pagamento (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  ativo boolean not null default true
);

create table clientes (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  tipo_pessoa text not null default 'PJ' check (tipo_pessoa in ('PF', 'PJ')),
  documento text,
  email text,
  telefone text,
  endereco text,
  observacoes text,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_clientes_updated_at
  before update on clientes
  for each row execute function set_updated_at();

create table fornecedores (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  tipo_pessoa text not null default 'PJ' check (tipo_pessoa in ('PF', 'PJ')),
  documento text,
  email text,
  telefone text,
  endereco text,
  observacoes text,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_fornecedores_updated_at
  before update on fornecedores
  for each row execute function set_updated_at();

-- ============================================================================
-- 3. PROJETOS
-- ============================================================================
create table projetos (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  descricao text,
  cliente_id uuid references clientes(id) on delete set null,
  responsavel_id uuid references profiles(id) on delete set null,
  status text not null default 'planejamento'
    check (status in ('planejamento', 'em_andamento', 'pausado', 'concluido', 'cancelado')),
  data_inicio date,
  data_prevista_fim date,
  data_fim_real date,
  orcamento numeric(14,2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_projetos_updated_at
  before update on projetos
  for each row execute function set_updated_at();

-- ============================================================================
-- 4. CRM KANBAN
-- ============================================================================
create table crm_etapas (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  ordem integer not null,
  cor text,
  created_at timestamptz not null default now()
);

create table crm_negocios (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  cliente_id uuid references clientes(id) on delete set null,
  etapa_id uuid not null references crm_etapas(id),
  responsavel_id uuid references profiles(id) on delete set null,
  valor_estimado numeric(14,2),
  probabilidade smallint check (probabilidade between 0 and 100),
  origem text,
  status text not null default 'aberto' check (status in ('aberto', 'ganho', 'perdido')),
  motivo_perda text,
  data_prevista_fechamento date,
  ordem integer not null default 0,
  observacoes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_crm_negocios_updated_at
  before update on crm_negocios
  for each row execute function set_updated_at();

create table crm_atividades (
  id uuid primary key default gen_random_uuid(),
  negocio_id uuid not null references crm_negocios(id) on delete cascade,
  responsavel_id uuid references profiles(id) on delete set null,
  tipo text not null check (tipo in ('ligacao', 'email', 'reuniao', 'tarefa', 'nota')),
  descricao text not null,
  data_atividade timestamptz not null default now(),
  concluida boolean not null default false,
  created_at timestamptz not null default now()
);

-- Etapas padrão do funil
insert into crm_etapas (nome, ordem, cor) values
  ('Lead', 1, '#94a3b8'),
  ('Contato', 2, '#60a5fa'),
  ('Proposta', 3, '#fbbf24'),
  ('Negociação', 4, '#fb923c'),
  ('Ganho', 5, '#34d399'),
  ('Perdido', 6, '#f87171');

-- ============================================================================
-- 5. CONTAS A RECEBER / PAGAR
-- ============================================================================
create table contas_receber (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid references clientes(id) on delete set null,
  projeto_id uuid references projetos(id) on delete set null,
  negocio_id uuid references crm_negocios(id) on delete set null,
  categoria_id uuid references categorias_financeiras(id) on delete set null,
  conta_bancaria_id uuid references contas_bancarias(id) on delete set null,
  forma_pagamento_id uuid references formas_pagamento(id) on delete set null,
  descricao text not null,
  numero_documento text,
  valor numeric(14,2) not null,
  data_emissao date not null default current_date,
  data_vencimento date not null,
  data_recebimento date,
  status text not null default 'pendente' check (status in ('pendente', 'recebido', 'atrasado', 'cancelado')),
  numero_parcela integer default 1,
  total_parcelas integer default 1,
  parcelamento_grupo_id uuid,
  observacoes text,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_contas_receber_updated_at
  before update on contas_receber
  for each row execute function set_updated_at();

create table contas_pagar (
  id uuid primary key default gen_random_uuid(),
  fornecedor_id uuid references fornecedores(id) on delete set null,
  projeto_id uuid references projetos(id) on delete set null,
  categoria_id uuid references categorias_financeiras(id) on delete set null,
  conta_bancaria_id uuid references contas_bancarias(id) on delete set null,
  forma_pagamento_id uuid references formas_pagamento(id) on delete set null,
  descricao text not null,
  numero_documento text,
  valor numeric(14,2) not null,
  data_emissao date not null default current_date,
  data_vencimento date not null,
  data_pagamento date,
  status text not null default 'pendente' check (status in ('pendente', 'pago', 'atrasado', 'cancelado')),
  numero_parcela integer default 1,
  total_parcelas integer default 1,
  parcelamento_grupo_id uuid,
  observacoes text,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_contas_pagar_updated_at
  before update on contas_pagar
  for each row execute function set_updated_at();

-- ============================================================================
-- 6. FLUXO DE CAIXA (ledger de movimentações)
-- ============================================================================
create table movimentacoes_caixa (
  id uuid primary key default gen_random_uuid(),
  tipo text not null check (tipo in ('entrada', 'saida')),
  valor numeric(14,2) not null,
  data_movimento date not null default current_date,
  conta_bancaria_id uuid references contas_bancarias(id) on delete set null,
  categoria_id uuid references categorias_financeiras(id) on delete set null,
  descricao text not null,
  conta_receber_id uuid references contas_receber(id) on delete set null,
  conta_pagar_id uuid references contas_pagar(id) on delete set null,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

-- Atualiza o saldo da conta bancária a cada movimentação
create or replace function aplicar_movimentacao_caixa()
returns trigger as $$
begin
  if new.conta_bancaria_id is not null then
    update contas_bancarias
    set saldo_atual = saldo_atual + (case when new.tipo = 'entrada' then new.valor else -new.valor end)
    where id = new.conta_bancaria_id;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_aplicar_movimentacao_caixa
  after insert on movimentacoes_caixa
  for each row execute function aplicar_movimentacao_caixa();

-- Gera movimentação de caixa automaticamente ao marcar conta a receber/pagar como quitada
create or replace function gerar_movimentacao_ao_quitar()
returns trigger as $$
begin
  if TG_TABLE_NAME = 'contas_receber' then
    if new.status = 'recebido' and (old.status is distinct from 'recebido') then
      insert into movimentacoes_caixa (tipo, valor, data_movimento, conta_bancaria_id, categoria_id, descricao, conta_receber_id)
      values ('entrada', new.valor, coalesce(new.data_recebimento, current_date), new.conta_bancaria_id, new.categoria_id, new.descricao, new.id);
    end if;
  elsif TG_TABLE_NAME = 'contas_pagar' then
    if new.status = 'pago' and (old.status is distinct from 'pago') then
      insert into movimentacoes_caixa (tipo, valor, data_movimento, conta_bancaria_id, categoria_id, descricao, conta_pagar_id)
      values ('saida', new.valor, coalesce(new.data_pagamento, current_date), new.conta_bancaria_id, new.categoria_id, new.descricao, new.id);
    end if;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_contas_receber_quitacao
  after update on contas_receber
  for each row execute function gerar_movimentacao_ao_quitar();

create trigger trg_contas_pagar_quitacao
  after update on contas_pagar
  for each row execute function gerar_movimentacao_ao_quitar();

-- ============================================================================
-- 7. ÍNDICES
-- ============================================================================
create index idx_contas_receber_status on contas_receber(status);
create index idx_contas_receber_vencimento on contas_receber(data_vencimento);
create index idx_contas_receber_cliente on contas_receber(cliente_id);
create index idx_contas_pagar_status on contas_pagar(status);
create index idx_contas_pagar_vencimento on contas_pagar(data_vencimento);
create index idx_contas_pagar_fornecedor on contas_pagar(fornecedor_id);
create index idx_movimentacoes_data on movimentacoes_caixa(data_movimento);
create index idx_movimentacoes_conta on movimentacoes_caixa(conta_bancaria_id);
create index idx_projetos_status on projetos(status);
create index idx_crm_negocios_etapa on crm_negocios(etapa_id);
create index idx_crm_negocios_status on crm_negocios(status);
create index idx_crm_atividades_negocio on crm_atividades(negocio_id);

-- ============================================================================
-- 8. ROW LEVEL SECURITY
-- Empresa única: qualquer usuário autenticado (membro da equipe) enxerga e edita
-- os dados. Exclusão restrita a admin. Perfis só editam o próprio registro
-- (exceto admin, que gerencia todos).
-- ============================================================================
alter table profiles enable row level security;
alter table categorias_financeiras enable row level security;
alter table contas_bancarias enable row level security;
alter table formas_pagamento enable row level security;
alter table clientes enable row level security;
alter table fornecedores enable row level security;
alter table projetos enable row level security;
alter table crm_etapas enable row level security;
alter table crm_negocios enable row level security;
alter table crm_atividades enable row level security;
alter table contas_receber enable row level security;
alter table contas_pagar enable row level security;
alter table movimentacoes_caixa enable row level security;

-- profiles
create policy "profiles_select_authenticated" on profiles for select to authenticated using (true);
create policy "profiles_update_own_or_admin" on profiles for update to authenticated
  using (id = auth.uid() or is_admin());
create policy "profiles_delete_admin" on profiles for delete to authenticated using (is_admin());

-- tabelas de leitura/escrita liberada para toda a equipe autenticada
do $$
declare
  t text;
begin
  foreach t in array array[
    'categorias_financeiras', 'contas_bancarias', 'formas_pagamento',
    'clientes', 'fornecedores', 'projetos', 'crm_etapas', 'crm_negocios',
    'crm_atividades', 'contas_receber', 'contas_pagar', 'movimentacoes_caixa'
  ]
  loop
    execute format('create policy "%1$s_select" on %1$s for select to authenticated using (true)', t);
    execute format('create policy "%1$s_insert" on %1$s for insert to authenticated with check (true)', t);
    execute format('create policy "%1$s_update" on %1$s for update to authenticated using (true)', t);
    execute format('create policy "%1$s_delete_admin" on %1$s for delete to authenticated using (is_admin())', t);
  end loop;
end $$;
