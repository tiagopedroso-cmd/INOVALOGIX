import { createClient } from "@/lib/supabase/server";
import { ProjectBoard } from "@/components/kanban/project-board";
import type { Projeto } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function ProjetosPage() {
  const supabase = await createClient();
  const { data: projetos } = await supabase
    .from("projetos")
    .select("*, cliente:parceiros(id, nome, iniciais), responsavel:usuarios(id, nome, iniciais, cor_avatar)")
    .order("atualizado_em", { ascending: false })
    .returns<Projeto[]>();

  return (
    <div className="animate-iv-fade px-7 pb-12 pt-7">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-[26px] font-bold tracking-tight">Projetos</h1>
          <p className="mt-1 text-sm text-muted-2">Arraste os cartões entre as colunas para atualizar o status.</p>
        </div>
      </div>

      <ProjectBoard projetos={projetos ?? []} />
    </div>
  );
}
