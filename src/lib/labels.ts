import type { CrmEtapa, ProjetoStatus, PagarStatus, ReceberStatus } from "@/types/database";

export const PROJETO_STATUS_META: Record<ProjetoStatus, { label: string; color: string; tint: string; tag: string }> = {
  nao_iniciado: { label: "Não iniciado", color: "#94A2A8", tint: "#EEF2F3", tag: "Novo" },
  em_andamento: { label: "Em andamento", color: "#12B2B2", tint: "#E8F7F7", tag: "Ativo" },
  pausado: { label: "Pausados", color: "#F5A623", tint: "#FDF1DD", tag: "Em pausa" },
  concluido: { label: "Concluídos", color: "#16A36A", tint: "#E4F6EE", tag: "Entregue" },
  cancelado: { label: "Cancelados", color: "#E5484D", tint: "#FCEBEB", tag: "Cancelado" },
};

export const PROJETO_STATUS_ORDER: ProjetoStatus[] = [
  "nao_iniciado",
  "em_andamento",
  "pausado",
  "concluido",
  "cancelado",
];

export const CRM_ETAPA_META: Record<CrmEtapa, { label: string; color: string }> = {
  conversando: { label: "Conversando", color: "#94A2A8" },
  agendado: { label: "Agendados", color: "#5B86FF" },
  proposta_andamento: { label: "Proposta em andamento", color: "#0EA5C4" },
  proposta_enviada: { label: "Proposta enviada", color: "#12B2B2" },
  finalizado: { label: "Finalizados", color: "#16A36A" },
  recorrente: { label: "Recorrentes", color: "#7C5CFC" },
  follow_up: { label: "Follow-up", color: "#F5A623" },
};

export const CRM_ETAPA_ORDER: CrmEtapa[] = [
  "conversando",
  "agendado",
  "proposta_andamento",
  "proposta_enviada",
  "finalizado",
  "recorrente",
  "follow_up",
];

export const PAGAR_STATUS_META: Record<PagarStatus, { label: string; fg: string; bg: string }> = {
  pago: { label: "Pago", fg: "#16A36A", bg: "#E4F6EE" },
  pendente: { label: "Pendente", fg: "#B5740A", bg: "#FDF1DD" },
  vencido: { label: "Vencido", fg: "#E5484D", bg: "#FCEBEB" },
};

export const RECEBER_STATUS_META: Record<ReceberStatus, { label: string; fg: string; bg: string }> = {
  recebido: { label: "Recebido", fg: "#16A36A", bg: "#E4F6EE" },
  aguardando: { label: "Aguardando", fg: "#0E9E9E", bg: "#E8F7F7" },
  atrasado: { label: "Atrasado", fg: "#E5484D", bg: "#FCEBEB" },
};
