import type { Metadata } from "next";
import { Space_Grotesk, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { createClient } from "@/lib/supabase/server";
import { Topbar } from "@/components/topbar";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "InovaLogix · Gestão",
  description: "Financeiro, Projetos e CRM da InovaLogix",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let usuario = null;
  if (user) {
    const { data } = await supabase
      .from("usuarios")
      .select("id, nome, cargo, iniciais, cor_avatar")
      .eq("auth_user_id", user.id)
      .maybeSingle();
    usuario = data;
  }

  return (
    <html lang="pt-BR" className={`${spaceGrotesk.variable} ${plusJakarta.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {user ? <Topbar usuario={usuario} /> : null}
        <main className="flex-1 min-w-0">{children}</main>
      </body>
    </html>
  );
}
