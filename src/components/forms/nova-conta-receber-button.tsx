"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Modal, inputClass, labelClass } from "@/components/modal";
import { ParceiroSelect } from "@/components/forms/parceiro-select";
import { ProjetoSelect } from "@/components/forms/projeto-select";
import { RecorrenciaFields } from "@/components/forms/recorrencia-fields";
import { gerarDatas, recorrenciaInicial, type RecorrenciaState } from "@/lib/recurrence";
import type { ReceberStatus } from "@/types/database";

const initialState = {
  descricao: "",
  valor: "",
  vencimento: "",
  status: "aguardando" as ReceberStatus,
  cliente_id: "",
  projeto_id: "",
  data_recebimento: "",
};

export function NovaContaReceberButton({ className }: { className?: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(initialState);
  const [rec, setRec] = useState<RecorrenciaState>(recorrenciaInicial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function close() {
    setOpen(false);
    setForm(initialState);
    setRec(recorrenciaInicial);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const supabase = createClient();
    const repetindo = rec.modo !== "none";
    const datas = gerarDatas(form.vencimento, rec);
    const rows = datas.map((vencimento) => ({
      descricao: form.descricao,
      valor: Number(form.valor),
      vencimento,
      status: repetindo ? ("aguardando" as ReceberStatus) : form.status,
      cliente_id: form.cliente_id || null,
      projeto_id: form.projeto_id || null,
      data_recebimento: !repetindo && form.status === "recebido" ? form.data_recebimento || form.vencimento : null,
    }));
    const { error } = await supabase.from("contas_receber").insert(rows);
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
        Nova conta a receber
      </button>

      <Modal open={open} onClose={close} title="Nova conta a receber">
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
              <label className={labelClass}>Vencimento{rec.modo !== "none" ? " (1ª parcela)" : ""}</label>
              <input required type="date" value={form.vencimento} onChange={(e) => setForm({ ...form, vencimento: e.target.value })} className={inputClass} />
            </div>
          </div>

          <RecorrenciaFields value={rec} onChange={setRec} />

          {rec.modo === "none" && (
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
          )}

          {error && <p className="text-sm font-semibold text-red">{error}</p>}

          <button type="submit" disabled={saving} className="mt-1 rounded-full bg-primary py-2.5 text-sm font-bold text-white disabled:opacity-60">
            {saving ? "Salvando…" : "Salvar conta"}
          </button>
        </form>
      </Modal>
    </>
  );
}
