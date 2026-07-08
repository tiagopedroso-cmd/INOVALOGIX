"use client";

import { inputClass, labelClass } from "@/components/modal";
import type { PeriodoRecorrencia, RecorrenciaState } from "@/lib/recurrence";

const PERIODO_LABEL: Record<PeriodoRecorrencia, string> = {
  mensal: "todo mês",
  quinzenal: "a cada 15 dias",
  semanal: "toda semana",
  personalizado: "no intervalo escolhido",
};

export function RecorrenciaFields({
  value,
  onChange,
}: {
  value: RecorrenciaState;
  onChange: (v: RecorrenciaState) => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border-strong bg-[#F8FAFA] p-3.5">
      <label className="flex items-center gap-2 text-[13px] font-semibold text-[#2B3B41]">
        <input
          type="checkbox"
          checked={value.modo === "fixa"}
          onChange={(e) => onChange({ ...value, modo: e.target.checked ? "fixa" : "none" })}
          className="h-4 w-4 rounded border-border-strong"
        />
        Conta fixa (repete todo mês, no mesmo dia, por 24 meses)
      </label>

      <label className="flex items-center gap-2 text-[13px] font-semibold text-[#2B3B41]">
        <input
          type="checkbox"
          checked={value.modo === "recorrente"}
          onChange={(e) => onChange({ ...value, modo: e.target.checked ? "recorrente" : "none" })}
          className="h-4 w-4 rounded border-border-strong"
        />
        Conta que se repete
      </label>

      {value.modo === "recorrente" && (
        <div className="grid grid-cols-2 gap-3 border-t border-[#E2E9EA] pt-3">
          <div>
            <label className={labelClass}>Quantas vezes se repete</label>
            <input
              type="number"
              min="2"
              max="120"
              value={value.vezes}
              onChange={(e) => onChange({ ...value, vezes: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Período</label>
            <select
              value={value.periodo}
              onChange={(e) => onChange({ ...value, periodo: e.target.value as PeriodoRecorrencia })}
              className={inputClass}
            >
              <option value="mensal">Mensal</option>
              <option value="quinzenal">Quinzenal</option>
              <option value="semanal">Semanal</option>
              <option value="personalizado">Personalizado</option>
            </select>
          </div>
          {value.periodo === "personalizado" && (
            <div className="col-span-2">
              <label className={labelClass}>A cada quantos dias</label>
              <input
                type="number"
                min="1"
                value={value.diasPersonalizado}
                onChange={(e) => onChange({ ...value, diasPersonalizado: e.target.value })}
                className={inputClass}
              />
            </div>
          )}
        </div>
      )}

      {value.modo === "fixa" && (
        <p className="text-[12px] text-muted-2">Serão criados 24 lançamentos, um por mês, a partir da data de vencimento informada.</p>
      )}
      {value.modo === "recorrente" && (
        <p className="text-[12px] text-muted-2">
          Serão criados {Math.max(1, Number(value.vezes) || 1)} lançamentos, {PERIODO_LABEL[value.periodo]}, a partir da data de vencimento informada.
        </p>
      )}
    </div>
  );
}
