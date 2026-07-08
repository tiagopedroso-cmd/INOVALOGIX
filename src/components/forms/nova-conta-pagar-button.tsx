"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Modal, inputClass, labelClass } from "@/components/modal";
import { ParceiroSelect } from "@/components/forms/parceiro-select";
import type { PagarStatus } from "@/types/database";

const initialState = {
  descricao: "",
  categoria: "",
  valor: "",
  vencimento: "",
  status: "pendente" as PagarStatus,
  fornecedor_id: "",
  data_pagamento: "",
};

export function NovaContaPagarButton({ className }: { className?: string }) {
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
    const { error } = await supabase.from("contas_pagar").insert({
      descricao: form.descricao,
      categoria: form.categoria || null,
      valor: Number(form.valor),
      vencimento: form.vencimento,
      status: form.status,
      fornecedor_id: form.fornecedor_id || null,
      data_pagamento: form.status === "pago" ? form.data_pagamento || form.vencimento : null,
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
        className={
          className ??
          "inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-[0_10px_24px_rgba(18,178,178,.32)]"
        }
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
          <path d="M5 12h14M12 5v14" />
        </svg>
        Nova conta a pagar
      </button>

      <Modal open={open} onClose={close} title="Nova conta a pagar">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <div>
            <label className={labelClass}>Descrição</label>
            <input required value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} className={inputClass} />
          </div>

          <ParceiroSelect tipo="fornecedor" label="Fornecedor (opcional)" value={form.fornecedor_id} onChange={(id) => setForm({ ...form, fornecedor_id: id })} />

          <div>
            <label className={labelClass}>Categoria</label>
            <input value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} placeholder="Infraestrutura, Folha, SaaS…" className={inputClass} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Valor (R$)</label>
              <input required type="number" min="0" step="0.01" value={form.valor} onChange={(e) => setForm({ ...form, valor: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Vencimento</label>
              <input required type="date" value={form.vencimento} onChange={(e) => setForm({ ...form, vencimento: e.target.value })} className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as PagarStatus })} className={inputClass}>
                <option value="pendente">Pendente</option>
                <option value="pago">Pago</option>
                <option value="vencido">Vencido</option>
              </select>
            </div>
            {form.status === "pago" && (
              <div>
                <label className={labelClass}>Data do pagamento</label>
                <input type="date" value={form.data_pagamento} onChange={(e) => setForm({ ...form, data_pagamento: e.target.value })} className={inputClass} />
              </div>
            )}
          </div>

          {error && <p className="text-sm font-semibold text-red">{error}</p>}

          <button type="submit" disabled={saving} className="mt-1 rounded-full bg-primary py-2.5 text-sm font-bold text-white disabled:opacity-60">
            {saving ? "Salvando…" : "Salvar conta"}
          </button>
        </form>
      </Modal>
    </>
  );
}
