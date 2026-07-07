export type ParceiroTipo = "cliente" | "fornecedor" | "ambos";
export type ProjetoStatus = "nao_iniciado" | "em_andamento" | "pausado" | "concluido" | "cancelado";
export type CrmEtapa =
  | "conversando"
  | "agendado"
  | "proposta_andamento"
  | "proposta_enviada"
  | "finalizado"
  | "recorrente"
  | "follow_up";
export type PagarStatus = "pago" | "pendente" | "vencido";
export type ReceberStatus = "recebido" | "aguardando" | "atrasado";
export type CaixaTipo = "entrada" | "saida";
export type CaixaRegime = "realizado" | "previsto";

export interface Usuario {
  id: string;
  auth_user_id: string | null;
  nome: string;
  cargo: string | null;
  iniciais: string;
  cor_avatar: string | null;
  email: string | null;
  role: "admin" | "financeiro" | "vendas" | "membro";
  ativo: boolean;
  criado_em: string;
}

export interface Parceiro {
  id: string;
  nome: string;
  iniciais: string | null;
  tipo: ParceiroTipo;
  origem: string | null;
  contato: string | null;
  email: string | null;
  telefone: string | null;
  criado_em: string;
}

export interface Projeto {
  id: string;
  nome: string;
  cliente_id: string | null;
  status: ProjetoStatus;
  valor: number;
  progresso: number;
  prazo: string | null;
  responsavel_id: string | null;
  criado_em: string;
  atualizado_em: string;
  cliente?: Pick<Parceiro, "id" | "nome" | "iniciais"> | null;
  responsavel?: Pick<Usuario, "id" | "nome" | "iniciais" | "cor_avatar"> | null;
}

export interface CrmLead {
  id: string;
  empresa: string;
  parceiro_id: string | null;
  contato: string | null;
  etapa: CrmEtapa;
  valor_estimado: number;
  recorrente: boolean;
  origem: string | null;
  nota: string | null;
  data_agendamento: string | null;
  responsavel_id: string | null;
  criado_em: string;
  atualizado_em: string;
  responsavel?: Pick<Usuario, "id" | "nome" | "iniciais" | "cor_avatar"> | null;
}

export interface ContaPagar {
  id: string;
  fornecedor_id: string | null;
  descricao: string;
  categoria: string | null;
  valor: number;
  vencimento: string;
  status: PagarStatus;
  data_pagamento: string | null;
  criado_em: string;
  fornecedor?: Pick<Parceiro, "id" | "nome" | "iniciais"> | null;
}

export interface ContaReceber {
  id: string;
  cliente_id: string | null;
  projeto_id: string | null;
  descricao: string;
  valor: number;
  vencimento: string;
  status: ReceberStatus;
  data_recebimento: string | null;
  criado_em: string;
  cliente?: Pick<Parceiro, "id" | "nome" | "iniciais"> | null;
  projeto?: Pick<Projeto, "id" | "nome"> | null;
}

export interface VwKpis {
  total_a_receber: number;
  total_a_pagar: number;
  saldo_previsto: number;
  faturamento_mes: number;
}

export interface VwFluxoPrevisto90d {
  saldo_previsto_90d: number;
}

export interface VwProjetosResumo {
  status: ProjetoStatus;
  qtd: number;
  valor_total: number;
}

export interface VwCrmFunil {
  etapa: CrmEtapa;
  qtd: number;
  valor_total: number;
}

export interface VwPagarResumo {
  status: PagarStatus;
  qtd: number;
  total: number;
}

export interface VwReceberResumo {
  status: ReceberStatus;
  qtd: number;
  total: number;
}

export interface VwCaixa {
  origem_id: string;
  origem: "contas_receber" | "contas_pagar";
  tipo: CaixaTipo;
  valor: number;
  data: string;
  regime: CaixaRegime;
  descricao: string;
}

export interface VwFluxoMensal {
  mes: string;
  regime: CaixaRegime;
  entradas: number;
  saidas: number;
  saldo: number;
}
