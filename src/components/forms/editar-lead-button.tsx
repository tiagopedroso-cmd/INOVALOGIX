"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Modal, inputClass, labelClass } from "@/components/modal";
import { ParceiroSelect } from "@/components/forms/parceiro-select";
import { UsuarioSelect } from "@/components/forms/usuario-select";
import { DeleteButton } from "@/components/delete-button";
import { CRM_ETAPA_META, CRM_ETAPA_ORDER } from "@/lib/labels";
import type { CrmLead, CrmEtapa } from "@/types/database";

export function EditarLeadButton({ lead }: { lead: CrmLead }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    empresa: lead.empresa,
    parceiro_id: lead.parceiro_id ?? "",
    etapa: lead.etapa,
    valor_estimado: String(lead.valor_estimado),
    recorrente: lead.recorrente,
    origem: lead.origem ?? "",
    nota: lead.nota ?? "",
    responsavel_id: lead.responsavel_id ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function close() {
    setOpen(false);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase
      .from("crm_leads")
      .update({
        empresa: form.empresa,
        parceiro_id: form.parceiro_id || null,
        etapa: form.etapa,
        valor_estimado: Number(form.valor_estimado) || 0,
        recorrente: form.recorrente,
        origem: form.origem || null,
        nota: form.nota || null,
        responsavel_id: form.responsavel_id || null,
      })
      .eq("id", lead.id);
    setSaving(false);
    if (error) {
      setError("Não foi possível salvar. Tente novamente.");
      return;
    }
    close();
    router.refresh();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        onMouseDown={(e) => e.stopPropagation()}
        title="Editar"
        className="grid h-6 w-6 flex-none place-items-center rounded-md text-muted hover:bg-teal-light hover:text-primary-dark"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
        </svg>
      </button>

      <Modal open={open} onClose={close} title="Editar lead">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <div>
            <label className={labelClass}>Empresa</label>
            <input required value={form.empresa} onChange={(e) => setForm({ ...form, empresa: e.target.value })} className={inputClass} />
          </div>

          <ParceiroSelect tipo="qualquer" label="Vincular a parceiro (opcional)" value={form.parceiro_id} onChange={(id) => setForm({ ...form, parceiro_id: id })} />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Etapa</label>
              <select value={form.etapa} onChange={(e) => setForm({ ...form, etapa: e.target.value as CrmEtapa })} className={inputClass}>
                {CRM_ETAPA_ORDER.map((k) => (
                  <option key={k} value={k}>
                    {CRM_ETAPA_META[k].label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Valor estimado (R$)</label>
              <input type="number" min="0" step="0.01" value={form.valor_estimado} onChange={(e) => setForm({ ...form, valor_estimado: e.target.value })} className={inputClass} />
            </div>
          </div>

          <label className="flex items-center gap-2 text-[13px] font-semibold text-[#2B3B41]">
            <input type="checkbox" checked={form.recorrente} onChange={(e) => setForm({ ...form, recorrente: e.target.checked })} className="h-4 w-4 rounded border-border-strong" />
            Receita recorrente (mensal)
          </label>

          <div>
            <label className={labelClass}>Origem</label>
            <input value={form.origem} onChange={(e) => setForm({ ...form, origem: e.target.value })} className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Nota</label>
            <input value={form.nota} onChange={(e) => setForm({ ...form, nota: e.target.value })} className={inputClass} />
          </div>

          <UsuarioSelect label="Responsável" value={form.responsavel_id} onChange={(id) => setForm({ ...form, responsavel_id: id })} />

          {error && <p className="text-sm font-semibold text-red">{error}</p>}

          <div className="mt-1 flex items-center gap-3">
            <button type="submit" disabled={saving} className="flex-1 rounded-full bg-primary py-2.5 text-sm font-bold text-white disabled:opacity-60">
              {saving ? "Salvando…" : "Salvar alterações"}
            </button>
            <DeleteButton
              table="crm_leads"
              id={lead.id}
              label={lead.empresa}
              className="grid h-11 w-11 flex-none place-items-center rounded-full border border-border-strong text-red hover:bg-red-light"
              onDeleted={() => {
                close();
                router.refresh();
              }}
            />
          </div>
        </form>
      </Modal>
    </>
  );
}
