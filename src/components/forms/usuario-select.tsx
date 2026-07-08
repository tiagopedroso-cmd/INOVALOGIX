"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { inputClass, labelClass } from "@/components/modal";

type UsuarioOption = { id: string; nome: string };

export function UsuarioSelect({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (id: string) => void;
}) {
  const [options, setOptions] = useState<UsuarioOption[]>([]);

  useEffect(() => {
    createClient()
      .from("usuarios")
      .select("id, nome")
      .eq("ativo", true)
      .order("nome")
      .then(({ data }) => setOptions(data ?? []));
  }, []);

  return (
    <div>
      <label className={labelClass}>{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={inputClass}>
        <option value="">Sem responsável</option>
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.nome}
          </option>
        ))}
      </select>
    </div>
  );
}
