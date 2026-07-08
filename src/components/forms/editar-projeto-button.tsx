"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Modal, inputClass, labelClass } from "@/components/modal";
import { ParceiroSelect } from "@/components/forms/parceiro-select";
import { UsuarioSelect } from "@/components/forms/usuario-select";
import { DeleteButton } from "@/components/delete-button";
import type { Projeto, ProjetoStatus } from "@/types/database";

export function EditarProjetoButton({ projeto }: { projeto: Projeto }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    nome: projeto.nome,
    cliente_id: projeto.cliente_id ?? "",
    status: projeto.status,
    valor: String(projeto.valor),
    progresso: String(projeto.progresso),
    prazo: projeto.prazo ?? "",
    responsavel_id: projeto.responsavel_id ?? "",
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
      .from("projetos")
      .update({
        nome: form.nome,
        cliente_id: form.cliente_id || null,
        status: form.status,
        valor: Number(form.valor) || 0,
        progresso: Number(form.progresso) || 0,
        prazo: form.prazo || null,
        responsavel_id: form.responsavel_id || null,
      })
      .eq("id", projeto.id);
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

      <Modal open={open} onClose={close} title="Editar projeto">
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

          <div className="mt-1 flex items-center gap-3">
            <button type="submit" disabled={saving} className="flex-1 rounded-full bg-primary py-2.5 text-sm font-bold text-white disabled:opacity-60">
              {saving ? "Salvando…" : "Salvar alterações"}
            </button>
            <DeleteButton
              table="projetos"
              id={projeto.id}
              label={projeto.nome}
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
