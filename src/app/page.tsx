import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatBRL, formatDateBR } from "@/lib/format";
import { KpiCard } from "@/components/kpi-card";
import { AreaChart } from "@/components/charts/area-chart";
import { DonutChart } from "@/components/charts/donut-chart";
import { PROJETO_STATUS_META, PROJETO_STATUS_ORDER, CRM_ETAPA_META, CRM_ETAPA_ORDER } from "@/lib/labels";
import type { VwKpis, VwProjetosResumo, VwCrmFunil, VwCaixa } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = await createClient();

  const hoje = new Date();
  const em15dias = new Date(hoje.getTime() + 15 * 86400000);
  const em90dias = new Date(hoje.getTime() + 90 * 86400000);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);

  const [{ data: kpis }, { data: projetosResumo }, { data: crmFunil }, { data: caixaPrevisto }, { data: pagarProx }, { data: receberProx }] =
    await Promise.all([
      supabase.from("vw_kpis").select("*").maybeSingle<VwKpis>(),
      supabase.from("vw_projetos_resumo").select("*").returns<VwProjetosResumo[]>(),
      supabase.from("vw_crm_funil").select("*").returns<VwCrmFunil[]>(),
      supabase
        .from("vw_caixa")
        .select("*")
        .eq("regime", "previsto")
        .gte("data", fmt(hoje))
        .lte("data", fmt(em90dias))
        .order("data")
        .returns<VwCaixa[]>(),
      supabase
        .from("contas_pagar")
        .select("id, descricao, valor, vencimento, status")
        .neq("status", "pago")
        .lte("vencimento", fmt(em15dias))
        .order("vencimento")
        .limit(5),
      supabase
        .from("contas_receber")
        .select("id, descricao, valor, vencimento, status")
        .neq("status", "recebido")
        .lte("vencimento", fmt(em15dias))
        .order("vencimento")
        .limit(5),
    ]);

  const totalAReceber = kpis?.total_a_receber ?? 0;
  const totalAPagar = kpis?.total_a_pagar ?? 0;
  const saldoPrevisto = kpis?.saldo_previsto ?? 0;
  const faturamentoMes = kpis?.faturamento_mes ?? 0;

  let acumulado = 0;
  const serie: number[] = [];
  (caixaPrevisto ?? []).forEach((mov) => {
    acumulado += mov.tipo === "entrada" ? Number(mov.valor) : -Number(mov.valor);
    serie.push(acumulado);
  });
  const flowSeries = serie.length > 1 ? serie : [0, saldoPrevisto];

  const vencimentos = [
    ...(pagarProx ?? []).map((c) => ({ ...c, sign: "−" as const, tipo: "saida" as const })),
    ...(receberProx ?? []).map((c) => ({ ...c, sign: "+" as const, tipo: "entrada" as const })),
  ]
    .sort((a, b) => a.vencimento.localeCompare(b.vencimento))
    .slice(0, 5);

  const projetosMap = new Map((projetosResumo ?? []).map((p) => [p.status, p]));
  const crmMap = new Map((crmFunil ?? []).map((f) => [f.etapa, f]));
  const maxCrmValor = Math.max(1, ...CRM_ETAPA_ORDER.map((k) => Number(crmMap.get(k)?.valor_total ?? 0)));

  return (
    <div className="animate-iv-fade px-7 pb-12 pt-7">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-[26px] font-bold tracking-tight">
            Bem-vindo de volta 👋
          </h1>
          <p className="mt-1 text-sm text-muted-2">Visão geral</p>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Total a Receber" value={formatBRL(totalAReceber)} accent="#12B2B2" iconBg="#E8F7F7" sub="em aberto" />
        <KpiCard label="Total a Pagar" value={formatBRL(totalAPagar)} accent="#E5484D" iconBg="#FCEBEB" sub="a vencer" />
        <KpiCard label="Saldo Previsto" value={formatBRL(saldoPrevisto)} accent="#16A36A" iconBg="#E4F6EE" sub="entradas − saídas" />
        <KpiCard label="Faturamento do Mês" value={formatBRL(faturamentoMes)} accent="#5B86FF" iconBg="#EAF0FF" sub="recebido este mês" />
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-[1.7fr_1fr]">
        <div className="rounded-[20px] border border-border bg-white p-6 shadow-[0_2px_8px_rgba(16,40,44,.05)]">
          <div className="mb-1 flex items-start justify-between gap-3">
            <div>
              <div className="text-[15px] font-bold">Fluxo de caixa · próximos 90 dias</div>
              <div className="mt-0.5 text-[12.5px] text-muted">Saldo previsto acumulado</div>
            </div>
            <div className="text-right">
              <div className="font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight">
                {formatBRL(saldoPrevisto)}
              </div>
            </div>
          </div>
          <AreaChart values={flowSeries} />
        </div>

        <div className="rounded-[20px] border border-border bg-white p-6 shadow-[0_2px_8px_rgba(16,40,44,.05)]">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-[15px] font-bold">Próximos vencimentos</div>
            <Link href="/financeiro" className="text-[12.5px] font-bold text-primary">
              Ver tudo
            </Link>
          </div>
          <div className="flex flex-col">
            {vencimentos.length === 0 && <p className="py-4 text-sm text-muted">Nada nos próximos 15 dias.</p>}
            {vencimentos.map((v) => (
              <div key={v.id} className="flex items-center gap-3 border-b border-[#EEF2F3] py-2.5 last:border-0">
                <div
                  className="grid h-9 w-9 flex-none place-items-center rounded-[11px]"
                  style={{ background: v.tipo === "entrada" ? "#E8F7F7" : "#FCEBEB", color: v.tipo === "entrada" ? "#0E9E9E" : "#E5484D" }}
                >
                  <span className="font-[family-name:var(--font-display)] text-[15px] font-bold">{v.sign}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13.5px] font-semibold">{v.descricao}</div>
                  <div className="text-[11.5px] text-muted">{formatDateBR(v.vencimento)}</div>
                </div>
                <div className="text-right">
                  <div
                    className="font-[family-name:var(--font-display)] text-[13.5px] font-bold tabular-nums"
                    style={{ color: v.tipo === "entrada" ? "#16A36A" : "#0E1B22" }}
                  >
                    {formatBRL(Number(v.valor))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-[20px] border border-border bg-white p-6 shadow-[0_2px_8px_rgba(16,40,44,.05)]">
          <div className="mb-3.5 flex items-center justify-between">
            <div className="text-[15px] font-bold">Resumo de projetos</div>
            <Link href="/projetos" className="text-[12.5px] font-bold text-primary">
              Abrir quadro
            </Link>
          </div>
          <div className="flex items-center gap-6">
            <DonutChart
              centerLabel="projetos"
              segments={PROJETO_STATUS_ORDER.map((k) => ({ color: PROJETO_STATUS_META[k].color, count: Number(projetosMap.get(k)?.qtd ?? 0) }))}
            />
            <div className="flex flex-1 flex-col gap-2.5">
              {PROJETO_STATUS_ORDER.map((k) => (
                <div key={k} className="flex items-center gap-2.5">
                  <span className="h-2.5 w-2.5 flex-none rounded-[3px]" style={{ background: PROJETO_STATUS_META[k].color }} />
                  <span className="flex-1 text-[13px] text-muted-2">{PROJETO_STATUS_META[k].label}</span>
                  <span className="font-[family-name:var(--font-display)] text-sm font-bold">{projetosMap.get(k)?.qtd ?? 0}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-[20px] border border-border bg-white p-6 shadow-[0_2px_8px_rgba(16,40,44,.05)]">
          <div className="mb-4 flex items-center justify-between">
            <div className="text-[15px] font-bold">Resumo do CRM · funil</div>
            <Link href="/crm" className="text-[12.5px] font-bold text-primary">
              Abrir funil
            </Link>
          </div>
          <div className="flex flex-col gap-2.5">
            {CRM_ETAPA_ORDER.map((k) => {
              const row = crmMap.get(k);
              const valor = Number(row?.valor_total ?? 0);
              const pct = Math.max(6, (valor / maxCrmValor) * 100);
              return (
                <div key={k}>
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-[12.5px] font-semibold text-[#2B3B41]">{CRM_ETAPA_META[k].label}</span>
                    <span className="text-xs text-muted">
                      <strong className="font-[family-name:var(--font-display)] text-[#0E1B22]">{row?.qtd ?? 0}</strong> ·{" "}
                      {formatBRL(valor)}
                      {k === "recorrente" ? "/mês" : ""}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[#EEF2F3]">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: CRM_ETAPA_META[k].color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
