-- ============================================================================
-- Alinha o schema ao modelo de dados do frontend (Claude Design: Sistema
-- InovaLogix). Substitui o schema genérico anterior por: usuarios, parceiros,
-- projetos, crm_leads, contas_pagar, contas_receber + enums + views de KPI.
-- Nenhuma linha de dado real existia nas tabelas substituídas (verificado
-- antes de aplicar).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 0. Remove schema anterior
-- ----------------------------------------------------------------------------
drop table if exists movimentacoes_caixa cascade;
drop table if exists crm_atividades cascade;
drop table if exists crm_negocios cascade;
drop table if exists crm_etapas cascade;
drop table if exists contas_receber cascade;
drop table if exists contas_pagar cascade;
drop table if exists projetos cascade;
drop table if exists fornecedores cascade;
drop table if exists clientes cascade;
drop table if exists formas_pagamento cascade;
drop table if exists contas_bancarias cascade;
drop table if exists categorias_financeiras cascade;
drop table if exists profiles cascade;

drop function if exists aplicar_movimentacao_caixa() cascade;
drop function if exists gerar_movimentacao_ao_quitar() cascade;
drop function if exists handle_new_user() cascade;
drop function if exists is_admin() cascade;
drop function if exists set_updated_at() cascade;

-- ----------------------------------------------------------------------------
-- 1. Extensão e ENUMs
-- ----------------------------------------------------------------------------
create extension if not exists pgcrypto;

create type parceiro_tipo  as enum ('cliente', 'fornecedor', 'ambos');
create type projeto_status as enum ('nao_iniciado', 'em_andamento', 'pausado', 'concluido', 'cancelado');
create type crm_etapa      as enum ('conversando', 'agendado', 'proposta_andamento', 'proposta_enviada', 'finalizado', 'recorrente', 'follow_up');
create type pagar_status   as enum ('pago', 'pendente', 'vencido');
create type receber_status as enum ('recebido', 'aguardando', 'atrasado');
create type caixa_tipo     as enum ('entrada', 'saida');

-- ----------------------------------------------------------------------------
-- 2. Tabelas
-- ----------------------------------------------------------------------------

-- 2.1 usuarios (equipe / responsáveis)
-- Ajuste: separado de auth.users via auth_user_id (nullable, unique) em vez de
-- usar o id do auth como PK. Permite cadastrar/seedar membros da equipe antes
-- de existir login, e depois vincular automaticamente pelo e-mail no signup.
-- Também adiciona "role" para permissões (admin/financeiro/vendas/membro),
-- necessário para a equipe com níveis de acesso.
create table usuarios (
  id            uuid primary key default gen_random_uuid(),
  auth_user_id  uuid unique references auth.users(id) on delete set null,
  nome          text not null,
  cargo         text,
  iniciais      text not null,
  cor_avatar    text default '#0E9E9E',
  email         text unique,
  role          text not null default 'membro' check (role in ('admin', 'financeiro', 'vendas', 'membro')),
  ativo         boolean not null default true,
  criado_em     timestamptz not null default now()
);

-- 2.2 parceiros (clientes e fornecedores)
create table parceiros (
  id         uuid primary key default gen_random_uuid(),
  nome       text not null,
  iniciais   text,
  tipo       parceiro_tipo not null default 'cliente',
  origem     text,
  contato    text,
  email      text,
  telefone   text,
  criado_em  timestamptz not null default now()
);

-- 2.3 projetos (quadro Kanban)
create table projetos (
  id             uuid primary key default gen_random_uuid(),
  nome           text not null,
  cliente_id     uuid references parceiros(id) on delete set null,
  status         projeto_status not null default 'nao_iniciado',
  valor          numeric(14,2) not null default 0,
  progresso      integer not null default 0 check (progresso between 0 and 100),
  prazo          date,
  responsavel_id uuid references usuarios(id) on delete set null,
  criado_em      timestamptz not null default now(),
  atualizado_em  timestamptz not null default now()
);

-- 2.4 crm_leads (funil de vendas)
create table crm_leads (
  id               uuid primary key default gen_random_uuid(),
  empresa          text not null,
  parceiro_id      uuid references parceiros(id) on delete set null,
  contato          text,
  etapa            crm_etapa not null default 'conversando',
  valor_estimado   numeric(14,2) not null default 0,
  recorrente       boolean not null default false,
  origem           text,
  nota             text,
  data_agendamento timestamptz,
  responsavel_id   uuid references usuarios(id) on delete set null,
  criado_em        timestamptz not null default now(),
  atualizado_em    timestamptz not null default now()
);

-- 2.5 contas_pagar
create table contas_pagar (
  id             uuid primary key default gen_random_uuid(),
  fornecedor_id  uuid references parceiros(id) on delete set null,
  descricao      text not null,
  categoria      text,
  valor          numeric(14,2) not null,
  vencimento     date not null,
  status         pagar_status not null default 'pendente',
  data_pagamento date,
  criado_em      timestamptz not null default now()
);

-- 2.6 contas_receber
create table contas_receber (
  id               uuid primary key default gen_random_uuid(),
  cliente_id       uuid references parceiros(id) on delete set null,
  projeto_id       uuid references projetos(id) on delete set null,
  descricao        text not null,
  valor            numeric(14,2) not null,
  vencimento       date not null,
  status           receber_status not null default 'aguardando',
  data_recebimento date,
  criado_em        timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 3. Índices
-- ----------------------------------------------------------------------------
create index idx_projetos_status      on projetos(status);
create index idx_projetos_responsavel on projetos(responsavel_id);
create index idx_crm_etapa            on crm_leads(etapa);
create index idx_pagar_status_venc    on contas_pagar(status, vencimento);
create index idx_receber_status_venc  on contas_receber(status, vencimento);
create index idx_pagar_data_pgto      on contas_pagar(data_pagamento);
create index idx_receber_data_receb   on contas_receber(data_recebimento);
create index idx_parceiros_tipo       on parceiros(tipo);

-- ----------------------------------------------------------------------------
-- 4. Trigger de atualizado_em
-- ----------------------------------------------------------------------------
create or replace function set_atualizado_em()
returns trigger as $$
begin
  new.atualizado_em = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_projetos_upd before update on projetos
  for each row execute function set_atualizado_em();
create trigger trg_crm_upd before update on crm_leads
  for each row execute function set_atualizado_em();

-- ----------------------------------------------------------------------------
-- 4.1 Ajuste: função para marcar contas vencidas/atrasadas automaticamente.
-- Não é chamada por trigger (depende da data corrente, não de um evento de
-- escrita) — precisa ser agendada (pg_cron diário ou Edge Function com cron
-- na Vercel). Deixe restrita a service_role.
-- ----------------------------------------------------------------------------
create or replace function atualizar_status_vencimento()
returns void as $$
begin
  update contas_pagar set status = 'vencido'
    where status = 'pendente' and vencimento < current_date;
  update contas_receber set status = 'atrasado'
    where status = 'aguardando' and vencimento < current_date;
end;
$$ language plpgsql security definer set search_path = public;

revoke execute on function atualizar_status_vencimento() from public;

-- Tenta agendar via pg_cron se a extensão estiver disponível no plano; se não
-- estiver, ignora silenciosamente (dá para agendar depois via Edge Function).
do $$
begin
  create extension if not exists pg_cron;
  perform cron.schedule('atualizar-status-vencimento', '0 3 * * *', 'select atualizar_status_vencimento();');
exception when others then
  raise notice 'pg_cron indisponível neste projeto — agende atualizar_status_vencimento() externamente (ex: Vercel Cron chamando uma Edge Function).';
end $$;

-- ----------------------------------------------------------------------------
-- 5. Equipe / login (Supabase Auth <-> usuarios)
-- ----------------------------------------------------------------------------
create or replace function is_admin()
returns boolean as $$
  select exists (
    select 1 from usuarios where auth_user_id = auth.uid() and role = 'admin' and ativo
  );
$$ language sql stable security definer set search_path = public;

-- Ao criar login: vincula a um usuario pré-cadastrado com o mesmo e-mail
-- (fluxo comum: admin cadastra o membro da equipe antes dele logar pela
-- primeira vez); se não existir, cria um novo registro.
create or replace function handle_new_user()
returns trigger as $$
begin
  update usuarios set auth_user_id = new.id
    where email = new.email and auth_user_id is null;

  if not found then
    insert into usuarios (nome, iniciais, email, auth_user_id)
    values (
      coalesce(new.raw_user_meta_data->>'nome', split_part(new.email, '@', 1)),
      upper(left(coalesce(new.raw_user_meta_data->>'nome', new.email), 2)),
      new.email,
      new.id
    );
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ----------------------------------------------------------------------------
-- 6. VIEWS — KPIs, agregações e fluxo de caixa derivado
-- security_invoker garante que as views respeitem a RLS de quem consulta,
-- em vez de rodar com o privilégio do dono da view.
-- ----------------------------------------------------------------------------
create or replace view vw_kpis
with (security_invoker = true) as
select
  (select coalesce(sum(valor),0) from contas_receber where status <> 'recebido') as total_a_receber,
  (select coalesce(sum(valor),0) from contas_pagar   where status <> 'pago')     as total_a_pagar,
  (select coalesce(sum(valor),0) from contas_receber where status <> 'recebido')
  - (select coalesce(sum(valor),0) from contas_pagar where status <> 'pago')     as saldo_previsto,
  (select coalesce(sum(valor),0) from contas_receber
     where status='recebido'
       and date_trunc('month',data_recebimento)=date_trunc('month',current_date)) as faturamento_mes;

create or replace view vw_fluxo_previsto_90d
with (security_invoker = true) as
select
  coalesce(sum(valor) filter (where origem='entrada'),0)
  - coalesce(sum(valor) filter (where origem='saida'),0) as saldo_previsto_90d
from (
  select valor, 'entrada' as origem, vencimento from contas_receber
    where status <> 'recebido' and vencimento between current_date and current_date + interval '90 days'
  union all
  select valor, 'saida' as origem, vencimento from contas_pagar
    where status <> 'pago' and vencimento between current_date and current_date + interval '90 days'
) t;

create or replace view vw_projetos_resumo
with (security_invoker = true) as
select status,
       count(*)                as qtd,
       coalesce(sum(valor),0)  as valor_total
from projetos
group by status;

create or replace view vw_crm_funil
with (security_invoker = true) as
select etapa,
       count(*)                          as qtd,
       coalesce(sum(valor_estimado),0)   as valor_total
from crm_leads
group by etapa;

create or replace view vw_pagar_resumo
with (security_invoker = true) as
  select status, count(*) qtd, coalesce(sum(valor),0) total from contas_pagar group by status;

create or replace view vw_receber_resumo
with (security_invoker = true) as
  select status, count(*) qtd, coalesce(sum(valor),0) total from contas_receber group by status;

create or replace view vw_caixa
with (security_invoker = true) as
  select cr.id as origem_id, 'contas_receber' as origem, 'entrada'::caixa_tipo as tipo,
         cr.valor, cr.data_recebimento as data, 'realizado' as regime, cr.descricao
    from contas_receber cr where cr.status = 'recebido' and cr.data_recebimento is not null
  union all
  select cp.id, 'contas_pagar', 'saida'::caixa_tipo, cp.valor, cp.data_pagamento, 'realizado', cp.descricao
    from contas_pagar cp where cp.status = 'pago' and cp.data_pagamento is not null
  union all
  select cr.id, 'contas_receber', 'entrada'::caixa_tipo, cr.valor, cr.vencimento, 'previsto', cr.descricao
    from contas_receber cr where cr.status <> 'recebido'
  union all
  select cp.id, 'contas_pagar', 'saida'::caixa_tipo, cp.valor, cp.vencimento, 'previsto', cp.descricao
    from contas_pagar cp where cp.status <> 'pago';

create or replace view vw_fluxo_mensal
with (security_invoker = true) as
select
  date_trunc('month', data)::date          as mes,
  regime,
  sum(valor) filter (where tipo='entrada') as entradas,
  sum(valor) filter (where tipo='saida')   as saidas,
  sum(valor) filter (where tipo='entrada')
    - sum(valor) filter (where tipo='saida') as saldo
from vw_caixa
group by 1, 2
order by 1;

-- ----------------------------------------------------------------------------
-- 7. RLS
-- Ajuste em relação ao prompt original: policies separadas por operação em
-- vez de "for all using(true)", para restringir DELETE a admin (equipe com
-- permissões diferentes, conforme definido para este projeto).
-- ----------------------------------------------------------------------------
alter table usuarios       enable row level security;
alter table parceiros      enable row level security;
alter table projetos       enable row level security;
alter table crm_leads      enable row level security;
alter table contas_pagar   enable row level security;
alter table contas_receber enable row level security;

create policy "usuarios_select" on usuarios for select to authenticated using (true);
create policy "usuarios_update_own_or_admin" on usuarios for update to authenticated
  using (auth_user_id = auth.uid() or is_admin());
create policy "usuarios_insert_admin" on usuarios for insert to authenticated with check (is_admin());
create policy "usuarios_delete_admin" on usuarios for delete to authenticated using (is_admin());

do $$
declare
  t text;
begin
  foreach t in array array['parceiros', 'projetos', 'crm_leads', 'contas_pagar', 'contas_receber']
  loop
    execute format('create policy "%1$s_select" on %1$s for select to authenticated using (true)', t);
    execute format('create policy "%1$s_insert" on %1$s for insert to authenticated with check (true)', t);
    execute format('create policy "%1$s_update" on %1$s for update to authenticated using (true)', t);
    execute format('create policy "%1$s_delete_admin" on %1$s for delete to authenticated using (is_admin())', t);
  end loop;
end $$;

-- ----------------------------------------------------------------------------
-- 8. Seed de exemplo
-- ----------------------------------------------------------------------------
insert into usuarios (nome, cargo, iniciais, cor_avatar, email) values
  ('André Lima','Diretor','AL','#0E9E9E','andre@inovalogix.com.br'),
  ('Marina Rocha','Comercial','MR','#5B86FF','marina@inovalogix.com.br'),
  ('João Silva','Comercial','JS','#12B2B2','joao@inovalogix.com.br'),
  ('Carla Ferraz','CS','CF','#F5A623','carla@inovalogix.com.br');

update usuarios set role = 'admin' where email = 'andre@inovalogix.com.br';

insert into parceiros (nome, iniciais, tipo, origem) values
  ('Banco Crediare','BC','cliente','Outbound'),
  ('Farmácias Vida','FV','cliente','Indicação'),
  ('FinPay','FP','cliente','Site'),
  ('ModaViva','MV','cliente','Site'),
  ('TransLog','TL','cliente','Indicação'),
  ('AWS','AW','fornecedor',null),
  ('Google Workspace','GW','fornecedor',null);
