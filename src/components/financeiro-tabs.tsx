"use client";

import { useState } from "react";
import { formatBRL, formatDateBR } from "@/lib/format";
import { PAGAR_STATUS_META, RECEBER_STATUS_META } from "@/lib/labels";
import { BarsChart } from "@/components/charts/bars-chart";
import { NovaContaPagarButton } from "@/components/forms/nova-conta-pagar-button";
import { NovaContaReceberButton } from "@/components/forms/nova-conta-receber-button";
import { EditarContaPagarButton } from "@/components/forms/editar-conta-pagar-button";
import { EditarContaReceberButton } from "@/components/forms/editar-conta-receber-button";
import { DeleteButton } from "@/components/delete-button";
import type { ContaPagar, ContaReceber, VwPagarResumo, VwReceberResumo, VwFluxoMensal } from "@/types/database";

type Tab = "pagar" | "receber" | "fluxo";

const AVATAR_PALETTE = [
  { bg: "#EAF0FF", fg: "#5B86FF" },
  { bg: "#E8F7F7", fg: "#0E9E9E" },
  { bg: "#FDF1DD", fg: "#B5740A" },
  { bg: "#F3ECFF", fg: "#7C5CFC" },
];

function initialsOf(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

const MES_LABEL = new Intl.DateTimeFormat("pt-BR", { month: "short" });

export function FinanceiroTabs({
  pagar,
  receber,
  pagarResumo,
  receberResumo,
  fluxoMensal,
}: {
  pagar: ContaPagar[];
  receber: ContaReceber[];
  pagarResumo: VwPagarResumo[];
  receberResumo: VwReceberResumo[];
  fluxoMensal: VwFluxoMensal[];
}) {
  const [tab, setTab] = useState<Tab>("pagar");

  const pagarMap = new Map(pagarResumo.map((r) => [r.status, r]));
  const receberMap = new Map(receberResumo.map((r) => [r.status, r]));
  const entradas6m = fluxoMensal.reduce((a, m) => a + Number(m.entradas ?? 0), 0);
  const saidas6m = fluxoMensal.reduce((a, m) => a + Number(m.saidas ?? 0), 0);
  const margem = entradas6m > 0 ? ((entradas6m - saidas6m) / entradas6m) * 100 : 0;

  const summary =
    tab === "pagar"
      ? [
          {
            label: "Total a pagar",
            value: formatBRL((Number(pagarMap.get("pendente")?.total ?? 0) + Number(pagarMap.get("vencido")?.total ?? 0))),
            sub: `${(pagarMap.get("pendente")?.qtd ?? 0) + (pagarMap.get("vencido")?.qtd ?? 0)} contas`,
            color: "#0E1B22",
          },
          { label: "Pago", value: formatBRL(Number(pagarMap.get("pago")?.total ?? 0)), sub: `${pagarMap.get("pago")?.qtd ?? 0} contas`, color: "#16A36A" },
          { label: "Pendente", value: formatBRL(Number(pagarMap.get("pendente")?.total ?? 0)), sub: `${pagarMap.get("pendente")?.qtd ?? 0} a vencer`, color: "#B5740A" },
          { label: "Vencido", value: formatBRL(Number(pagarMap.get("vencido")?.total ?? 0)), sub: `${pagarMap.get("vencido")?.qtd ?? 0} contas`, color: "#E5484D" },
        ]
      : tab === "receber"
        ? [
            {
              label: "Total a receber",
              value: formatBRL(Number(receberMap.get("aguardando")?.total ?? 0) + Number(receberMap.get("atrasado")?.total ?? 0)),
              sub: `${(receberMap.get("aguardando")?.qtd ?? 0) + (receberMap.get("atrasado")?.qtd ?? 0)} faturas`,
              color: "#0E1B22",
            },
            { label: "Recebido", value: formatBRL(Number(receberMap.get("recebido")?.total ?? 0)), sub: `${receberMap.get("recebido")?.qtd ?? 0} faturas`, color: "#16A36A" },
            { label: "Aguardando", value: formatBRL(Number(receberMap.get("aguardando")?.total ?? 0)), sub: `${receberMap.get("aguardando")?.qtd ?? 0} faturas`, color: "#0E9E9E" },
            { label: "Atrasado", value: formatBRL(Number(receberMap.get("atrasado")?.total ?? 0)), sub: `${receberMap.get("atrasado")?.qtd ?? 0} fatura(s)`, color: "#E5484D" },
          ]
        : [
            { label: "Entradas (6m)", value: formatBRL(entradas6m), sub: `média ${formatBRL(entradas6m / 6)}/mês`, color: "#0E9E9E" },
            { label: "Saídas (6m)", value: formatBRL(saidas6m), sub: `média ${formatBRL(saidas6m / 6)}/mês`, color: "#E5484D" },
            { label: "Saldo do período", value: formatBRL(entradas6m - saidas6m), sub: "resultado líquido", color: "#16A36A" },
            { label: "Margem líquida", value: `${margem.toFixed(1)}%`, sub: "entradas − saídas", color: "#0E1B22" },
          ];

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex max-w-full gap-1 overflow-x-auto rounded-full border border-border bg-white p-1">
          {(
            [
              ["pagar", "Contas a Pagar"],
              ["receber", "Contas a Receber"],
              ["fluxo", "Fluxo de Caixa"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex-none whitespace-nowrap rounded-full px-4.5 py-2 text-[13px] font-semibold transition-colors ${
                tab === key ? "bg-primary text-white shadow-[0_4px_12px_rgba(18,178,178,.28)]" : "text-muted-2"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        {tab === "pagar" && <NovaContaPagarButton />}
        {tab === "receber" && <NovaContaReceberButton />}
      </div>

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summary.map((s) => (
          <div key={s.label} className="rounded-[18px] border border-border bg-white p-4.5 shadow-[0_2px_8px_rgba(16,40,44,.05)]">
            <div className="text-[11px] font-bold uppercase tracking-wider text-muted">{s.label}</div>
            <div className="mt-2 font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight" style={{ color: s.color }}>
              {s.value}
            </div>
            <div className="mt-1 text-xs text-muted">{s.sub}</div>
          </div>
        ))}
      </div>

      {tab !== "fluxo" ? (
        <div className="overflow-x-auto rounded-[20px] border border-border bg-white px-6 py-2 shadow-[0_2px_8px_rgba(16,40,44,.05)]">
          <table className="w-full min-w-[640px] border-collapse">
            <thead>
              <tr>
                <th className="border-b border-[#EEF2F3] px-2.5 py-4 text-left text-[11px] font-bold uppercase tracking-wide text-muted">
                  {tab === "pagar" ? "Fornecedor" : "Cliente"}
                </th>
                <th className="border-b border-[#EEF2F3] px-2.5 py-4 text-left text-[11px] font-bold uppercase tracking-wide text-muted">
                  {tab === "pagar" ? "Categoria" : "Projeto"}
                </th>
                <th className="border-b border-[#EEF2F3] px-2.5 py-4 text-left text-[11px] font-bold uppercase tracking-wide text-muted">Vencimento</th>
                <th className="border-b border-[#EEF2F3] px-2.5 py-4 text-right text-[11px] font-bold uppercase tracking-wide text-muted">Valor</th>
                <th className="border-b border-[#EEF2F3] px-2.5 py-4 text-right text-[11px] font-bold uppercase tracking-wide text-muted">Status</th>
                <th className="border-b border-[#EEF2F3] px-2.5 py-4 text-right text-[11px] font-bold uppercase tracking-wide text-muted">Ações</th>
              </tr>
            </thead>
            <tbody>
              {tab === "pagar"
                ? pagar.map((r, i) => {
                    const nome = r.fornecedor?.nome ?? r.descricao;
                    const pal = AVATAR_PALETTE[i % AVATAR_PALETTE.length];
                    const meta = PAGAR_STATUS_META[r.status];
                    return (
                      <tr key={r.id}>
                        <td className="border-b border-[#F2F5F6] px-2.5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <span
                              className="grid h-[34px] w-[34px] flex-none place-items-center rounded-[10px] font-[family-name:var(--font-display)] text-[13px] font-bold"
                              style={{ background: pal.bg, color: pal.fg }}
                            >
                              {r.fornecedor?.iniciais ?? initialsOf(nome)}
                            </span>
                            <span className="text-[13.5px] font-semibold">{nome}</span>
                          </div>
                        </td>
                        <td className="border-b border-[#F2F5F6] px-2.5 py-3.5 text-[13px] text-muted-2">{r.categoria ?? "—"}</td>
                        <td className="border-b border-[#F2F5F6] px-2.5 py-3.5 text-[13px] text-muted-2">{formatDateBR(r.vencimento)}</td>
                        <td className="border-b border-[#F2F5F6] px-2.5 py-3.5 text-right font-[family-name:var(--font-display)] text-sm font-bold tabular-nums">
                          {formatBRL(Number(r.valor))}
                        </td>
                        <td className="border-b border-[#F2F5F6] px-2.5 py-3.5 text-right">
                          <span className="rounded-full px-2.5 py-1 text-[11.5px] font-bold" style={{ color: meta.fg, background: meta.bg }}>
                            {meta.label}
                          </span>
                        </td>
                        <td className="border-b border-[#F2F5F6] px-2.5 py-3.5">
                          <div className="flex items-center justify-end gap-1">
                            <EditarContaPagarButton conta={r} />
                            <DeleteButton table="contas_pagar" id={r.id} label={r.descricao} />
                          </div>
                        </td>
                      </tr>
                    );
                  })
                : receber.map((r, i) => {
                    const nome = r.cliente?.nome ?? r.descricao;
                    const pal = AVATAR_PALETTE[i % AVATAR_PALETTE.length];
                    const meta = RECEBER_STATUS_META[r.status];
                    return (
                      <tr key={r.id}>
                        <td className="border-b border-[#F2F5F6] px-2.5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <span
                              className="grid h-[34px] w-[34px] flex-none place-items-center rounded-[10px] font-[family-name:var(--font-display)] text-[13px] font-bold"
                              style={{ background: pal.bg, color: pal.fg }}
                            >
                              {r.cliente?.iniciais ?? initialsOf(nome)}
                            </span>
                            <span className="text-[13.5px] font-semibold">{nome}</span>
                          </div>
                        </td>
                        <td className="border-b border-[#F2F5F6] px-2.5 py-3.5 text-[13px] text-muted-2">{r.projeto?.nome ?? "—"}</td>
                        <td className="border-b border-[#F2F5F6] px-2.5 py-3.5 text-[13px] text-muted-2">{formatDateBR(r.vencimento)}</td>
                        <td className="border-b border-[#F2F5F6] px-2.5 py-3.5 text-right font-[family-name:var(--font-display)] text-sm font-bold tabular-nums text-[#16A36A]">
                          {formatBRL(Number(r.valor))}
                        </td>
                        <td className="border-b border-[#F2F5F6] px-2.5 py-3.5 text-right">
                          <span className="rounded-full px-2.5 py-1 text-[11.5px] font-bold" style={{ color: meta.fg, background: meta.bg }}>
                            {meta.label}
                          </span>
                        </td>
                        <td className="border-b border-[#F2F5F6] px-2.5 py-3.5">
                          <div className="flex items-center justify-end gap-1">
                            <EditarContaReceberButton conta={r} />
                            <DeleteButton table="contas_receber" id={r.id} label={r.descricao} />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-[20px] border border-border bg-white p-6 shadow-[0_2px_8px_rgba(16,40,44,.05)]">
          <div className="mb-1.5 flex flex-wrap items-center justify-between gap-3">
            <div className="text-base font-bold">Entradas vs. Saídas · últimos 6 meses</div>
            <div className="flex items-center gap-4.5">
              <span className="flex items-center gap-1.5 text-[12.5px] text-muted-2">
                <span className="h-2.5 w-2.5 rounded-[3px] bg-primary" />
                Entradas
              </span>
              <span className="flex items-center gap-1.5 text-[12.5px] text-muted-2">
                <span className="h-2.5 w-2.5 rounded-[3px] bg-[#CBD6D9]" />
                Saídas
              </span>
            </div>
          </div>
          <BarsChart
            data={fluxoMensal.map((m) => ({
              label: MES_LABEL.format(new Date(`${m.mes}T00:00:00`)),
              entradas: Number(m.entradas ?? 0),
              saidas: Number(m.saidas ?? 0),
            }))}
          />
        </div>
      )}
    </div>
  );
}
