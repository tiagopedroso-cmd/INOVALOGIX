"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError("E-mail ou senha inválidos.");
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-[20px] border border-border bg-white p-8 shadow-[0_2px_8px_rgba(16,40,44,.05)]">
        <Image src="/inovalogix-logo.png" alt="InovaLogix" width={150} height={38} className="mx-auto mb-6 h-[38px] w-auto" priority />
        <h1 className="mb-1 text-center font-[family-name:var(--font-display)] text-xl font-bold">Entrar</h1>
        <p className="mb-6 text-center text-sm text-muted-2">Acesse o sistema de gestão InovaLogix</p>

        <label className="mb-1 block text-[13px] font-semibold text-[#2B3B41]">E-mail</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-4 w-full rounded-xl border border-border-strong px-3.5 py-2.5 text-sm outline-none focus:border-primary"
          placeholder="voce@inovalogix.com.br"
        />

        <label className="mb-1 block text-[13px] font-semibold text-[#2B3B41]">Senha</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-4 w-full rounded-xl border border-border-strong px-3.5 py-2.5 text-sm outline-none focus:border-primary"
          placeholder="••••••••"
        />

        {error && <p className="mb-4 text-sm font-semibold text-red">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-primary py-2.5 text-sm font-bold text-white shadow-[0_10px_24px_rgba(18,178,178,.32)] disabled:opacity-60"
        >
          {loading ? "Entrando…" : "Entrar"}
        </button>
      </form>
    </div>
  );
}
