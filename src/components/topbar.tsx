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
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-20 border-b border-border-strong bg-white/88 backdrop-blur-md">
      <div className="flex h-[62px] items-center gap-3 px-4 md:h-[66px] md:gap-7 md:px-7">
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="grid h-9 w-9 flex-none place-items-center rounded-lg border border-border-strong bg-white text-[#2B3B41] md:hidden"
          aria-label="Abrir menu"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {menuOpen ? <path d="M18 6 6 18M6 6l12 12" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>

        <Image src="/inovalogix-logo.png" alt="InovaLogix" width={120} height={30} className="h-6 w-auto flex-none md:h-[30px]" priority />

        <nav className="ml-2 hidden items-center gap-1 md:flex">
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

        <div className="ml-auto flex items-center gap-2 md:gap-3">
          <div className="relative hidden sm:block">
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

          <button className="relative grid h-9 w-9 flex-none place-items-center rounded-xl border border-border-strong bg-white text-[#2B3B41] md:h-10 md:w-10">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
            </svg>
            <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full border-[1.5px] border-white bg-red" />
          </button>

          <button
            onClick={handleLogout}
            title="Sair"
            className="flex items-center gap-2.5 rounded-full border border-border-strong bg-white p-0.5 pr-0.5 sm:py-1 sm:pl-1 sm:pr-3.5"
          >
            <div
              className="grid h-8 w-8 flex-none place-items-center rounded-full text-[12px] font-bold text-white md:h-[34px] md:w-[34px] md:text-[13px]"
              style={{ background: usuario?.cor_avatar ?? "linear-gradient(135deg,#22D3D3,#0E9E9E)" }}
            >
              {usuario?.iniciais ?? "?"}
            </div>
            <div className="hidden flex-col leading-tight text-left sm:flex">
              <strong className="text-[13px]">{usuario?.nome ?? "Usuário"}</strong>
              <span className="text-[11px] text-muted">{usuario?.cargo ?? ""}</span>
            </div>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-border-strong bg-white px-4 py-3 md:hidden">
          <nav className="flex flex-col gap-1">
            {PAGES.map((p) => {
              const active = p.href === "/" ? pathname === "/" : pathname.startsWith(p.href);
              return (
                <Link
                  key={p.href}
                  href={p.href}
                  onClick={() => setMenuOpen(false)}
                  className={`rounded-lg px-3 py-2.5 text-[14px] font-semibold ${
                    active ? "bg-primary text-white" : "text-muted-2"
                  }`}
                >
                  {p.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-2 border-t border-[#EEF2F3] pt-2 sm:hidden">
            <div className="px-3 pb-1 text-[11px] font-bold uppercase tracking-wide text-muted">Período</div>
            <div className="flex flex-wrap gap-1.5 px-3">
              {DATE_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setDateFilter(opt)}
                  className={`rounded-full px-3 py-1.5 text-[12.5px] font-semibold ${
                    opt === dateFilter ? "bg-teal-light text-primary-dark" : "border border-border-strong text-[#2B3B41]"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
