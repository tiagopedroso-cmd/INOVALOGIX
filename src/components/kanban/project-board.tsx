"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatBRL, formatDateBR } from "@/lib/format";
import { PROJETO_STATUS_META, PROJETO_STATUS_ORDER } from "@/lib/labels";
import type { Projeto, ProjetoStatus } from "@/types/database";

export function ProjectBoard({ projetos: initial }: { projetos: Projeto[] }) {
  const [projetos, setProjetos] = useState(initial);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  async function moveTo(id: string, status: ProjetoStatus) {
    setProjetos((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
    const supabase = createClient();
    await supabase.from("projetos").update({ status }).eq("id", id);
  }

  return (
    <div className="flex items-start gap-4 overflow-x-auto pb-3">
      {PROJETO_STATUS_ORDER.map((status) => {
        const meta = PROJETO_STATUS_META[status];
        const cards = projetos.filter((p) => p.status === status);
        const total = cards.reduce((a, c) => a + Number(c.valor), 0);

        return (
          <div
            key={status}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (draggingId) moveTo(draggingId, status);
              setDraggingId(null);
            }}
            className="flex min-h-[120px] w-[290px] flex-none flex-col gap-3 rounded-[18px] border border-border bg-[#F5F8F9] p-3.5"
          >
            <div className="flex items-center gap-2">
              <span className="h-[9px] w-[9px] rounded-[3px]" style={{ background: meta.color }} />
              <span className="text-[13.5px] font-bold">{meta.label}</span>
              <span className="rounded-full bg-[#E6EDEE] px-2 py-0.5 text-[11px] font-bold text-muted-2">{cards.length}</span>
              <span className="ml-auto font-[family-name:var(--font-display)] text-[11.5px] font-bold text-muted">{formatBRL(total)}</span>
            </div>

            {cards.map((c) => (
              <div
                key={c.id}
                draggable
                onDragStart={() => setDraggingId(c.id)}
                className="cursor-grab rounded-[14px] border border-border bg-white p-3.5 shadow-[0_1px_3px_rgba(16,40,44,.06)]"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[13.5px] font-bold leading-tight">{c.nome}</span>
                  <span
                    className="whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-bold"
                    style={{ color: meta.color, background: meta.tint }}
                  >
                    {meta.tag}
                  </span>
                </div>
                <div className="my-1 text-xs text-muted">{c.cliente?.nome ?? "—"}</div>
                <div className="mb-1.5 h-1.5 overflow-hidden rounded-full bg-[#EEF2F3]">
                  <div className="h-full rounded-full" style={{ width: `${c.progresso}%`, background: meta.color }} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[11.5px] text-muted">
                    {c.progresso}% · {c.prazo ? formatDateBR(c.prazo) : "—"}
                  </span>
                  <span className="font-[family-name:var(--font-display)] text-[13px] font-bold">{formatBRL(Number(c.valor))}</span>
                </div>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
