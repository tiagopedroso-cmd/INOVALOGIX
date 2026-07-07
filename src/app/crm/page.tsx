import { createClient } from "@/lib/supabase/server";
import { LeadBoard } from "@/components/kanban/lead-board";
import type { CrmLead } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function CrmPage() {
  const supabase = await createClient();
  const { data: leads } = await supabase
    .from("crm_leads")
    .select("*, responsavel:usuarios(id, nome, iniciais, cor_avatar)")
    .order("atualizado_em", { ascending: false })
    .returns<CrmLead[]>();

  return (
    <div className="animate-iv-fade px-7 pb-12 pt-7">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-[26px] font-bold tracking-tight">CRM · Funil de vendas</h1>
          <p className="mt-1 text-sm text-muted-2">Arraste os leads entre as etapas do funil.</p>
        </div>
      </div>

      <LeadBoard leads={leads ?? []} />
    </div>
  );
}
