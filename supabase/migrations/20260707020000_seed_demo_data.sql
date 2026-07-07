-- Dados de demonstração para as telas (Kanban de projetos, funil de CRM,
-- contas a pagar/receber), espelhando o conteúdo do protótipo de design.

with p as (select id, nome from parceiros),
     u as (select id, nome from usuarios)
insert into projetos (nome, cliente_id, status, valor, progresso, prazo, responsavel_id)
select v.nome, p.id, v.status::projeto_status, v.valor, v.progresso, v.prazo::date, u.id
from (values
  ('Integração ERP/Fiscal', null, 'nao_iniciado', 56000, 0, '2026-08-30', 'André Lima'),
  ('Chatbot IA de Atendimento', null, 'nao_iniciado', 28000, 0, '2026-09-12', 'Marina Rocha'),
  ('Portal do Cliente v2', 'Banco Crediare', 'em_andamento', 84000, 62, '2026-07-22', 'André Lima'),
  ('App Logística Mobile', 'TransLog', 'em_andamento', 88000, 40, '2026-08-15', 'João Silva'),
  ('E-commerce Headless', 'ModaViva', 'em_andamento', 65000, 78, '2026-08-05', 'Carla Ferraz'),
  ('Dashboard de BI', null, 'pausado', 39000, 30, '2026-07-18', 'Marina Rocha'),
  ('Migração Cloud AWS', 'Farmácias Vida', 'concluido', 62000, 100, '2026-07-03', 'João Silva'),
  ('API de Pagamentos PIX', 'FinPay', 'concluido', 48000, 100, '2026-06-28', 'André Lima'),
  ('Refatoração de Legado', null, 'cancelado', 90000, 0, null, 'Carla Ferraz')
) as v(nome, cliente_nome, status, valor, progresso, prazo, responsavel_nome)
left join p on p.nome = v.cliente_nome
left join u on u.nome = v.responsavel_nome;

with u as (select id, nome from usuarios),
     pa as (select id, nome from parceiros)
insert into crm_leads (empresa, parceiro_id, etapa, valor_estimado, recorrente, origem, nota, responsavel_id)
select v.empresa, pa.id, v.etapa::crm_etapa, v.valor, v.recorrente, v.origem, v.nota, u.id
from (values
  ('Startup Nuvem', null, 'conversando', 45000, false, 'Site', 'Origem: Site · SaaS B2B', 'Marina Rocha'),
  ('Óticas Clara', null, 'conversando', 22000, false, 'Indicação', 'Indicação · E-commerce', 'João Silva'),
  ('Rede FarmaBem', null, 'agendado', 120000, false, 'Outbound', 'Reunião 09/07 · 14h', 'André Lima'),
  ('AgroTech Sul', null, 'agendado', 68000, false, 'Site', 'Demo 11/07 · online', 'Marina Rocha'),
  ('Banco Crediare', 'Banco Crediare', 'proposta_andamento', 210000, false, 'Outbound', 'Escopo em revisão', 'André Lima'),
  ('Loja MegaTech', null, 'proposta_andamento', 54000, false, 'Site', 'Ajuste de valores', 'Carla Ferraz'),
  ('TransLog', 'TransLog', 'proposta_enviada', 88000, false, 'Indicação', 'Enviada 02/07', 'João Silva'),
  ('Grupo Netos', null, 'proposta_enviada', 150000, false, 'Indicação', 'Enviada 04/07', 'André Lima'),
  ('FinPay', 'FinPay', 'finalizado', 96000, false, 'Site', 'Contrato assinado', 'Marina Rocha'),
  ('ModaViva', 'ModaViva', 'finalizado', 130000, false, 'Site', 'Ganho · onboarding', 'Carla Ferraz'),
  ('Farmácias Vida', 'Farmácias Vida', 'recorrente', 12000, true, null, 'Sustentação mensal', 'João Silva'),
  ('EducaMais', null, 'recorrente', 8000, true, null, 'Licença + suporte', 'André Lima'),
  ('Construtora Alpha', null, 'follow_up', 40000, false, null, 'Retomar em 15/07', 'Marina Rocha'),
  ('Clínica Sorriso', null, 'follow_up', 18000, false, null, 'Aguardando budget', 'Carla Ferraz')
) as v(empresa, parceiro_nome, etapa, valor, recorrente, origem, nota, responsavel_nome)
left join pa on pa.nome = v.parceiro_nome
left join u on u.nome = v.responsavel_nome;

with f as (select id, nome from parceiros where tipo = 'fornecedor')
insert into contas_pagar (fornecedor_id, descricao, categoria, valor, vencimento, status, data_pagamento)
select f.id, v.descricao, v.categoria, v.valor, v.vencimento::date, v.status::pagar_status, v.data_pagamento::date
from (values
  ('AWS', 'AWS Cloud Services', 'Infraestrutura', 12480, '2026-07-10', 'pago', '2026-07-10'),
  (null, 'Salários da Equipe', 'Folha de pagamento', 98500, '2026-07-05', 'pago', '2026-07-05'),
  (null, 'Aluguel do Escritório', 'Ocupação', 14900, '2026-07-12', 'pendente', null),
  (null, 'Contador Terceirizado', 'Serviços', 5600, '2026-07-08', 'vencido', null),
  ('Google Workspace', 'Google Workspace', 'SaaS', 3240, '2026-07-15', 'pendente', null),
  (null, 'Licenças JetBrains', 'Software', 2180, '2026-07-20', 'pendente', null),
  (null, 'Marketing / Ads', 'Marketing', 8700, '2026-07-22', 'pendente', null)
) as v(fornecedor_nome, descricao, categoria, valor, vencimento, status, data_pagamento)
left join f on f.nome = v.fornecedor_nome;

with c as (select id, nome from parceiros where tipo = 'cliente'),
     pr as (select id, nome from projetos)
insert into contas_receber (cliente_id, projeto_id, descricao, valor, vencimento, status, data_recebimento)
select c.id, pr.id, v.descricao, v.valor, v.vencimento::date, v.status::receber_status, v.data_recebimento::date
from (values
  ('Banco Crediare', 'Portal do Cliente v2', 'Portal do Cliente v2', 84000, '2026-07-15', 'aguardando', null),
  ('Farmácias Vida', 'Migração Cloud AWS', 'Migração Cloud AWS', 62000, '2026-07-03', 'recebido', '2026-07-03'),
  ('FinPay', 'API de Pagamentos PIX', 'API de Pagamentos PIX', 48000, '2026-06-28', 'atrasado', null),
  ('ModaViva', 'E-commerce Headless', 'E-commerce Headless', 65000, '2026-07-20', 'aguardando', null),
  ('TransLog', 'App Logística Mobile', 'App Mobile · entrada', 44000, '2026-07-30', 'aguardando', null)
) as v(cliente_nome, projeto_nome, descricao, valor, vencimento, status, data_recebimento)
left join c on c.nome = v.cliente_nome
left join pr on pr.nome = v.projeto_nome;
