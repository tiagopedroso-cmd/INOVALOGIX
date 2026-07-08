"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Modal, inputClass, labelClass } from "@/components/modal";
import { ParceiroSelect } from "@/components/forms/parceiro-select";
import { UsuarioSelect } from "@/components/forms/usuario-select";
import type { ProjetoStatus } from "@/types/database";

const initialState = {
  nome: "",
  cliente_id: "",
  status: "nao_iniciado" as ProjetoStatus,
  valor: "",
  progresso: "0",
  prazo: "",
  responsavel_id: "",
};

export function NovoProjetoButton() {
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
    const { error } = await supabase.from("projetos").insert({
      nome: form.nome,
      cliente_id: form.cliente_id || null,
      status: form.status,
      valor: Number(form.valor) || 0,
      progresso: Number(form.progresso) || 0,
      prazo: form.prazo || null,
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
        Novo projeto
      </button>

      <Modal open={open} onClose={close} title="Novo projeto">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <div>
            <label className={labelClass}>Nome do projeto</label>
            <input required value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} className={inputClass} />
          </div>

          <ParceiroSelect tipo="cliente" label="Cliente (opcional)" value={form.cliente_id} onChange={(id) => setForm({ ...form, cliente_id: id })} />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Valor (R$)</label>
              <input type="number" min="0" step="0.01" value={form.valor} onChange={(e) => setForm({ ...form, valor: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Prazo</label>
              <input type="date" value={form.prazo} onChange={(e) => setForm({ ...form, prazo: e.target.value })} className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as ProjetoStatus })} className={inputClass}>
                <option value="nao_iniciado">Não iniciado</option>
                <option value="em_andamento">Em andamento</option>
                <option value="pausado">Pausado</option>
                <option value="concluido">Concluído</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Progresso (%)</label>
              <input type="number" min="0" max="100" value={form.progresso} onChange={(e) => setForm({ ...form, progresso: e.target.value })} className={inputClass} />
            </div>
          </div>

          <UsuarioSelect label="Responsável" value={form.responsavel_id} onChange={(id) => setForm({ ...form, responsavel_id: id })} />

          {error && <p className="text-sm font-semibold text-red">{error}</p>}

          <button type="submit" disabled={saving} className="mt-1 rounded-full bg-primary py-2.5 text-sm font-bold text-white disabled:opacity-60">
            {saving ? "Salvando…" : "Salvar projeto"}
          </button>
        </form>
      </Modal>
    </>
  );
}
