"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { inputClass, labelClass } from "@/components/modal";

type ProjetoOption = { id: string; nome: string };

export function ProjetoSelect({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (id: string) => void;
}) {
  const [options, setOptions] = useState<ProjetoOption[]>([]);

  useEffect(() => {
    createClient()
      .from("projetos")
      .select("id, nome")
      .order("nome")
      .then(({ data }) => setOptions(data ?? []));
  }, []);

  return (
    <div>
      <label className={labelClass}>{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={inputClass}>
        <option value="">Nenhum</option>
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.nome}
          </option>
        ))}
      </select>
    </div>
  );
}
