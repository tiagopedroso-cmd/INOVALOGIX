export type PeriodoRecorrencia = "mensal" | "quinzenal" | "semanal" | "personalizado";

function addDays(dateStr: string, days: number): string {
  const d = new Date(`${dateStr}T00:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function addMonths(dateStr: string, months: number): string {
  const d = new Date(`${dateStr}T00:00:00`);
  const day = d.getDate();
  d.setDate(1);
  d.setMonth(d.getMonth() + months);
  const lastDayOfTarget = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  d.setDate(Math.min(day, lastDayOfTarget));
  return d.toISOString().slice(0, 10);
}

/** Datas de vencimento de uma conta fixa: mesmo dia, todo mês, por 24 meses. */
export function gerarDatasFixa(dataInicial: string): string[] {
  return Array.from({ length: 24 }, (_, i) => addMonths(dataInicial, i));
}

/** Datas de vencimento de uma conta recorrente conforme período escolhido. */
export function gerarDatasRecorrente(
  dataInicial: string,
  vezes: number,
  periodo: PeriodoRecorrencia,
  diasPersonalizado: number
): string[] {
  const n = Math.max(1, vezes);
  return Array.from({ length: n }, (_, i) => {
    if (i === 0) return dataInicial;
    if (periodo === "mensal") return addMonths(dataInicial, i);
    if (periodo === "quinzenal") return addDays(dataInicial, i * 15);
    if (periodo === "semanal") return addDays(dataInicial, i * 7);
    return addDays(dataInicial, i * Math.max(1, diasPersonalizado));
  });
}

export type RepeatMode = "none" | "fixa" | "recorrente";

export type RecorrenciaState = {
  modo: RepeatMode;
  vezes: string;
  periodo: PeriodoRecorrencia;
  diasPersonalizado: string;
};

export const recorrenciaInicial: RecorrenciaState = {
  modo: "none",
  vezes: "12",
  periodo: "mensal",
  diasPersonalizado: "30",
};

/** Lista de datas de vencimento resultante do modo de recorrência escolhido. */
export function gerarDatas(dataInicial: string, rec: RecorrenciaState): string[] {
  if (!dataInicial) return [];
  if (rec.modo === "fixa") return gerarDatasFixa(dataInicial);
  if (rec.modo === "recorrente") {
    return gerarDatasRecorrente(dataInicial, Number(rec.vezes) || 1, rec.periodo, Number(rec.diasPersonalizado) || 1);
  }
  return [dataInicial];
}
