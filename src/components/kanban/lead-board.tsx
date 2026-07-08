"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatBRL } from "@/lib/format";
import { CRM_ETAPA_META, CRM_ETAPA_ORDER } from "@/lib/labels";
import { EditarLeadButton } from "@/components/forms/editar-lead-button";
import { DeleteButton } from "@/components/delete-button";
import type { CrmLead, CrmEtapa } from "@/types/database";

export function LeadBoard({ leads: initial }: { leads: CrmLead[] }) {
  const [leads, setLeads] = useState(initial);
  const [prevInitial, setPrevInitial] = useState(initial);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  if (initial !== prevInitial) {
    setPrevInitial(initial);
    setLeads(initial);
  }

  async function moveTo(id: string, etapa: CrmEtapa) {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, etapa } : l)));
    const supabase = createClient();
    await supabase.from("crm_leads").update({ etapa }).eq("id", id);
  }

  return (
    <div className="flex items-start gap-3.5 overflow-x-auto pb-3">
      {CRM_ETAPA_ORDER.map((etapa) => {
        const meta = CRM_ETAPA_META[etapa];
        const cards = leads.filter((l) => l.etapa === etapa);
        const total = cards.reduce((a, c) => a + Number(c.valor_estimado), 0);

        return (
          <div
            key={etapa}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (draggingId) moveTo(draggingId, etapa);
              setDraggingId(null);
            }}
            className="flex min-h-[120px] w-[250px] flex-none flex-col gap-2.5 rounded-[18px] border border-border bg-[#F5F8F9] p-3.5"
          >
            <div className="flex items-center gap-2">
              <span className="h-[9px] w-[9px] rounded-[3px]" style={{ background: meta.color }} />
              <span className="flex-1 text-[12.5px] font-bold">{meta.label}</span>
              <span className="rounded-full bg-[#E6EDEE] px-2 py-0.5 text-[11px] font-bold text-muted-2">{cards.length}</span>
            </div>
            <div className="-mt-1 font-[family-name:var(--font-display)] text-[11.5px] font-bold text-muted">
              {formatBRL(total)}
              {etapa === "recorrente" ? "/mês" : ""}
            </div>

            {cards.map((c) => (
              <div
                key={c.id}
                draggable
                onDragStart={() => setDraggingId(c.id)}
                className="cursor-grab rounded-[14px] border border-border bg-white p-3.5 shadow-[0_1px_3px_rgba(16,40,44,.06)]"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[13.5px] font-bold leading-tight">{c.empresa}</span>
                  <div draggable={false} className="flex flex-none items-center gap-0.5">
                    <EditarLeadButton lead={c} />
                    <DeleteButton
                      table="crm_leads"
                      id={c.id}
                      label={c.empresa}
                      className="grid h-6 w-6 place-items-center rounded-md text-muted hover:bg-red-light hover:text-red"
                    />
                  </div>
                </div>
                <div className="my-1 truncate text-xs text-muted">{c.nota ?? c.origem ?? ""}</div>
                <div className="flex items-center justify-between">
                  <span className="font-[family-name:var(--font-display)] text-[13px] font-bold text-primary-dark">
                    {formatBRL(Number(c.valor_estimado))}
                    {c.recorrente ? "/mês" : ""}
                  </span>
                  {c.responsavel && (
                    <span
                      className="grid h-[26px] w-[26px] place-items-center rounded-full text-[10.5px] font-bold text-white"
                      style={{ background: c.responsavel.cor_avatar ?? "#0E9E9E" }}
                    >
                      {c.responsavel.iniciais}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
