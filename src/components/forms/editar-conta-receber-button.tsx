"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Modal, inputClass, labelClass } from "@/components/modal";
import { ParceiroSelect } from "@/components/forms/parceiro-select";
import { ProjetoSelect } from "@/components/forms/projeto-select";
import { DeleteButton } from "@/components/delete-button";
import type { ContaReceber, ReceberStatus } from "@/types/database";

export function EditarContaReceberButton({ conta }: { conta: ContaReceber }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    descricao: conta.descricao,
    valor: String(conta.valor),
    vencimento: conta.vencimento,
    status: conta.status,
    cliente_id: conta.cliente_id ?? "",
    projeto_id: conta.projeto_id ?? "",
    data_recebimento: conta.data_recebimento ?? "",
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
      .from("contas_receber")
      .update({
        descricao: form.descricao,
        valor: Number(form.valor),
        vencimento: form.vencimento,
        status: form.status,
        cliente_id: form.cliente_id || null,
        projeto_id: form.projeto_id || null,
        data_recebimento: form.status === "recebido" ? form.data_recebimento || form.vencimento : null,
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

      <Modal open={open} onClose={close} title="Editar conta a receber">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <div>
            <label className={labelClass}>Descrição</label>
            <input required value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} className={inputClass} />
          </div>

          <ParceiroSelect tipo="cliente" label="Cliente" value={form.cliente_id} onChange={(id) => setForm({ ...form, cliente_id: id })} />

          <ProjetoSelect label="Projeto (opcional)" value={form.projeto_id} onChange={(id) => setForm({ ...form, projeto_id: id })} />

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
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as ReceberStatus })} className={inputClass}>
                <option value="aguardando">Aguardando</option>
                <option value="recebido">Recebido</option>
                <option value="atrasado">Atrasado</option>
              </select>
            </div>
            {form.status === "recebido" && (
              <div>
                <label className={labelClass}>Data do recebimento</label>
                <input type="date" value={form.data_recebimento} onChange={(e) => setForm({ ...form, data_recebimento: e.target.value })} className={inputClass} />
              </div>
            )}
          </div>

          {error && <p className="text-sm font-semibold text-red">{error}</p>}

          <div className="mt-1 flex items-center gap-3">
            <button type="submit" disabled={saving} className="flex-1 rounded-full bg-primary py-2.5 text-sm font-bold text-white disabled:opacity-60">
              {saving ? "Salvando…" : "Salvar alterações"}
            </button>
            <DeleteButton
              table="contas_receber"
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
