"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { inputClass, labelClass } from "@/components/modal";
import type { ParceiroTipo } from "@/types/database";

type ParceiroOption = { id: string; nome: string };

export function ParceiroSelect({
  tipo,
  label,
  value,
  onChange,
  required,
}: {
  tipo: ParceiroTipo | "qualquer";
  label: string;
  value: string;
  onChange: (id: string) => void;
  required?: boolean;
}) {
  const [options, setOptions] = useState<ParceiroOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [novoNome, setNovoNome] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let query = createClient().from("parceiros").select("id, nome").order("nome");
    if (tipo !== "qualquer") query = query.in("tipo", tipo === "ambos" ? ["ambos"] : [tipo, "ambos"]);
    query.then(({ data }) => {
      setOptions(data ?? []);
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCreate() {
    if (!novoNome.trim()) return;
    setSaving(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("parceiros")
      .insert({ nome: novoNome.trim(), tipo: tipo === "qualquer" ? "cliente" : tipo })
      .select("id, nome")
      .single();
    setSaving(false);
    if (error || !data) return;
    setOptions((prev) => [...prev, data].sort((a, b) => a.nome.localeCompare(b.nome)));
    onChange(data.id);
    setNovoNome("");
    setCreating(false);
  }

  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <label className={labelClass + " mb-0"}>{label}</label>
        <button
          type="button"
          onClick={() => setCreating((v) => !v)}
          className="text-[12px] font-bold text-primary"
        >
          {creating ? "cancelar" : "+ novo"}
        </button>
      </div>

      {creating ? (
        <div className="flex gap-2">
          <input
            value={novoNome}
            onChange={(e) => setNovoNome(e.target.value)}
            placeholder="Nome"
            className={inputClass}
          />
          <button
            type="button"
            onClick={handleCreate}
            disabled={saving || !novoNome.trim()}
            className="flex-none rounded-xl bg-primary px-3.5 text-sm font-bold text-white disabled:opacity-50"
          >
            {saving ? "…" : "Criar"}
          </button>
        </div>
      ) : (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          className={inputClass}
        >
          <option value="">{loading ? "Carregando…" : "Selecione"}</option>
          {options.map((o) => (
            <option key={o.id} value={o.id}>
              {o.nome}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
