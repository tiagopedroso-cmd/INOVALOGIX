"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const PAGES = [
  { href: "/", label: "Home" },
  { href: "/financeiro", label: "Financeiro" },
  { href: "/projetos", label: "Projetos" },
  { href: "/crm", label: "CRM" },
];

const DATE_OPTIONS = ["Hoje", "Últimos 7 dias", "Este mês", "Últimos 90 dias", "Este ano"];

type TopbarUsuario = {
  nome: string;
  cargo: string | null;
  iniciais: string;
  cor_avatar: string | null;
} | null;

export function Topbar({ usuario }: { usuario: TopbarUsuario }) {
  const pathname = usePathname();
  const router = useRouter();
  const [dateOpen, setDateOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState("Este mês");

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-20 flex h-[66px] items-center gap-7 border-b border-border-strong bg-white/88 px-7 backdrop-blur-md">
      <Image src="/inovalogix-logo.png" alt="InovaLogix" width={120} height={30} className="h-[30px] w-auto flex-none" priority />

      <nav className="ml-2 flex items-center gap-1">
        {PAGES.map((p) => {
          const active = p.href === "/" ? pathname === "/" : pathname.startsWith(p.href);
          return (
            <Link
              key={p.href}
              href={p.href}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                active ? "bg-primary text-white" : "text-muted-2 hover:bg-teal-light hover:text-primary-dark"
              }`}
            >
              {p.label}
            </Link>
          );
        })}
      </nav>

      <div className="ml-auto flex items-center gap-3">
        <div className="relative">
          <button
            onClick={() => setDateOpen((v) => !v)}
            className="flex items-center gap-2 rounded-full border border-border-strong bg-white px-3.5 py-2 text-[13px] font-semibold text-[#2B3B41]"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#12B2B2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
            <span>{dateFilter}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94A2A8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
          {dateOpen && (
            <div className="absolute right-0 top-12 z-40 min-w-[190px] rounded-2xl border border-border-strong bg-white p-1.5 shadow-[0_16px_40px_rgba(16,40,44,.14)]">
              {DATE_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  onClick={() => {
                    setDateFilter(opt);
                    setDateOpen(false);
                  }}
                  className={`w-full rounded-lg px-3 py-2 text-left text-[13px] font-semibold ${
                    opt === dateFilter ? "bg-teal-light text-primary-dark" : "text-[#2B3B41]"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>

        <button className="relative grid h-10 w-10 place-items-center rounded-xl border border-border-strong bg-white text-[#2B3B41]">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
          </svg>
          <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full border-[1.5px] border-white bg-red" />
        </button>

        <button
          onClick={handleLogout}
          title="Sair"
          className="flex items-center gap-2.5 rounded-full border border-border-strong bg-white py-1 pl-1 pr-3.5"
        >
          <div
            className="grid h-[34px] w-[34px] place-items-center rounded-full text-[13px] font-bold text-white"
            style={{ background: usuario?.cor_avatar ?? "linear-gradient(135deg,#22D3D3,#0E9E9E)" }}
          >
            {usuario?.iniciais ?? "?"}
          </div>
          <div className="flex flex-col leading-tight text-left">
            <strong className="text-[13px]">{usuario?.nome ?? "Usuário"}</strong>
            <span className="text-[11px] text-muted">{usuario?.cargo ?? ""}</span>
          </div>
        </button>
      </div>
    </header>
  );
}
