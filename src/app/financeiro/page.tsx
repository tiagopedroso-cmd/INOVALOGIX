import { createClient } from "@/lib/supabase/server";
import { FinanceiroTabs } from "@/components/financeiro-tabs";
import type { ContaPagar, ContaReceber, VwPagarResumo, VwReceberResumo, VwFluxoMensal } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function FinanceiroPage() {
  const supabase = await createClient();

  const seisMesesAtras = new Date();
  seisMesesAtras.setMonth(seisMesesAtras.getMonth() - 6);

  const [{ data: pagar }, { data: receber }, { data: pagarResumo }, { data: receberResumo }, { data: fluxoMensal }] = await Promise.all([
    supabase
      .from("contas_pagar")
      .select("*, fornecedor:parceiros(nome, iniciais)")
      .order("vencimento")
      .returns<ContaPagar[]>(),
    supabase
      .from("contas_receber")
      .select("*, cliente:parceiros(nome, iniciais), projeto:projetos(nome)")
      .order("vencimento")
      .returns<ContaReceber[]>(),
    supabase.from("vw_pagar_resumo").select("*").returns<VwPagarResumo[]>(),
    supabase.from("vw_receber_resumo").select("*").returns<VwReceberResumo[]>(),
    supabase
      .from("vw_fluxo_mensal")
      .select("*")
      .eq("regime", "realizado")
      .gte("mes", seisMesesAtras.toISOString().slice(0, 10))
      .order("mes")
      .returns<VwFluxoMensal[]>(),
  ]);

  return (
    <div className="animate-iv-fade px-4 pb-8 pt-5 md:px-7 md:pb-12 md:pt-7">
      <h1 className="font-[family-name:var(--font-display)] text-[26px] font-bold tracking-tight">Financeiro</h1>
      <p className="mb-5 mt-1 text-sm text-muted-2">Contas a pagar, a receber e fluxo de caixa</p>

      <FinanceiroTabs
        pagar={pagar ?? []}
        receber={receber ?? []}
        pagarResumo={pagarResumo ?? []}
        receberResumo={receberResumo ?? []}
        fluxoMensal={fluxoMensal ?? []}
      />
    </div>
  );
}
