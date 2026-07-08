"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Modal, inputClass, labelClass } from "@/components/modal";
import { ParceiroSelect } from "@/components/forms/parceiro-select";
import { UsuarioSelect } from "@/components/forms/usuario-select";
import { CRM_ETAPA_META, CRM_ETAPA_ORDER } from "@/lib/labels";
import type { CrmEtapa } from "@/types/database";

const initialState = {
  empresa: "",
  parceiro_id: "",
  etapa: "conversando" as CrmEtapa,
  valor_estimado: "",
  recorrente: false,
  origem: "",
  nota: "",
  responsavel_id: "",
};

export function NovoLeadButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(initialState);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function close() {
    setOpen(false);
    setForm(initialState);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.from("crm_leads").insert({
      empresa: form.empresa,
      parceiro_id: form.parceiro_id || null,
      etapa: form.etapa,
      valor_estimado: Number(form.valor_estimado) || 0,
      recorrente: form.recorrente,
      origem: form.origem || null,
      nota: form.nota || null,
      responsavel_id: form.responsavel_id || null,
    });
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
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-[0_10px_24px_rgba(18,178,178,.32)]"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
          <path d="M5 12h14M12 5v14" />
        </svg>
        Novo lead
      </button>

      <Modal open={open} onClose={close} title="Novo lead">
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
            <input value={form.origem} onChange={(e) => setForm({ ...form, origem: e.target.value })} placeholder="Site, Indicação, Outbound…" className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Nota</label>
            <input value={form.nota} onChange={(e) => setForm({ ...form, nota: e.target.value })} className={inputClass} />
          </div>

          <UsuarioSelect label="Responsável" value={form.responsavel_id} onChange={(id) => setForm({ ...form, responsavel_id: id })} />

          {error && <p className="text-sm font-semibold text-red">{error}</p>}

          <button type="submit" disabled={saving} className="mt-1 rounded-full bg-primary py-2.5 text-sm font-bold text-white disabled:opacity-60">
            {saving ? "Salvando…" : "Salvar lead"}
          </button>
        </form>
      </Modal>
    </>
  );
}
