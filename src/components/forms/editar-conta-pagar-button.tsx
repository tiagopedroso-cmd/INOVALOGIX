"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Modal, inputClass, labelClass } from "@/components/modal";
import { ParceiroSelect } from "@/components/forms/parceiro-select";
import { DeleteButton } from "@/components/delete-button";
import type { ContaPagar, PagarStatus } from "@/types/database";

export function EditarContaPagarButton({ conta }: { conta: ContaPagar }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    descricao: conta.descricao,
    categoria: conta.categoria ?? "",
    valor: String(conta.valor),
    vencimento: conta.vencimento,
    status: conta.status,
    fornecedor_id: conta.fornecedor_id ?? "",
    data_pagamento: conta.data_pagamento ?? "",
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
      .from("contas_pagar")
      .update({
        descricao: form.descricao,
        categoria: form.categoria || null,
        valor: Number(form.valor),
        vencimento: form.vencimento,
        status: form.status,
        fornecedor_id: form.fornecedor_id || null,
        data_pagamento: form.status === "pago" ? form.data_pagamento || form.vencimento : null,
      })
      .eq("id", conta.id);
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
        className="grid h-7 w-7 place-items-center rounded-lg text-muted hover:bg-teal-light hover:text-primary-dark"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
        </svg>
      </button>

      <Modal open={open} onClose={close} title="Editar conta a pagar">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <div>
            <label className={labelClass}>Descrição</label>
            <input required value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} className={inputClass} />
          </div>

          <ParceiroSelect tipo="fornecedor" label="Fornecedor (opcional)" value={form.fornecedor_id} onChange={(id) => setForm({ ...form, fornecedor_id: id })} />

          <div>
            <label className={labelClass}>Categoria</label>
            <input value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} className={inputClass} />
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

          <div className="mt-1 flex items-center gap-3">
            <button type="submit" disabled={saving} className="flex-1 rounded-full bg-primary py-2.5 text-sm font-bold text-white disabled:opacity-60">
              {saving ? "Salvando…" : "Salvar alterações"}
            </button>
            <DeleteButton
              table="contas_pagar"
              id={conta.id}
              label={conta.descricao}
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
