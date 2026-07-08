"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

/** true/false depois de carregar; null enquanto verifica. */
export function useIsAdmin(): boolean | null {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        setIsAdmin(false);
        return;
      }
      supabase
        .from("usuarios")
        .select("role")
        .eq("auth_user_id", user.id)
        .maybeSingle()
        .then(({ data }) => setIsAdmin(data?.role === "admin"));
    });
  }, []);

  return isAdmin;
}
