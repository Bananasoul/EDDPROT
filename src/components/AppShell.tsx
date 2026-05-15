"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LogOut, User as UserIcon, LogIn } from "lucide-react";
import { useApp } from "@/lib/app-context";
import { cn } from "@/lib/utils";
import { DemoMode } from "./DemoMode";
import { HSNELogo } from "./HSNELogo";

type Session = {
  loggedIn: boolean;
  method: string;
  loginAt: string;
  name: string;
  role: string;
} | null;

export function AppShell({ children }: { children: React.ReactNode }) {
  const { lang, setLang, t } = useApp();
  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === "/";
  const isLogin = pathname === "/login";
  const [session, setSession] = useState<Session>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = sessionStorage.getItem("edd.session");
    if (raw) try { setSession(JSON.parse(raw)); } catch {}
  }, [pathname]);

  const logout = () => {
    sessionStorage.removeItem("edd.session");
    setSession(null);
    router.push("/login");
  };

  // Sur la page de login : pas d'AppShell, render direct
  if (isLogin) return <>{children}</>;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header style HSNE — fond blanc, logo navy, CTA cyan */}
      <header className="bg-white border-b border-hairline">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center group">
            <HSNELogo variant="full" />
            {/* Programme tag — discret à droite du logo */}
            <div className="hidden md:flex items-center gap-2 ml-6 pl-6 border-l border-hairline">
              <div className="leading-tight">
                <div className="text-[10px] uppercase tracking-[0.18em] text-cyan font-extrabold">
                  Service École du Dos
                </div>
                <div className="text-xs text-slate font-medium">
                  Rückenschule · Programme KCE/INAMI
                </div>
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/vision"
              className={cn(
                "hidden sm:inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-md transition",
                pathname === "/vision"
                  ? "bg-navy text-white"
                  : "text-navy hover:bg-navy-pale"
              )}
            >
              Vision
            </Link>
            <div className="flex items-center rounded-md overflow-hidden border border-hairline">
              <button
                onClick={() => setLang("fr")}
                className={cn(
                  "px-3 py-1.5 text-xs font-bold uppercase tracking-wide transition",
                  lang === "fr" ? "bg-cyan text-white" : "text-slate hover:bg-slate-light"
                )}
              >
                FR
              </button>
              <button
                onClick={() => setLang("de")}
                className={cn(
                  "px-3 py-1.5 text-xs font-bold uppercase tracking-wide transition",
                  lang === "de" ? "bg-cyan text-white" : "text-slate hover:bg-slate-light"
                )}
              >
                DE
              </button>
            </div>

            {/* User indicator */}
            {session ? (
              <div className="hidden md:flex items-center gap-2 pl-3 border-l border-hairline">
                <div className="w-8 h-8 rounded-full bg-cyan text-white flex items-center justify-center text-xs font-bold">
                  {session.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </div>
                <div className="text-xs leading-tight">
                  <div className="font-bold text-navy">{session.name}</div>
                  <div className="text-slate text-[10px]">{session.role}</div>
                </div>
                <button
                  onClick={logout}
                  className="ml-1 p-1.5 rounded-md text-slate hover:text-accent hover:bg-accent/10"
                  title="Se déconnecter"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold border border-cyan text-cyan hover:bg-cyan hover:text-white transition"
              >
                <LogIn className="w-3.5 h-3.5" />
                Se connecter
              </Link>
            )}
          </div>
        </div>
      </header>

      <div className="bg-cyan-soft border-b border-cyan-light/40 text-cyan-mid text-xs py-1.5 text-center font-semibold tracking-wide">
        {t.demoBanner}
      </div>

      <main className="flex-1">{children}</main>
      <DemoMode />

      {!isHome && (
        <footer className="border-t border-hairline bg-white py-6 text-xs text-slate">
          <div className="max-w-7xl mx-auto px-6 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <HSNELogo variant="icon" className="h-6 w-auto opacity-60" />
              <span>© 2026 St. Nikolaus Hospital Eupen · École du Dos / Rückenschule · Prototype v0</span>
            </div>
            <Link href="/" className="text-cyan font-semibold hover:underline">
              {t.backToRoles}
            </Link>
          </div>
        </footer>
      )}
    </div>
  );
}
