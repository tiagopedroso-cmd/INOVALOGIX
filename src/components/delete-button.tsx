"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useIsAdmin } from "@/hooks/use-is-admin";

export function DeleteButton({
  table,
  id,
  label,
  className,
  onDeleted,
}: {
  table: "contas_pagar" | "contas_receber" | "projetos" | "crm_leads";
  id: string;
  label: string;
  className?: string;
  onDeleted?: () => void;
}) {
  const router = useRouter();
  const isAdmin = useIsAdmin();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (isAdmin === false) return null;

  async function handleDelete() {
    if (!confirm(`Excluir "${label}"? Essa ação não pode ser desfeita.`)) return;
    setBusy(true);
    setError(null);
    const supabase = createClient();
    const { data, error } = await supabase.from(table).delete().eq("id", id).select("id");
    setBusy(false);
    if (error || !data || data.length === 0) {
      setError("Sem permissão para excluir.");
      setTimeout(() => setError(null), 3000);
      return;
    }
    if (onDeleted) {
      onDeleted();
    } else {
      router.refresh();
    }
  }

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        onClick={handleDelete}
        onMouseDown={(e) => e.stopPropagation()}
        disabled={busy || isAdmin === null}
        title="Excluir"
        className={
          className ??
          "grid h-7 w-7 place-items-center rounded-lg text-muted hover:bg-red-light hover:text-red disabled:opacity-50"
        }
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6h16Z" />
        </svg>
      </button>
      {error && (
        <span className="absolute right-0 top-8 z-30 whitespace-nowrap rounded-lg bg-[#0E1B22] px-2.5 py-1.5 text-[11px] font-semibold text-white">
          {error}
        </span>
      )}
    </span>
  );
}
